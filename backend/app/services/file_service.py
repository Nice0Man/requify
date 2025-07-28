"""
Сервис для работы с файлами и blob storage.

Обеспечивает загрузку, обработку и хранение файлов с поддержкой:
- MinIO Object Storage
- Локального хранилища и blob storage
- Изменения размера изображений
- Безопасности и валидации
- CDN интеграции
"""

import os
import uuid
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Tuple, BinaryIO
from io import BytesIO

from fastapi import HTTPException, UploadFile, status
from PIL import Image
import aiofiles
from sqlalchemy.ext.asyncio import AsyncSession
from minio import Minio
from minio.error import S3Error

from app.core.config import settings
from app.utils.logger import logger


class FileService:
    """Сервис для работы с файлами и MinIO Object Storage."""
    
    def __init__(self):
        self.config = settings.file_storage
        self.upload_dir = Path(self.config.upload_dir)
        self.quarantine_dir = Path(self.config.quarantine_dir)
        
        # MinIO client initialization
        if self.config.use_minio:
            try:
                self.minio_client = Minio(
                    endpoint=self.config.minio_endpoint,
                    access_key=self.config.minio_access_key,
                    secret_key=self.config.minio_secret_key,
                    secure=self.config.minio_secure,
                    region=self.config.minio_region
                )
                logger.info(f"MinIO client initialized: {self.config.minio_endpoint}")
                
                # Ensure buckets exist
                self._ensure_buckets_exist()
                
            except Exception as e:
                logger.error(f"Failed to initialize MinIO client: {str(e)}")
                self.minio_client = None
        else:
            self.minio_client = None
            # Создаем директории если их нет (для локального хранения)
            self.upload_dir.mkdir(parents=True, exist_ok=True)
            self.quarantine_dir.mkdir(parents=True, exist_ok=True)
    
    def _ensure_buckets_exist(self):
        """Создает необходимые buckets в MinIO если их нет."""
        if not self.minio_client:
            return
            
        buckets = [
            self.config.minio_bucket_uploads,
            self.config.minio_bucket_avatars,
            self.config.minio_bucket_documents
        ]
        
        for bucket_name in buckets:
            try:
                if not self.minio_client.bucket_exists(bucket_name):
                    self.minio_client.make_bucket(bucket_name)
                    logger.info(f"Created MinIO bucket: {bucket_name}")
            except S3Error as e:
                logger.error(f"Error ensuring bucket {bucket_name} exists: {str(e)}")
    
    async def upload_avatar(
        self, 
        file: UploadFile, 
        user_id: int, 
        db: AsyncSession
    ) -> str:
        """
        Загрузка аватара пользователя в MinIO или локальное хранилище.
        
        Args:
            file: Загружаемый файл
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            str: URL загруженного аватара
            
        Raises:
            HTTPException: При ошибках валидации или загрузки
        """
        try:
            # Валидация файла
            await self._validate_avatar_file(file)
            
            # Генерация уникального имени файла
            file_extension = self._get_file_extension(file.filename)
            
            # Чтение и обработка файла
            content = await file.read()
            
            # Вирусная проверка (если включена)
            if self.config.enable_virus_scan:
                await self._scan_for_viruses(content)
            
            # Изменение размера изображения
            processed_images = await self._resize_avatar_image(content)
            
            if self.config.use_minio and self.minio_client:
                # Загрузка в MinIO
                avatar_url = await self._upload_to_minio(
                    processed_images,
                    user_id,
                    file_extension,
                    self.config.minio_bucket_avatars,
                    "avatars"
                )
            else:
                # Загрузка в локальное хранилище
                avatar_url = await self._upload_to_local(
                    processed_images,
                    user_id,
                    file_extension,
                    "avatars"
                )
            
            logger.info(f"Avatar uploaded successfully for user {user_id}: {avatar_url}")
            return avatar_url
            
        except Exception as e:
            logger.error(f"Failed to upload avatar for user {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload avatar: {str(e)}"
            )
    
    async def _upload_to_minio(
        self,
        processed_images: dict,
        user_id: int,
        file_extension: str,
        bucket_name: str,
        file_type: str
    ) -> str:
        """Загрузка файлов в MinIO."""
        main_object_name = None
        
        for size, image_data in processed_images.items():
            # Определение пути объекта
            if self.config.organize_by_user and self.config.organize_by_date:
                date_path = datetime.now().strftime("%Y/%m/%d")
                object_name = f"users/{user_id}/{date_path}/{file_type}_{size}_{uuid.uuid4()}{file_extension}"
            elif self.config.organize_by_user:
                object_name = f"users/{user_id}/{file_type}_{size}_{uuid.uuid4()}{file_extension}"
            else:
                object_name = f"{file_type}_{user_id}_{size}_{uuid.uuid4()}{file_extension}"
            
            try:
                # Загрузка в MinIO
                self.minio_client.put_object(
                    bucket_name=bucket_name,
                    object_name=object_name,
                    data=BytesIO(image_data),
                    length=len(image_data),
                    content_type=self._get_content_type(file_extension),
                    metadata={
                        "user-id": str(user_id),
                        "upload-time": datetime.now().isoformat(),
                        "size": size,
                        "file-type": file_type
                    }
                )
                
                # Сохраняем основной размер (256x256)
                if size == "256x256":
                    main_object_name = object_name
                    
                logger.info(f"Uploaded {file_type} {size} to MinIO: {object_name}")
                
            except S3Error as e:
                logger.error(f"Failed to upload {file_type} {size} to MinIO: {str(e)}")
                raise
        
        # Генерация CDN URL
        if main_object_name and self.config.cdn_enabled:
            if file_type == "avatars":
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_avatar_path}/{main_object_name}"
            else:
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_uploads_path}/{main_object_name}"
        else:
            # Fallback to direct MinIO URL
            cdn_url = f"http://{self.config.minio_endpoint}/{bucket_name}/{main_object_name}"
        
        return cdn_url
    
    async def _upload_to_local(
        self,
        processed_images: dict,
        user_id: int,
        file_extension: str,
        file_type: str
    ) -> str:
        """Загрузка файлов в локальное хранилище (fallback)."""
        main_file_path = None
        
        for size, image_data in processed_images.items():
            # Определение пути сохранения
            if self.config.organize_by_user:
                file_dir = self.upload_dir / "users" / str(user_id)
            else:
                file_dir = self.upload_dir / file_type
                
            if self.config.organize_by_date:
                date_path = datetime.now().strftime("%Y/%m/%d")
                file_dir = file_dir / date_path
                
            file_dir.mkdir(parents=True, exist_ok=True)
            
            size_filename = f"{file_type}_{user_id}_{size}_{uuid.uuid4()}{file_extension}"
            size_file_path = file_dir / size_filename
            
            async with aiofiles.open(size_file_path, 'wb') as f:
                await f.write(image_data)
            
            # Сохраняем основной размер
            if size == "256x256":
                main_file_path = size_file_path
        
        # Генерация URL
        if main_file_path:
            relative_path = main_file_path.relative_to(self.upload_dir)
            return f"/uploads/{relative_path}"
        
        return ""
    
    def _get_content_type(self, file_extension: str) -> str:
        """Определение content type по расширению файла."""
        content_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg", 
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt": "text/plain"
        }
        return content_types.get(file_extension.lower(), "application/octet-stream")
    
    async def delete_avatar(self, avatar_url: str) -> bool:
        """
        Удаление аватара из MinIO или локального хранилища.
        
        Args:
            avatar_url: URL аватара для удаления
            
        Returns:
            bool: True если успешно удален
        """
        try:
            if self.config.use_minio and self.minio_client and self.config.cdn_enabled:
                # Извлекаем object name из CDN URL
                if avatar_url.startswith(self.config.cdn_base_url):
                    # Пример: http://localhost:8080/avatars/users/1/2025/01/28/avatars_256x256_uuid.jpg
                    path_part = avatar_url.replace(self.config.cdn_base_url, "")
                    if path_part.startswith(self.config.cdn_avatar_path):
                        object_name = path_part.replace(self.config.cdn_avatar_path + "/", "")
                        
                        # Удаляем все размеры аватара
                        # Поскольку в object_name есть размер, заменяем его на * для поиска
                        base_name = object_name.replace("_256x256_", "_*_")
                        
                        # Список объектов для удаления
                        try:
                            objects = self.minio_client.list_objects(
                                self.config.minio_bucket_avatars, 
                                prefix=object_name.rsplit("_", 2)[0]  # Базовое имя без размера и UUID
                            )
                            
                            deleted_count = 0
                            for obj in objects:
                                self.minio_client.remove_object(
                                    self.config.minio_bucket_avatars, 
                                    obj.object_name
                                )
                                deleted_count += 1
                                logger.info(f"Deleted MinIO object: {obj.object_name}")
                            
                            return deleted_count > 0
                            
                        except S3Error as e:
                            logger.error(f"Failed to delete avatar from MinIO: {str(e)}")
                            return False
            else:
                # Локальное удаление
                if avatar_url.startswith("/uploads/"):
                    file_path = self.upload_dir / avatar_url[9:]  # Убираем "/uploads/"
                    if file_path.exists():
                        file_path.unlink()
                        logger.info(f"Avatar deleted: {file_path}")
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete avatar {avatar_url}: {str(e)}")
            return False
    
    async def _validate_avatar_file(self, file: UploadFile) -> None:
        """Валидация файла аватара."""
        # Проверка размера файла
        content = await file.read()
        await file.seek(0)  # Сброс позиции для последующего чтения
        
        if len(content) > self.config.avatar_max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size too large. Maximum size: {self.config.avatar_max_size} bytes"
            )
        
        # Проверка расширения файла
        file_extension = self._get_file_extension(file.filename)
        allowed_extensions = [ext.strip() for ext in self.config.avatar_allowed_extensions.split(",")]
        
        if file_extension.lower() not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Проверка, что файл действительно является изображением
        try:
            image = Image.open(BytesIO(content))
            image.verify()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
    
    async def _resize_avatar_image(self, content: bytes) -> dict:
        """Изменение размера изображения аватара."""
        processed_images = {}
        
        # Получаем размеры из конфигурации
        dimensions = [dim.strip() for dim in self.config.avatar_resize_dimensions.split(",")]
        
        for dimension in dimensions:
            width, height = map(int, dimension.split("x"))
            
            # Открываем изображение
            image = Image.open(BytesIO(content))
            
            # Конвертируем в RGB если нужно
            if image.mode in ('RGBA', 'LA', 'P'):
                # Создаем белый фон для прозрачных изображений
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Изменяем размер с сохранением пропорций
            image.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Создаем квадратное изображение с центрированием
            final_image = Image.new('RGB', (width, height), (255, 255, 255))
            paste_x = (width - image.width) // 2
            paste_y = (height - image.height) // 2
            final_image.paste(image, (paste_x, paste_y))
            
            # Сохраняем в байты
            output = BytesIO()
            final_image.save(output, format='JPEG', quality=85, optimize=True)
            processed_images[dimension] = output.getvalue()
        
        return processed_images
    
    async def _scan_for_viruses(self, content: bytes) -> None:
        """Простая проверка на вирусы (заглушка для интеграции с антивирусом)."""
        # TODO: Интеграция с антивирусным сканером
        # Например, ClamAV или другое решение
        
        # Простая проверка на подозрительные паттерны
        suspicious_patterns = [
            b'<script',
            b'javascript:',
            b'vbscript:',
            b'<%',
            b'<?php',
        ]
        
        content_lower = content.lower()
        for pattern in suspicious_patterns:
            if pattern in content_lower:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Suspicious content detected in file"
                )
    
    def _get_file_extension(self, filename: Optional[str]) -> str:
        """Получение расширения файла."""
        if not filename:
            return ""
        return Path(filename).suffix.lower()
    
    def _generate_file_hash(self, content: bytes) -> str:
        """Генерация хэша файла для дедупликации."""
        return hashlib.sha256(content).hexdigest()
    
    def get_health_status(self) -> dict:
        """Получение статуса здоровья файлового сервиса."""
        status = {
            "storage_type": "minio" if self.config.use_minio else "local",
            "cdn_enabled": self.config.cdn_enabled,
            "minio_connected": False,
            "buckets_status": {}
        }
        
        if self.minio_client:
            try:
                # Проверка подключения к MinIO
                self.minio_client.list_buckets()
                status["minio_connected"] = True
                
                # Проверка существования buckets
                buckets = [
                    self.config.minio_bucket_uploads,
                    self.config.minio_bucket_avatars,
                    self.config.minio_bucket_documents
                ]
                
                for bucket in buckets:
                    status["buckets_status"][bucket] = self.minio_client.bucket_exists(bucket)
                    
            except Exception as e:
                status["error"] = str(e)
        
        return status


# Создаем глобальный экземпляр сервиса
file_service = FileService() 
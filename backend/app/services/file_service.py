"""
Сервис для работы с файлами и blob storage.

Обеспечивает загрузку, обработку и хранение файлов с поддержкой:
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

from app.core.config import settings
from app.utils.logger import logger


class FileService:
    """Сервис для работы с файлами."""
    
    def __init__(self):
        self.config = settings.file_storage
        self.upload_dir = Path(self.config.upload_dir)
        self.quarantine_dir = Path(self.config.quarantine_dir)
        
        # Создаем директории если их нет
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
    
    async def upload_avatar(
        self, 
        file: UploadFile, 
        user_id: int, 
        db: AsyncSession
    ) -> str:
        """
        Загрузка аватара пользователя.
        
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
            unique_filename = f"avatar_{user_id}_{uuid.uuid4()}{file_extension}"
            
            # Определение пути сохранения
            if self.config.organize_by_user:
                file_dir = self.upload_dir / "users" / str(user_id)
            else:
                file_dir = self.upload_dir / "avatars"
                
            if self.config.organize_by_date:
                date_path = datetime.now().strftime("%Y/%m/%d")
                file_dir = file_dir / date_path
                
            file_dir.mkdir(parents=True, exist_ok=True)
            file_path = file_dir / unique_filename
            
            # Чтение и обработка файла
            content = await file.read()
            
            # Вирусная проверка (если включена)
            if self.config.enable_virus_scan:
                await self._scan_for_viruses(content)
            
            # Изменение размера изображения
            processed_images = await self._resize_avatar_image(content)
            
            # Сохранение файлов
            avatar_urls = {}
            for size, image_data in processed_images.items():
                size_filename = f"avatar_{user_id}_{size}_{uuid.uuid4()}{file_extension}"
                size_file_path = file_dir / size_filename
                
                async with aiofiles.open(size_file_path, 'wb') as f:
                    await f.write(image_data)
                
                # Генерация URL
                if self.config.enable_cdn and self.config.cdn_base_url:
                    avatar_url = f"{self.config.cdn_base_url}/{size_file_path.relative_to(self.upload_dir)}"
                else:
                    avatar_url = f"/uploads/{size_file_path.relative_to(self.upload_dir)}"
                
                avatar_urls[size] = avatar_url
            
            # Возвращаем URL основного размера (256x256)
            main_avatar_url = avatar_urls.get("256x256", list(avatar_urls.values())[0])
            
            logger.info(f"Avatar uploaded successfully for user {user_id}: {main_avatar_url}")
            return main_avatar_url
            
        except Exception as e:
            logger.error(f"Failed to upload avatar for user {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload avatar: {str(e)}"
            )
    
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
    
    async def delete_avatar(self, avatar_url: str) -> bool:
        """
        Удаление аватара.
        
        Args:
            avatar_url: URL аватара для удаления
            
        Returns:
            bool: True если успешно удален
        """
        try:
            # Извлекаем путь из URL
            if avatar_url.startswith("/uploads/"):
                file_path = self.upload_dir / avatar_url[9:]  # Убираем "/uploads/"
            elif self.config.cdn_base_url and avatar_url.startswith(self.config.cdn_base_url):
                relative_path = avatar_url[len(self.config.cdn_base_url):].lstrip("/")
                file_path = self.upload_dir / relative_path
            else:
                return False
            
            # Удаляем файл если он существует
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Avatar deleted: {file_path}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete avatar {avatar_url}: {str(e)}")
            return False


# Создаем глобальный экземпляр сервиса
file_service = FileService() 
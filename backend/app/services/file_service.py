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
import socket
import asyncio

from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Tuple, BinaryIO, Dict, Any
from io import BytesIO

from fastapi import HTTPException, UploadFile, status
from PIL import Image
import aiofiles
from sqlalchemy.ext.asyncio import AsyncSession
from minio import Minio
from minio.error import S3Error

from app.core.config import settings
from app.utils.logger import logger
from app.services.email_service import email_service


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
                    region=self.config.minio_region,
                )
                logger.info(f"MinIO client initialized: {self.config.minio_endpoint}")

                # Ensure buckets exist
                self._ensure_buckets_exist()

            except Exception as e:
                logger.error(f"Failed to initialize MinIO client: {str(e)}")
                self.minio_client = None
        else:
            self.minio_client = None
            logger.info(f"MinIO disabled, using local storage in: {self.upload_dir}")
            # Создаем директории если их нет (для локального хранения)
            self.upload_dir.mkdir(parents=True, exist_ok=True)
            self.quarantine_dir.mkdir(parents=True, exist_ok=True)

    def _ensure_buckets_exist(self):
        """Создает необходимые buckets в MinIO если их нет и устанавливает политики доступа."""
        if not self.minio_client:
            return

        # Конфигурация bucket'ов с политиками доступа
        bucket_configs = [
            {
                "name": self.config.minio_bucket_uploads,
                "policy": "none",  # Приватный доступ
                "description": "General uploads bucket",
            },
            {
                "name": self.config.minio_bucket_avatars,
                "policy": "download",  # Публичный доступ на чтение
                "description": "User avatars bucket",
            },
            {
                "name": self.config.minio_bucket_documents,
                "policy": "none",  # Приватный доступ
                "description": "Documents bucket",
            },
        ]

        for bucket_config in bucket_configs:
            bucket_name = bucket_config["name"]
            try:
                # Создаем bucket если не существует
                if not self.minio_client.bucket_exists(bucket_name):
                    self.minio_client.make_bucket(bucket_name)
                    logger.info(f"Created MinIO bucket: {bucket_name}")

                # Устанавливаем политику доступа
                self._set_bucket_policy(bucket_name, bucket_config["policy"])
                logger.info(
                    f"Set policy '{bucket_config['policy']}' for bucket: {bucket_name}"
                )

            except S3Error as e:
                logger.error(f"Error ensuring bucket {bucket_name} exists: {str(e)}")

    def _set_bucket_policy(self, bucket_name: str, policy_type: str):
        """Устанавливает политику доступа для bucket'а."""
        try:
            if policy_type == "download":
                # Публичная политика для чтения (для аватаров)
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{bucket_name}/*"],
                        }
                    ],
                }
            elif policy_type == "none":
                # Приватная политика (только для авторизованных пользователей)
                policy = {"Version": "2012-10-17", "Statement": []}
            else:
                logger.warning(f"Unknown policy type: {policy_type}")
                return

            import json

            policy_json = json.dumps(policy)
            self.minio_client.set_bucket_policy(bucket_name, policy_json)

        except S3Error as e:
            logger.error(f"Error setting bucket policy for {bucket_name}: {str(e)}")
        except Exception as e:
            logger.error(
                f"Unexpected error setting bucket policy for {bucket_name}: {str(e)}"
            )

    async def upload_avatar(
        self, file: UploadFile, user_id: int, db: AsyncSession
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
                await self._scan_for_viruses(
                    content, file.filename or "unknown", user_id
                )

            # Изменение размера изображения
            processed_images = await self._resize_avatar_image(content)

            if self.config.use_minio and self.minio_client:
                # Загрузка в MinIO
                logger.info(f"Using MinIO storage for user {user_id}")
                avatar_url = await self._upload_to_minio(
                    processed_images,
                    user_id,
                    file_extension,
                    self.config.minio_bucket_avatars,
                    "avatars",
                )
            else:
                # Загрузка в локальное хранилище
                logger.info(
                    f"Using local storage for user {user_id} (MinIO: {self.config.use_minio}, client: {self.minio_client is not None})"
                )
                avatar_url = await self._upload_to_local(
                    processed_images, user_id, file_extension, "avatars"
                )

            logger.info(
                f"Avatar uploaded successfully for user {user_id}: {avatar_url}"
            )
            return avatar_url

        except HTTPException:
            # Пробрасываем HTTPException без изменений (валидация, размер файла и т.д.)
            raise
        except Exception as e:
            logger.error(f"Failed to upload avatar for user {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload avatar: {str(e)}",
            )

    async def _upload_to_minio(
        self,
        processed_images: dict,
        user_id: int,
        file_extension: str,
        bucket_name: str,
        file_type: str,
    ) -> str:
        """Загрузка файлов в MinIO."""
        main_object_name = None

        for size, image_data in processed_images.items():
            # Определение пути объекта
            if self.config.organize_by_user and self.config.organize_by_date:
                date_path = datetime.now().strftime("%Y/%m/%d")
                object_name = f"users/{user_id}/{date_path}/{file_type}_{size}_{uuid.uuid4()}{file_extension}"
            elif self.config.organize_by_user:
                object_name = (
                    f"users/{user_id}/{file_type}_{size}_{uuid.uuid4()}{file_extension}"
                )
            else:
                object_name = (
                    f"{file_type}_{user_id}_{size}_{uuid.uuid4()}{file_extension}"
                )

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
                        "file-type": file_type,
                    },
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
            elif file_type == "uploads":
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_uploads_path}/{main_object_name}"
            elif file_type == "documents":
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_documents_path}/{main_object_name}"
            elif file_type == "static":
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_static_path}/{main_object_name}"
            elif file_type == "images":
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_images_path}/{main_object_name}"
            else:
                cdn_url = f"{self.config.cdn_base_url}{self.config.cdn_uploads_path}/{main_object_name}"
        else:
            # Fallback to direct MinIO URL
            cdn_url = (
                f"http://{self.config.minio_endpoint}/{bucket_name}/{main_object_name}"
            )

        return cdn_url

    async def _upload_to_local(
        self, processed_images: dict, user_id: int, file_extension: str, file_type: str
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

            size_filename = (
                f"{file_type}_{user_id}_{size}_{uuid.uuid4()}{file_extension}"
            )
            size_file_path = file_dir / size_filename

            async with aiofiles.open(size_file_path, "wb") as f:
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
            ".txt": "text/plain",
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
                    # Пример: http://localhost/cdn/avatars/users/1/2025/01/28/avatars_256x256_uuid.jpg
                    path_part = avatar_url.replace(self.config.cdn_base_url, "")
                    if path_part.startswith(self.config.cdn_avatar_path):
                        object_name = path_part.replace(
                            self.config.cdn_avatar_path + "/", ""
                        )

                        # Удаляем все размеры аватара для КОНКРЕТНОГО UUID
                        # Извлекаем UUID из имени файла
                        if "_" in object_name:
                            # Пример: users/5/2025/07/29/avatars_256x256_be9bbae6-f664-4e38-9b13-10fb59780da2.jpg
                            # Извлекаем UUID: be9bbae6-f664-4e38-9b13-10fb59780da2
                            try:
                                parts = object_name.split("_")
                                if len(parts) >= 3:
                                    uuid_part = parts[-1].split(".")[
                                        0
                                    ]  # UUID без расширения

                                    # Создаем префикс для поиска всех размеров этого конкретного аватара
                                    # Пример: users/5/2025/07/29/avatars_
                                    base_prefix = "_".join(parts[:-2]) + "_"

                                    # Список объектов для удаления с конкретным UUID
                                    objects = self.minio_client.list_objects(
                                        self.config.minio_bucket_avatars,
                                        prefix=base_prefix,
                                    )

                                    deleted_count = 0
                                    for obj in objects:
                                        # Проверяем что объект содержит наш UUID
                                        if uuid_part in obj.object_name:
                                            self.minio_client.remove_object(
                                                self.config.minio_bucket_avatars,
                                                obj.object_name,
                                            )
                                            deleted_count += 1
                                            logger.info(
                                                f"Deleted MinIO object: {obj.object_name}"
                                            )

                                    return deleted_count > 0
                                else:
                                    # Если структура имени нестандартная, удаляем только конкретный файл
                                    self.minio_client.remove_object(
                                        self.config.minio_bucket_avatars, object_name
                                    )
                                    logger.info(f"Deleted MinIO object: {object_name}")
                                    return True
                            except Exception as parse_error:
                                logger.warning(
                                    f"Could not parse object name {object_name}, deleting single file: {str(parse_error)}"
                                )
                                # Fallback: удаляем только конкретный файл
                                self.minio_client.remove_object(
                                    self.config.minio_bucket_avatars, object_name
                                )
                                logger.info(f"Deleted MinIO object: {object_name}")
                                return True

                            except S3Error as e:
                                logger.error(
                                    f"Failed to delete avatar from MinIO: {str(e)}"
                                )
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
                detail=f"File size too large. Maximum size: {self.config.avatar_max_size} bytes",
            )

        # Проверка расширения файла
        file_extension = self._get_file_extension(file.filename)
        allowed_extensions = [
            ext.strip() for ext in self.config.avatar_allowed_extensions.split(",")
        ]

        # Убираем точку из расширения для сравнения с конфигурацией
        file_extension_clean = file_extension.lower().lstrip(".")

        if file_extension_clean not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}",
            )

        # Проверка, что файл действительно является изображением
        try:
            image = Image.open(BytesIO(content))
            image.verify()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file"
            )

    async def _resize_avatar_image(self, content: bytes) -> dict:
        """Изменение размера изображения аватара."""
        processed_images = {}

        # Получаем размеры из конфигурации
        dimensions = [
            dim.strip() for dim in self.config.avatar_resize_dimensions.split(",")
        ]

        for dimension in dimensions:
            width, height = map(int, dimension.split("x"))

            # Открываем изображение
            image = Image.open(BytesIO(content))

            # Конвертируем в RGB если нужно
            if image.mode in ("RGBA", "LA", "P"):
                # Создаем белый фон для прозрачных изображений
                background = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                background.paste(
                    image, mask=image.split()[-1] if image.mode == "RGBA" else None
                )
                image = background

            # Изменяем размер с сохранением пропорций
            image.thumbnail((width, height), Image.Resampling.LANCZOS)

            # Создаем квадратное изображение с центрированием
            final_image = Image.new("RGB", (width, height), (255, 255, 255))
            paste_x = (width - image.width) // 2
            paste_y = (height - image.height) // 2
            final_image.paste(image, (paste_x, paste_y))

            # Сохраняем в байты
            output = BytesIO()
            final_image.save(output, format="JPEG", quality=85, optimize=True)
            processed_images[dimension] = output.getvalue()

        return processed_images

    async def _scan_for_viruses(
        self, content: bytes, filename: str = "", user_id: int = 0
    ) -> None:
        """
        Комплексная антивирусная проверка файлов с логированием и уведомлениями.

        Args:
            content: Содержимое файла в байтах
            filename: Имя файла (для логирования)
            user_id: ID пользователя (для логирования)

        Raises:
            HTTPException: При обнаружении угроз
        """
        file_hash = self._generate_file_hash(content)
        scan_start = datetime.now()

        try:
            # Инициализируем результаты сканирования
            scan_results = {
                "filename": filename,
                "user_id": user_id,
                "file_hash": file_hash,
                "file_size": len(content),
                "scan_timestamp": scan_start.isoformat(),
                "threats_found": [],
                "scan_engine": self.config.virus_scan_engine,
                "scan_duration_ms": 0,
            }

            threats_found = []

            # 1. Проверка паттернов (быстрая проверка)
            if self.config.scan_patterns_enabled:
                pattern_threats = await self._scan_patterns(content, filename)
                threats_found.extend(pattern_threats)

            # 2. Проверка магических байтов
            if self.config.scan_magic_bytes:
                magic_threats = await self._scan_magic_bytes(content, filename)
                threats_found.extend(magic_threats)

            # 3. Проверка встроенного контента
            if self.config.scan_embedded_content:
                embedded_threats = await self._scan_embedded_content(content, filename)
                threats_found.extend(embedded_threats)

            # 4. ClamAV сканирование (если доступно)
            if self.config.virus_scan_engine in ["clamav", "both"]:
                clamav_threats = await self._scan_with_clamav(content, filename)
                threats_found.extend(clamav_threats)

            scan_end = datetime.now()
            scan_results["scan_duration_ms"] = int(
                (scan_end - scan_start).total_seconds() * 1000
            )
            scan_results["threats_found"] = threats_found

            # Логирование результатов
            if threats_found:
                await self._log_security_incident(scan_results, "VIRUS_DETECTED")
                await self._quarantine_file(content, filename, user_id, threats_found)
                await self._notify_admin_security_incident(scan_results)

                # Выбрасываем исключение с детальной информацией
                threat_details = "; ".join([t["description"] for t in threats_found])
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file. Please load another one or contact support.",
                )
            else:
                # Логируем успешную проверку
                if self.config.security_log_enabled:
                    logger.info(
                        f"File scan completed successfully: {filename} (hash: {file_hash[:8]}...)"
                    )

        except HTTPException:
            # Перебрасываем HTTP исключения
            raise
        except Exception as e:
            # Логируем ошибки сканирования
            error_msg = f"Virus scan failed for file {filename}: {str(e)}"
            await self._log_security_incident(
                {
                    **scan_results,
                    "error": str(e),
                    "scan_duration_ms": int(
                        (datetime.now() - scan_start).total_seconds() * 1000
                    ),
                },
                "SCAN_ERROR",
            )

            # В случае ошибки сканирования - по умолчанию блокируем файл
            logger.error(error_msg)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Virus scan failed - file rejected for security",
            )

    def _get_file_extension(self, filename: Optional[str]) -> str:
        """Получение расширения файла."""
        if not filename:
            return ""
        return Path(filename).suffix.lower()

    async def _scan_patterns(
        self, content: bytes, filename: str
    ) -> List[Dict[str, Any]]:
        """Проверка на подозрительные паттерны в содержимом файла."""
        threats = []
        content_lower = content.lower()

        # Расширенные подозрительные паттерны
        suspicious_patterns = {
            # Веб-скрипты
            b"<script": "JavaScript injection attempt",
            b"javascript:": "JavaScript protocol detected",
            b"vbscript:": "VBScript detected",
            b"data:text/html": "Data URI HTML injection",
            # Серверные скрипты
            b"<?php": "PHP code detected",
            b"<%": "Server-side script detected",
            b"<%=": "ASP expression detected",
            b"<jsp:": "JSP tag detected",
            # Исполняемые команды
            b"exec(": "Code execution attempt",
            b"eval(": "Code evaluation attempt",
            b"system(": "System command execution",
            b"shell_exec": "Shell execution attempt",
            b"cmd.exe": "Windows command prompt",
            b"/bin/sh": "Unix shell detected",
            b"/bin/bash": "Bash shell detected",
            # Макросы Office
            b"auto_open": "Office macro autorun",
            b"autoexec": "Macro autoexecution",
            b"workbook_open": "Excel workbook macro",
            # Потенциально опасные расширения в содержимом
            b".exe": "Executable file reference",
            b".bat": "Batch file reference",
            b".cmd": "Command file reference",
            b".scr": "Screen saver executable",
            b".pif": "Program information file",
        }

        for pattern, description in suspicious_patterns.items():
            if pattern in content_lower:
                threats.append(
                    {
                        "type": "PATTERN_MATCH",
                        "pattern": pattern.decode("utf-8", errors="ignore"),
                        "description": description,
                        "severity": (
                            "HIGH"
                            if pattern in [b"<script", b"exec(", b"eval(", b"cmd.exe"]
                            else "MEDIUM"
                        ),
                    }
                )

        # Проверка соотношения исполняемого кода
        executable_patterns = [b"<script", b"<?php", b"exec(", b"eval("]
        exec_count = sum(
            1 for pattern in executable_patterns if pattern in content_lower
        )
        if exec_count > 2:
            threats.append(
                {
                    "type": "MULTIPLE_EXECUTABLE_PATTERNS",
                    "description": f"Multiple executable patterns detected ({exec_count})",
                    "severity": "HIGH",
                }
            )

        return threats

    async def _scan_magic_bytes(
        self, content: bytes, filename: str
    ) -> List[Dict[str, Any]]:
        """Проверка магических байтов для определения реального типа файла."""
        threats = []

        if len(content) < 16:
            return threats

        # Получаем расширение из имени файла
        file_ext = self._get_file_extension(filename).lower()

        # Магические байты известных форматов
        magic_signatures = {
            # Исполняемые файлы
            b"MZ": ("exe", "Windows executable"),
            b"\x7fELF": ("elf", "Linux executable"),
            b"\xca\xfe\xba\xbe": ("macho", "macOS executable"),
            # Архивы
            b"PK\x03\x04": ("zip", "ZIP archive"),
            b"Rar!": ("rar", "RAR archive"),
            b"7z\xbc\xaf\x27\x1c": ("7z", "7-Zip archive"),
            # Офисные документы (которые могут содержать макросы)
            b"\xd0\xcf\x11\xe0": ("ole", "OLE document (may contain macros)"),
            # Изображения (для проверки соответствия)
            b"\xff\xd8\xff": ("jpg", "JPEG image"),
            b"\x89PNG": ("png", "PNG image"),
            b"GIF8": ("gif", "GIF image"),
            b"RIFF": ("webp", "WebP/RIFF format"),
        }

        # Проверяем первые 16 байтов
        file_header = content[:16]

        for magic_bytes, (detected_type, description) in magic_signatures.items():
            if file_header.startswith(magic_bytes):
                # Проверяем соответствие расширения файла реальному типу
                expected_extensions = {
                    "exe": [".exe", ".dll", ".sys"],
                    "elf": [".bin", ".out"],
                    "zip": [".zip", ".jar", ".apk", ".docx", ".xlsx", ".pptx"],
                    "rar": [".rar"],
                    "7z": [".7z"],
                    "ole": [".doc", ".xls", ".ppt"],
                    "jpg": [".jpg", ".jpeg"],
                    "png": [".png"],
                    "gif": [".gif"],
                    "webp": [".webp"],
                }

                # Если это исполняемый файл - всегда угроза
                if detected_type in ["exe", "elf", "macho"]:
                    threats.append(
                        {
                            "type": "EXECUTABLE_FILE",
                            "description": f"{description} detected",
                            "severity": "CRITICAL",
                        }
                    )

                # Если расширение не соответствует содержимому - подозрительно
                elif detected_type in expected_extensions:
                    if file_ext not in expected_extensions[detected_type]:
                        threats.append(
                            {
                                "type": "FILE_TYPE_MISMATCH",
                                "description": f"File extension {file_ext} doesn't match content type {detected_type}",
                                "severity": "HIGH",
                            }
                        )

        return threats

    def _generate_file_hash(self, content: bytes) -> str:
        """Генерация хэша файла для дедупликации."""
        return hashlib.sha256(content).hexdigest()

    async def _scan_embedded_content(
        self, content: bytes, filename: str
    ) -> List[Dict[str, Any]]:
        """Проверка на встроенный подозрительный контент."""
        threats = []

        # Поиск встроенных файлов и архивов
        embedded_patterns = {
            b"PK\x03\x04": "Embedded ZIP archive",
            b"Rar!": "Embedded RAR archive",
            b"MZ": "Embedded Windows executable",
            b"\x7fELF": "Embedded Linux executable",
        }

        # Ищем паттерны не в начале файла (встроенное содержимое)
        for i in range(
            100, min(len(content) - 4, 10000)
        ):  # Проверяем первые 10KB после первых 100 байт
            chunk = content[i : i + 4]
            for pattern, description in embedded_patterns.items():
                if chunk == pattern:
                    threats.append(
                        {
                            "type": "EMBEDDED_CONTENT",
                            "description": f"{description} found at offset {i}",
                            "severity": "HIGH",
                            "offset": i,
                        }
                    )

        # Проверка на подозрительные URL
        url_patterns = [
            b"http://",
            b"https://",
            b"ftp://",
            b"file://",
        ]

        total_urls = sum(content.count(pattern) for pattern in url_patterns)

        if total_urls > 10:  # Много URL в файле
            threats.append(
                {
                    "type": "SUSPICIOUS_URL_COUNT",
                    "description": f"File contains {total_urls} URLs",
                    "severity": "MEDIUM",
                }
            )

        return threats

    async def _scan_with_clamav(
        self, content: bytes, filename: str
    ) -> List[Dict[str, Any]]:
        """Сканирование с помощью ClamAV антивируса."""
        threats = []

        try:
            # Пытаемся подключиться к ClamAV
            if os.path.exists(self.config.clamav_socket_path):
                # Unix socket подключение
                result = await self._clamav_scan_unix_socket(content)
            else:
                # TCP подключение
                result = await self._clamav_scan_tcp(content)

            if result and result != "OK":
                threats.append(
                    {
                        "type": "CLAMAV_DETECTION",
                        "description": f"ClamAV detected: {result}",
                        "severity": "CRITICAL",
                    }
                )

        except Exception as e:
            logger.warning(f"ClamAV scan failed for {filename}: {str(e)}")
            # Не выбрасываем исключение - продолжаем с другими методами

        return threats

    async def _clamav_scan_unix_socket(self, content: bytes) -> str:
        """ClamAV сканирование через Unix socket."""
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_unix_connection(self.config.clamav_socket_path),
                timeout=self.config.clamav_timeout,
            )

            # Отправляем команду INSTREAM
            writer.write(b"zINSTREAM\0")
            await writer.drain()

            # Отправляем размер данных
            size = len(content)
            writer.write(size.to_bytes(4, byteorder="big"))
            await writer.drain()

            # Отправляем данные
            writer.write(content)
            await writer.drain()

            # Сигнализируем об окончании
            writer.write(b"\0\0\0\0")
            await writer.drain()

            # Читаем ответ
            response = await reader.read(1024)
            writer.close()
            await writer.wait_closed()

            result = response.decode().strip()
            return result.split(": ")[1] if ": " in result else result

        except Exception as e:
            logger.error(f"ClamAV Unix socket scan failed: {str(e)}")
            raise

    async def _clamav_scan_tcp(self, content: bytes) -> str:
        """ClamAV сканирование через TCP."""
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(
                    self.config.clamav_host, self.config.clamav_port
                ),
                timeout=self.config.clamav_timeout,
            )

            # Аналогично Unix socket версии
            writer.write(b"zINSTREAM\0")
            await writer.drain()

            size = len(content)
            writer.write(size.to_bytes(4, byteorder="big"))
            await writer.drain()

            writer.write(content)
            await writer.drain()

            writer.write(b"\0\0\0\0")
            await writer.drain()

            response = await reader.read(1024)
            writer.close()
            await writer.wait_closed()

            result = response.decode().strip()
            return result.split(": ")[1] if ": " in result else result

        except Exception as e:
            logger.error(f"ClamAV TCP scan failed: {str(e)}")
            raise

    async def _log_security_incident(
        self,
        scan_results: Dict[str, Any],
        incident_type: str,
        client_ip: str = "unknown",
        user_agent: str = "unknown",
    ) -> None:
        """
        Логирование инцидентов безопасности.

        Args:
            scan_results: Результаты сканирования
            incident_type: Тип инцидента
            client_ip: IP адрес клиента (получать из fastapi.Request.client.host)
            user_agent: User-Agent клиента (получать из fastapi.Request.headers.get("user-agent"))
        """
        if not self.config.security_log_enabled:
            return

        try:
            # Формируем детальное сообщение об инциденте
            log_entry = {
                "timestamp": scan_results.get(
                    "scan_timestamp", datetime.now().isoformat()
                ),
                "incident_type": incident_type,
                "filename": scan_results.get("filename", "unknown"),
                "user_id": scan_results.get("user_id", 0),
                "file_hash": scan_results.get("file_hash", ""),
                "file_size": scan_results.get("file_size", 0),
                "scan_duration_ms": scan_results.get("scan_duration_ms", 0),
                "scan_engine": scan_results.get("scan_engine", "unknown"),
                "threats_found": scan_results.get("threats_found", []),
                "client_ip": client_ip,
                "user_agent": user_agent,
            }

            # Формируем сообщение для лога
            if incident_type == "VIRUS_DETECTED":
                threat_details = "; ".join(
                    [
                        f"{t.get('type', 'UNKNOWN')}: {t.get('description', 'No description')}"
                        for t in scan_results.get("threats_found", [])
                    ]
                )
                message = (
                    f"SECURITY ALERT - Virus detected: {scan_results.get('filename', 'unknown')} "
                    f"(user_id: {scan_results.get('user_id', 0)}, "
                    f"hash: {scan_results.get('file_hash', 'unknown')[:8]}..., "
                    f"threats: {threat_details})"
                )
                logger.error(message, extra={"security_incident": log_entry})

            elif incident_type == "SCAN_ERROR":
                message = (
                    f"SECURITY WARNING - Virus scan failed: {scan_results.get('filename', 'unknown')} "
                    f"(user_id: {scan_results.get('user_id', 0)}, "
                    f"error: {scan_results.get('error', 'unknown')})"
                )
                logger.warning(message, extra={"security_incident": log_entry})

            # Дополнительное логирование в специальный файл безопасности
            security_log_path = Path(self.config.security_log_file)
            security_log_path.parent.mkdir(parents=True, exist_ok=True)

            async with aiofiles.open(security_log_path, "a") as f:
                import json

                await f.write(f"{json.dumps(log_entry, ensure_ascii=False)}\n")

        except Exception as e:
            logger.error(f"Failed to log security incident: {str(e)}")

    async def _quarantine_file(
        self, content: bytes, filename: str, user_id: int, threats: List[Dict[str, Any]]
    ) -> None:
        """Помещение файла в карантин."""
        try:
            # Создаем директорию карантина
            quarantine_path = Path(self.config.quarantine_dir)
            quarantine_path.mkdir(parents=True, exist_ok=True)

            # Генерируем уникальное имя файла в карантине
            file_hash = self._generate_file_hash(content)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-")[
                :50
            ]
            quarantine_filename = (
                f"{timestamp}_{user_id}_{file_hash[:8]}_{safe_filename}.quarantine"
            )
            quarantine_file_path = quarantine_path / quarantine_filename

            # Сохраняем файл в карантине
            async with aiofiles.open(quarantine_file_path, "wb") as f:
                await f.write(content)

            # Создаем метаданные файла в карантине
            metadata = {
                "original_filename": filename,
                "user_id": user_id,
                "quarantine_timestamp": datetime.now().isoformat(),
                "file_hash": file_hash,
                "file_size": len(content),
                "threats_detected": threats,
                "retention_until": (
                    datetime.now()
                    + timedelta(days=self.config.quarantine_retention_days)
                ).isoformat(),
            }

            metadata_path = quarantine_file_path.with_suffix(".metadata.json")
            async with aiofiles.open(metadata_path, "w") as f:
                import json

                await f.write(json.dumps(metadata, ensure_ascii=False, indent=2))

            logger.warning(
                f"File quarantined: {quarantine_filename} (threats: {len(threats)})"
            )

        except Exception as e:
            logger.error(f"Failed to quarantine file {filename}: {str(e)}")

    async def _notify_admin_security_incident(
        self, scan_results: Dict[str, Any]
    ) -> None:
        """Уведомление администратора о инциденте безопасности."""
        if not self.config.admin_notifications_enabled:
            return

        try:
            # Подсчитываем количество недавних инцидентов
            incident_count = await self._count_recent_incidents()

            # Уведомляем только если превышен порог
            if incident_count >= self.config.admin_notification_threshold:

                notification_methods = [
                    method.strip()
                    for method in self.config.admin_notification_methods.split(",")
                ]

                for method in notification_methods:
                    if method == "email":
                        await self._send_admin_email_notification(
                            scan_results, incident_count
                        )
                    elif method == "log":
                        await self._send_admin_log_notification(
                            scan_results, incident_count
                        )
                    elif (
                        method == "webhook"
                        and self.config.admin_notification_webhook_url
                    ):
                        await self._send_admin_webhook_notification(
                            scan_results, incident_count
                        )

        except Exception as e:
            logger.error(f"Failed to send admin notification: {str(e)}")

    async def _count_recent_incidents(self) -> int:
        """Подсчет количества недавних инцидентов безопасности."""
        try:
            security_log_path = Path(self.config.security_log_file)
            if not security_log_path.exists():
                return 0

            recent_incidents = 0
            cutoff_time = datetime.now() - timedelta(hours=1)  # За последний час

            async with aiofiles.open(security_log_path, "r") as f:
                async for line in f:
                    try:
                        import json

                        incident = json.loads(line.strip())
                        incident_time = datetime.fromisoformat(
                            incident.get("timestamp", "")
                        )
                        if (
                            incident_time > cutoff_time
                            and incident.get("incident_type") == "VIRUS_DETECTED"
                        ):
                            recent_incidents += 1
                    except (json.JSONDecodeError, ValueError):
                        continue

            return recent_incidents

        except Exception:
            return 0

    async def _send_admin_email_notification(
        self, scan_results: Dict[str, Any], incident_count: int
    ) -> None:
        """Отправка email уведомления администратору."""
        try:
            # Формируем тело письма
            threat_details = "\n".join(
                [
                    f"- {t.get('type', 'UNKNOWN')}: {t.get('description', 'No description')} (Severity: {t.get('severity', 'UNKNOWN')})"
                    for t in scan_results.get("threats_found", [])
                ]
            )

            email_body = f"""
SECURITY ALERT - Virus Detection Report

File: {scan_results.get('filename', 'unknown')}
User ID: {scan_results.get('user_id', 0)}
File Hash: {scan_results.get('file_hash', 'unknown')}
File Size: {scan_results.get('file_size', 0)} bytes
Scan Duration: {scan_results.get('scan_duration_ms', 0)}ms
Detection Time: {scan_results.get('scan_timestamp', 'unknown')}

Threats Detected:
{threat_details}

Recent incident count (last hour): {incident_count}

This is an automated security alert from Requify File Security System.
The file has been quarantined and access blocked.
"""

            subject = f"[SECURITY ALERT] Virus Detected - {scan_results.get('filename', 'unknown')}"

            # Используем email_service для отправки уведомления
            await email_service.send_notification_email(
                subject=subject,
                template_data={
                    "filename": scan_results.get("filename", "unknown"),
                    "user_id": scan_results.get("user_id", 0),
                    "file_hash": scan_results.get("file_hash", "unknown"),
                    "file_size": scan_results.get("file_size", 0),
                    "scan_duration_ms": scan_results.get("scan_duration_ms", 0),
                    "scan_timestamp": scan_results.get("scan_timestamp", "unknown"),
                    "threat_details": threat_details,
                    "incident_count": incident_count,
                },
                template_name="security_alert",
                recipients=(
                    [settings.admin.email]
                    if hasattr(settings, "admin") and hasattr(settings.admin, "email")
                    else []
                ),
            )

            logger.info("Security alert email sent to admin via email_service")

        except Exception as e:
            logger.error(f"Failed to send admin email notification: {str(e)}")

    async def _send_admin_log_notification(
        self, scan_results: Dict[str, Any], incident_count: int
    ) -> None:
        """Отправка log уведомления администратору."""
        threat_summary = ", ".join(
            [t.get("type", "UNKNOWN") for t in scan_results.get("threats_found", [])]
        )

        logger.critical(
            f"ADMIN ALERT: Multiple security incidents detected! "
            f"Recent count: {incident_count}, "
            f"Latest threat: {threat_summary} in file {scan_results.get('filename', 'unknown')} "
            f"(user: {scan_results.get('user_id', 0)})"
        )

    async def _send_admin_webhook_notification(
        self, scan_results: Dict[str, Any], incident_count: int
    ) -> None:
        """Отправка webhook уведомления администратору."""
        try:
            try:
                import httpx
            except ImportError:
                logger.warning("Webhook notifications disabled - httpx not installed")
                return

            webhook_payload = {
                "alert_type": "security_incident",
                "severity": "critical",
                "incident_count": incident_count,
                "latest_incident": scan_results,
                "timestamp": datetime.now().isoformat(),
                "system": "requify_file_security",
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.config.admin_notification_webhook_url,
                    json=webhook_payload,
                    timeout=10,
                )
                response.raise_for_status()

            logger.info(f"Security webhook notification sent: {response.status_code}")

        except Exception as e:
            logger.error(f"Failed to send webhook notification: {str(e)}")

    def get_health_status(self) -> dict:
        """Получение статуса здоровья файлового сервиса."""
        status = {
            "storage_type": "minio" if self.config.use_minio else "local",
            "cdn_enabled": self.config.cdn_enabled,
            "minio_connected": False,
            "buckets_status": {},
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
                    self.config.minio_bucket_documents,
                ]

                for bucket in buckets:
                    status["buckets_status"][bucket] = self.minio_client.bucket_exists(
                        bucket
                    )

            except Exception as e:
                status["error"] = str(e)

        return status

    def force_bucket_policies_update(self) -> dict:
        """Принудительное обновление политик bucket'ов."""
        if not self.minio_client:
            return {"error": "MinIO client not initialized"}

        results = {}
        bucket_configs = [
            {
                "name": self.config.minio_bucket_uploads,
                "policy": "none",
                "description": "General uploads bucket",
            },
            {
                "name": self.config.minio_bucket_avatars,
                "policy": "download",
                "description": "User avatars bucket",
            },
            {
                "name": self.config.minio_bucket_documents,
                "policy": "none",
                "description": "Documents bucket",
            },
        ]

        for bucket_config in bucket_configs:
            bucket_name = bucket_config["name"]
            try:
                # Проверяем существование bucket'а
                if not self.minio_client.bucket_exists(bucket_name):
                    self.minio_client.make_bucket(bucket_name)
                    logger.info(f"Created missing bucket: {bucket_name}")

                # Принудительно устанавливаем политику
                self._set_bucket_policy(bucket_name, bucket_config["policy"])
                results[bucket_name] = {
                    "status": "success",
                    "policy": bucket_config["policy"],
                    "description": bucket_config["description"],
                }
                logger.info(
                    f"Updated policy for bucket {bucket_name}: {bucket_config['policy']}"
                )

            except Exception as e:
                results[bucket_name] = {"status": "error", "error": str(e)}
                logger.error(
                    f"Failed to update policy for bucket {bucket_name}: {str(e)}"
                )

        return results


# Создаем глобальный экземпляр сервиса
file_service = FileService()

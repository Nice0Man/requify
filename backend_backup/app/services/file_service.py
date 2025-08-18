"""
File Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

import os
import uuid
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Tuple, BinaryIO, Dict, Any, Union
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from io import BytesIO

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.logger import logger
from .base import BaseService, ServiceError


class FileServiceError(ServiceError):
    """Ошибки файлового сервиса."""

    pass


class FileNotFoundError(FileServiceError):
    """Ошибка - файл не найден."""

    pass


class FileUploadError(FileServiceError):
    """Ошибка загрузки файла."""

    pass


class FileValidationError(FileServiceError):
    """Ошибка валидации файла."""

    pass


class FileStorageError(FileServiceError):
    """Ошибка хранилища файлов."""

    pass


class FileType(str, Enum):
    """Типы файлов."""

    IMAGE = "image"
    DOCUMENT = "document"
    VIDEO = "video"
    AUDIO = "audio"
    ARCHIVE = "archive"
    OTHER = "other"


class StorageType(str, Enum):
    """Типы хранилищ."""

    LOCAL = "local"
    MINIO = "minio"
    S3 = "s3"
    AZURE = "azure"
    GCP = "gcp"


@dataclass
class FileInfo:
    """Информация о файле."""

    filename: str
    original_filename: str
    size: int
    content_type: str
    file_type: FileType
    hash_md5: str
    upload_path: str
    uploaded_at: datetime
    user_id: Optional[int] = None
    metadata: Dict[str, Any] = None


@dataclass
class UploadConfig:
    """Конфигурация загрузки."""

    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: List[str] = None
    allowed_mime_types: List[str] = None
    storage_type: StorageType = StorageType.LOCAL
    bucket_name: Optional[str] = None
    create_thumbnails: bool = False
    scan_for_viruses: bool = False


@dataclass
class ProcessingResult:
    """Результат обработки файла."""

    success: bool
    file_info: Optional[FileInfo] = None
    error_message: Optional[str] = None
    thumbnails: List[str] = None


# Абстрактные интерфейсы
class IFileStorage(ABC):
    """Интерфейс хранилища файлов."""

    @abstractmethod
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Загрузить файл."""
        pass

    @abstractmethod
    async def download_file(self, file_path: str) -> bytes:
        """Скачать файл."""
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """Удалить файл."""
        pass

    @abstractmethod
    async def get_file_url(
        self, file_path: str, expires_in: Optional[timedelta] = None
    ) -> str:
        """Получить URL файла."""
        pass


class IFileValidator(ABC):
    """Интерфейс валидатора файлов."""

    @abstractmethod
    async def validate_file(self, file: UploadFile, config: UploadConfig) -> bool:
        """Валидировать файл."""
        pass


class IFileProcessor(ABC):
    """Интерфейс процессора файлов."""

    @abstractmethod
    async def process_file(
        self, file: UploadFile, config: UploadConfig
    ) -> ProcessingResult:
        """Обработать файл."""
        pass


class IVirusScanner(ABC):
    """Интерфейс антивирусного сканера."""

    @abstractmethod
    async def scan_file(self, file_content: bytes) -> bool:
        """Сканировать файл на вирусы."""
        pass


# Конкретные реализации
class LocalFileStorage(IFileStorage):
    """Локальное хранилище файлов."""

    def __init__(self, base_path: str = "./uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Загрузить файл."""
        try:
            # Создание уникального пути
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix
            unique_filename = f"{file_id}{file_extension}"

            # Создание структуры директорий по дате
            date_path = datetime.now().strftime("%Y/%m/%d")
            full_dir = self.base_path / date_path
            full_dir.mkdir(parents=True, exist_ok=True)

            file_path = full_dir / unique_filename

            # Запись файла
            with open(file_path, "wb") as f:
                f.write(file_content)

            # Возврат относительного пути
            return f"{date_path}/{unique_filename}"

        except Exception as e:
            raise FileStorageError(f"Failed to upload file: {str(e)}")

    async def download_file(self, file_path: str) -> bytes:
        """Скачать файл."""
        try:
            full_path = self.base_path / file_path

            if not full_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            with open(full_path, "rb") as f:
                return f.read()

        except FileNotFoundError:
            raise
        except Exception as e:
            raise FileStorageError(f"Failed to download file: {str(e)}")

    async def delete_file(self, file_path: str) -> bool:
        """Удалить файл."""
        try:
            full_path = self.base_path / file_path

            if full_path.exists():
                full_path.unlink()
                return True

            return False

        except Exception as e:
            raise FileStorageError(f"Failed to delete file: {str(e)}")

    async def get_file_url(
        self, file_path: str, expires_in: Optional[timedelta] = None
    ) -> str:
        """Получить URL файла."""
        # Для локального хранилища возвращаем относительный путь
        return f"/uploads/{file_path}"


class StandardFileValidator(IFileValidator):
    """Стандартный валидатор файлов."""

    DANGEROUS_EXTENSIONS = {
        ".exe",
        ".bat",
        ".cmd",
        ".com",
        ".pif",
        ".scr",
        ".vbs",
        ".js",
        ".jar",
        ".sh",
        ".ps1",
        ".msi",
        ".dll",
        ".app",
        ".dmg",
    }

    async def validate_file(self, file: UploadFile, config: UploadConfig) -> bool:
        """Валидировать файл."""
        # Проверка размера файла
        if hasattr(file, "size") and file.size and file.size > config.max_file_size:
            raise FileValidationError(
                f"File size {file.size} exceeds limit {config.max_file_size}"
            )

        # Проверка расширения
        file_extension = Path(file.filename).suffix.lower()

        # Проверка на опасные расширения
        if file_extension in self.DANGEROUS_EXTENSIONS:
            raise FileValidationError(f"File extension {file_extension} is not allowed")

        # Проверка разрешенных расширений
        if config.allowed_extensions:
            if file_extension not in [ext.lower() for ext in config.allowed_extensions]:
                raise FileValidationError(
                    f"File extension {file_extension} is not allowed"
                )

        # Проверка MIME типа
        if config.allowed_mime_types:
            if file.content_type not in config.allowed_mime_types:
                raise FileValidationError(
                    f"MIME type {file.content_type} is not allowed"
                )

        return True


class BasicFileProcessor(IFileProcessor):
    """Базовый процессор файлов."""

    def __init__(self, storage: IFileStorage):
        self.storage = storage

    async def process_file(
        self, file: UploadFile, config: UploadConfig
    ) -> ProcessingResult:
        """Обработать файл."""
        try:
            # Чтение содержимого файла
            content = await file.read()

            # Генерация хеша
            hash_md5 = hashlib.md5(content).hexdigest()

            # Определение типа файла
            file_type = self._determine_file_type(file.filename, file.content_type)

            # Загрузка в хранилище
            upload_path = await self.storage.upload_file(
                content, file.filename, file.content_type
            )

            # Создание информации о файле
            file_info = FileInfo(
                filename=f"{uuid.uuid4()}{Path(file.filename).suffix}",
                original_filename=file.filename,
                size=len(content),
                content_type=file.content_type,
                file_type=file_type,
                hash_md5=hash_md5,
                upload_path=upload_path,
                uploaded_at=datetime.utcnow(),
                metadata={},
            )

            return ProcessingResult(success=True, file_info=file_info)

        except Exception as e:
            return ProcessingResult(success=False, error_message=str(e))

    def _determine_file_type(self, filename: str, content_type: str) -> FileType:
        """Определить тип файла."""
        extension = Path(filename).suffix.lower()

        # Изображения
        if extension in [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
        ] or content_type.startswith("image/"):
            return FileType.IMAGE

        # Документы
        elif extension in [
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".txt",
        ]:
            return FileType.DOCUMENT

        # Видео
        elif extension in [
            ".mp4",
            ".avi",
            ".mov",
            ".wmv",
            ".flv",
        ] or content_type.startswith("video/"):
            return FileType.VIDEO

        # Аудио
        elif extension in [".mp3", ".wav", ".ogg", ".flac"] or content_type.startswith(
            "audio/"
        ):
            return FileType.AUDIO

        # Архивы
        elif extension in [".zip", ".rar", ".7z", ".tar", ".gz"]:
            return FileType.ARCHIVE

        else:
            return FileType.OTHER


class MockVirusScanner(IVirusScanner):
    """Имитация антивирусного сканера."""

    async def scan_file(self, file_content: bytes) -> bool:
        """Сканировать файл на вирусы."""
        # Простая имитация - проверяем на подозрительные сигнатуры
        suspicious_patterns = [b"EICAR", b"X5O!P%@AP[4\\PZX54(P^)7CC)7}"]

        for pattern in suspicious_patterns:
            if pattern in file_content:
                return False  # Найден вирус

        return True  # Файл чистый


class FileService(BaseService):
    """
    Основной файловый сервис.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные хранилища и процессоры)
    - Template Method (процесс загрузки файла)
    - Factory (создание процессоров)
    - Chain of Responsibility (валидация)
    """

    def __init__(self):
        self._storage: IFileStorage = LocalFileStorage()
        self._validator: IFileValidator = StandardFileValidator()
        self._processor: IFileProcessor = BasicFileProcessor(self._storage)
        self._virus_scanner: Optional[IVirusScanner] = MockVirusScanner()

        # Конфигурации по умолчанию
        self._default_configs = {
            FileType.IMAGE: UploadConfig(
                max_file_size=5 * 1024 * 1024,  # 5MB
                allowed_extensions=[".jpg", ".jpeg", ".png", ".gif", ".webp"],
                allowed_mime_types=[
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                ],
                create_thumbnails=True,
            ),
            FileType.DOCUMENT: UploadConfig(
                max_file_size=20 * 1024 * 1024,  # 20MB
                allowed_extensions=[".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
                allowed_mime_types=[
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "text/plain",
                ],
            ),
        }

        super().__init__()

    def get_service_name(self) -> str:
        return "FileService"

    def set_storage(self, storage: IFileStorage):
        """Установить хранилище файлов."""
        self._storage = storage
        self._processor = BasicFileProcessor(storage)
        self._log_operation("set_storage", {"storage": type(storage).__name__})

    def set_validator(self, validator: IFileValidator):
        """Установить валидатор файлов."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    def set_virus_scanner(self, scanner: Optional[IVirusScanner]):
        """Установить антивирусный сканер."""
        self._virus_scanner = scanner
        self._log_operation(
            "set_virus_scanner",
            {"scanner": type(scanner).__name__ if scanner else None},
        )

    async def upload_file(
        self,
        file: UploadFile,
        user_id: Optional[int] = None,
        file_type: Optional[FileType] = None,
        config: Optional[UploadConfig] = None,
    ) -> FileInfo:
        """Загрузить файл."""
        try:
            self._log_operation(
                "upload_file",
                {
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "user_id": user_id,
                    "file_type": file_type.value if file_type else None,
                },
            )

            # Определение конфигурации
            if not config:
                determined_type = file_type or self._determine_file_type_from_upload(
                    file
                )
                config = self._default_configs.get(determined_type, UploadConfig())

            # Валидация файла
            await self._validator.validate_file(file, config)

            # Антивирусная проверка
            if config.scan_for_viruses and self._virus_scanner:
                content = await file.read()
                await file.seek(0)  # Возврат к началу файла

                is_clean = await self._virus_scanner.scan_file(content)
                if not is_clean:
                    raise FileValidationError("File failed virus scan")

            # Обработка файла
            processing_result = await self._processor.process_file(file, config)

            if not processing_result.success:
                raise FileUploadError(processing_result.error_message)

            # Установка ID пользователя
            if user_id:
                processing_result.file_info.user_id = user_id

            return processing_result.file_info

        except Exception as e:
            raise self._handle_error(e, "upload_file")

    async def download_file(self, file_path: str) -> bytes:
        """Скачать файл."""
        try:
            self._log_operation("download_file", {"file_path": file_path})

            return await self._storage.download_file(file_path)

        except Exception as e:
            raise self._handle_error(e, "download_file")

    async def delete_file(self, file_path: str) -> bool:
        """Удалить файл."""
        try:
            self._log_operation("delete_file", {"file_path": file_path})

            return await self._storage.delete_file(file_path)

        except Exception as e:
            raise self._handle_error(e, "delete_file")

    async def get_file_url(
        self, file_path: str, expires_in: Optional[timedelta] = None
    ) -> str:
        """Получить URL файла."""
        try:
            self._log_operation(
                "get_file_url",
                {
                    "file_path": file_path,
                    "expires_in": str(expires_in) if expires_in else None,
                },
            )

            return await self._storage.get_file_url(file_path, expires_in)

        except Exception as e:
            raise self._handle_error(e, "get_file_url")

    async def validate_file_upload(
        self, file: UploadFile, file_type: Optional[FileType] = None
    ) -> bool:
        """Валидировать загрузку файла."""
        try:
            self._log_operation(
                "validate_file_upload",
                {
                    "filename": file.filename,
                    "file_type": file_type.value if file_type else None,
                },
            )

            # Определение конфигурации
            determined_type = file_type or self._determine_file_type_from_upload(file)
            config = self._default_configs.get(determined_type, UploadConfig())

            return await self._validator.validate_file(file, config)

        except Exception as e:
            raise self._handle_error(e, "validate_file_upload")

    def _determine_file_type_from_upload(self, file: UploadFile) -> FileType:
        """Определить тип файла из UploadFile."""
        if not file.filename:
            return FileType.OTHER

        extension = Path(file.filename).suffix.lower()
        content_type = file.content_type or ""

        # Изображения
        if extension in [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
        ] or content_type.startswith("image/"):
            return FileType.IMAGE

        # Документы
        elif extension in [
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".txt",
        ]:
            return FileType.DOCUMENT

        # Видео
        elif extension in [
            ".mp4",
            ".avi",
            ".mov",
            ".wmv",
            ".flv",
        ] or content_type.startswith("video/"):
            return FileType.VIDEO

        # Аудио
        elif extension in [".mp3", ".wav", ".ogg", ".flac"] or content_type.startswith(
            "audio/"
        ):
            return FileType.AUDIO

        # Архивы
        elif extension in [".zip", ".rar", ".7z", ".tar", ".gz"]:
            return FileType.ARCHIVE

        else:
            return FileType.OTHER

    def get_upload_config(self, file_type: FileType) -> UploadConfig:
        """Получить конфигурацию загрузки для типа файла."""
        return self._default_configs.get(file_type, UploadConfig())

    def set_upload_config(self, file_type: FileType, config: UploadConfig):
        """Установить конфигурацию загрузки для типа файла."""
        self._default_configs[file_type] = config
        self._log_operation(
            "set_upload_config",
            {"file_type": file_type.value, "max_size": config.max_file_size},
        )

    # Convenience методы
    async def upload_image(
        self,
        file: UploadFile,
        user_id: Optional[int] = None,
        create_thumbnails: bool = True,
    ) -> FileInfo:
        """Загрузить изображение."""
        config = self.get_upload_config(FileType.IMAGE)
        config.create_thumbnails = create_thumbnails

        return await self.upload_file(file, user_id, FileType.IMAGE, config)

    async def upload_document(
        self, file: UploadFile, user_id: Optional[int] = None
    ) -> FileInfo:
        """Загрузить документ."""
        return await self.upload_file(file, user_id, FileType.DOCUMENT)

    async def upload_avatar(self, file: UploadFile, user_id: int) -> FileInfo:
        """Загрузить аватар пользователя."""
        config = UploadConfig(
            max_file_size=2 * 1024 * 1024,  # 2MB
            allowed_extensions=[".jpg", ".jpeg", ".png"],
            allowed_mime_types=["image/jpeg", "image/png"],
            create_thumbnails=True,
        )

        return await self.upload_file(file, user_id, FileType.IMAGE, config)


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("file", FileService)

# Singleton instance
file_service = FileService()

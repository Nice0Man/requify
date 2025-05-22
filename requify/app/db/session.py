from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Создаем движок для соединения с базой данных
engine = create_engine(
    str(settings.DATABASE_URI),
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

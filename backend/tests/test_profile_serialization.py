"""
Тест специально для проблемы сериализации profile.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, selectinload

from app.models.base import Base
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user import UserDetailed


@pytest.fixture(scope="function")
def test_db():
    """Создает простую тестовую базу данных в памяти."""
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False}
    )
    
    # Создаем таблицы
    Base.metadata.create_all(engine)
    
    # Возвращаем сессию
    with Session(engine) as session:
        yield session
    
    # Очищаем после теста
    Base.metadata.drop_all(engine)


def test_user_with_profile_serialization(test_db):
    """Тестирует сериализацию пользователя с профилем."""
    # Создаем пользователя
    user = User(
        username="testuser",
        email="test@example.com",
        name="Test User",
        password_hash="fake_hash",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    # Создаем профиль
    profile = UserProfile(
        user_id=user.id,
        first_name="Test",
        last_name="User",
        display_name="Test User",
        bio="Test bio"
    )
    test_db.add(profile)
    test_db.commit()
    
    # Загружаем пользователя с профилем
    user_with_profile = test_db.query(User).options(
        selectinload(User.profile)
    ).filter(User.id == user.id).first()
    
    # Проверяем, что профиль загружен
    assert user_with_profile.profile is not None
    assert user_with_profile.profile.first_name == "Test"
    
    # Сериализуем в UserDetailed
    try:
        user_detailed = UserDetailed.model_validate(user_with_profile)
        
        # Проверяем сериализацию
        assert user_detailed.username == "testuser"
        assert user_detailed.email == "test@example.com"
        assert user_detailed.profile is not None
        
        # Если profile сериализован как словарь, проверяем его содержимое
        if isinstance(user_detailed.profile, dict):
            assert user_detailed.profile.get("first_name") == "Test"
            assert user_detailed.profile.get("last_name") == "User"
        
        print("Сериализация прошла успешно!")
        print(f"Profile type: {type(user_detailed.profile)}")
        print(f"Profile content: {user_detailed.profile}")
        
    except Exception as e:
        print(f"Ошибка сериализации: {e}")
        raise


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

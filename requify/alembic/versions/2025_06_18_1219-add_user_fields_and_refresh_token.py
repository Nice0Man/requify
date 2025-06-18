"""add_user_fields_and_refresh_token

Revision ID: add_user_fields_and_refresh_token
Revises:
Create Date: 2025-06-18 12:19:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = "1bd46c4e9ded"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # First, add nullable columns to users table
    op.add_column(
        "users",
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=True,
            comment="Полное имя пользователя",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "is_active", sa.Boolean(), nullable=True, comment="Активен ли пользователь"
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "is_superuser",
            sa.Boolean(),
            nullable=True,
            comment="Является ли пользователь суперпользователем",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "last_login",
            sa.DateTime(),
            nullable=True,
            comment="Время последнего входа в систему",
        ),
    )

    # Update existing users with default values
    op.execute(text("UPDATE users SET is_active = true WHERE is_active IS NULL"))
    op.execute(text("UPDATE users SET is_superuser = false WHERE is_superuser IS NULL"))
    op.execute(text("UPDATE users SET is_superuser = true WHERE role = 'admin'"))

    # Now make the columns NOT NULL
    op.alter_column("users", "is_active", nullable=False)
    op.alter_column("users", "is_superuser", nullable=False)

    # Update role column comment
    op.alter_column(
        "users",
        "role",
        existing_type=sa.VARCHAR(length=20),
        comment="Роль пользователя (admin, manager, analyst, developer, tester, user)",
        existing_comment="Роль пользователя (admin, manager, analyst, developer, tester)",
        existing_nullable=False,
    )

    # Create indexes for new columns
    op.create_index("ix_users_is_active", "users", ["is_active"], unique=False)
    op.create_index("ix_users_last_login", "users", ["last_login"], unique=False)

    # Create refresh_tokens table
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "token",
            sa.String(length=255),
            nullable=False,
            comment="Уникальный токен обновления",
        ),
        sa.Column("user_id", sa.Integer(), nullable=False, comment="ID пользователя"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, comment="Время создания токена"
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(),
            nullable=False,
            comment="Время истечения токена",
        ),
        sa.Column(
            "last_used_at",
            sa.DateTime(),
            nullable=True,
            comment="Время последнего использования токена",
        ),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, comment="Активен ли токен"
        ),
        sa.Column("user_agent", sa.Text(), nullable=True, comment="User-Agent клиента"),
        sa.Column(
            "ip_address",
            sa.String(length=45),
            nullable=True,
            comment="IP адрес клиента",
        ),
        sa.Column(
            "revoked_at", sa.DateTime(), nullable=True, comment="Время отзыва токена"
        ),
        sa.Column(
            "revoked_by",
            sa.String(length=50),
            nullable=True,
            comment="Причина отзыва токена",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_refresh_tokens_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_refresh_tokens")),
        sa.UniqueConstraint("token", name=op.f("uq_refresh_tokens_token")),
    )

    # Create indexes for refresh_tokens table
    op.create_index(
        "ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"], unique=False
    )
    op.create_index(
        "ix_refresh_tokens_is_active", "refresh_tokens", ["is_active"], unique=False
    )
    op.create_index(
        "ix_refresh_tokens_token_unique", "refresh_tokens", ["token"], unique=True
    )
    op.create_index(
        "ix_refresh_tokens_user_active",
        "refresh_tokens",
        ["user_id", "is_active"],
        unique=False,
    )
    op.create_index(
        "ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop refresh_tokens table and indexes
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_active", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_token_unique", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_is_active", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    # Drop user indexes and columns
    op.drop_index("ix_users_last_login", table_name="users")
    op.drop_index("ix_users_is_active", table_name="users")
    op.alter_column(
        "users",
        "role",
        existing_type=sa.VARCHAR(length=20),
        comment="Роль пользователя (admin, manager, analyst, developer, tester)",
        existing_comment="Роль пользователя (admin, manager, analyst, developer, tester, user)",
        existing_nullable=False,
    )
    op.drop_column("users", "last_login")
    op.drop_column("users", "is_superuser")
    op.drop_column("users", "is_active")
    op.drop_column("users", "name")

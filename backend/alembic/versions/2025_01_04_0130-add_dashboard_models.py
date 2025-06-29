"""add_dashboard_models

Revision ID: add_dashboard_models
Revises: 4ac2d2b53298
Create Date: 2025-01-04 01:30:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "add_dashboard_models"
down_revision = "4ac2d2b53298"
branch_labels = None
depends_on = None


def upgrade():
    # Create user_dashboard_preferences table
    op.create_table(
        "user_dashboard_preferences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("show_quick_stats", sa.Boolean(), nullable=True, default=True),
        sa.Column("show_recent_activity", sa.Boolean(), nullable=True, default=True),
        sa.Column("show_my_projects", sa.Boolean(), nullable=True, default=True),
        sa.Column("show_pending_approvals", sa.Boolean(), nullable=True, default=True),
        sa.Column("default_project_filter", sa.String(length=100), nullable=True),
        sa.Column("activity_limit", sa.Integer(), nullable=True, default=20),
        sa.Column("refresh_interval", sa.Integer(), nullable=True, default=300),
        sa.Column("theme", sa.String(length=20), nullable=True, default="light"),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=True, default=True),
        sa.Column("email_notifications", sa.Boolean(), nullable=True, default=True),
        sa.Column("timezone", sa.String(length=50), nullable=True, default="UTC"),
        sa.Column("custom_settings", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(
        op.f("ix_user_dashboard_preferences_id"),
        "user_dashboard_preferences",
        ["id"],
        unique=False,
    )

    # Create dashboard_notifications table
    op.create_table(
        "dashboard_notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("action_url", sa.String(length=255), nullable=True),
        sa.Column("action_text", sa.String(length=100), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=True, default=False),
        sa.Column("priority", sa.String(length=20), nullable=True, default="medium"),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("requirement_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["requirement_id"],
            ["requirements.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_dashboard_notifications_id"),
        "dashboard_notifications",
        ["id"],
        unique=False,
    )

    # Create dashboard_activities table
    op.create_table(
        "dashboard_activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("activity_type", sa.String(length=50), nullable=False),
        sa.Column("activity_title", sa.String(length=200), nullable=False),
        sa.Column("activity_description", sa.Text(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("user_name", sa.String(length=100), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("requirement_id", sa.Integer(), nullable=True),
        sa.Column("entity_type", sa.String(length=50), nullable=True),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("entity_name", sa.String(length=200), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("priority", sa.String(length=20), nullable=True),
        sa.Column("extra_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["requirement_id"],
            ["requirements.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_dashboard_activities_id"), "dashboard_activities", ["id"], unique=False
    )

    # Create dashboard_widgets table
    op.create_table(
        "dashboard_widgets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("widget_type", sa.String(length=50), nullable=False),
        sa.Column("widget_title", sa.String(length=100), nullable=False),
        sa.Column("position", sa.Integer(), nullable=True, default=0),
        sa.Column("size", sa.String(length=20), nullable=True, default="medium"),
        sa.Column("is_visible", sa.Boolean(), nullable=True, default=True),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_dashboard_widgets_id"), "dashboard_widgets", ["id"], unique=False
    )


def downgrade():
    # Drop dashboard tables
    op.drop_index(op.f("ix_dashboard_widgets_id"), table_name="dashboard_widgets")
    op.drop_table("dashboard_widgets")

    op.drop_index(op.f("ix_dashboard_activities_id"), table_name="dashboard_activities")
    op.drop_table("dashboard_activities")

    op.drop_index(
        op.f("ix_dashboard_notifications_id"), table_name="dashboard_notifications"
    )
    op.drop_table("dashboard_notifications")

    op.drop_index(
        op.f("ix_user_dashboard_preferences_id"),
        table_name="user_dashboard_preferences",
    )
    op.drop_table("user_dashboard_preferences")

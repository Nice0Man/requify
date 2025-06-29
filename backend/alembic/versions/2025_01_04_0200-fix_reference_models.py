"""Fix reference models

Revision ID: fix_reference_models
Revises: add_dashboard_models
Create Date: 2025-01-04 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'fix_reference_models'
down_revision: Union[str, None] = 'add_dashboard_models'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add missing columns to requirement_priorities table
    op.add_column('requirement_priorities', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('requirement_priorities', sa.Column('level', sa.Integer(), nullable=True, default=5))
    op.add_column('requirement_priorities', sa.Column('color', sa.String(length=20), nullable=True))
    op.add_column('requirement_priorities', sa.Column('is_active', sa.Boolean(), nullable=False, default=True))
    op.add_column('requirement_priorities', sa.Column('sort_order', sa.Integer(), nullable=False, default=0))

    # Add missing columns to requirement_statuses table
    op.add_column('requirement_statuses', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('requirement_statuses', sa.Column('color', sa.String(length=20), nullable=True))
    op.add_column('requirement_statuses', sa.Column('is_final', sa.Boolean(), nullable=False, default=False))
    op.add_column('requirement_statuses', sa.Column('is_active', sa.Boolean(), nullable=False, default=True))
    op.add_column('requirement_statuses', sa.Column('sort_order', sa.Integer(), nullable=False, default=0))
    op.add_column('requirement_statuses', sa.Column('workflow_transitions', postgresql.ARRAY(sa.Integer()), nullable=True))


def downgrade() -> None:
    # Remove columns from requirement_statuses table
    op.drop_column('requirement_statuses', 'workflow_transitions')
    op.drop_column('requirement_statuses', 'sort_order')
    op.drop_column('requirement_statuses', 'is_active')
    op.drop_column('requirement_statuses', 'is_final')
    op.drop_column('requirement_statuses', 'color')
    op.drop_column('requirement_statuses', 'description')

    # Remove columns from requirement_priorities table
    op.drop_column('requirement_priorities', 'sort_order')
    op.drop_column('requirement_priorities', 'is_active')
    op.drop_column('requirement_priorities', 'color')
    op.drop_column('requirement_priorities', 'level')
    op.drop_column('requirement_priorities', 'description') 
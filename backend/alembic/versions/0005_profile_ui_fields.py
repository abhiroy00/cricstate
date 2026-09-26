"""profile UI fields for mobile Profile screen

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-26

Adds columns consumed by mobile ProfileScreen:
playing_role, batting_style, bowling_style, profile_views
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0005'
down_revision: Union[str, None] = '0004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('profiles', sa.Column('playing_role', sa.String(length=30), nullable=True))
    op.add_column('profiles', sa.Column('batting_style', sa.String(length=50), nullable=True))
    op.add_column('profiles', sa.Column('bowling_style', sa.String(length=50), nullable=True))
    op.add_column(
        'profiles',
        sa.Column('profile_views', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('profiles', 'profile_views')
    op.drop_column('profiles', 'bowling_style')
    op.drop_column('profiles', 'batting_style')
    op.drop_column('profiles', 'playing_role')

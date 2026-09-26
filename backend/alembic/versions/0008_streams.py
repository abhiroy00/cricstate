"""match live-stream metadata table

Revision ID: 0008
Revises: 0007
Create Date: 2026-09-26

Stores live-video *metadata* only (status, HLS playback URL, viewer
count, ingest key hint). The video pipeline itself (RTMP ingest,
transcoder, CDN) runs outside FastAPI. One stream per match.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0008'
down_revision: Union[str, None] = '0007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'streams',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('match_id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('playback_url', sa.String(length=500), nullable=True),
        sa.Column('stream_key', sa.String(length=100), nullable=True),
        sa.Column('stream_key_hint', sa.String(length=12), nullable=True),
        sa.Column('viewer_count', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_streams_match_id', 'streams', ['match_id'], unique=True)
    op.create_index('ix_streams_status', 'streams', ['status'])


def downgrade() -> None:
    op.drop_index('ix_streams_status', table_name='streams')
    op.drop_index('ix_streams_match_id', table_name='streams')
    op.drop_table('streams')

"""listing reviews for community detail screens

Revision ID: 0007
Revises: 0006
Create Date: 2026-09-26

Backs the Write-review modals on every community detail screen
(streamers, organisers, academies, grounds, box-cricket): one rating
(1-5) + optional text per user per listing.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0007'
down_revision: Union[str, None] = '0006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'listing_reviews',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('listing_id', sa.Uuid(), nullable=False),
        sa.Column('reviewer_id', sa.Uuid(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['listing_id'], ['directory_listings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_listing_reviews_listing_id', 'listing_reviews', ['listing_id'])
    op.create_index('ix_listing_reviews_reviewer_id', 'listing_reviews', ['reviewer_id'])


def downgrade() -> None:
    op.drop_index('ix_listing_reviews_reviewer_id', table_name='listing_reviews')
    op.drop_index('ix_listing_reviews_listing_id', table_name='listing_reviews')
    op.drop_table('listing_reviews')

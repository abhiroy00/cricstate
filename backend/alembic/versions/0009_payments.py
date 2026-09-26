"""payments table for store order checkout

Revision ID: 0009
Revises: 0008
Create Date: 2026-09-26

One row per payment attempt against an order. Works fully in test mode
(provider='test', no external call); a real gateway plugs into the same
rows via provider/provider_ref + the /webhooks/payments endpoint.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0009'
down_revision: Union[str, None] = '0008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'payments',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('order_id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('provider', sa.String(length=30), nullable=False),
        sa.Column('provider_ref', sa.String(length=100), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_payments_order_id', 'payments', ['order_id'])
    op.create_index('ix_payments_user_id', 'payments', ['user_id'])
    op.create_index('ix_payments_provider_ref', 'payments', ['provider_ref'], unique=True)
    op.create_index('ix_payments_status', 'payments', ['status'])


def downgrade() -> None:
    op.drop_index('ix_payments_status', table_name='payments')
    op.drop_index('ix_payments_provider_ref', table_name='payments')
    op.drop_index('ix_payments_user_id', table_name='payments')
    op.drop_index('ix_payments_order_id', table_name='payments')
    op.drop_table('payments')

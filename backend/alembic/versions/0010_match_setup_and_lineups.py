"""match setup fields + match lineups

Revision ID: 0010
Revises: 0009
Create Date: 2026-09-27

Backs the Start A Match flow:
- extra match columns captured on the Match Setup screen (ball type,
  overs per bowler, power play, pitch type, wagon wheel, officials, city)
- match_lineups: the per-team squad / playing XI selected before toss.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0010'
down_revision: Union[str, None] = '0009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('matches', sa.Column('ball_type', sa.String(length=20), nullable=True))
    op.add_column('matches', sa.Column('overs_per_bowler', sa.Integer(), nullable=True))
    op.add_column('matches', sa.Column('powerplay_overs', sa.Integer(), nullable=True))
    op.add_column('matches', sa.Column('pitch_type', sa.String(length=20), nullable=True))
    op.add_column(
        'matches',
        sa.Column('wagon_wheel', sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column('matches', sa.Column('officials', sa.String(length=200), nullable=True))
    op.add_column('matches', sa.Column('city', sa.String(length=100), nullable=True))

    op.create_table(
        'match_lineups',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('match_id', sa.Uuid(), nullable=False),
        sa.Column('team_id', sa.Uuid(), nullable=False),
        sa.Column('player_id', sa.Uuid(), nullable=False),
        sa.Column('is_playing_xi', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['player_id'], ['players.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('match_id', 'team_id', 'player_id', name='uq_match_lineup'),
    )
    op.create_index('ix_match_lineups_match_id', 'match_lineups', ['match_id'])
    op.create_index('ix_match_lineups_team_id', 'match_lineups', ['team_id'])


def downgrade() -> None:
    op.drop_index('ix_match_lineups_team_id', table_name='match_lineups')
    op.drop_index('ix_match_lineups_match_id', table_name='match_lineups')
    op.drop_table('match_lineups')
    op.drop_column('matches', 'city')
    op.drop_column('matches', 'officials')
    op.drop_column('matches', 'wagon_wheel')
    op.drop_column('matches', 'pitch_type')
    op.drop_column('matches', 'powerplay_overs')
    op.drop_column('matches', 'overs_per_bowler')
    op.drop_column('matches', 'ball_type')

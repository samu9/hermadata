"""add therapy table

Revision ID: b2c3d4e5f6a7
Revises: ddafa4534a22
Create Date: 2025-05-03 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "ddafa4534a22"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "therapy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("animal_id", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("reminder_value", sa.Integer(), nullable=True),
        sa.Column("reminder_unit", sa.String(10), nullable=True),
        sa.Column("prescription_document_id", sa.Integer(), nullable=True),
        sa.Column("transport_document_id", sa.Integer(), nullable=True),
        sa.Column("animal_log_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["animal_id"], ["animal.id"]),
        sa.ForeignKeyConstraint(["prescription_document_id"], ["document.id"]),
        sa.ForeignKeyConstraint(["transport_document_id"], ["document.id"]),
        sa.ForeignKeyConstraint(["animal_log_id"], ["animal_log.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        "INSERT INTO animal_event_type (code, description, category) "
        "VALUES ('TH', 'Terapia', 'health') "
        "ON DUPLICATE KEY UPDATE description='Terapia'"
    )


def downgrade() -> None:
    op.execute("DELETE FROM animal_event_type WHERE code = 'TH'")
    op.drop_table("therapy")

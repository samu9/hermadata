"""add deleted_at to animal_document and adoption, exit_deleted event

Revision ID: c7d8e9f0a1b2
Revises: a2cecf276ae6
Create Date: 2026-06-17 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c7d8e9f0a1b2"
down_revision: Union[str, None] = "a2cecf276ae6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "animal_document",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "adoption",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.execute(
        "INSERT INTO animal_event_type (code, description, category) "
        "VALUES ('ED', 'Uscita eliminata', 'automatic') "
        "ON DUPLICATE KEY UPDATE description=VALUES(description), "
        "category=VALUES(category)"
    )


def downgrade() -> None:
    op.drop_column("adoption", "deleted_at")
    op.drop_column("animal_document", "deleted_at")
    op.execute("DELETE FROM animal_event_type WHERE code = 'ED'")

"""add dirty flag to animal_document, document_rerendered event

Revision ID: e9f0a1b2c3d4
Revises: d8e9f0a1b2c3
Create Date: 2026-06-20 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e9f0a1b2c3d4"
down_revision: Union[str, None] = "d8e9f0a1b2c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "animal_document",
        sa.Column(
            "dirty",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.execute(
        "INSERT INTO animal_event_type (code, description, category) "
        "VALUES ('DR', 'Documento rigenerato', 'automatic') "
        "ON DUPLICATE KEY UPDATE description=VALUES(description), "
        "category=VALUES(category)"
    )


def downgrade() -> None:
    op.drop_column("animal_document", "dirty")
    op.execute("DELETE FROM animal_event_type WHERE code = 'DR'")

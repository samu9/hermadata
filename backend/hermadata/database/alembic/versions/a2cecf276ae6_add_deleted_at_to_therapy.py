"""add deleted_at to therapy

Revision ID: a2cecf276ae6
Revises: b2c3d4e5f6a7
Create Date: 2026-05-13 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a2cecf276ae6"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "therapy",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.execute(
        "INSERT INTO animal_event_type (code, description, category) VALUES ('THD', 'Terapia eliminata', 'health') "
        "ON DUPLICATE KEY UPDATE description=VALUES(description), category=VALUES(category)"
    )


def downgrade() -> None:
    op.drop_column("therapy", "deleted_at")
    op.execute("DELETE FROM animal_event_type WHERE code = 'THD'")

"""add foreign province EE (STATO ESTERO)

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f6
Create Date: 2026-03-28 18:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    provincia_table = sa.table(
        "provincia",
        sa.column("id", sa.String),
        sa.column("name", sa.String),
    )
    op.bulk_insert(
        provincia_table,
        [{"id": "EE", "name": "STATO ESTERO"}],
    )


def downgrade() -> None:
    op.execute("DELETE FROM provincia WHERE id = 'EE'")

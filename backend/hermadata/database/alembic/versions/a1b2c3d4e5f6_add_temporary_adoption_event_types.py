"""add temporary adoption event types

Revision ID: a1b2c3d4e5f6
Revises: fceb0e2f434a
Create Date: 2026-03-08 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "fceb0e2f434a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    animal_event_type = sa.table(
        "animal_event_type",
        sa.column("code", sa.String),
        sa.column("description", sa.String),
        sa.column("category", sa.String),
    )
    op.bulk_insert(
        animal_event_type,
        [
            {
                "code": "TC",
                "description": "Adozione temporanea confermata",
                "category": "automatic",
            },
            {
                "code": "TU",
                "description": "Adozione temporanea annullata",
                "category": "automatic",
            },
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM animal_event_type WHERE code IN ('TC', 'TU')")

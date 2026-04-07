"""add structures table and structure_id to animal

Revision ID: e3f4a5b6c7d8
Revises: b1c2d3e4f5a6
Create Date: 2025-04-05 19:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e3f4a5b6c7d8"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

STRUCTURES = [
    {
        "id": 1,
        "name": "Canile Rifugio Hermada",
        "city_id": None,
        "address": None,
        "structure_type": "R",
    },
    {
        "id": 2,
        "name": "Canile Sanitario Chiodo",
        "city_id": None,
        "address": None,
        "structure_type": "S",
    },
    {
        "id": 3,
        "name": "Gattile Miciopolis",
        "city_id": None,
        "address": None,
        "structure_type": "R",
    },
    {
        "id": 4,
        "name": "Canile Sanitario Voglia di Casa",
        "city_id": None,
        "address": None,
        "structure_type": "S",
    },
]


def upgrade() -> None:
    op.create_table(
        "structure",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("city_id", sa.String(length=4), nullable=True),
        sa.Column("address", sa.String(length=200), nullable=True),
        sa.Column("structure_type", sa.String(length=1), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["city_id"], ["comune.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.bulk_insert(
        sa.table(
            "structure",
            sa.column("id", sa.Integer()),
            sa.column("name", sa.String()),
            sa.column("city_id", sa.String()),
            sa.column("address", sa.String()),
            sa.column("structure_type", sa.String()),
        ),
        STRUCTURES,
    )

    op.add_column(
        "animal",
        sa.Column("structure_id", sa.Integer(), nullable=True),
    )

    op.execute("UPDATE animal SET structure_id = 1")

    op.alter_column(
        "animal",
        "structure_id",
        nullable=False,
        existing_type=sa.Integer(),
    )

    op.create_foreign_key(
        "fk_animal_structure",
        "animal",
        "structure",
        ["structure_id"],
        ["id"],
    )

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
                "code": "MV",
                "description": "Spostamento a struttura",
                "category": "structure",
            },
        ],
    )


def downgrade() -> None:
    op.drop_constraint("fk_animal_structure", "animal", type_="foreignkey")
    op.drop_column("animal", "structure_id")
    op.drop_table("structure")
    op.execute("DELETE FROM animal_event_type WHERE code = 'MV'")

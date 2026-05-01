"""add animal_image table, drop img_path

Revision ID: a9f1b2c3d4e5
Revises: e3f4a5b6c7d8
Create Date: 2025-05-01 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a9f1b2c3d4e5"
down_revision: Union[str, None] = "e3f4a5b6c7d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "animal_image",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("animal_id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(40), nullable=False),
        sa.Column("mimetype", sa.String(50), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column(
            "is_profile",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["animal_id"], ["animal.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.drop_column("animal", "img_path")


def downgrade() -> None:
    op.add_column(
        "animal",
        sa.Column("img_path", sa.String(100), nullable=True),
    )
    op.drop_table("animal_image")

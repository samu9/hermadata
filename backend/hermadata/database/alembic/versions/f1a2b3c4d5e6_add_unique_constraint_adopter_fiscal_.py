"""add unique constraint to adopter fiscal_code

Revision ID: f1a2b3c4d5e6
Revises: a2cecf276ae6
Create Date: 2026-08-30 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "a2cecf276ae6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        "uq_adopter_fiscal_code", "adopter", ["fiscal_code"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_adopter_fiscal_code", "adopter", type_="unique")

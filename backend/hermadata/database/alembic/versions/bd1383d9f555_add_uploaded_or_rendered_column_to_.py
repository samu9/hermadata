"""add uploaded or rendered column to document table

Revision ID: bd1383d9f555
Revises: fceb0e2f434a
Create Date: 2024-12-07 18:25:49.589877

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bd1383d9f555"
down_revision: Union[str, None] = "fceb0e2f434a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "document",
        sa.Column("is_uploaded", sa.Boolean(), nullable=False),
    )
    # ### end Alembic commands ###
    op.get_bind().execute(
        sa.text(
            """
        update document d
        join animal_document ad on ad.document_id = d.id
        join document_kind dk on dk.id = ad.document_kind_id
        set is_uploaded = dk.uploadable"""
        )
    )


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("document", "is_uploaded")
    # ### end Alembic commands ###

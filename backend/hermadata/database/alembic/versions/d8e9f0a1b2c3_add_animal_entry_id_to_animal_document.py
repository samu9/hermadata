"""add animal_entry_id to animal_document (entry-tied documents)

Revision ID: d8e9f0a1b2c3
Revises: c7d8e9f0a1b2
Create Date: 2026-06-20 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d8e9f0a1b2c3"
down_revision: Union[str, None] = "c7d8e9f0a1b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Document kinds strictly tied to a specific entry/exit event.
ENTRY_TIED_DOC_KIND_CODES = (
    "CI",
    "U",
    "UF",
    "AD",
    "ADF",
    "AF",
    "AFF",
    "VA",
    "VAF",
    "RP",
)


def upgrade() -> None:
    op.add_column(
        "animal_document",
        sa.Column("animal_entry_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_animal_document_animal_entry",
        "animal_document",
        "animal_entry",
        ["animal_entry_id"],
        ["id"],
    )

    # Best-effort backfill: tie each entry-tied document to the most recent
    # entry that had already begun when the document was created.
    codes = ", ".join(f"'{c}'" for c in ENTRY_TIED_DOC_KIND_CODES)
    op.execute(
        sa.text(
            f"""
            UPDATE animal_document ad
            JOIN document_kind dk ON dk.id = ad.document_kind_id
            SET ad.animal_entry_id = (
                SELECT e.id
                FROM animal_entry e
                WHERE e.animal_id = ad.animal_id
                  AND (e.entry_date IS NULL
                       OR e.entry_date <= DATE(ad.created_at))
                ORDER BY e.entry_date DESC, e.id DESC
                LIMIT 1
            )
            WHERE dk.code IN ({codes})
              AND ad.animal_entry_id IS NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_animal_document_animal_entry",
        "animal_document",
        type_="foreignkey",
    )
    op.drop_column("animal_document", "animal_entry_id")

"""translate permission descriptions to Italian

Revision ID: f1a2b3c4d5e6
Revises: f0a1b2c3d4e5
Create Date: 2026-10-25 16:35:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "f0a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ITALIAN_DESCRIPTIONS: list[tuple[str, str]] = [
    ("CA", "Crea nuove schede animale"),
    ("MA", "Gestisci adozioni animali"),
    ("UD", "Carica documenti nel sistema"),
    ("EAD", "Modifica dati adottanti"),
    ("EAN", "Modifica dati animali"),
    ("BPA", "Visualizza animali presenti"),
    ("BNA", "Visualizza animali non più presenti"),
    ("BAD", "Visualizza anagrafica adottanti"),
    ("BAV", "Visualizza anagrafica veterinari"),
    ("DD", "Scarica documenti dal sistema"),
    ("DS", "Scarica report riepilogativi"),
    ("SDP", "Imposta permessi sui documenti"),
    ("MU", "Gestisci utenti, ruoli e permessi"),
    ("BDA", "Visualizza animali eliminati"),
    ("AAE", "Aggiungi eventi animale"),
    ("UAI", "Carica e gestisci foto animali"),
    ("BAE", "Visualizza cronologia eventi animale"),
]

PREVIOUS_DESCRIPTIONS: list[tuple[str, str]] = [
    ("CA", "Create new animal records"),
    ("MA", "Process animal adoptions"),
    ("UD", "Upload documents to the system"),
    ("EAD", "Edit adopter information"),
    ("EAN", "Edit animal information"),
    ("BPA", "Browse animals currently present"),
    ("BNA", "Browse animals no longer present"),
    ("BAD", "Browse adopter records"),
    ("BAV", "Browse veterinarian records"),
    ("DD", "Download documents from the system"),
    ("DS", "Download summary reports"),
    ("SDP", "Set document permissions"),
    ("MU", "Manage user accounts and roles"),
    ("BDA", "Browse deleted animal records"),
    ("AAE", "Aggiungi evento animal"),
    ("UAI", "Upload and manage animal images"),
    ("BAE", "Browse animal events"),
]


def upgrade() -> None:
    conn = op.get_bind()
    stmt = sa.text(
        "UPDATE permissions SET description = :description WHERE code = :code"
    )
    conn.execute(
        stmt,
        [
            {"code": code, "description": desc}
            for code, desc in ITALIAN_DESCRIPTIONS
        ],
    )


def downgrade() -> None:
    conn = op.get_bind()
    stmt = sa.text(
        "UPDATE permissions SET description = :description WHERE code = :code"
    )
    conn.execute(
        stmt,
        [
            {"code": code, "description": desc}
            for code, desc in PREVIOUS_DESCRIPTIONS
        ],
    )

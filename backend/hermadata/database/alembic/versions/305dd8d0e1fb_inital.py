"""inital

Revision ID: 305dd8d0e1fb
Revises: 
Create Date: 2023-11-05 11:09:14.322722

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "305dd8d0e1fb"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "adopter",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("surname", sa.String(length=100), nullable=False),
        sa.Column("birth_city_code", sa.String(length=4), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=False),
        sa.Column("residence_city_code", sa.String(length=4), nullable=False),
        sa.Column("phone", sa.String(length=15), nullable=False),
        sa.Column("document_type", sa.String(length=3), nullable=True),
        sa.Column("document_number", sa.String(length=20), nullable=True),
        sa.Column("document_release_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "document_kind",
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "procedure_kind",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "provincia",
        sa.Column("id", sa.String(length=2), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "race",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=1), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("surname", sa.String(length=100), nullable=True),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "vet",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("surname", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "breed",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("race_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["race_id"],
            ["race.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "comune",
        sa.Column("id", sa.String(length=4), nullable=False),
        sa.Column("provincia", sa.String(length=2), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(
            ["provincia"],
            ["provincia.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "document",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("kind_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["kind_id"],
            ["document_kind.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "procedure",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("kind_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("closed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["kind_id"],
            ["procedure_kind.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "procedure_document",
        sa.Column("procedure_kind_id", sa.Integer(), nullable=False),
        sa.Column("document_kind_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["document_kind_id"],
            ["document_kind.id"],
        ),
        sa.ForeignKeyConstraint(
            ["procedure_kind_id"],
            ["procedure_kind.id"],
        ),
        sa.PrimaryKeyConstraint("procedure_kind_id", "document_kind_id"),
    )
    op.create_table(
        "animal",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=12), nullable=False),
        sa.Column("finding_date", sa.Date(), nullable=False),
        sa.Column("race_id", sa.Integer(), nullable=False),
        sa.Column("origin_city_code", sa.String(length=4), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("breed_id", sa.Integer(), nullable=True),
        sa.Column("sex", sa.Integer(), nullable=True),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("check_in_date", sa.Date(), nullable=True),
        sa.Column("check_out_date", sa.Date(), nullable=True),
        sa.Column("returned_to_owner", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("sterilized", sa.Boolean(), nullable=True),
        sa.Column("adoptable", sa.Boolean(), nullable=True),
        sa.Column("adoptability_index", sa.Integer(), nullable=True),
        sa.Column("behaviour", sa.String(length=100), nullable=True),
        sa.Column("color", sa.String(length=100), nullable=True),
        sa.Column("fur", sa.String(length=100), nullable=True),
        sa.Column("features", sa.String(length=100), nullable=True),
        sa.Column("medical_treatments", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("vet_id", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["breed_id"],
            ["breed.id"],
        ),
        sa.ForeignKeyConstraint(
            ["race_id"],
            ["race.id"],
        ),
        sa.ForeignKeyConstraint(
            ["vet_id"],
            ["vet.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_table(
        "procedure_document_checklist",
        sa.Column("procedure_id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["document.id"],
        ),
        sa.ForeignKeyConstraint(
            ["procedure_id"],
            ["procedure.id"],
        ),
        sa.PrimaryKeyConstraint("procedure_id", "document_id"),
    )
    op.create_table(
        "adoption",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("animal_id", sa.Integer(), nullable=False),
        sa.Column("temporary", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["animal_id"],
            ["animal.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "terapy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("animal_id", sa.Integer(), nullable=False),
        sa.Column("vet_id", sa.Integer(), nullable=False),
        sa.Column("med_name", sa.String(length=100), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("from_date", sa.DateTime(), nullable=True),
        sa.Column("to_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["animal_id"],
            ["animal.id"],
        ),
        sa.ForeignKeyConstraint(
            ["vet_id"],
            ["animal.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("terapy")
    op.drop_table("adoption")
    op.drop_table("procedure_document_checklist")
    op.drop_table("animal")
    op.drop_table("procedure_document")
    op.drop_table("procedure")
    op.drop_table("document")
    op.drop_table("comune")
    op.drop_table("breed")
    op.drop_table("vet")
    op.drop_table("users")
    op.drop_table("race")
    op.drop_table("provincia")
    op.drop_table("procedure_kind")
    op.drop_table("document_kind")
    op.drop_table("adopter")
    # ### end Alembic commands ###

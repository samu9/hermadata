"""Exercise event data migrations without requiring a MySQL server."""

from importlib import import_module

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations


@pytest.mark.parametrize(
    "migration_name, codes",
    [
        ("a1b2c3d4e5f6_add_temporary_adoption_event_types", ["TC", "TU"]),
        ("e3f4a5b6c7d8_add_structures", ["MV"]),
    ],
)
@pytest.mark.parametrize("seeded", ["none", "first", "all"])
def test_event_type_migration_handles_existing_seeds(
    monkeypatch, migration_name, codes, seeded
):
    migration = import_module(
        f"hermadata.database.alembic.versions.{migration_name}"
    )
    engine = sa.create_engine("sqlite://")
    metadata = sa.MetaData()
    events = sa.Table(
        "animal_event_type",
        metadata,
        sa.Column("code", sa.String(10), primary_key=True),
        sa.Column("description", sa.String(255), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
    )
    sa.Table(
        "comune", metadata, sa.Column("id", sa.String(4), primary_key=True)
    )
    sa.Table("animal", metadata, sa.Column("id", sa.Integer, primary_key=True))
    metadata.create_all(engine)

    with engine.begin() as connection:
        operations = Operations(MigrationContext.configure(connection))
        # SQLite cannot alter columns or add FKs. Those schema operations are
        # unrelated to the event inserts exercised by the structures migration.
        monkeypatch.setattr(operations, "alter_column", lambda *a, **kw: None)
        monkeypatch.setattr(
            operations, "create_foreign_key", lambda *a, **kw: None
        )
        monkeypatch.setattr(migration, "op", operations)
        existing_codes = {
            "none": [],
            "first": codes[:1],
            "all": codes,
        }[seeded]
        existing = [
            {"code": code, "description": "Existing", "category": "custom"}
            for code in ["OTHER", *existing_codes]
        ]
        connection.execute(events.insert(), existing)

        migration.upgrade()

        rows = {
            row.code: (row.description, row.category)
            for row in connection.execute(sa.select(events))
        }
        assert set(rows) == {"OTHER", *codes}
        for code in ["OTHER", *existing_codes]:
            assert rows[code] == ("Existing", "custom")
        for code in set(codes) - set(existing_codes):
            assert (
                rows[code]
                == {
                    "TC": ("Adozione temporanea confermata", "automatic"),
                    "TU": ("Adozione temporanea annullata", "automatic"),
                    "MV": ("Spostamento a struttura", "structure"),
                }[code]
            )

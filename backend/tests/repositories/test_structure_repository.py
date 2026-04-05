import pytest
from sqlalchemy.orm import Session

from hermadata.repositories.structure_repository import (
    SQLStructureRepository,
    StructureModel,
)


def test_get_all_structures(structure_repository: SQLStructureRepository):
    structures = structure_repository.get_all()
    assert isinstance(structures, list)
    assert len(structures) >= 1
    assert all(isinstance(s, StructureModel) for s in structures)


def test_get_structure_by_id(structure_repository: SQLStructureRepository):
    structure = structure_repository.get_by_id(1)
    assert structure is not None
    assert structure.id == 1
    assert structure.name == "Canile Rifugio Hermada"


def test_get_nonexistent_structure(structure_repository: SQLStructureRepository):
    structure = structure_repository.get_by_id(9999)
    assert structure is None

from hermadata.dependancies import get_repository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository


def test_get_repository():
    repo_factory = get_repository(SQLAnimalRepository)
    repo = repo_factory()
    assert repo

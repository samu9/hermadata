from sqlalchemy.orm import Session

from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository


def test_race_reository(db_session: Session):
    repo = SQLRaceRepository(db_session())

    repo.save(RaceModel(code="X", name="X"))

    races = repo.get_all()

    assert len(races) == 1

    assert races[0].code == "X"

    # repo.delete(code="X")

    # races = repo.get_all()

    # assert not races

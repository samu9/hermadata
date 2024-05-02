from sqlalchemy.orm import Session

from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository


def test_race_reository(db_session: Session):
    repo = SQLRaceRepository(db_session)

    repo.save(RaceModel(id="X", name="X"))

    races = repo.get_all()

    assert len(races) == 3

    assert "X" in [r.id for r in races]

    repo.delete(id_="X")

    races = repo.get_all()

    assert "X" not in [r.id for r in races]

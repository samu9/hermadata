from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository


def test_race_reository(race_repository: SQLRaceRepository):

    race_repository.save(RaceModel(id="X", name="X"))

    races = race_repository.get_all()

    assert len(races) == 3

    assert "X" in [r.id for r in races]

    race_repository.delete(id_="X")

    races = race_repository.get_all()

    assert "X" not in [r.id for r in races]

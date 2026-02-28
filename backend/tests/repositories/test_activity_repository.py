from datetime import date

from sqlalchemy.orm import Session

from hermadata.repositories.activity_repository import (
    ActivityFilterQuery,
    SQLActivityRepository,
)
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import (
    CompleteEntryModel,
    NewAnimalLogModel,
    NewAnimalModel,
)
from hermadata.constants import EntryType


def test_get_activities_empty(db_session: Session, activity_repository: SQLActivityRepository):
    """Test getting activities returns a valid result even with no data."""
    result = activity_repository.get_activities(ActivityFilterQuery())

    assert result.total >= 0
    assert isinstance(result.items, list)


def test_get_activities_with_logs(
    db_session: Session,
    activity_repository: SQLActivityRepository,
    animal_repository: SQLAnimalRepository,
    make_animal,
):
    """Test that animal logs appear in activity results."""
    animal_id = make_animal()

    animal_repository.add_log(
        animal_id,
        NewAnimalLogModel(event="CS", data={"note": "test"}),
    )

    result = activity_repository.get_activities(ActivityFilterQuery())

    assert result.total >= 1
    assert any(a.animal_id == animal_id for a in result.items)


def test_get_activities_with_date_filter(
    db_session: Session,
    activity_repository: SQLActivityRepository,
    make_animal,
    animal_repository: SQLAnimalRepository,
):
    """Test activities filtered by date range."""
    animal_id = make_animal()

    animal_repository.add_log(
        animal_id,
        NewAnimalLogModel(event="CS", data={"note": "test date filter"}),
    )

    query = ActivityFilterQuery(
        start_date=date(2020, 1, 1),
        end_date=date(2099, 12, 31),
    )
    result = activity_repository.get_activities(query)

    assert result.total >= 1


def test_get_activities_with_pagination(
    db_session: Session,
    activity_repository: SQLActivityRepository,
    make_animal,
    animal_repository: SQLAnimalRepository,
):
    """Test activities with pagination."""
    animal_id = make_animal()

    for i in range(3):
        animal_repository.add_log(
            animal_id,
            NewAnimalLogModel(event="CS", data={"note": f"log {i}"}),
        )

    query = ActivityFilterQuery(from_index=0, to_index=2)
    result = activity_repository.get_activities(query)

    assert len(result.items) <= 3
    assert result.total >= 3

from sqlalchemy import insert, select
from sqlalchemy.orm import sessionmaker, Session

from hermadata.database.models import Animal


def test_db_session(db_session: Session, make_animal):

    animal_id = make_animal()

    animal = db_session.execute(
        select(Animal).where(Animal.id == animal_id)
    ).first()
    assert animal

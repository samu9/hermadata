from sqlalchemy import insert, select
from sqlalchemy.orm import sessionmaker, Session

from hermadata.database.models import Animal


def test_db_session(DBSessionMaker: sessionmaker, make_animal):

    with DBSessionMaker.begin() as s1:
        s1: Session
        animal_id = make_animal()
        with DBSessionMaker.begin() as s2:
            s2: Session
            r = s2.execute(insert(Animal).values(race_id="C", code="123"))
            s2.flush()

            (animal_id2,) = r.inserted_primary_key

        animal = s1.execute(
            select(Animal).where(Animal.id == animal_id)
        ).first()
        assert animal

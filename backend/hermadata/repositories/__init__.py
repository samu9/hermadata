import logging
from typing import Annotated, Type, TypeVar

from fastapi import Depends
from sqlalchemy.orm import Session

from hermadata.dependancies import get_db_session

logger = logging.getLogger(__name__)


EntityT = TypeVar("EntityT")


class BaseRepository:
    pass


class SQLBaseRepository(BaseRepository):
    # https://fastapi.tiangolo.com/advanced/advanced-dependencies/#a-callable-instance
    def __call__(self, session: Annotated[Session, Depends(get_db_session)]):
        self.session = session
        return self

    def add_entity(self, model_class: Type[EntityT], **kwargs) -> EntityT:
        """
        General method to add a new entity to the database.

        :param model_class: The SQLAlchemy model class to create an instance of.
        :param kwargs: The fields and values to pass to the model.
        :return: The created instance.
        """
        entity = model_class(**kwargs)
        self.session.add(entity)
        self.session.flush()
        return entity

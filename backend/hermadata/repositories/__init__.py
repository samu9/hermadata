import logging
from fastapi import Depends
from sqlalchemy.orm import Session

from hermadata.dependancies import get_db_session

logger = logging.getLogger(__name__)


class BaseRepository:
    pass


class SQLBaseRepository(BaseRepository):
    # https://fastapi.tiangolo.com/advanced/advanced-dependencies/#a-callable-instance
    def __call__(self, session: Session = Depends(get_db_session)):
        self.session = session
        return self

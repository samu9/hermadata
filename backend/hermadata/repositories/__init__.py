import logging
from fastapi import Depends
from sqlalchemy.orm import Session

from hermadata.dependancies import get_session

logger = logging.getLogger(__name__)


class BaseRepository:
    pass


class SQLBaseRepository(BaseRepository):
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session

import logging
from threading import local
from fastapi import Depends
from sqlalchemy.orm import Session

from hermadata.dependancies import get_session

logger = logging.getLogger(__name__)


class BaseRepository:
    pass


class SQLBaseRepository(BaseRepository):
    _instance = None
    _local = local()

    def instance_init(cls, *args, **kwargs):
        pass

    @classmethod
    def factory(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(SQLBaseRepository, cls).__new__(cls)
        return cls._instance

    def __init__(self, session: Session = Depends(get_session)):
        if not self._instance:
            self.factory()
        self.session = session

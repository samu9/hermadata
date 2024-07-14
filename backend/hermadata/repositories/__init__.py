import logging
from threading import local
import threading
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class BaseRepository:
    pass


class LocalSession(local):
    session: Session


class SQLBaseRepository(BaseRepository):
    def __init__(self) -> None:
        self.local_session = LocalSession()
        self.local_session.session = None

    def __call__(self, session: Session):
        logger.debug(
            "%s:__call__ - thread:%s setting session %s",
            self.__class__.__name__,
            threading.get_ident(),
            session,
        )
        self.local_session.session = session
        return self

    def __enter__(self):
        logger.debug(
            "%s:__enter__ - thread:%s",
            self.__class__.__name__,
            threading.get_ident(),
        )
        return self

    def __exit__(self, *args, **kwargs):
        logger.debug(
            "%s:__exit__ - thread:%s",
            self.__class__.__name__,
            threading.get_ident(),
        )
        self.local_session.session = None

    @property
    def session(self) -> Session:
        return self.local_session.session

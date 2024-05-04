from threading import local
from sqlalchemy.orm import Session


class BaseRepository:
    pass


class LocalSession(local):
    session: Session


class SQLBaseRepository(BaseRepository):
    def __init__(self) -> None:
        self.local_session = LocalSession()

    def __call__(self, session: Session):
        self.local_session.session = session
        return self

    def __enter__(self):
        return self

    def __exit__(self, *args, **kwargs):
        self.local_session.session = None

    @property
    def session(self) -> Session:
        return self.local_session.session

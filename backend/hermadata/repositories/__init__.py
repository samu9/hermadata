from sqlalchemy.orm import Session


class BaseRepository:
    pass


class SQLBaseRepository(BaseRepository):
    def __init__(self, session: Session) -> None:
        super().__init__()

        self.session = session

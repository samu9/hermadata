from datetime import datetime, timezone
from pydantic import BaseModel
from sqlalchemy import select, update
from hermadata.constants import ExitType
from hermadata.database.models import Adoption, Animal, AnimalEntry
from hermadata.repositories import SQLBaseRepository


class SQLAdopionRepository(SQLBaseRepository):
    pass

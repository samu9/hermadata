from datetime import date
from typing import Annotated

from codicefiscale import codicefiscale
from fastapi import Depends
from pydantic import BaseModel, StringConstraints
from sqlalchemy.orm import Session

from hermadata.dependancies import get_db_session
from hermadata.models import PaginationResult
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    AdopterSearchQuery,
    IDDocumentType,
    NewAdopter,
    SQLAdopterRepository,
)


class NewAdopterRequest(BaseModel):
    """Model for adopter data coming from frontend (without birth fields)."""

    name: Annotated[str, StringConstraints(to_upper=True)]
    surname: Annotated[str, StringConstraints(to_upper=True)]
    residence_city_code: str
    fiscal_code: Annotated[str, StringConstraints(to_upper=True)]
    phone: Annotated[str, StringConstraints(pattern=r"[\d\+\. ]+")]
    document_type: IDDocumentType
    document_number: str


class CompleteNewAdopter(NewAdopterRequest):
    """Complete adopter model with birth fields for database storage."""

    birth_date: date
    birth_city_code: str


class AdopterService:
    def __init__(self, adopter_repository: SQLAdopterRepository) -> None:
        self.adopter_repository = adopter_repository

    def __call__(self, session: Annotated[Session, Depends(get_db_session)]):
        self.adopter_repository(session)
        return self

    def create(self, data: NewAdopterRequest) -> AdopterModel:
        """Create a new adopter."""
        decoded = codicefiscale.decode(data.fiscal_code)
        birth_date = decoded.get("birthdate")
        birth_place_code = decoded.get("birthplace").get("code")

        # Convert to repository model
        repo_data = NewAdopter(
            **data.model_dump(),
            birth_city_code=birth_place_code,
            birth_date=birth_date,
        )

        return self.adopter_repository.create(repo_data)

    def search(
        self, query: AdopterSearchQuery
    ) -> PaginationResult[AdopterModel]:
        """Search for adopters based on query parameters."""
        return self.adopter_repository.search(query)

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
from hermadata.repositories.city_repository import SQLCityRepository


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
    def __init__(
        self,
        adopter_repository: SQLAdopterRepository,
        city_repository: SQLCityRepository,
    ) -> None:
        self.adopter_repository = adopter_repository
        self.city_repository = city_repository

    def __call__(self, session: Annotated[Session, Depends(get_db_session)]):
        self.adopter_repository(session)
        self.city_repository(session)
        return self

    def _validate_birth_city_code(self, city_code: str) -> str:
        """Validate that the birth city code exists in the database.

        Args:
            city_code: The city code to validate

        Returns:
            The validated city code

        Raises:
            ValueError: If the city code doesn't exist in the database
        """
        if not city_code:
            raise ValueError("Birth city code cannot be empty")

        if not self.city_repository.city_exists(city_code):
            raise ValueError(
                f"Birth city code '{city_code}' not found in database"
            )

        return city_code

    def create(self, data: NewAdopterRequest) -> AdopterModel:
        """Create a new adopter."""
        decoded = codicefiscale.decode(data.fiscal_code)
        birth_date = decoded.get("birthdate")
        birth_place_code = decoded.get("birthplace").get("code")

        # Validate that both city codes exist in the database
        validated_birth_city_code = self._validate_birth_city_code(
            birth_place_code
        )

        # Also validate residence city code
        if not self.city_repository.city_exists(data.residence_city_code):
            raise ValueError(
                f"Residence city code '{data.residence_city_code}' "
                f"not found in database"
            )

        # Convert to repository model
        repo_data = NewAdopter(
            **data.model_dump(),
            birth_city_code=validated_birth_city_code,
            birth_date=birth_date,
        )

        return self.adopter_repository.create(repo_data)

    def search(
        self, query: AdopterSearchQuery
    ) -> PaginationResult[AdopterModel]:
        """Search for adopters based on query parameters."""
        return self.adopter_repository.search(query)

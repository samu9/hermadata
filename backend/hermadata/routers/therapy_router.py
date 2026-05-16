from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.exc import NoResultFound

from hermadata.initializations import get_current_user, get_therapy_repository
from hermadata.repositories.therapy_repository import (
    SQLTherapyRepository,
    TherapyCreate,
    TherapyRead,
    TherapyReminder,
)
from hermadata.services.user_service import TokenData


class AttachDocumentRequest(BaseModel):
    document_id: int


reminders_router = APIRouter(prefix="/therapies", tags=["therapy"])
router = APIRouter(prefix="/animal/{animal_id}/therapies", tags=["therapy"])


@reminders_router.get("/reminders", response_model=list[TherapyReminder])
def get_reminders(
    structure_ids: Annotated[list[int], Query()],
    days: int = 30,
    repo: SQLTherapyRepository = Depends(get_therapy_repository),
    _: TokenData = Depends(get_current_user),
):
    return repo.get_reminders(structure_ids=structure_ids, days=days)


@router.post("", response_model=TherapyRead, status_code=201)
def create_therapy(
    animal_id: int,
    data: TherapyCreate,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    data.user_id = current_user.user_id
    return repo.create(animal_id=animal_id, data=data)


@router.get("", response_model=list[TherapyRead])
def list_therapies(
    animal_id: int,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    _: Annotated[TokenData, Depends(get_current_user)],
):
    return repo.get_by_animal(animal_id=animal_id)


@router.post("/{therapy_id}/document/{doc_type}", response_model=TherapyRead)
def attach_document(
    animal_id: int,
    therapy_id: int,
    doc_type: Literal["prescription", "transport"],
    data: AttachDocumentRequest,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    _: Annotated[TokenData, Depends(get_current_user)],
):
    try:
        return repo.attach_document(
            therapy_id=therapy_id,
            animal_id=animal_id,
            doc_type=doc_type,
            document_id=data.document_id,
        )
    except (NoResultFound, ValueError) as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.delete("/{therapy_id}", status_code=204)
def delete_therapy(
    animal_id: int,
    therapy_id: int,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    try:
        repo.delete_therapy(
            therapy_id=therapy_id,
            animal_id=animal_id,
            user_id=current_user.user_id,
        )
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Terapia non trovata")


@router.post("/{therapy_id}/end", response_model=TherapyRead)
def end_therapy(
    animal_id: int,
    therapy_id: int,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    _: Annotated[TokenData, Depends(get_current_user)],
):
    try:
        return repo.end_therapy(therapy_id=therapy_id, animal_id=animal_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Terapia non trovata")

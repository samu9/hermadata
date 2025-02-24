import logging

from fastapi.responses import JSONResponse

from hermadata.repositories.animal.animal_repository import (
    AnimalWithoutChipCodeException,
    EntryNotCompleteException,
    NoRequiredExitDataException,
)

logger = logging.getLogger(__name__)

API_ERROR_MESSAGES = {
    AnimalWithoutChipCodeException: "Chip non inserito. Non è possibile completare l'operazione",
    EntryNotCompleteException: "Data di ingresso non inserita. Non è possibile completare l'operazione",
    NoRequiredExitDataException: "Dati animale non completi. Non è possibile completare l'operazione",
}
DEFAULT_MESSAGE = "Qualcosa è andato storto, riprova più tardi"


async def api_error_exception_handler(request, exc):
    message = API_ERROR_MESSAGES.get(type(exc), DEFAULT_MESSAGE)
    return JSONResponse(
        status_code=400,
        content={
            "error": "Internal Server Error",
            "detail": message,
        },
    )

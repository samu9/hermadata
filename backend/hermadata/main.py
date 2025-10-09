import json
import logging
import logging.config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from hermadata.error_handlers import api_error_exception_handler
from hermadata.errors import APIException
from hermadata.routers import (
    adopter_router,
    animal_router,
    breed_router,
    document_router,
    race_router,
    user_router,
    util_router,
    vet_router,
)

logging.config.dictConfig(json.load(open("hermadata/log-configs.json")))

# https://github.com/pyca/bcrypt/issues/684
logging.getLogger("passlib").setLevel(logging.ERROR)

logger = logging.getLogger(__name__)


def build_app():
    app = FastAPI(lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-filename"],
    )
    app.include_router(animal_router.router)
    app.include_router(util_router.router)
    app.include_router(race_router.router)
    app.include_router(breed_router.router)
    app.include_router(document_router.router)
    app.include_router(adopter_router.router)
    app.include_router(vet_router.router)
    app.include_router(user_router.router)

    app.add_exception_handler(APIException, api_error_exception_handler)

    logger.info("hermadata set up")

    return app


def lifespan(app: FastAPI):
    yield


app = build_app()

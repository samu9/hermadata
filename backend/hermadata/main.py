import json
import logging
import logging.config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from hermadata.routers import (
    adopter_router,
    adoption_router,
    animal_router,
    breed_router,
    document_router,
    race_router,
    util_router,
    vet_router,
)

logging.config.dictConfig(json.load(open("hermadata/log-configs.json")))

logger = logging.getLogger(__name__)


def build_app():
    app = FastAPI()

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
    app.include_router(adoption_router.router)
    app.include_router(vet_router.router)

    logger.info("hermadata set up")

    return app


app = build_app()

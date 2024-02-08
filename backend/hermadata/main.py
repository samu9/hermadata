import json
import logging

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
)
from hermadata.settings import Settings

logging.config.dictConfig(json.load(open("hermadata/log-configs.json")))

logger = logging.getLogger(__name__)

settings = Settings()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(animal_router.router)
app.include_router(util_router.router)
app.include_router(race_router.router)
app.include_router(breed_router.router)
app.include_router(document_router.router)
app.include_router(adopter_router.router)
app.include_router(adoption_router.router)


logger.info("app set up")

from fastapi import FastAPI
from hermadata.routers import (
    adopter_router,
    adoption_router,
    animal_router,
    race_router,
    util_router,
    breed_router,
    document_router,
)
from hermadata.settings import Settings
from fastapi.middleware.cors import CORSMiddleware

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

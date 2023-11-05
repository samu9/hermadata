from fastapi import FastAPI
from hermadata.routers import animal, util, race
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
app.include_router(animal.router)
app.include_router(util.router)
app.include_router(race.router)

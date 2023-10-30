from fastapi import FastAPI
from hermadata.routers import animal
from hermadata.settings import Settings

settings = Settings()
app = FastAPI()

app.include_router(animal.router)

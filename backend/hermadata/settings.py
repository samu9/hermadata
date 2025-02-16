import os

from pydantic_settings import BaseSettings, SettingsConfigDict

from hermadata.constants import StorageType

ENV_PATH = os.getenv("ENV_PATH")


class DBSettings(BaseSettings):
    url: str
    pool_recycle: int = 3600


class S3StorageSettings(BaseSettings):
    bucket: str


class DiskStorageSettings(BaseSettings):
    base_path: str


class StorageSettings(BaseSettings):
    disk: DiskStorageSettings
    s3: S3StorageSettings
    selected: StorageType


class Settings(BaseSettings):
    stage: str
    db: DBSettings
    storage: StorageSettings
    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )


settings = Settings()

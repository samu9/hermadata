from pydantic_settings import BaseSettings, SettingsConfigDict

from hermadata.constants import StorageType


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


class AuthSettings(BaseSettings):
    secret: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


class Settings(BaseSettings):
    stage: str
    db: DBSettings
    storage: StorageSettings
    auth: AuthSettings
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", env_nested_delimiter="__"
    )


settings = Settings()


print(settings)

from pydantic_settings import BaseSettings, SettingsConfigDict


class DBSettings(BaseSettings):
    url: str
    pool_recycle: int = 3600


class DiskStorageSettings(BaseSettings):
    base_path: str


class StorageSettings(BaseSettings):
    disk: DiskStorageSettings


class Settings(BaseSettings):
    stage: str
    db: DBSettings
    storage: StorageSettings
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", env_nested_delimiter="__"
    )


settings = Settings()


print(settings)

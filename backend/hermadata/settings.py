from pydantic_settings import BaseSettings, SettingsConfigDict


class DBSettings(BaseSettings):
    url: str


class Settings(BaseSettings):
    stage: str
    db: DBSettings
    model_config = SettingsConfigDict(
        env_file='.env', env_file_encoding='utf-8', env_nested_delimiter='__'
    )


settings = Settings()


print(settings)

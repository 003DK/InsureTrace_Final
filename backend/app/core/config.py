from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_secret_key: str = "changeme"
    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./insuretrace.db"

    imagekit_public_key: str = ""
    imagekit_private_key: str = ""
    imagekit_url_endpoint: str = ""

    digilocker_client_id: str = ""
    digilocker_client_secret: str = ""

    anthropic_api_key: str = ""

    jwt_secret: str = "changeme"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
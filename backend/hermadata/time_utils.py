from datetime import date, datetime
from zoneinfo import ZoneInfo

from hermadata.settings import settings


def get_tz() -> ZoneInfo:
    return ZoneInfo(settings.app.timezone)


def get_now() -> datetime:
    return datetime.now(get_tz())


def get_today() -> date:
    return get_now().date()

from sqlalchemy import Interval, func
from hermadata.constants import RecurrenceType

INTERVAL_MAP = {
    RecurrenceType.DAILY.value: "day",
    RecurrenceType.MONTHLY.value: "month",
    RecurrenceType.WEEKLY.value: "week",
    RecurrenceType.YEARLY.value: "year",
}


def recurrence_to_sql_interval(type_: RecurrenceType, amount: int) -> Interval:
    return func.interval(
        f"{amount} {INTERVAL_MAP[type_] + ("s" if amount > 1 else "")}"
    )

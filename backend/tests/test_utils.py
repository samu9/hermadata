from datetime import datetime
from sqlalchemy import select
from hermadata.constants import RecurrenceType
from hermadata.utils import recurrence_to_sql_interval


def test_recurrence_to_sql_interval():
    i = recurrence_to_sql_interval(RecurrenceType.DAILY, 2)

    stmt = str(select(datetime.now() + i))
    assert i
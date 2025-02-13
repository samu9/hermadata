from datetime import datetime
import pytest
from sqlalchemy import select
from hermadata.constants import RecurrenceType
from hermadata.utils import recurrence_to_sql_interval


@pytest.mark.skip(reason="not implemented yet")
def test_recurrence_to_sql_interval():
    i = recurrence_to_sql_interval(RecurrenceType.DAILY, 2)

    _ = str(select(datetime.now() + i))
    assert i

from datetime import datetime

import pytest
from sqlalchemy import select

from hermadata.constants import RecurrenceType
from hermadata.utils import recurrence_to_sql_interval


def test_recurrence_to_sql_interval():
    # Test daily recurrence
    daily_interval = recurrence_to_sql_interval(RecurrenceType.DAILY, 2)
    assert daily_interval is not None
    
    # Test weekly recurrence
    weekly_interval = recurrence_to_sql_interval(RecurrenceType.WEEKLY, 1)
    assert weekly_interval is not None
    
    # Test monthly recurrence  
    monthly_interval = recurrence_to_sql_interval(RecurrenceType.MONTHLY, 3)
    assert monthly_interval is not None
    
    # Test yearly recurrence
    yearly_interval = recurrence_to_sql_interval(RecurrenceType.YEARLY, 1)
    assert yearly_interval is not None
    
    # Test that the intervals can be used in SQL select statements
    # This validates they're properly formatted SQLAlchemy Interval objects
    daily_query = str(select(datetime.now() + daily_interval))
    assert "interval" in daily_query.lower()
    
    weekly_query = str(select(datetime.now() + weekly_interval))  
    assert "interval" in weekly_query.lower()
    
    # Test singular vs plural forms
    single_day = recurrence_to_sql_interval(RecurrenceType.DAILY, 1)
    multi_day = recurrence_to_sql_interval(RecurrenceType.DAILY, 2)
    
    # Both should create valid intervals
    assert single_day is not None
    assert multi_day is not None
    
    # Test all recurrence types with different amounts
    test_cases = [
        (RecurrenceType.DAILY, 1),
        (RecurrenceType.DAILY, 5),
        (RecurrenceType.WEEKLY, 1),
        (RecurrenceType.WEEKLY, 3),
        (RecurrenceType.MONTHLY, 1),
        (RecurrenceType.MONTHLY, 6),
        (RecurrenceType.YEARLY, 1),
        (RecurrenceType.YEARLY, 2),
    ]
    
    for recurrence_type, amount in test_cases:
        interval = recurrence_to_sql_interval(recurrence_type, amount)
        assert interval is not None, f"Failed for {recurrence_type} with amount {amount}"
        
        # Verify it can be used in a SQL query
        query = str(select(datetime.now() + interval))
        assert "interval" in query.lower(), f"No interval found in query for {recurrence_type} {amount}"

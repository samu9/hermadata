import pytest
from pydantic import ValidationError

from hermadata.models import int_to_sex, PaginationQuery, SearchQuery, PaginationResult, UtilElement, ApiError
from hermadata.constants import ApiErrorCode


def test_int_to_sex_male():
    """Test converting 0 to 'M' for male"""
    result = int_to_sex(0)
    assert result == "M"


def test_int_to_sex_female():
    """Test converting 1 to 'F' for female"""
    result = int_to_sex(1)
    assert result == "F"


def test_int_to_sex_string_passthrough():
    """Test that string values pass through unchanged"""
    result = int_to_sex("M")
    assert result == "M"
    
    result = int_to_sex("F")
    assert result == "F"


def test_int_to_sex_invalid_int():
    """Test that invalid int values raise ValueError"""
    with pytest.raises(ValueError, match="int value representing sex must be 0 or 1"):
        int_to_sex(2)
    
    with pytest.raises(ValueError, match="int value representing sex must be 0 or 1"):
        int_to_sex(-1)
    
    with pytest.raises(ValueError, match="int value representing sex must be 0 or 1"):
        int_to_sex(99)


def test_pagination_query_defaults():
    """Test PaginationQuery with default values"""
    query = PaginationQuery()
    assert query.from_index is None
    assert query.to_index is None
    assert query.sort_field is None
    assert query.sort_order is None


def test_pagination_query_with_values():
    """Test PaginationQuery with provided values"""
    query = PaginationQuery(
        from_index=10,
        to_index=20,
        sort_field="name",
        sort_order=1
    )
    assert query.from_index == 10
    assert query.to_index == 20
    assert query.sort_field == "name"
    assert query.sort_order == 1


def test_search_query_inherits_pagination():
    """Test that SearchQuery inherits from PaginationQuery"""
    query = SearchQuery(from_index=5, to_index=15)
    assert query.from_index == 5
    assert query.to_index == 15
    assert hasattr(query, 'as_where_clause')
    assert hasattr(query, 'as_order_by_clause')


def test_pagination_result_empty():
    """Test PaginationResult with empty items"""
    result = PaginationResult[str](total=0)
    assert result.total == 0
    assert result.items == []


def test_pagination_result_with_items():
    """Test PaginationResult with items"""
    items = ["item1", "item2", "item3"]
    result = PaginationResult[str](total=3, items=items)
    assert result.total == 3
    assert result.items == items


def test_util_element_string_id():
    """Test UtilElement with string ID"""
    element = UtilElement(id="abc123", label="Test Label")
    assert element.id == "abc123"
    assert element.label == "Test Label"


def test_util_element_int_id():
    """Test UtilElement with integer ID"""
    element = UtilElement(id=42, label="Test Label")
    assert element.id == 42
    assert element.label == "Test Label"


def test_api_error_minimal():
    """Test ApiError with minimal required fields"""
    error = ApiError(
        code=ApiErrorCode.existing_chip_code,
        content={"chip_code": "123456789"}
    )
    assert error.code == ApiErrorCode.existing_chip_code
    assert error.content == {"chip_code": "123456789"}
    assert error.message is None


def test_api_error_with_message():
    """Test ApiError with message"""
    error = ApiError(
        code=ApiErrorCode.existing_chip_code,
        content={"chip_code": "123456789"},
        message="Chip code already exists"
    )
    assert error.code == ApiErrorCode.existing_chip_code
    assert error.content == {"chip_code": "123456789"}
    assert error.message == "Chip code already exists"
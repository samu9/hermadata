import pytest

from hermadata.errors import APIException


def test_api_exception_inheritance():
    """Test that APIException inherits from Exception"""
    assert issubclass(APIException, Exception)


def test_api_exception_creation():
    """Test creating APIException instance"""
    exc = APIException("Test error message")
    assert isinstance(exc, APIException)
    assert isinstance(exc, Exception)


def test_api_exception_message():
    """Test APIException with message"""
    message = "Test error message"
    exc = APIException(message)
    assert str(exc) == message


def test_api_exception_no_message():
    """Test APIException without message"""
    exc = APIException()
    assert str(exc) == ""


def test_api_exception_raise():
    """Test raising APIException"""
    with pytest.raises(APIException):
        raise APIException("Test error")


def test_api_exception_raise_with_message():
    """Test raising APIException with specific message"""
    message = "Specific error message"
    with pytest.raises(APIException, match=message):
        raise APIException(message)
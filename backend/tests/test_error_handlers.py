import pytest
from unittest.mock import Mock
from fastapi.responses import JSONResponse

from hermadata.error_handlers import api_error_exception_handler, API_ERROR_MESSAGES, DEFAULT_MESSAGE
from hermadata.repositories.animal.animal_repository import (
    AnimalWithoutChipCodeException,
    EntryNotCompleteException,
    NoRequiredExitDataException,
)


@pytest.mark.asyncio
async def test_handle_animal_without_chip_code_exception():
    """Test handling AnimalWithoutChipCodeException"""
    request = Mock()
    exc = AnimalWithoutChipCodeException("Test exception")
    
    response = await api_error_exception_handler(request, exc)
    
    assert isinstance(response, JSONResponse)
    assert response.status_code == 400
    
    # Check the response content
    content = response.body.decode()
    assert "error" in content
    assert "Internal Server Error" in content
    assert API_ERROR_MESSAGES[AnimalWithoutChipCodeException] in content


@pytest.mark.asyncio
async def test_handle_entry_not_complete_exception():
    """Test handling EntryNotCompleteException"""
    request = Mock()
    exc = EntryNotCompleteException("Test exception")
    
    response = await api_error_exception_handler(request, exc)
    
    assert isinstance(response, JSONResponse)
    assert response.status_code == 400
    
    content = response.body.decode()
    assert API_ERROR_MESSAGES[EntryNotCompleteException] in content


@pytest.mark.asyncio
async def test_handle_no_required_exit_data_exception():
    """Test handling NoRequiredExitDataException"""
    request = Mock()
    exc = NoRequiredExitDataException("Test exception")
    
    response = await api_error_exception_handler(request, exc)
    
    assert isinstance(response, JSONResponse)
    assert response.status_code == 400
    
    content = response.body.decode()
    assert API_ERROR_MESSAGES[NoRequiredExitDataException] in content


@pytest.mark.asyncio
async def test_handle_unknown_exception():
    """Test handling unknown exception type"""
    request = Mock()
    
    # Create a custom exception not in the error messages
    class UnknownException(Exception):
        pass
    
    exc = UnknownException("Unknown error")
    
    response = await api_error_exception_handler(request, exc)
    
    assert isinstance(response, JSONResponse)
    assert response.status_code == 400
    
    content = response.body.decode()
    assert DEFAULT_MESSAGE in content


def test_error_messages_coverage():
    """Test that all supported exceptions have error messages"""
    supported_exceptions = [
        AnimalWithoutChipCodeException,
        EntryNotCompleteException, 
        NoRequiredExitDataException,
    ]
    
    for exc_type in supported_exceptions:
        assert exc_type in API_ERROR_MESSAGES
        assert isinstance(API_ERROR_MESSAGES[exc_type], str)
        assert len(API_ERROR_MESSAGES[exc_type]) > 0


def test_default_message_exists():
    """Test that default message is defined"""
    assert DEFAULT_MESSAGE is not None
    assert isinstance(DEFAULT_MESSAGE, str)
    assert len(DEFAULT_MESSAGE) > 0
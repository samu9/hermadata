import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from hermadata.routers.vet_router import router
from hermadata.models import PaginationResult


@pytest.fixture
def test_client():
    """Create a test client with the vet router"""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


@pytest.fixture
def mock_vet_repository():
    """Mock vet repository"""
    repo = Mock()
    return repo


@patch('hermadata.routers.vet_router.vet_repository')
def test_create_vet(mock_dep, test_client, mock_vet_repository):
    """Test creating a new vet"""
    # Mock data
    vet_data = {
        "id": 1,
        "name": "Dr. Smith",
        "email": "dr.smith@example.com",
        "phone": "123-456-7890"
    }
    mock_vet_repository.create.return_value = vet_data
    mock_dep.return_value = mock_vet_repository
    
    response = test_client.post(
        "/vet/",
        json=vet_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data == vet_data
    mock_vet_repository.create.assert_called_once()


@patch('hermadata.routers.vet_router.vet_repository')
def test_search_vet(mock_dep, test_client, mock_vet_repository):
    """Test searching for vets"""
    # Mock data  
    search_result = PaginationResult(
        total=2,
        items=[
            {"id": 1, "name": "Dr. Smith", "email": "dr.smith@example.com"},
            {"id": 2, "name": "Dr. Jones", "email": "dr.jones@example.com"}
        ]
    )
    mock_vet_repository.search.return_value = search_result
    mock_dep.return_value = mock_vet_repository
    
    response = test_client.get("/vet/search")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    mock_vet_repository.search.assert_called_once()


@patch('hermadata.routers.vet_router.vet_repository')
def test_search_vet_with_params(mock_dep, test_client, mock_vet_repository):
    """Test searching for vets with query parameters"""
    search_result = PaginationResult(total=1, items=[{"id": 1, "name": "Dr. Smith"}])
    mock_vet_repository.search.return_value = search_result
    mock_dep.return_value = mock_vet_repository
    
    response = test_client.get("/vet/search?name=Smith&from_index=0&to_index=10")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    mock_vet_repository.search.assert_called_once()
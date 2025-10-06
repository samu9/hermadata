import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from hermadata.routers.adoption_router import router


@pytest.fixture
def test_client():
    """Create a test client with the adoption router"""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


@pytest.fixture
def mock_adoption_repository():
    """Mock adoption repository"""
    repo = Mock()
    return repo


class TestAdoptionRouter:
    """Test cases for adoption router endpoints"""
    
    @patch('hermadata.routers.adoption_router.SQLAdopionRepository')
    def test_new_animal_adoption_success(self, mock_repo_class, test_client):
        """Test successfully creating a new adoption"""
        # Mock repository instance
        mock_repo = Mock()
        mock_repo_class.return_value = mock_repo
        
        # Mock data
        adoption_data = {"animal_id": 1, "adopter_id": 1}
        created_adoption = {
            "id": 1,
            "animal_id": 1, 
            "adopter_id": 1,
            "adoption_date": "2024-01-01"
        }
        
        mock_repo.create.return_value = created_adoption
        
        response = test_client.post(
            "/adoption",
            json=adoption_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data == created_adoption
        mock_repo.create.assert_called_once()
    
    @patch('hermadata.routers.adoption_router.SQLAdopionRepository')
    def test_new_animal_adoption_existing_adoption(self, mock_repo_class, test_client):
        """Test creating adoption when animal already adopted"""
        # Import the exception
        from hermadata.repositories.adoption_repository import ExistingAdoptionException
        
        # Mock repository instance
        mock_repo = Mock()
        mock_repo_class.return_value = mock_repo
        
        # Mock exception
        mock_repo.create.side_effect = ExistingAdoptionException("Animal already adopted")
        
        adoption_data = {"animal_id": 1, "adopter_id": 1}
        
        response = test_client.post(
            "/adoption",
            json=adoption_data
        )
        
        assert response.status_code == 400  # HTTPException with 400 status
        mock_repo.create.assert_called_once()
    
    @patch('hermadata.routers.adoption_router.SQLAdopionRepository')
    def test_new_animal_adoption_invalid_data(self, mock_repo_class, test_client):
        """Test creating adoption with invalid data"""
        mock_repo = Mock()
        mock_repo_class.return_value = mock_repo
        
        # Test missing required fields
        response = test_client.post(
            "/adoption",
            json={"animal_id": 1}  # Missing adopter_id
        )
        
        assert response.status_code == 422  # Validation error
        
        # Test invalid types
        response = test_client.post(
            "/adoption",
            json={"animal_id": "invalid", "adopter_id": 1}
        )
        
        assert response.status_code == 422  # Validation error
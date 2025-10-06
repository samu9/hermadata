import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from pymysql import IntegrityError

from hermadata.routers.breed_router import router


@pytest.fixture
def test_client():
    """Create a test client with the breed router"""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


@pytest.fixture
def mock_breed_repository():
    """Mock breed repository"""
    repo = Mock()
    return repo


class TestBreedRouter:
    """Test cases for breed router endpoints"""
    
    @patch('hermadata.routers.breed_router.breed_repository')
    def test_get_all_breeds(self, mock_dep, test_client, mock_breed_repository):
        """Test getting all breeds for a race"""
        # Mock data
        breed_data = [
            {"id": 1, "name": "Labrador", "race_id": "C"},
            {"id": 2, "name": "Golden Retriever", "race_id": "C"}
        ]
        mock_breed_repository.get_all.return_value = breed_data
        mock_dep.return_value = mock_breed_repository
        
        response = test_client.get("/breed?race_id=C")
        
        assert response.status_code == 200
        data = response.json()
        assert data == breed_data
        mock_breed_repository.get_all.assert_called_once_with("C")
    
    @patch('hermadata.routers.breed_router.breed_repository')
    def test_get_all_breeds_missing_race_id(self, mock_dep, test_client, mock_breed_repository):
        """Test getting breeds without race_id parameter"""
        mock_dep.return_value = mock_breed_repository
        
        response = test_client.get("/breed")
        
        # Should return 422 for missing required parameter
        assert response.status_code == 422
    
    @patch('hermadata.routers.breed_router.breed_repository')
    def test_create_breed_success(self, mock_dep, test_client, mock_breed_repository):
        """Test successfully creating a breed"""
        # Mock data
        new_breed_data = {"name": "Beagle", "race_id": "C"}
        created_breed = {"id": 3, "name": "Beagle", "race_id": "C"}
        
        mock_breed_repository.create.return_value = created_breed
        mock_breed_repository.session.commit.return_value = None
        mock_dep.return_value = mock_breed_repository
        
        response = test_client.post(
            "/breed",
            json=new_breed_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data == created_breed
        mock_breed_repository.create.assert_called_once()
        mock_breed_repository.session.commit.assert_called_once()
    
    @patch('hermadata.routers.breed_router.breed_repository')
    def test_create_breed_integrity_error(self, mock_dep, test_client, mock_breed_repository):
        """Test creating a breed with integrity error (duplicate)"""
        # Mock data
        new_breed_data = {"name": "Beagle", "race_id": "C"}
        
        # Mock IntegrityError
        mock_breed_repository.create.side_effect = IntegrityError("Duplicate entry")
        mock_dep.return_value = mock_breed_repository
        
        response = test_client.post(
            "/breed",
            json=new_breed_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data is None  # Should return None on integrity error
        mock_breed_repository.create.assert_called_once()
        # Commit should not be called on error
        mock_breed_repository.session.commit.assert_not_called()
    
    @patch('hermadata.routers.breed_router.breed_repository')
    def test_create_breed_invalid_data(self, mock_dep, test_client, mock_breed_repository):
        """Test creating a breed with invalid data"""
        mock_dep.return_value = mock_breed_repository
        
        # Test missing required fields
        response = test_client.post(
            "/breed",
            json={"name": "Beagle"}  # Missing race_id
        )
        
        assert response.status_code == 422  # Validation error
        
        # Test empty name
        response = test_client.post(
            "/breed", 
            json={"name": "", "race_id": "C"}
        )
        
        assert response.status_code == 422  # Validation error
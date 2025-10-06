import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from hermadata.routers.race_router import router


@pytest.fixture
def test_client():
    """Create a test client with the race router"""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


@pytest.fixture
def mock_race_repository():
    """Mock race repository"""
    repo = Mock()
    return repo


class TestRaceRouter:
    """Test cases for race router endpoints"""
    
    @patch('hermadata.routers.race_router.race_repository')
    def test_get_races(self, mock_dep, test_client, mock_race_repository):
        """Test getting all races"""
        # Mock data
        race_data = [
            {"id": "C", "description": "Cane"},
            {"id": "G", "description": "Gatto"}
        ]
        mock_race_repository.get_all.return_value = race_data
        mock_dep.return_value = mock_race_repository
        
        response = test_client.get("/race")
        
        assert response.status_code == 200
        data = response.json()
        assert data == race_data
        mock_race_repository.get_all.assert_called_once()
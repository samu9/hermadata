import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from hermadata.routers.util_router import router
from hermadata.constants import (
    ANIMAL_STAGE_LABELS,
    ENTRY_TYPE_LABELS, 
    EXIT_TYPE_LABELS,
    FUR_LABELS,
    SIZE_LABELS,
)
from hermadata.models import UtilElement


@pytest.fixture
def test_client():
    """Create a test client with the util router"""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


@pytest.fixture 
def mock_city_repository():
    """Mock city repository"""
    repo = Mock()
    return repo


@pytest.fixture
def mock_animal_repository():
    """Mock animal repository"""
    repo = Mock()
    return repo


@patch('hermadata.routers.util_router.city_repository')
def test_get_province(mock_dep, test_client, mock_city_repository):
    """Test getting province list"""
    # Mock data
    province_data = [
        {"sigla": "LU", "provincia": "Lucca"},
        {"sigla": "PI", "provincia": "Pisa"}
    ]
    mock_city_repository.get_province.return_value = province_data
    mock_dep.return_value = mock_city_repository
    
    response = test_client.get("/util/province")
    
    assert response.status_code == 200
    data = response.json()
    assert data == province_data
    mock_city_repository.get_province.assert_called_once()


@patch('hermadata.routers.util_router.city_repository')
def test_get_comuni(mock_dep, test_client, mock_city_repository):
    """Test getting comuni list for a province"""
    # Mock data
    comuni_data = [
        {"codice": "H501", "nome": "Lucca", "provincia": "LU"},
        {"codice": "H502", "nome": "Bagni di Lucca", "provincia": "LU"}
    ]
    mock_city_repository.get_comuni.return_value = comuni_data
    mock_dep.return_value = mock_city_repository
    
    response = test_client.get("/util/comuni?provincia=LU")
    
    assert response.status_code == 200
    data = response.json()
    assert data == comuni_data
    mock_city_repository.get_comuni.assert_called_once_with(provincia="LU")


def test_get_entry_types(test_client):
    """Test getting entry types"""
    response = test_client.get("/util/entry-types")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert isinstance(data, list)
    assert len(data) == len(ENTRY_TYPE_LABELS)
    
    # Verify each item has correct structure
    for item in data:
        assert "id" in item
        assert "label" in item
    
    # Verify specific mappings
    ids = [item["id"] for item in data]
    labels = [item["label"] for item in data]
    
    for entry_type, label in ENTRY_TYPE_LABELS.items():
        assert entry_type.value in ids
        assert label in labels


def test_get_exit_types(test_client):
    """Test getting exit types"""
    response = test_client.get("/util/exit-types")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert isinstance(data, list)
    assert len(data) == len(EXIT_TYPE_LABELS)
    
    # Verify each item has correct structure
    for item in data:
        assert "id" in item
        assert "label" in item
    
    # Verify specific mappings
    ids = [item["id"] for item in data]
    labels = [item["label"] for item in data]
    
    for exit_type, label in EXIT_TYPE_LABELS.items():
        assert exit_type.value in ids
        assert label in labels


def test_get_animal_sizes(test_client):
    """Test getting animal size options"""
    response = test_client.get("/util/animal-size")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert isinstance(data, list)
    assert len(data) == len(SIZE_LABELS)
    
    # Verify each item has correct structure
    for item in data:
        assert "id" in item
        assert "label" in item
    
    # Verify specific mappings
    ids = [item["id"] for item in data]
    labels = [item["label"] for item in data]
    
    for size, label in SIZE_LABELS.items():
        assert size.value in ids
        assert label in labels


def test_get_animal_fur_types(test_client):
    """Test getting animal fur type options"""
    response = test_client.get("/util/animal-fur")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert isinstance(data, list)
    assert len(data) == len(FUR_LABELS)
    
    # Verify each item has correct structure
    for item in data:
        assert "id" in item
        assert "label" in item
    
    # Verify specific mappings
    ids = [item["id"] for item in data]
    labels = [item["label"] for item in data]
    
    for fur_type, label in FUR_LABELS.items():
        assert fur_type.value in ids
        assert label in labels


def test_get_animal_stages(test_client):
    """Test getting animal stage options"""
    response = test_client.get("/util/animal-stages")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert isinstance(data, list)
    assert len(data) == len(ANIMAL_STAGE_LABELS)
    
    # Verify each item has correct structure
    for item in data:
        assert "id" in item
        assert "label" in item
    
    # Verify specific mappings
    ids = [item["id"] for item in data]
    labels = [item["label"] for item in data]
    
    for stage, label in ANIMAL_STAGE_LABELS.items():
        assert stage.value in ids
        assert label in labels


@patch('hermadata.routers.util_router.animal_repository')
def test_get_animal_fur_colors(mock_dep, test_client, mock_animal_repository):
    """Test getting fur color options"""
    # Mock data
    fur_colors = [
        UtilElement(id=1, label="Black"),
        UtilElement(id=2, label="White"),
        UtilElement(id=3, label="Brown")
    ]
    mock_animal_repository.get_fur_colors.return_value = fur_colors
    mock_dep.return_value = mock_animal_repository
    
    response = test_client.get("/util/fur-color")
    
    assert response.status_code == 200
    data = response.json()
    
    # Convert back to verify
    expected_data = [{"id": color.id, "label": color.label} for color in fur_colors]
    assert data == expected_data
    mock_animal_repository.get_fur_colors.assert_called_once()


@patch('hermadata.routers.util_router.animal_repository')
def test_add_fur_color(mock_dep, test_client, mock_animal_repository):
    """Test adding a new fur color"""
    # Mock return data
    new_color = UtilElement(id=4, label="GOLDEN")
    mock_animal_repository.add_fur_color.return_value = new_color
    mock_dep.return_value = mock_animal_repository
    
    response = test_client.post(
        "/util/fur-color",
        json={"name": "golden"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    expected_data = {"id": new_color.id, "label": new_color.label}
    assert data == expected_data
    mock_animal_repository.add_fur_color.assert_called_once_with("GOLDEN")


@patch('hermadata.routers.util_router.animal_repository') 
def test_add_fur_color_invalid_name(mock_dep, test_client, mock_animal_repository):
    """Test adding a fur color with invalid name"""
    mock_dep.return_value = mock_animal_repository
    
    # Test too short name
    response = test_client.post(
        "/util/fur-color",
        json={"name": "x"}
    )
    
    assert response.status_code == 422  # Validation error
    
    # Test empty name
    response = test_client.post(
        "/util/fur-color",
        json={"name": ""}
    )
    
    assert response.status_code == 422  # Validation error


def test_get_comuni_missing_parameter(test_client):
    """Test getting comuni without provincia parameter"""
    response = test_client.get("/util/comuni")
    
    # Should return 422 for missing required parameter
    assert response.status_code == 422
import pytest
from unittest.mock import MagicMock, patch

from hermadata.constants import StorageType
from hermadata.dependancies import (
    get_disk_storage, 
    get_s3_storage,
    get_storage_map,
    get_jinja_env
)
from hermadata.storage.disk_storage import DiskStorage
from hermadata.storage.s3_storage import S3Storage


def test_get_disk_storage():
    """Test disk storage dependency creation"""
    with patch('hermadata.dependancies.settings') as mock_settings:
        mock_settings.storage.disk.base_path = "/test/path"
        
        storage = get_disk_storage()
        
        assert isinstance(storage, DiskStorage)
        assert storage.base_path == "/test/path"


def test_get_s3_storage():
    """Test S3 storage dependency creation"""
    with patch('hermadata.dependancies.settings') as mock_settings:
        mock_settings.storage.s3.bucket = "test-bucket"
        
        storage = get_s3_storage()
        
        assert isinstance(storage, S3Storage)
        assert storage.bucket_name == "test-bucket"


def test_get_storage_map():
    """Test storage map dependency creation"""
    disk_storage = DiskStorage("/test/path")
    s3_storage = S3Storage("test-bucket")
    
    storage_map = get_storage_map(disk_storage, s3_storage)
    
    assert isinstance(storage_map, dict)
    assert StorageType.disk in storage_map
    assert StorageType.aws_s3 in storage_map
    assert storage_map[StorageType.disk] == disk_storage
    assert storage_map[StorageType.aws_s3] == s3_storage


def test_get_jinja_env():
    """Test Jinja environment dependency creation"""
    env = get_jinja_env()
    
    # Verify it's a Jinja environment
    from jinja2 import Environment
    assert isinstance(env, Environment)
    
    # Verify globals are set
    assert "software_name" in env.globals
    assert "software_version" in env.globals
    assert env.globals["software_name"] == "Hermadata"


def test_get_document_repository():
    """Test document repository dependency creation"""
    # This is a placeholder test that can be expanded once the actual
    # get_document_repository function is implemented
    pass

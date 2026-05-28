from abc import ABC, abstractmethod


class StorageInterface(ABC):
    @abstractmethod
    def store_file(self, file_name, content):
        pass

    @abstractmethod
    def retrieve_file(self, key: str):
        pass

    @abstractmethod
    def delete_file(self, key: str):
        pass

    @abstractmethod
    def list_files(self):
        pass

    @abstractmethod
    def clear_storage(self):
        pass

    @abstractmethod
    def get_presigned_url(
        self, key: str, filename: str, mimetype: str, expires_in: int
    ) -> str | None:
        """Return a short-lived presigned download URL,
        or None if not supported."""
        pass

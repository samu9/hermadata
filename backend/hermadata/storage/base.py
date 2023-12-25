from abc import ABC, abstractmethod


class StorageInterface(ABC):
    @abstractmethod
    def store_file(self, file_name, content):
        pass

    @abstractmethod
    def retrieve_file(self, file_name):
        pass

    @abstractmethod
    def delete_file(self, file_name):
        pass

    @abstractmethod
    def list_files(self):
        pass

    @abstractmethod
    def clear_storage(self):
        pass

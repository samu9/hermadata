import logging
import os
import shutil

from hermadata.storage.base import StorageInterface

logger = logging.getLogger(__name__)


class DiskStorage(StorageInterface):
    def __init__(self, base_path):
        self.base_path = base_path

    def store_file(self, file_name, content):
        file_path = os.path.join(self.base_path, file_name)
        with open(file_path, "wb") as file:
            file.write(content)
        logger.debug(f"File '{file_name}' stored at '{file_path}'.")

    def retrieve_file(self, key):
        file_path = os.path.join(self.base_path, key)
        if os.path.exists(file_path):
            with open(file_path, "rb") as file:
                content = file.read()
            logger.debug(f"File '{key}' retrieved from '{file_path}'.")
            return content
        else:
            logger.warning(f"File '{key}' not found.")
            return None

    def delete_file(self, file_name):
        file_path = os.path.join(self.base_path, file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File '{file_name}' deleted.")
        else:
            logger.info(f"File '{file_name}' not found.")

    def list_files(self):
        files = os.listdir(self.base_path)
        print(f"Files in storage: {files}")
        return files

    def clear_storage(self):
        shutil.rmtree(self.base_path)
        os.makedirs(self.base_path)
        print("Storage cleared.")

import os

from sqlalchemy import create_engine, select, update
from sqlalchemy.orm import sessionmaker

from hermadata.constants import StorageType
from hermadata.database.models import Document
from hermadata.dependancies import get_s3_storage
from hermadata.settings import settings


def upload_pdfs_to_s3():
    directory_path = settings.storage.disk.base_path
    # Create an instance of the S3Storage class
    s3_storage = get_s3_storage()
    db_session = sessionmaker(create_engine(**settings.db.model_dump()))

    with db_session() as session:
        keys = session.execute(
            select(Document.key, Document.filename).where(Document.storage_service == StorageType.disk.value)
        ).all()

    # Check if the provided directory path is valid
    if not os.path.isdir(directory_path):
        print(f"The provided path '{directory_path}' is not a valid directory.")
        return

    # Loop through all files in the directory
    for k, filename in keys:
        if not os.path.exists(os.path.join(directory_path, k)):
            print(f"{k} not found")
            continue

        file_path = os.path.join(directory_path, k)

        # Open the PDF and upload its content to S3
        try:
            with open(file_path, "rb") as pdf_file:
                content = pdf_file.read()
                s3_storage.store_file(k, content)
                print(f"Uploaded '{filename}' to S3.")
        except Exception as e:
            print(f"Failed to upload '{filename}' to S3: {e}")
            continue
        with db_session.begin() as session:
            session.execute(
                update(Document).where(Document.key == k).values({Document.storage_service: StorageType.aws_s3.value})
            )


if __name__ == "__main__":
    upload_pdfs_to_s3()

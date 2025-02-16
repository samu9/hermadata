import logging

import boto3
from botocore.exceptions import ClientError

from hermadata.storage.base import StorageInterface

logger = logging.getLogger(__name__)


class S3Storage(StorageInterface):
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name
        self.s3 = boto3.client("s3")

    def store_file(self, file_name, content):
        try:
            self.s3.put_object(Body=content, Bucket=self.bucket_name, Key=file_name)
            logger.info(f"File '{file_name}' stored in S3 bucket '{self.bucket_name}'.")
        except ClientError as e:
            logger.error(f"Failed to store file '{file_name}': {e}")
            raise e

    def retrieve_file(self, file_name):
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=file_name)
            content = response["Body"].read()
            logger.info(f"File '{file_name}' retrieved from S3 bucket '{self.bucket_name}'.")
            return content
        except self.s3.exceptions.NoSuchKey:
            logger.warning(f"File '{file_name}' not found in S3 bucket '{self.bucket_name}'.")
            return None
        except ClientError as e:
            logger.error(f"Failed to retrieve file '{file_name}': {e}")
            return None

    def delete_file(self, file_name):
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=file_name)
            logger.info(f"File '{file_name}' deleted from S3 bucket '{self.bucket_name}'.")
        except ClientError as e:
            logger.error(f"Failed to delete file '{file_name}': {e}")

    def list_files(self):
        try:
            files = []
            paginator = self.s3.get_paginator("list_objects_v2")
            for page in paginator.paginate(Bucket=self.bucket_name):
                files.extend([obj["Key"] for obj in page.get("Contents", [])])
            logger.info(f"Files in S3 bucket '{self.bucket_name}': {files}")
            return files
        except ClientError as e:
            logger.error(f"Failed to list files in bucket '{self.bucket_name}': {e}")
            return []

    def clear_storage(self):
        try:
            objects = self.s3.list_objects_v2(Bucket=self.bucket_name).get("Contents", [])
            for obj in objects:
                self.s3.delete_object(Bucket=self.bucket_name, Key=obj["Key"])
            logger.info(f"S3 bucket '{self.bucket_name}' cleared.")
        except ClientError as e:
            logger.error(f"Failed to clear bucket '{self.bucket_name}': {e}")

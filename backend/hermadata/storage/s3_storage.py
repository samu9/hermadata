import boto3

from hermadata.storage.base import StorageInterface


class S3Storage(StorageInterface):
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name
        self.s3 = boto3.client("s3")

    def store_file(self, file_name, content):
        self.s3.put_object(Body=content, Bucket=self.bucket_name, Key=file_name)
        print(f"File '{file_name}' stored in S3 bucket '{self.bucket_name}'.")

    def retrieve_file(self, file_name):
        try:
            response = self.s3.get_object(
                Bucket=self.bucket_name, Key=file_name
            )
            content = response["Body"].read()
            print(
                f"File '{file_name}' retrieved from S3 bucket '{self.bucket_name}'."
            )
            return content
        except self.s3.exceptions.NoSuchKey:
            print(
                f"File '{file_name}' not found in S3 bucket '{self.bucket_name}'."
            )
            return None

    def delete_file(self, file_name):
        self.s3.delete_object(Bucket=self.bucket_name, Key=file_name)
        print(
            f"File '{file_name}' deleted from S3 bucket '{self.bucket_name}'."
        )

    def list_files(self):
        response = self.s3.list_objects_v2(Bucket=self.bucket_name)
        files = [obj["Key"] for obj in response.get("Contents", [])]
        print(f"Files in S3 bucket '{self.bucket_name}': {files}")
        return files

    def clear_storage(self):
        objects = self.s3.list_objects_v2(Bucket=self.bucket_name).get(
            "Contents", []
        )
        for obj in objects:
            self.s3.delete_object(Bucket=self.bucket_name, Key=obj["Key"])
        print(f"S3 bucket '{self.bucket_name}' cleared.")

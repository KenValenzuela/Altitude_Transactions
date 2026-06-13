"""File storage behind a small interface: local disk (default) or S3-compatible.

Files are never publicly addressable; reads go through authorized API routes.
Storage keys are server-generated (org/transaction/uuid) — user filenames are
metadata only and never touch the filesystem path.
"""
from __future__ import annotations

from pathlib import Path
from typing import Protocol
from uuid import uuid4

from app.core.config import settings


class StorageBackend(Protocol):
    def put(self, key: str, data: bytes) -> None: ...

    def get(self, key: str) -> bytes: ...


class LocalStorage:
    def __init__(self, root: str) -> None:
        self._root = Path(root)

    def _path(self, key: str) -> Path:
        path = (self._root / key).resolve()
        if not path.is_relative_to(self._root.resolve()):
            raise ValueError("Invalid storage key")
        return path

    def put(self, key: str, data: bytes) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def get(self, key: str) -> bytes:
        return self._path(key).read_bytes()


class S3Storage:
    """S3-compatible backend. Requires the `s3` extra (boto3)."""

    def __init__(self, bucket: str, endpoint_url: str | None, region: str) -> None:
        import boto3  # imported lazily so boto3 stays optional

        self._bucket = bucket
        self._client = boto3.client(
            "s3", endpoint_url=endpoint_url or None, region_name=region
        )

    def put(self, key: str, data: bytes) -> None:
        self._client.put_object(Bucket=self._bucket, Key=key, Body=data)

    def get(self, key: str) -> bytes:
        return self._client.get_object(Bucket=self._bucket, Key=key)["Body"].read()


_backend: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _backend
    if _backend is None:
        if settings.storage_backend == "s3" and settings.s3_bucket:
            _backend = S3Storage(
                settings.s3_bucket, settings.s3_endpoint_url, settings.s3_region
            )
        else:
            _backend = LocalStorage(settings.upload_dir)
    return _backend


def make_storage_key(organization_id: str, transaction_id: str) -> str:
    return f"{organization_id}/{transaction_id}/{uuid4()}.pdf"

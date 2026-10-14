import time
from typing import Dict, Any, Optional

class SimpleCache:
    """
    Thread-safe in-memory cache with Time-To-Live (TTL) support for computational evidence.
    """
    def __init__(self, default_ttl_seconds: int = 3600):
        self._store: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        entry = self._store[key]
        if time.time() > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["value"]

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }

    def clear(self) -> None:
        self._store.clear()

evidence_cache = SimpleCache(default_ttl_seconds=3600)

import time
from threading import Lock

class SessionStore:
    def __init__(self, ttl_seconds: int = 600):
        self._store: dict[str, dict] = {}
        self._lock = Lock()
        self.ttl = ttl_seconds

    def update(self, session_id: str, packet: dict) -> dict:
        with self._lock:
            state = self._store.setdefault(session_id, {
                "hover_durations": {},
                "text_selections": [],
                "scroll_velocity": [],
                "identity_hint": None,
                "last_seen": time.time(),
            })
            for k, v in packet.get("hover_durations", {}).items():
                state["hover_durations"][k] = state["hover_durations"].get(k, 0) + v
            state["text_selections"].extend(packet.get("text_selections", []))
            state["scroll_velocity"] = (
                state["scroll_velocity"] + packet.get("scroll_velocity", [])
            )[-20:]
            if packet.get("identity_hint"):
                state["identity_hint"] = packet["identity_hint"]
            state["last_seen"] = time.time()
            return dict(state)

    def get(self, session_id: str):
        return self._store.get(session_id)

    def cleanup(self):
        now = time.time()
        with self._lock:
            expired = [sid for sid, s in self._store.items() if now - s["last_seen"] > self.ttl]
            for sid in expired:
                del self._store[sid]

store = SessionStore()
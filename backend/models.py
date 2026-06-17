from pydantic import BaseModel
from typing import Optional, Literal

class BehaviorPacket(BaseModel):
    session_id: str
    identity_hint: Optional[str] = None
    hover_durations: dict[str, float] = {}
    text_selections: list[str] = []
    scroll_velocity: list[float] = []
    timestamp: float

class InterventionPayload(BaseModel):
    trigger: bool
    intervention_type: Optional[Literal["chatbot", "promo_banner", "loyalty_perk"]] = None
    payload: Optional[dict] = None
    confidence: Optional[float] = None
    identity: Optional[dict] = None
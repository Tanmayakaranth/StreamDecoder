import json

with open("data/intent_catalog.json") as f:
    INTENT_CATALOG = json.load(f)

TECH_KEYWORDS = ["spec", "dimensions", "compatibility", "material", "warranty"]
HOVER_THRESHOLD_TECH = 4.0
HOVER_THRESHOLD_PRICE = 2.0
MIN_SCROLL_SAMPLES = 4
MIN_REVERSALS = 3

def infer_intent(state: dict, identity: dict) -> dict:
    max_hover = max(state["hover_durations"].values(), default=0.0)
    has_tech_selection = any(_is_technical(t) for t in state["text_selections"])

    # Priority 1: returning gold-tier member -> loyalty recognition
    if identity.get("loyalty_tier") == "gold" and max_hover > 1.0:
        return _build_payload("loyalty_recognition", identity)

    # Priority 2: technical friction
    if max_hover > HOVER_THRESHOLD_TECH and has_tech_selection:
        return _build_payload("technical_friction", identity)

    # Priority 3: price hesitation
    if _is_erratic_scroll(state["scroll_velocity"]) and max_hover > HOVER_THRESHOLD_PRICE:
        return _build_payload("price_hesitation", identity)

    return {"trigger": False, "identity": identity}

def _is_technical(text: str) -> bool:
    return any(k in text.lower() for k in TECH_KEYWORDS)

def _is_erratic_scroll(velocities: list[float]) -> bool:
    if len(velocities) < MIN_SCROLL_SAMPLES:
        return False
    reversals = sum(
        1 for i in range(1, len(velocities))
        if (velocities[i] > 0) != (velocities[i - 1] > 0)
    )
    return reversals >= MIN_REVERSALS

def _build_payload(intent_key: str, identity: dict) -> dict:
    entry = INTENT_CATALOG[intent_key]
    return {
        "trigger": True,
        "intervention_type": entry["intervention_type"],
        "payload": entry["payload"],
        "confidence": entry.get("confidence", 0.8),
        "identity": identity,
    }
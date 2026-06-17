import json

with open("data/identities.json") as f:
    IDENTITIES = json.load(f)

def resolve_identity(identity_hint: str | None) -> dict:
    if not identity_hint or identity_hint not in IDENTITIES:
        return {
            "unified_id": None,
            "persona_tags": [],
            "loyalty_tier": "none",
            "past_purchases": 0,
        }
    return IDENTITIES[identity_hint]
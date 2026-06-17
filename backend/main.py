from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import BehaviorPacket, InterventionPayload, GenerateRequest
from session_store import store
from identity import resolve_identity
from inference import infer_intent
from generation import generate_all_persona_copies

app = FastAPI(title="ChameleonPerks Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ingest", response_model=InterventionPayload)
def ingest(packet: BehaviorPacket):
    state = store.update(packet.session_id, packet.dict())
    identity = resolve_identity(state.get("identity_hint"))
    result = infer_intent(state, identity)
    return result

@app.post("/generate")
def generate_ads(req: GenerateRequest):
    return generate_all_persona_copies(req.product)

@app.get("/session/{session_id}")
def debug_session(session_id: str):
    return store.get(session_id) or {}

@app.get("/health")
def health():
    return {"status": "ok"}
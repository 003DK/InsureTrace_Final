from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

print("=== Starting InsureTrace API ===")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    try:
        from app.core.database import init_db
        await init_db()
        print("✓ Database initialized")
    except Exception as e:
        print(f"✗ Database error: {e}")
    yield
    print("Shutting down...")

app = FastAPI(
    title="InsureTrace API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth Router ──────────────────────────────────
try:
    from app.routers.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/v1")
    print("✓ Auth router loaded")
except Exception as e:
    print(f"✗ Auth router FAILED: {e}")

# ── Claims Router ────────────────────────────────
try:
    from app.routers.claims import router as claims_router
    app.include_router(claims_router, prefix="/api/v1")
    print("✓ Claims router loaded")
except Exception as e:
    print(f"✗ Claims router FAILED: {e}")

# ── Vehicles Router ──────────────────────────────
try:
    from app.routers.vehicles import router as vehicles_router
    app.include_router(vehicles_router, prefix="/api/v1")
    print("✓ Vehicles router loaded")
except Exception as e:
    print(f"✗ Vehicles router FAILED: {e}")

# ── Health & Debug ───────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/v1/debug/routes")
async def debug_routes():
    return [
        {"path": str(r.path), "methods": list(r.methods)}
        for r in app.routes
    ]

print(f"=== App created with {len(app.routes)} routes ===")
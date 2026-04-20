from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, claims, vehicles

app = FastAPI(
    title="InsureTrace API",
    version="1.0.0"
)

# ✅ CORS (keep * for development, restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers (clean prefixes)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims"])
app.include_router(vehicles.router, prefix="/api/v1/vehicles", tags=["Vehicles"])


# ✅ Health check (important for debugging)
@app.get("/")
def root():
    return {"message": "API is running 🚀"}
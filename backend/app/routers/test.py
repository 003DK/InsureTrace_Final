from fastapi import APIRouter

router = APIRouter()
print("✅ TEST ROUTER LOADED")

@router.get("/test")
def test():
    return {"message": "Backend is working 🚀"}
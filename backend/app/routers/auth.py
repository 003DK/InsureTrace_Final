from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import get_settings
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, TokenOut, AuthUserOut
import uuid

# ✅ IMPORTANT: NO prefix here (handled in main.py)
router = APIRouter(tags=["Authentication"])

settings = get_settings()


# ==========================
# ✅ REGISTER
# ==========================
@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):

    # 🔍 Check if email already exists
    existing_email = await db.scalar(
        select(User).where(User.email == payload.email)
    )
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 🔍 Check if phone already exists
    existing_phone = await db.scalar(
        select(User).where(User.phone == payload.phone)
    )
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # ✅ Create user
    user = User(
        id=str(uuid.uuid4()),
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
    )

    db.add(user)

    try:
        await db.commit()
        await db.refresh(user)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Database error")

    return user


# ==========================
# ✅ LOGIN
# ==========================
@router.post("/login", response_model=TokenOut)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):

    # 🔐 Agent login (special back-office access)
    if (
        payload.email.lower() == settings.agent_email.lower()
        and payload.password == settings.agent_password
    ):
        user = AuthUserOut(
            id="agent-backoffice",
            full_name=settings.agent_name,
            email=settings.agent_email,
            role="agent",
        )

        token = create_access_token({
            "sub": user.id,
            "email": user.email,
            "role": "agent"
        })

        return {
            "access_token": token,
            "user": user
        }

    # 🔍 Find user
    user = await db.scalar(
        select(User).where(User.email == payload.email)
    )

    # ❌ Invalid credentials
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 🔐 Create token
    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": "user"
    })

    # ✅ Response user object
    user_out = AuthUserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        kyc_status=user.kyc_status,
        digilocker_verified=user.digilocker_verified,
        role="user",
        created_at=user.created_at,
    )

    return {
        "access_token": token,
        "user": user_out
    }
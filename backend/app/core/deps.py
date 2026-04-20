from dataclasses import dataclass
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

bearer = HTTPBearer()


@dataclass
class AuthActor:
    sub: str
    email: str
    role: str
    user: User | None = None


async def get_current_actor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db)
) -> AuthActor:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    role = payload.get("role", "user")
    sub = payload.get("sub")
    email = payload.get("email", "")

    if role == "agent":
        return AuthActor(sub=sub, email=email, role=role)

    user = await db.get(User, sub)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    return AuthActor(sub=sub, email=user.email, role=role, user=user)


async def get_current_user(actor: AuthActor = Depends(get_current_actor)) -> User:
    if actor.role != "user" or not actor.user:
        raise HTTPException(status_code=403, detail="Customer account required")
    return actor.user


async def require_agent(actor: AuthActor = Depends(get_current_actor)) -> AuthActor:
    if actor.role != "agent":
        raise HTTPException(status_code=403, detail="Agent access required")
    return actor
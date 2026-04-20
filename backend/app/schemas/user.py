from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import KYCStatus


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthUserOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str | None = None
    kyc_status: KYCStatus | str = KYCStatus.PENDING
    digilocker_verified: bool = False
    role: str = "user"
    created_at: datetime | None = None


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    kyc_status: KYCStatus
    digilocker_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserOut
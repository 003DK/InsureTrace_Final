import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class KYCStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(15), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    aadhaar_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    digilocker_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    kyc_status: Mapped[KYCStatus] = mapped_column(SAEnum(KYCStatus), default=KYCStatus.PENDING)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
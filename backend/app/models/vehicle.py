import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    registration_number: Mapped[str] = mapped_column(String(15), unique=True, index=True)
    make: Mapped[str] = mapped_column(String(50))
    model: Mapped[str] = mapped_column(String(50))
    year: Mapped[int] = mapped_column()
    engine_number: Mapped[str] = mapped_column(String(50))
    chassis_number: Mapped[str] = mapped_column(String(50))
    policy_number: Mapped[str] = mapped_column(String(50), unique=True)
    policy_expiry: Mapped[date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
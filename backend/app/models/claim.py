import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, Enum as SAEnum, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class ClaimStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"


class FraudRisk(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    vehicle_id: Mapped[str] = mapped_column(ForeignKey("vehicles.id"))

    # Incident details
    incident_description: Mapped[str] = mapped_column(Text)
    incident_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gps_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    gps_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    incident_timestamp: Mapped[datetime] = mapped_column(DateTime)

    # OBD-II telematics snapshot
    obd_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Media
    media_urls: Mapped[list | None] = mapped_column(JSON, nullable=True)
    dashcam_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # AI consensus
    vision_agent_report: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    forensic_agent_report: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    compliance_agent_report: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    consensus_report: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    fraud_risk: Mapped[FraudRisk | None] = mapped_column(SAEnum(FraudRisk), nullable=True)
    consensus_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Financials
    estimated_damage: Mapped[float | None] = mapped_column(Float, nullable=True)
    approved_amount: Mapped[float | None] = mapped_column(Float, nullable=True)

    status: Mapped[ClaimStatus] = mapped_column(SAEnum(ClaimStatus), default=ClaimStatus.DRAFT)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
from pydantic import BaseModel
from datetime import datetime
from typing import Any
from app.models.claim import ClaimStatus, FraudRisk


class OBDData(BaseModel):
    speed_kmh: float | None = None
    rpm: int | None = None
    throttle_position: float | None = None
    brake_signal: bool | None = None
    airbag_deployed: bool | None = None
    impact_g_force: float | None = None


class ClaimCreate(BaseModel):
    vehicle_id: str
    incident_description: str
    incident_location: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    incident_timestamp: datetime
    obd_data: OBDData | None = None


class ClaimOut(BaseModel):
    id: str
    claim_number: str
    status: ClaimStatus
    fraud_risk: FraudRisk | None = None
    consensus_score: float | None = None
    estimated_damage: float | None = None
    approved_amount: float | None = None
    consensus_report: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
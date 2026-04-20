from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_actor, require_agent, AuthActor
from app.models.claim import Claim, ClaimStatus, FraudRisk
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.claim import ClaimCreate, ClaimOut
import uuid
import random
import string
from datetime import datetime

router = APIRouter(prefix="/claims", tags=["Claims"])


def generate_claim_number() -> str:
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"CLM-{datetime.utcnow().year}-{suffix}"


async def process_claim_with_swarm(claim_id: str):
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        claim = await db.get(Claim, claim_id)
        if not claim:
            return
        user = await db.get(User, claim.user_id)
        vehicle = await db.get(Vehicle, claim.vehicle_id)

        claim_data = {
            "incident_description": claim.incident_description,
            "incident_location": claim.incident_location,
            "gps_latitude": claim.gps_latitude,
            "gps_longitude": claim.gps_longitude,
        }

        from app.services.consensus_ai import (
            run_vision_agent, run_forensic_agent,
            run_compliance_agent, run_consensus_ai
        )

        vision = await run_vision_agent(claim_data, claim.media_urls or [])
        forensic = await run_forensic_agent(claim_data, claim.obd_data)
        compliance = await run_compliance_agent(
            {"kyc_status": user.kyc_status if user else "pending",
             "digilocker_verified": user.digilocker_verified if user else False},
            {"registration_number": vehicle.registration_number if vehicle else "N/A",
             "policy_number": vehicle.policy_number if vehicle else "N/A",
             "policy_expiry": str(vehicle.policy_expiry) if vehicle else "N/A"},
        )
        consensus = await run_consensus_ai(vision, forensic, compliance, claim_data)

        claim.vision_agent_report = vision
        claim.forensic_agent_report = forensic
        claim.compliance_agent_report = compliance
        claim.consensus_report = consensus

        fraud = consensus.get("fraud_risk", "medium")
        try:
            claim.fraud_risk = FraudRisk(fraud)
        except Exception:
            claim.fraud_risk = FraudRisk.MEDIUM

        claim.consensus_score = consensus.get("consensus_score", 0.0)
        claim.estimated_damage = vision.get("estimated_repair_cost_inr")
        claim.approved_amount = consensus.get("approved_amount_inr")

        verdict = consensus.get("final_verdict", "under_review")
        if verdict == "approved":
            claim.status = ClaimStatus.APPROVED
        elif verdict == "rejected":
            claim.status = ClaimStatus.REJECTED
        else:
            claim.status = ClaimStatus.UNDER_REVIEW

        await db.commit()


@router.post("/", response_model=ClaimOut, status_code=201)
async def create_claim(
    payload: ClaimCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    vehicle = await db.get(Vehicle, payload.vehicle_id)
    if not vehicle or vehicle.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Valid vehicle_id for this user is required")

    if len(payload.media_urls) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 media files")

    full_description = payload.incident_description.strip()
    if payload.incident_story:
        full_description = f"{full_description}\n\nFull Story:\n{payload.incident_story.strip()}"

    claim = Claim(
        id=str(uuid.uuid4()),
        claim_number=generate_claim_number(),
        user_id=current_user.id,
        vehicle_id=payload.vehicle_id,
        incident_description=full_description,
        incident_location=payload.incident_location,
        gps_latitude=payload.gps_latitude,
        gps_longitude=payload.gps_longitude,
        incident_timestamp=payload.incident_timestamp,
        media_urls=payload.media_urls,
        obd_data=payload.obd_data.model_dump() if payload.obd_data else None,
        status=ClaimStatus.SUBMITTED,
    )
    db.add(claim)
    await db.flush()
    background_tasks.add_task(process_claim_with_swarm, claim.id)
    return claim


@router.get("/", response_model=list[ClaimOut])
async def my_claims(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim)
        .where(Claim.user_id == current_user.id)
        .order_by(Claim.created_at.desc())
    )
    return result.scalars().all()


@router.get("/all", response_model=list[ClaimOut])
async def all_claims(
    _: AuthActor = Depends(require_agent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Claim).order_by(Claim.created_at.desc()))
    return result.scalars().all()


@router.get("/{claim_id}", response_model=ClaimOut)
async def get_claim(
    claim_id: str,
    actor: AuthActor = Depends(get_current_actor),
    db: AsyncSession = Depends(get_db)
):
    claim = await db.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if actor.role != "agent" and claim.user_id != actor.sub:
        raise HTTPException(status_code=403, detail="Not your claim")
    return claim
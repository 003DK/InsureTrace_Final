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

router = APIRouter(tags=["Claims"])


# ==========================
# GENERATE CLAIM NUMBER
# ==========================
def generate_claim_number() -> str:
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"CLM-{datetime.utcnow().year}-{suffix}"


# ==========================
# MOCK AI PROCESS (SAFE)
# ==========================
async def process_claim_with_swarm(claim_id: str):
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        claim = await db.get(Claim, claim_id)
        if not claim:
            return

        # Mock AI result
        claim.vision_agent_report = {"damage": "minor"}
        claim.forensic_agent_report = {}
        claim.compliance_agent_report = {}
        claim.consensus_report = {"status": "approved"}

        claim.fraud_risk = FraudRisk.LOW
        claim.consensus_score = 0.92
        claim.estimated_damage = 5000
        claim.approved_amount = 4500
        claim.status = ClaimStatus.APPROVED

        await db.commit()


# ==========================
# CREATE CLAIM
# ==========================
@router.post("/", response_model=ClaimOut, status_code=201)
async def create_claim(
    payload: ClaimCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    vehicle = await db.get(Vehicle, payload.vehicle_id)

    if not vehicle or vehicle.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Invalid vehicle")

    if len(payload.media_urls) < 2:
        raise HTTPException(status_code=400, detail="Upload at least 2 images")

    claim = Claim(
        id=str(uuid.uuid4()),
        claim_number=generate_claim_number(),
        user_id=current_user.id,
        vehicle_id=payload.vehicle_id,
        incident_description=payload.incident_description,
        incident_location=payload.incident_location,
        gps_latitude=payload.gps_latitude,
        gps_longitude=payload.gps_longitude,
        incident_timestamp=payload.incident_timestamp,
        media_urls=payload.media_urls,
        status=ClaimStatus.SUBMITTED,
    )

    db.add(claim)
    await db.flush()

    background_tasks.add_task(process_claim_with_swarm, claim.id)

    return claim


# ==========================
# GET MY CLAIMS
# ==========================
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


# ==========================
# AGENT - ALL CLAIMS
# ==========================
@router.get("/all", response_model=list[ClaimOut])
async def all_claims(
    _: AuthActor = Depends(require_agent),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Claim).order_by(Claim.created_at.desc())
    )
    return result.scalars().all()


# ==========================
# GET SINGLE CLAIM
# ==========================
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
        raise HTTPException(status_code=403, detail="Forbidden")

    return claim
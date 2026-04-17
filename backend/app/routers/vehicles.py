from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.vehicle import Vehicle
from app.models.user import User
from pydantic import BaseModel
from datetime import date
import uuid

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


class VehicleCreate(BaseModel):
    registration_number: str
    make: str
    model: str
    year: int
    engine_number: str
    chassis_number: str
    policy_number: str
    policy_expiry: date


class VehicleOut(BaseModel):
    id: str
    registration_number: str
    make: str
    model: str
    year: int
    policy_number: str
    policy_expiry: date
    is_active: bool
    model_config = {"from_attributes": True}


@router.post("/", response_model=VehicleOut, status_code=201)
async def add_vehicle(
    payload: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    vehicle = Vehicle(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(vehicle)
    await db.flush()
    return vehicle


@router.get("/", response_model=list[VehicleOut])
async def my_vehicles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Vehicle).where(Vehicle.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your vehicle")
    return vehicle
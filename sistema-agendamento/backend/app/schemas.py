from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import AppointmentStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=4, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    calendar_color: str


class UserProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    calendar_color: str = Field(min_length=7, max_length=7, pattern=r"^#[0-9A-Fa-f]{6}$")


class ClientCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=30)
    email: str | None = None
    notes: str | None = None


class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone: str
    email: str | None
    notes: str | None
    created_at: datetime


class AnamnesisCreate(BaseModel):
    summary: str = Field(min_length=1)
    pain_points: str = Field(min_length=1)
    contraindications: str | None = None


class AnamnesisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    summary: str
    pain_points: str
    contraindications: str | None
    submitted_at: datetime
    created_by_user_id: int | None


class AppointmentCreate(BaseModel):
    client_id: int
    therapist_id: int
    service_name: str = Field(min_length=2, max_length=120)
    starts_at: datetime
    duration_minutes: int = Field(default=60, ge=15, le=240)
    status: AppointmentStatus = AppointmentStatus.scheduled
    notes: str | None = None


class AppointmentUpdate(BaseModel):
    client_id: int | None = None
    therapist_id: int | None = None
    service_name: str | None = Field(default=None, min_length=2, max_length=120)
    starts_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=240)
    status: AppointmentStatus | None = None
    notes: str | None = None


class AppointmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    therapist_id: int
    service_name: str
    starts_at: datetime
    duration_minutes: int
    status: AppointmentStatus
    notes: str | None
    client_name: str | None = None
    therapist_name: str | None = None
    therapist_color: str | None = None

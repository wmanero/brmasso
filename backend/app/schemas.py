from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import AppointmentStatus, PaymentMethod, PaymentStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AnamnesisBase(BaseModel):
    summary: str
    pain_points: str
    contraindications: str | None = None


class AnamnesisCreate(AnamnesisBase):
    google_form_response_id: str | None = None


class AnamnesisRead(AnamnesisBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    submitted_at: datetime


class TreatmentPlanCreate(BaseModel):
    title: str
    session_type: str
    sessions_total: int
    sessions_remaining: int
    price_total: float
    valid_until: date | None = None
    active: bool = True


class TreatmentPlanRead(TreatmentPlanCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ClientBase(BaseModel):
    full_name: str
    phone: str
    email: EmailStr | None = None
    instagram_handle: str | None = None
    birth_date: date | None = None
    preferred_service: str | None = None
    notes: str | None = None
    has_active_package: bool = False


class ClientCreate(ClientBase):
    anamnesis: AnamnesisCreate | None = None
    plans: list[TreatmentPlanCreate] = []


class ClientRead(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    anamneses: list[AnamnesisRead]
    plans: list[TreatmentPlanRead]


class AppointmentCreate(BaseModel):
    client_id: int
    service_name: str
    scheduled_at: datetime
    duration_minutes: int = 60
    status: AppointmentStatus = AppointmentStatus.scheduled
    notes: str | None = None


class AppointmentRead(AppointmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    calendar_event_id: str | None = None


class PaymentCreate(BaseModel):
    client_id: int
    amount: float
    method: PaymentMethod
    description: str


class PaymentRead(PaymentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: PaymentStatus
    external_reference: str | None = None
    created_at: datetime


class DashboardSnapshot(BaseModel):
    clients_total: int
    active_packages: int
    monthly_revenue: float
    upcoming_appointments: int
    google_form_url: str
    calendar_id: str
    pix_key: str

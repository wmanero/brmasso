from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models import Anamnesis, Appointment, Client, Payment, PaymentStatus, TreatmentPlan, User
from app.schemas import (
    AppointmentCreate,
    AppointmentRead,
    ClientCreate,
    ClientRead,
    DashboardSnapshot,
    LoginRequest,
    PaymentCreate,
    PaymentRead,
    Token,
)
from app.services import dashboard_snapshot, generate_payment_reference, list_appointments, list_clients, list_payments

router = APIRouter()


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais invalidas")
    return Token(access_token=create_access_token(user.email))


@router.get("/dashboard", response_model=DashboardSnapshot)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardSnapshot:
    return DashboardSnapshot(**dashboard_snapshot(db))


@router.get("/clients", response_model=list[ClientRead])
def get_clients(db: Session = Depends(get_db)) -> list[ClientRead]:
    return list(list_clients(db))


@router.post("/clients", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)) -> ClientRead:
    client = Client(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        instagram_handle=payload.instagram_handle,
        birth_date=payload.birth_date,
        preferred_service=payload.preferred_service,
        notes=payload.notes,
        has_active_package=payload.has_active_package,
    )
    if payload.anamnesis:
        client.anamneses.append(
            Anamnesis(
                summary=payload.anamnesis.summary,
                pain_points=payload.anamnesis.pain_points,
                contraindications=payload.anamnesis.contraindications,
                google_form_response_id=payload.anamnesis.google_form_response_id,
            )
        )
    for plan in payload.plans:
        client.plans.append(
            TreatmentPlan(
                title=plan.title,
                session_type=plan.session_type,
                sessions_total=plan.sessions_total,
                sessions_remaining=plan.sessions_remaining,
                price_total=plan.price_total,
                valid_until=plan.valid_until,
                active=plan.active,
            )
        )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/appointments", response_model=list[AppointmentRead])
def get_appointments(db: Session = Depends(get_db)) -> list[AppointmentRead]:
    return list(list_appointments(db))


@router.post("/appointments", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)) -> AppointmentRead:
    client = db.get(Client, payload.client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    appointment = Appointment(**payload.model_dump(), calendar_event_id=f"google_{client.id}_{payload.scheduled_at:%Y%m%d%H%M}")
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/payments", response_model=list[PaymentRead])
def get_payments(db: Session = Depends(get_db)) -> list[PaymentRead]:
    return list(list_payments(db))


@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)) -> PaymentRead:
    client = db.get(Client, payload.client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    payment = Payment(
        client_id=payload.client_id,
        amount=payload.amount,
        method=payload.method,
        status=PaymentStatus.pending,
        description=payload.description,
        external_reference=generate_payment_reference(payload.method),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

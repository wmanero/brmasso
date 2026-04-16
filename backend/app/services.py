from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.models import (
    Anamnesis,
    Appointment,
    AppointmentStatus,
    Client,
    Payment,
    PaymentMethod,
    PaymentStatus,
    TreatmentPlan,
    User,
)


def ensure_seed_data(db: Session) -> None:
    settings = get_settings()
    user = db.scalar(select(User).where(User.email == settings.first_superuser_email))
    if user is None:
        from app.core.security import get_password_hash

        db.add(
            User(
                full_name="B.R. Massoterapia",
                email=settings.first_superuser_email,
                hashed_password=get_password_hash(settings.first_superuser_password),
                is_superuser=True,
            )
        )
        db.commit()

    if db.scalar(select(func.count(Client.id))) != 0:
        return

    client_1 = Client(
        full_name="Ana Paula Lima",
        phone="(11) 99876-1020",
        email="ana@example.com",
        instagram_handle="@anapaulalima",
        preferred_service="Massagem relaxante",
        notes="Busca alivio para tensao cervical.",
        has_active_package=True,
    )
    client_1.anamneses.append(
        Anamnesis(
            summary="Dor recorrente em trapezio e lombar.",
            pain_points="Cervical, ombros e lombar.",
            contraindications="Nenhuma.",
            google_form_response_id="GF-001",
        )
    )
    client_1.plans.append(
        TreatmentPlan(
            title="Pacote Relax Premium",
            session_type="Pacote",
            sessions_total=8,
            sessions_remaining=5,
            price_total=960.0,
        )
    )
    client_1.appointments.append(
        Appointment(
            service_name="Sessao Relax Premium",
            scheduled_at=datetime.now(UTC).replace(tzinfo=None),
            duration_minutes=75,
            status=AppointmentStatus.confirmed,
            calendar_event_id="cal_evt_001",
        )
    )
    client_1.payments.append(
        Payment(
            amount=240.0,
            method=PaymentMethod.pix,
            status=PaymentStatus.paid,
            description="Entrada pacote relax",
            external_reference="pix_" + uuid4().hex[:10],
        )
    )

    client_2 = Client(
        full_name="Bruna Medeiros",
        phone="(11) 99123-4445",
        email="bruna@example.com",
        preferred_service="Drenagem linfatica",
        notes="Prefere horarios no inicio da tarde.",
        has_active_package=False,
    )
    client_2.anamneses.append(
        Anamnesis(
            summary="Retencao de liquido e cansaco nas pernas.",
            pain_points="Pernas e pes.",
            contraindications="Pressao controlada.",
            google_form_response_id="GF-002",
        )
    )
    client_2.appointments.append(
        Appointment(
            service_name="Drenagem linfatica",
            scheduled_at=datetime(2026, 4, 20, 14, 0, 0),
            duration_minutes=60,
            status=AppointmentStatus.scheduled,
            calendar_event_id="cal_evt_002",
        )
    )
    client_2.payments.append(
        Payment(
            amount=180.0,
            method=PaymentMethod.credit_card,
            status=PaymentStatus.pending,
            description="Sessao avulsa drenagem",
            external_reference="card_" + uuid4().hex[:10],
        )
    )

    db.add_all([client_1, client_2])
    db.commit()


def list_clients(db: Session):
    return db.scalars(
        select(Client).options(selectinload(Client.anamneses), selectinload(Client.plans)).order_by(Client.full_name)
    ).all()


def list_appointments(db: Session):
    return db.scalars(select(Appointment).options(selectinload(Appointment.client)).order_by(Appointment.scheduled_at)).all()


def list_payments(db: Session):
    return db.scalars(select(Payment).options(selectinload(Payment.client)).order_by(Payment.created_at.desc())).all()


def dashboard_snapshot(db: Session) -> dict[str, str | int | float]:
    settings = get_settings()
    clients_total = db.scalar(select(func.count(Client.id))) or 0
    active_packages = db.scalar(select(func.count(TreatmentPlan.id)).where(TreatmentPlan.active.is_(True))) or 0
    monthly_revenue = db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0.0)).where(Payment.status == PaymentStatus.paid)
    ) or 0.0
    upcoming_appointments = db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.status.in_([AppointmentStatus.scheduled, AppointmentStatus.confirmed])
        )
    ) or 0
    return {
        "clients_total": clients_total,
        "active_packages": active_packages,
        "monthly_revenue": float(monthly_revenue),
        "upcoming_appointments": upcoming_appointments,
        "google_form_url": settings.google_form_url,
        "calendar_id": settings.google_calendar_id,
        "pix_key": settings.pix_key,
    }


def generate_payment_reference(method: PaymentMethod) -> str:
    prefix = {
        PaymentMethod.pix: "pix",
        PaymentMethod.credit_card: "cc",
        PaymentMethod.debit_card: "dc",
    }[method]
    return f"{prefix}_{uuid4().hex[:12]}"

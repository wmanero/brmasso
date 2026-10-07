from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.datetime_utils import coerce_for_compare, to_clinic_naive
from app.core.security import get_password_hash
from app.models import Anamnesis, Appointment, AppointmentStatus, Client, User, UserRole
from app.schemas import AppointmentRead


def ensure_seed_users(db: Session) -> None:
    """Cria as duas contas iniciais somente se o banco ainda nao tiver usuarios.

    Depois disso, login, agenda e profissionais vêm exclusivamente da tabela `users`.
    """
    total = db.scalar(select(func.count()).select_from(User)) or 0
    if total > 0:
        return

    settings = get_settings()
    seed = [
        (
            settings.therapist_1_email,
            settings.therapist_1_password,
            settings.therapist_1_name,
            settings.therapist_1_color,
        ),
        (
            settings.therapist_2_email,
            settings.therapist_2_password,
            settings.therapist_2_name,
            settings.therapist_2_color,
        ),
    ]
    for email, password, name, color in seed:
        db.add(
            User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(password),
                role=UserRole.therapist,
                calendar_color=color,
            )
        )
    db.commit()


def appointment_end(starts_at: datetime, duration_minutes: int) -> datetime:
    return starts_at + timedelta(minutes=duration_minutes)


def intervals_overlap(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    start_a, start_b = coerce_for_compare(start_a, start_b)
    end_a, end_b = coerce_for_compare(end_a, end_b)
    return start_a < end_b and start_b < end_a


def find_therapist_conflict(
    db: Session,
    therapist_id: int,
    starts_at: datetime,
    duration_minutes: int,
    exclude_appointment_id: int | None = None,
) -> Appointment | None:
    starts_at = to_clinic_naive(starts_at)
    end_at = appointment_end(starts_at, duration_minutes)
    stmt = (
        select(Appointment)
        .where(
            Appointment.therapist_id == therapist_id,
            Appointment.status != AppointmentStatus.cancelled,
        )
        .options(joinedload(Appointment.client))
    )
    for other in db.scalars(stmt):
        if exclude_appointment_id is not None and other.id == exclude_appointment_id:
            continue
        other_end = appointment_end(other.starts_at, other.duration_minutes)
        if intervals_overlap(starts_at, end_at, other.starts_at, other_end):
            return other
    return None


def serialize_appointment(appointment: Appointment) -> AppointmentRead:
    return AppointmentRead(
        id=appointment.id,
        client_id=appointment.client_id,
        therapist_id=appointment.therapist_id,
        service_name=appointment.service_name,
        starts_at=appointment.starts_at,
        duration_minutes=appointment.duration_minutes,
        status=appointment.status,
        notes=appointment.notes,
        client_name=appointment.client.full_name if appointment.client else None,
        therapist_name=appointment.therapist.full_name if appointment.therapist else None,
        therapist_color=appointment.therapist.calendar_color if appointment.therapist else None,
    )


def list_appointments_in_range(
    db: Session,
    range_start: datetime | None,
    range_end: datetime | None,
    therapist_id: int | None = None,
) -> list[AppointmentRead]:
    stmt = select(Appointment).options(
        joinedload(Appointment.client),
        joinedload(Appointment.therapist),
    )
    if therapist_id is not None:
        stmt = stmt.where(Appointment.therapist_id == therapist_id)
    if range_start is not None:
        stmt = stmt.where(Appointment.starts_at >= to_clinic_naive(range_start))
    if range_end is not None:
        stmt = stmt.where(Appointment.starts_at <= to_clinic_naive(range_end))
    stmt = stmt.order_by(Appointment.starts_at.asc())
    rows = db.scalars(stmt).unique().all()
    return [serialize_appointment(row) for row in rows]

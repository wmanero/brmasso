from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.datetime_utils import to_clinic_naive
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.deps import get_current_user
from app.models import Anamnesis, Appointment, AppointmentStatus, Client, User
from app.schemas import (
    AnamnesisCreate,
    AnamnesisRead,
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
    ChangePasswordRequest,
    ClientCreate,
    ClientRead,
    LoginRequest,
    Token,
    UserProfileUpdate,
    UserRead,
)
from app.services import find_therapist_conflict, list_appointments_in_range, serialize_appointment

router = APIRouter()


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais invalidas")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inativo")
    return Token(access_token=create_access_token(user.email))


@router.get("/auth/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/auth/me", response_model=UserRead)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    user = db.get(User, current_user.id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario nao encontrado")
    user.full_name = payload.full_name.strip()
    user.calendar_color = payload.calendar_color
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    user = db.get(User, current_user.id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario nao encontrado")
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta")
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()


@router.get("/therapists", response_model=list[UserRead])
def list_therapists(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[User]:
    return list(db.scalars(select(User).where(User.is_active.is_(True)).order_by(User.full_name)).all())


@router.get("/clients", response_model=list[ClientRead])
def get_clients(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Client]:
    return list(db.scalars(select(Client).order_by(Client.full_name)).all())


@router.post("/clients", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Client:
    client = Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/clients/{client_id}", response_model=ClientRead)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Client:
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    return client


@router.get("/clients/{client_id}/anamneses", response_model=list[AnamnesisRead])
def list_anamneses(
    client_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Anamnesis]:
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    rows = db.scalars(
        select(Anamnesis).where(Anamnesis.client_id == client_id).order_by(Anamnesis.submitted_at.desc())
    )
    return list(rows)


@router.post("/clients/{client_id}/anamneses", response_model=AnamnesisRead, status_code=status.HTTP_201_CREATED)
def create_anamnesis(
    client_id: int,
    payload: AnamnesisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Anamnesis:
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    record = Anamnesis(client_id=client_id, created_by_user_id=current_user.id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/appointments", response_model=list[AppointmentRead])
def get_appointments(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    from_: datetime | None = Query(default=None, alias="from"),
    to: datetime | None = Query(default=None),
    therapist_id: int | None = Query(default=None),
) -> list[AppointmentRead]:
    return list_appointments_in_range(db, from_, to, therapist_id)


@router.get("/appointments/{appointment_id}", response_model=AppointmentRead)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AppointmentRead:
    appointment = db.scalar(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(joinedload(Appointment.client), joinedload(Appointment.therapist))
    )
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento nao encontrado")
    return serialize_appointment(appointment)


@router.post("/appointments", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AppointmentRead:
    client = db.get(Client, payload.client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    therapist = db.get(User, payload.therapist_id)
    if therapist is None or not therapist.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profissional nao encontrado")

    conflict = find_therapist_conflict(db, payload.therapist_id, payload.starts_at, payload.duration_minutes)
    if conflict is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe agendamento neste horario para esta profissional",
        )

    appt_data = payload.model_dump()
    appt_data["starts_at"] = to_clinic_naive(payload.starts_at)
    appointment = Appointment(**appt_data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    loaded = db.scalar(
        select(Appointment)
        .where(Appointment.id == appointment.id)
        .options(joinedload(Appointment.client), joinedload(Appointment.therapist))
    )
    assert loaded is not None
    return serialize_appointment(loaded)


@router.patch("/appointments/{appointment_id}", response_model=AppointmentRead)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AppointmentRead:
    appointment = db.scalar(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(joinedload(Appointment.client), joinedload(Appointment.therapist))
    )
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento nao encontrado")

    data = payload.model_dump(exclude_unset=True)
    if "client_id" in data and db.get(Client, data["client_id"]) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado")
    if "therapist_id" in data:
        therapist = db.get(User, data["therapist_id"])
        if therapist is None or not therapist.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profissional nao encontrado")

    if "starts_at" in data and data["starts_at"] is not None:
        data["starts_at"] = to_clinic_naive(data["starts_at"])
    for key, value in data.items():
        setattr(appointment, key, value)

    if appointment.status != AppointmentStatus.cancelled:
        conflict = find_therapist_conflict(
            db,
            appointment.therapist_id,
            appointment.starts_at,
            appointment.duration_minutes,
            exclude_appointment_id=appointment.id,
        )
        if conflict is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ja existe agendamento neste horario para esta profissional",
            )

    db.commit()
    db.refresh(appointment)
    return serialize_appointment(appointment)

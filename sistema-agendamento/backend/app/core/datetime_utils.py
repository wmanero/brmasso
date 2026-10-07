from datetime import datetime
from zoneinfo import ZoneInfo

CLINIC_TZ = ZoneInfo("America/Sao_Paulo")


def to_clinic_naive(value: datetime) -> datetime:
    """Horario de parede da clinica (Brasil), sem fuso no banco."""
    if value.tzinfo is None:
        return value
    return value.astimezone(CLINIC_TZ).replace(tzinfo=None)


def coerce_for_compare(a: datetime, b: datetime) -> tuple[datetime, datetime]:
    return to_clinic_naive(a), to_clinic_naive(b)

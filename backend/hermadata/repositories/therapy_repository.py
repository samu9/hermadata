from datetime import date, timedelta

from pydantic import BaseModel, ConfigDict
from sqlalchemy import or_, select, update
from sqlalchemy.exc import NoResultFound

from hermadata.constants import AnimalEvent, ReminderUnit
from hermadata.database.models import Animal, AnimalLog, Therapy
from hermadata.repositories import SQLBaseRepository


class TherapyReminder(BaseModel):
    therapy_id: int
    animal_id: int
    animal_code: str
    animal_name: str | None
    description: str
    next_due_date: date
    reminder_value: int
    reminder_unit: ReminderUnit


def _next_due_date(start: date, value: int, unit: ReminderUnit) -> date:
    today = date.today()
    if start >= today:
        return start
    current = start
    while current < today:
        if unit == ReminderUnit.day:
            current += timedelta(days=value)
        elif unit == ReminderUnit.week:
            current += timedelta(weeks=value)
        elif unit == ReminderUnit.month:
            month = current.month + value
            year = current.year + (month - 1) // 12
            month = (month - 1) % 12 + 1
            day = min(
                current.day,
                [
                    31,
                    29
                    if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
                    else 28,
                    31,
                    30,
                    31,
                    30,
                    31,
                    31,
                    30,
                    31,
                    30,
                    31,
                ][month - 1],
            )
            current = current.replace(year=year, month=month, day=day)
        elif unit == ReminderUnit.year:
            try:
                current = current.replace(year=current.year + value)
            except ValueError:
                current = current.replace(year=current.year + value, day=28)
    return current


class TherapyCreate(BaseModel):
    start_date: date
    end_date: date | None = None
    description: str
    reminder_value: int | None = None
    reminder_unit: ReminderUnit | None = None
    user_id: int | None = None


class TherapyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    animal_id: int
    start_date: date
    end_date: date | None = None
    description: str
    reminder_value: int | None = None
    reminder_unit: ReminderUnit | None = None
    animal_log_id: int | None = None
    prescription_document_id: int | None = None
    transport_document_id: int | None = None


class SQLTherapyRepository(SQLBaseRepository):
    def create(self, animal_id: int, data: TherapyCreate) -> TherapyRead:
        log = AnimalLog(
            animal_id=animal_id,
            event=AnimalEvent.therapy.value,
            data={"description": data.description},
            user_id=data.user_id,
        )
        self.session.add(log)
        self.session.flush()

        therapy = Therapy(
            animal_id=animal_id,
            start_date=data.start_date,
            end_date=data.end_date,
            description=data.description,
            reminder_value=data.reminder_value,
            reminder_unit=data.reminder_unit,
            animal_log_id=log.id,
        )
        self.session.add(therapy)
        self.session.flush()

        return TherapyRead.model_validate(therapy)

    def attach_document(
        self,
        therapy_id: int,
        animal_id: int,
        doc_type: str,
        document_id: int,
    ) -> TherapyRead:
        therapy = self.session.execute(
            select(Therapy).where(
                Therapy.id == therapy_id, Therapy.animal_id == animal_id
            )
        ).scalar_one_or_none()

        if therapy is None:
            raise NoResultFound(f"Therapy {therapy_id} not found")

        if doc_type == "prescription":
            therapy.prescription_document_id = document_id
        elif doc_type == "transport":
            therapy.transport_document_id = document_id
        else:
            raise ValueError(f"Invalid doc_type: {doc_type}")

        self.session.flush()
        return TherapyRead.model_validate(therapy)

    def end_therapy(self, therapy_id: int, animal_id: int) -> TherapyRead:
        therapy = self.session.execute(
            select(Therapy).where(
                Therapy.id == therapy_id, Therapy.animal_id == animal_id
            )
        ).scalar_one_or_none()

        if therapy is None:
            raise NoResultFound(f"Therapy {therapy_id} not found")

        therapy.end_date = date.today()
        self.session.flush()

        return TherapyRead.model_validate(therapy)

    def get_reminders(
        self, structure_ids: list[int], days: int = 30
    ) -> list[TherapyReminder]:
        rows = self.session.execute(
            select(Therapy, Animal.id, Animal.code, Animal.name)
            .join(Animal, Therapy.animal_id == Animal.id)
            .where(
                or_(Therapy.end_date.is_(None), Therapy.end_date >= date.today()),
                Therapy.reminder_value.is_not(None),
                Therapy.reminder_unit.is_not(None),
                Animal.deleted_at.is_(None),
                Animal.structure_id.in_(structure_ids),
            )
        ).all()

        cutoff = date.today() + timedelta(days=days)
        results: list[TherapyReminder] = []

        for therapy, animal_id, animal_code, animal_name in rows:
            next_due = _next_due_date(
                therapy.start_date,
                therapy.reminder_value,
                ReminderUnit(therapy.reminder_unit),
            )
            if next_due <= cutoff:
                results.append(
                    TherapyReminder(
                        therapy_id=therapy.id,
                        animal_id=animal_id,
                        animal_code=animal_code,
                        animal_name=animal_name,
                        description=therapy.description,
                        next_due_date=next_due,
                        reminder_value=therapy.reminder_value,
                        reminder_unit=ReminderUnit(therapy.reminder_unit),
                    )
                )

        results.sort(key=lambda r: r.next_due_date)
        return results

    def get_by_animal(self, animal_id: int) -> list[TherapyRead]:
        rows = (
            self.session.execute(
                select(Therapy)
                .where(Therapy.animal_id == animal_id)
                .order_by(Therapy.start_date.desc())
            )
            .scalars()
            .all()
        )
        return [TherapyRead.model_validate(r) for r in rows]

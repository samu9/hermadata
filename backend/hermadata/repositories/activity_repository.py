from datetime import date, datetime

from pydantic import BaseModel, ConfigDict
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from hermadata.database.models import AnimalEventType, AnimalLog, User
from hermadata.models import PaginationQuery, PaginationResult
from hermadata.repositories import SQLBaseRepository


class ActivityModel(BaseModel):
    id: int
    animal_id: int
    user_id: int | None
    user_name: str | None = None
    event_description: str | None = None
    data: dict | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityFilterQuery(PaginationQuery):
    user_id: int | None = None
    start_date: date | None = None
    end_date: date | None = None


class SQLActivityRepository(SQLBaseRepository):
    def __call__(self, session: Session):
        self.session = session
        return self

    def get_activities(
        self, query: ActivityFilterQuery
    ) -> PaginationResult[ActivityModel]:
        # Base query joining necessary tables
        base_query = (
            select(
                AnimalLog,
                User.name.label("user_name"),
                User.surname.label("user_surname"),
                AnimalEventType.description.label("event_description"),
            )
            .outerjoin(User, AnimalLog.user_id == User.id)
            .outerjoin(
                AnimalEventType, AnimalLog.event == AnimalEventType.code
            )
        )

        filter_conditions = []
        if query.user_id:
            filter_conditions.append(AnimalLog.user_id == query.user_id)
        if query.start_date:
            filter_conditions.append(AnimalLog.created_at >= query.start_date)
        if query.end_date:
            # Compare date part only
            filter_conditions.append(
                func.date(AnimalLog.created_at) <= query.end_date
            )

        if filter_conditions:
            base_query = base_query.where(*filter_conditions)

        # Count total
        count_query = (
            select(func.count())
            .select_from(AnimalLog)
            .where(*filter_conditions)
        )
        total = self.session.execute(count_query).scalar_one()

        # Pagination
        if query.from_index is not None and query.to_index is not None:
            limit = query.to_index - query.from_index + 1
            base_query = base_query.offset(query.from_index).limit(limit)

        # Ordering
        base_query = base_query.order_by(desc(AnimalLog.created_at))

        result = self.session.execute(base_query).all()

        items = []
        for row in result:
            log: AnimalLog = row[0]
            user_name = row.user_name
            user_surname = row.user_surname
            event_desc = row.event_description

            full_name = (
                f"{user_name} {user_surname}"
                if user_name and user_surname
                else user_name or user_surname or "Unknown"
            )

            items.append(
                ActivityModel(
                    id=log.id,
                    animal_id=log.animal_id,
                    user_id=log.user_id,
                    user_name=full_name,
                    event_description=event_desc or log.event,
                    data=log.data,
                    created_at=log.created_at,
                )
            )

        return PaginationResult(items=items, total=total)

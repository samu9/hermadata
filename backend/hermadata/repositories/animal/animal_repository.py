from datetime import date, datetime, timedelta
import json
import logging
from hermadata.constants import AnimalEvent
from hermadata.models import PaginationResult
from hermadata.repositories import BaseRepository
from sqlalchemy import and_, func, insert, select, update
from sqlalchemy.orm import Session

from hermadata.database.models import (
    Adopter,
    Adoption,
    Animal,
    AnimalDocument,
    AnimalEntry,
    AnimalLog,
    Comune,
)
from hermadata.repositories.animal.models import (
    AnimalDocumentModel,
    AnimalExit,
    AnimalModel,
    AnimalQueryModel,
    AnimalSearchModel,
    AnimalSearchResult,
    AnimalSearchResultQuery,
    CompleteEntryModel,
    NewAnimalDocument,
    NewAnimalModel,
    NewEntryModel,
    UpdateAnimalModel,
)

logger = logging.getLogger(__name__)


class AnimalRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__()


class SQLAnimalRepository(AnimalRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def save(self, model: AnimalModel):
        result = self.session.execute(
            insert(Animal).values(
                code=model.code,
                race_id=model.race_id,
            )
        )
        self.session.commit()
        return result

    def new_animal(self, data: NewAnimalModel) -> str:

        code = self.generate_code(
            race_id=data.race_id,
            rescue_city_code=data.rescue_city_code,
            rescue_date=datetime.now().date(),
        )

        animal = Animal(
            code=code,
            race_id=data.race_id,
        )
        animal_entry = AnimalEntry(
            animal=animal,
            entry_type=data.entry_type,
            origin_city_code=data.rescue_city_code,
        )
        self.session.add(animal)
        self.session.add(animal_entry)
        self.session.commit()
        return code

    def add_entry(self, animal_id: int, data: NewEntryModel) -> int:
        self.session.execute(
            select(Animal.id).where(Animal.id == animal_id)
        ).one()

        is_present = self.session.execute(
            select(AnimalEntry.id).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
                AnimalEntry.exit_date.is_(None),
            )
        ).scalar()

        if is_present:
            raise Exception(
                f"animal id {animal_id} has already an active entry"
            )
        self.session.execute(
            update(AnimalEntry)
            .where(AnimalEntry.animal_id, AnimalEntry.current.is_(True))
            .values(current=False)
        )
        new_entry = AnimalEntry(
            animal_id=animal_id,
            entry_type=data.entry_type,
            origin_city_code=data.rescue_city_code,
        )

        self.session.add(new_entry)
        self.session.commit()

        return new_entry.id

    def check_complete_entry_needed(self, animal_id: int) -> bool:
        check = self.session.execute(
            select(AnimalEntry.id).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
                AnimalEntry.entry_date.is_(None),
            )
        )

        return check is not None

    def get(self, query: AnimalQueryModel, columns=[]) -> AnimalModel:
        where = []
        if query.id is not None:
            where.append(Animal.id == query.id)
        if query.code is not None:
            where.append(Animal.code == query.code)
        if query.rescue_date is not None:
            where.append(Animal.rescue_date == query.rescue_date)

        if query.rescue_city_code is not None:
            where.append(Animal.rescue_city_code == query.rescue_city_code)

        result = self.session.execute(select(Animal).where(*where)).scalar_one()

        data = AnimalModel.model_validate(result, from_attributes=True)
        return data

    def get_adoption(self, animal_id: int):
        result = self.session.execute(
            select()
            .select_from(Adoption)
            .join(Adopter, Adopter.id == Adoption.adopter_id)
            .where(Adoption.animal_id == animal_id)
        ).first()

        if not result:
            return None

    def search(
        self, query: AnimalSearchModel
    ) -> PaginationResult[AnimalSearchResult]:
        """
        Return the minimum data set of a list of animals which match the search query.
        """

        where = query.as_where_clause()

        total = self.session.execute(
            select(func.count("*")).select_from(Animal).where(*where)
        ).scalar_one()
        stmt = (
            select(
                Animal.id,
                Animal.code,
                Animal.name,
                Animal.chip_code,
                Animal.race_id,
                AnimalEntry.entry_date,
                AnimalEntry.origin_city_code,
                Comune.name,
                Comune.provincia,
                AnimalEntry.entry_type,
                AnimalEntry.exit_date,
                AnimalEntry.exit_type,
            )
            .select_from(Animal)
            .join(Adoption, Adoption.animal_id == Animal.id, isouter=True)
            .join(
                AnimalEntry,
                and_(
                    Animal.id == AnimalEntry.animal_id,
                    AnimalEntry.current.is_(True),
                ),
            )
            .join(Comune, Comune.id == AnimalEntry.origin_city_code)
            .where(*where)
            .order_by(query.as_order_by_clause())
        )
        if query.from_index is not None:
            stmt = stmt.offset(query.from_index)
        if query.to_index is not None:
            stmt = stmt.limit(query.to_index - query.from_index or 0)

        result = self.session.execute(stmt).all()

        response = [
            AnimalSearchResult.model_validate(
                AnimalSearchResultQuery(*r), from_attributes=True
            )
            for r in result
        ]

        return PaginationResult(items=response, total=total)

    def generate_code(
        self, race_id: str, rescue_city_code: str, rescue_date: date = None
    ):
        rescue_date = rescue_date or datetime.now().date()
        current_animals = self.session.execute(
            select(func.count("*"))
            .select_from(Animal)
            .join(
                AnimalEntry,
                Animal.id == AnimalEntry.animal_id,
                isouter=True,
            )
            .where(
                Animal.race_id == race_id,
                AnimalEntry.origin_city_code == rescue_city_code,
                AnimalEntry.created_at.between(
                    rescue_date, rescue_date + timedelta(1)
                ),
            )
        ).scalar_one()

        code = (
            race_id
            + rescue_city_code
            + rescue_date.strftime("%y%m%d")
            + str(current_animals).zfill(2)
        )

        return code

    def complete_entry(self, animal_id: str, data: CompleteEntryModel):
        self.session.execute(
            update(AnimalEntry)
            .where(AnimalEntry.animal_id == animal_id)
            .values(entry_date=data.entry_date)
        )
        self.session.commit()

    def update(self, id: str, updates: UpdateAnimalModel):
        values = updates.model_dump(exclude_none=True)
        if updates.chip_code:
            is_set = self.session.execute(
                select(Animal.chip_code_set).where(Animal.id == id)
            ).scalar_one()

            if is_set:
                logger.info("chip code already set for animal id %s", id)
                updates.chip_code = None
            values["chip_code_set"] = True

        result = self.session.execute(
            update(Animal).where(Animal.id == id).values(**values)
        )

        self.session.commit()

        return result.rowcount

    def new_document(self, animal_id: int, data: NewAnimalDocument):
        animal_document = AnimalDocument(
            animal_id=animal_id,
            document_id=data.document_id,
            document_kind_id=data.document_kind_id,
        )
        self.session.add(animal_document)
        self.session.flush()

        result = AnimalDocumentModel.model_validate(
            animal_document, from_attributes=True
        )

        self.session.commit()

        return result

    def get_documents(self, animal_id: int):
        result = self.session.execute(
            select(
                AnimalDocument.document_id,
                AnimalDocument.document_kind_id,
                AnimalDocument.created_at,
            ).where(AnimalDocument.animal_id == animal_id)
        ).all()

        docs = [
            AnimalDocumentModel(
                animal_id=animal_id,
                document_id=document_id,
                document_kind_id=document_kind_id,
                created_at=created_at,
            )
            for document_id, document_kind_id, created_at in result
        ]

        return docs

    def exit(self, animal_id: int, data: AnimalExit):
        check = self.session.execute(
            select(AnimalEntry.entry_date, AnimalEntry.exit_date).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
        ).first()
        if not check:
            raise Exception(f"animal {animal_id} is not present")

        entry_date, exit_date = check
        if not entry_date:
            raise Exception(f"animal {animal_id} did not complete the entry")
        if exit_date:
            raise Exception(f"animal {animal_id} already is exit!")

        animal_log = AnimalLog(
            animal_id=animal_id,
            data=json.loads(data.model_dump_json()),
            event=AnimalEvent.exit_.value,
            # user_id=user_id #TODO: add user
        )
        self.session.add(animal_log)
        self.session.execute(
            update(AnimalEntry)
            .where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
            .values(
                exit_date=data.exit_date,
                exit_type=data.exit_type,
            )
        )
        self.session.commit()

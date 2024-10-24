import json
import logging
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import and_, func, insert, or_, select, update
from sqlalchemy.exc import IntegrityError
from hermadata.constants import AnimalEvent, ExitType
from hermadata.database.models import (
    Adopter,
    Adoption,
    Animal,
    AnimalDocument,
    AnimalEntry,
    AnimalLog,
    Comune,
    DocumentKind,
    MedicalRecord,
    Race,
)
from hermadata.models import PaginationResult
from hermadata.repositories import SQLBaseRepository

from hermadata.repositories.animal.models import (
    AddMedicalRecordModel,
    AdoptionModel,
    AnimalDaysItem,
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalDocumentModel,
    AnimalEntriesItem,
    AnimalEntriesResult,
    AnimalEntryModel,
    AnimalExit,
    AnimalGetQuery,
    AnimalModel,
    AnimalQueryModel,
    AnimalSearchModel,
    AnimalSearchResult,
    AnimalSearchResultQuery,
    CompleteEntryModel,
    NewAdoption,
    NewAnimalDocument,
    NewAnimalModel,
    NewEntryModel,
    UpdateAnimalModel,
)

logger = logging.getLogger(__name__)


class EntryNotCompleteException(Exception):
    pass


class AnimalNotPresentException(Exception):
    pass


class ExistingChipCodeException(Exception):
    def __init__(self, *args: object, animal_id: int) -> None:
        self.animal_id = animal_id
        super().__init__(*args)


class ExitNotValidException(Exception):
    pass


class ExistingAdoptionException(Exception):
    pass


class SQLAnimalRepository(SQLBaseRepository):

    def save(self, model: AnimalModel):
        result = self.session.execute(
            insert(Animal).values(
                code=model.code,
                race_id=model.race_id,
            )
        )
        self.session.flush()
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
        event_log = AnimalLog(
            animal=animal,
            event=AnimalEvent.create.value,
            data=data.model_dump(),
        )
        self.session.add(animal)
        self.session.add(animal_entry)
        self.session.add(event_log)
        self.session.flush()
        return code

    def add_entry(self, animal_id: int, data: NewEntryModel) -> int:
        self.session.execute(
            select(Animal.id).where(Animal.id == animal_id)
        ).one()

        last_entry_id, exit_date = self.session.execute(
            select(AnimalEntry.id, AnimalEntry.exit_date).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
        ).first()

        if not exit_date:
            raise Exception(
                f"animal id {animal_id} has already an active entry"
            )

        adoptions_update = self.session.execute(
            update(Adoption)
            .where(
                Adoption.animal_id == animal_id,
                Adoption.animal_entry_id == last_entry_id,
                Adoption.returned_at.is_(None),
            )
            .values(returned_at=datetime.now().date())
        )
        if adoptions_update.rowcount == 1:
            logger.info("adoption closed by new entry for animal %s", animal_id)
        self.session.execute(
            update(AnimalEntry)
            .where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
            .values(current=False)
        )

        new_entry = AnimalEntry(
            animal_id=animal_id,
            entry_type=data.entry_type,
            origin_city_code=data.rescue_city_code,
        )

        self.session.add(new_entry)
        new_entry_id = new_entry.id
        event_log = AnimalLog(
            animal_id=animal_id,
            event=AnimalEvent.new_entry.value,
            data=data.model_dump(),
        )
        self.session.add(event_log)
        self.session.flush()

        return new_entry_id

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

        result = self.session.execute(
            select(
                Animal.code,
                Animal.race_id,
                AnimalEntry.origin_city_code,
                Animal.breed_id,
                Animal.chip_code,
                Animal.chip_code_set,
                Animal.name,
                Animal.birth_date,
                AnimalEntry.entry_date,
                AnimalEntry.entry_type,
                Animal.sex,
                Animal.sterilized,
                Animal.notes,
                Animal.img_path,
                Animal.fur,
                Animal.size,
                AnimalEntry.exit_date,
                AnimalEntry.exit_type,
            )
            .where(*where)
            .join(
                AnimalEntry,
                and_(
                    Animal.id == AnimalEntry.animal_id,
                    AnimalEntry.current.is_(True),
                ),
            )
        ).one()

        data = AnimalModel.model_validate(
            AnimalGetQuery(*result), from_attributes=True
        )
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
            select(func.count("*"))
            .select_from(Animal)
            .join(
                AnimalEntry,
                and_(
                    Animal.id == AnimalEntry.animal_id,
                    AnimalEntry.current.is_(True),
                ),
            )
            .where(*where)
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

    def complete_entry(self, animal_id: str, data: CompleteEntryModel) -> int:
        entry_id = self.session.execute(
            select(AnimalEntry.id).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.entry_date.is_(None),
            )
        ).scalar()

        if entry_id is None:
            raise Exception(
                f"complete entry: no entries to complete for animal {animal_id}"
            )
        self.session.execute(
            update(AnimalEntry)
            .where(AnimalEntry.id == entry_id)
            .values(entry_date=data.entry_date)
        )
        event_log = AnimalLog(
            animal_id=animal_id,
            event=AnimalEvent.entry_complete.value,
            data=json.loads(data.model_dump_json()),
        )
        self.session.add(event_log)
        self.session.flush()

        return entry_id

    def get_animal_entry(self, entry_id: int) -> AnimalEntryModel:
        (
            animal_entry,
            animal_name,
            animal_race_id,
            animal_race,
            origin_city_name,
        ) = self.session.execute(
            select(
                AnimalEntry, Animal.name, Animal.race_id, Race.name, Comune.name
            )
            .select_from(AnimalEntry)
            .join(Animal, AnimalEntry.animal_id == Animal.id)
            .join(Race, Animal.race_id == Race.id)
            .join(Comune, Comune.id == AnimalEntry.origin_city_code)
            .where(AnimalEntry.id == entry_id)
        ).one()
        animal_entry: AnimalEntry
        result = AnimalEntryModel(
            animal_id=animal_entry.animal_id,
            animal_name=animal_name,
            entry_date=animal_entry.entry_date,
            exit_date=animal_entry.exit_date,
            entry_type=animal_entry.entry_type,
            exit_type=animal_entry.exit_type,
            origin_city_code=animal_entry.origin_city_code,
            origin_city_name=origin_city_name,
            animal_race=animal_race,
            animal_race_id=animal_race_id,
        )

        return result

    def update(self, id: str, updates: UpdateAnimalModel) -> int:
        """Return updated rowcound"""
        values = updates.model_dump(exclude_none=True)
        if updates.chip_code:
            is_set = self.session.execute(
                select(Animal.chip_code_set).where(Animal.id == id)
            ).scalar_one()

            if is_set:
                logger.info("chip code already set for animal id %s", id)
                updates.chip_code = None
            values["chip_code_set"] = True

        try:
            result = self.session.execute(
                update(Animal).where(Animal.id == id).values(**values)
            )
        except IntegrityError as e:
            if updates.chip_code and "chip_code" in e.orig.args[1]:
                other_animal_id = self.session.execute(
                    select(Animal.id).where(
                        Animal.chip_code == updates.chip_code
                    )
                ).scalar_one()
                raise ExistingChipCodeException(animal_id=other_animal_id)
            self.session.rollback()
            raise e
        event_log = AnimalLog(
            animal_id=id,
            event=AnimalEvent.data_update.value,
            data=json.loads(updates.model_dump_json()),
        )
        self.session.add(event_log)
        self.session.flush()
        return result.rowcount

    def new_document(self, animal_id: int, data: NewAnimalDocument):
        document_kind_id = self.session.execute(
            select(DocumentKind.id).where(
                DocumentKind.code == data.document_kind_code.value
            )
        ).scalar_one()
        animal_document = AnimalDocument(
            animal_id=animal_id,
            document_id=data.document_id,
            document_kind_id=document_kind_id,
            title=data.title,
        )
        self.session.add(animal_document)
        self.session.flush()

        result = AnimalDocumentModel(
            animal_id=animal_id,
            document_id=data.document_id,
            document_kind_code=data.document_kind_code.value,
            created_at=animal_document.created_at,
        )

        self.session.flush()

        return result

    def get_documents(self, animal_id: int):
        result = self.session.execute(
            select(
                AnimalDocument.document_id,
                DocumentKind.code,
                AnimalDocument.created_at,
            )
            .join(
                DocumentKind, DocumentKind.id == AnimalDocument.document_kind_id
            )
            .where(AnimalDocument.animal_id == animal_id)
        ).all()

        docs = [
            AnimalDocumentModel(
                animal_id=animal_id,
                document_id=document_id,
                document_kind_code=document_kind_code,
                created_at=created_at,
            )
            for document_id, document_kind_code, created_at in result
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
            raise AnimalNotPresentException()

        entry_date, exit_date = check
        if not entry_date:
            raise EntryNotCompleteException()
        if exit_date:
            raise Exception(f"animal {animal_id} already is exit!")

        if data.exit_date < entry_date:
            raise ExitNotValidException()

        if data.exit_type == ExitType.adoption:
            adoption_data = NewAdoption(
                animal_id=animal_id, adopter_id=data.adopter_id
            )
            self.new_adoption(adoption_data)

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
        self.session.flush()

    def new_adoption(self, data: NewAdoption) -> AdoptionModel:

        existing_adoption = self.session.execute(
            select(Adoption.id).where(
                Adoption.animal_id == data.animal_id,
                Adoption.returned_at.is_(None),
            )
        ).first()

        if existing_adoption:
            raise ExistingAdoptionException

        current_entry_id = self.session.execute(
            select(AnimalEntry.id).where(
                AnimalEntry.animal_id == data.animal_id,
                AnimalEntry.current.is_(True),
                AnimalEntry.exit_date.is_(None),
            )
        ).scalar()

        if not current_entry_id:
            raise Exception(
                f"animal {data.animal_id} has no current entry with null exit date"
            )

        adoption = Adoption(
            animal_id=data.animal_id,
            adopter_id=data.adopter_id,
            animal_entry_id=current_entry_id,
            completed_at=(
                datetime.now(tz=timezone.utc) if data.completed else None
            ),
        )
        self.session.add(adoption)
        self.session.flush()
        result = AdoptionModel.model_validate(adoption, from_attributes=True)

        return result

    def count_animal_days(self, query: AnimalDaysQuery) -> AnimalDaysResult:
        entries = self.session.execute(
            select(
                Animal.id,
                Animal.name,
                Animal.chip_code,
                AnimalEntry.entry_date,
                AnimalEntry.exit_date,
            )
            .where(
                AnimalEntry.entry_date.is_not(None),
                AnimalEntry.entry_date <= query.to_date,
                or_(
                    AnimalEntry.exit_date.is_(None),
                    AnimalEntry.exit_date > query.from_date,
                ),
                AnimalEntry.origin_city_code == query.city_code,
            )
            .join(Animal, Animal.id == AnimalEntry.animal_id)
        ).all()

        result_map: dict[int, AnimalDaysItem] = {}

        for (
            animal_id,
            animal_name,
            animal_chip_code,
            animal_entry_date,
            animal_exit_date,
        ) in entries:
            result_map.setdefault(
                animal_id,
                AnimalDaysItem(
                    animal_name=animal_name,
                    animal_chip_code=animal_chip_code,
                    animal_days=0,
                ),
            )

            # we start from the next day after the entry
            entry = max(animal_entry_date + timedelta(days=1), query.from_date)

            exit = (
                animal_exit_date
                and min(animal_exit_date, query.to_date)
                or query.to_date
            ) + timedelta(days=1)

            delta: timedelta = exit - entry

            result_map[animal_id].animal_days += delta.days

        result = AnimalDaysResult(
            total_days=sum(r.animal_days for r in result_map.values()),
            items=list(result_map.values()),
        )

        return result

    def count_animal_entries(
        self, query: AnimalEntriesItem
    ) -> AnimalEntriesResult:
        stmt = (
            select(
                Animal.id,
                Animal.name,
                Animal.chip_code,
                AnimalEntry.entry_date,
                Comune.name,
            )
            .where(
                AnimalEntry.entry_date.is_not(None),
                AnimalEntry.entry_date <= query.to_date,
                AnimalEntry.entry_date >= query.from_date,
            )
            .join(Animal, Animal.id == AnimalEntry.animal_id)
            .join(Comune, AnimalEntry.origin_city_code == Comune.id)
        )

        entries = self.session.execute(stmt).all()

        if query.entry_type:
            stmt = stmt.where(AnimalEntry.entry_type == query.city_code)

        result = AnimalEntriesResult(
            items=[
                AnimalEntriesItem(
                    animal_chip_code=animal_chip_code,
                    animal_name=animal_name,
                    entry_date=animal_entry_date,
                    entry_city=entry_city,
                )
                for animal_id, animal_name, animal_chip_code, animal_entry_date, entry_city in entries
            ],
            total=len(entries),
        )
        return result

    def add_medical_record(self, animal_id, data: AddMedicalRecordModel):
        medical_record = MedicalRecord(animal_id=animal_id, **data.model_dump())
        result = self.session.add(medical_record)

        self.session.flush()

        return result

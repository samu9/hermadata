import json
import logging
from datetime import date, datetime, timedelta, timezone

from pydantic import validate_call
from sqlalchemy import (
    and_,
    func,
    insert,
    or_,
    select,
    text,
    update,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import aliased

from hermadata.constants import AnimalEvent, ExitType
from hermadata.database.models import (
    Adopter,
    Adoption,
    Animal,
    AnimalDocument,
    AnimalEntry,
    AnimalLog,
    Breed,
    Comune,
    DocumentKind,
    FurColor,
    MedicalActivity,
    MedicalActivityRecord,
    Race,
    VetServiceRecord,
)
from hermadata.errors import APIException
from hermadata.models import PaginationResult, UtilElement
from hermadata.reports.report_generator import (
    AdopterVariables,
    AnimalVariables,
    ReportAdoptionVariables,
    ReportVariationVariables,
)
from hermadata.repositories import SQLBaseRepository
from hermadata.repositories.animal.models import (
    AddMedicalRecordModel,
    AdoptionModel,
    AnimalDaysItem,
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalDocumentModel,
    AnimalEntriesItem,
    AnimalEntriesQuery,
    AnimalEntryModel,
    AnimalExit,
    AnimalExitsItem,
    AnimalExitsQuery,
    AnimalModel,
    AnimalQueryModel,
    AnimalReportResult,
    AnimalSearchModel,
    AnimalSearchResult,
    AnimalSearchResultQuery,
    CompleteEntryModel,
    FurColorName,
    MedicalActivityModel,
    NewAdoption,
    NewAnimalDocument,
    NewAnimalModel,
    NewEntryModel,
    UpdateAnimalModel,
)

logger = logging.getLogger(__name__)

ADOPTER_EXIT_TYPES: list[ExitType] = [ExitType.adoption, ExitType.custody]

EXIT_REQUIRED_DATA: dict[str, tuple] = {
    "C": [
        Animal.chip_code,
        Animal.fur,
        Animal.color,
        Animal.breed_id,
        Animal.sex,
        Animal.birth_date,
        # Animal.sterilized,
        Animal.size,
    ],
    "G": [
        Animal.fur,
        Animal.color,
        Animal.breed_id,
        Animal.sex,
        Animal.birth_date,
        # Animal.sterilized,
        Animal.size,
    ],
}


class EntryNotCompleteException(APIException):
    pass


class AnimalNotPresentException(APIException):
    pass


class NoRequiredExitDataException(APIException):
    pass


class AnimalWithoutChipCodeException(APIException):
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
    animal_birth_date_to_age = func.TIMESTAMPDIFF(text("year"), Animal.birth_date, func.current_date())

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
        self.session.execute(select(Animal.id).where(Animal.id == animal_id)).one()

        last_entry_id, exit_date = self.session.execute(
            select(AnimalEntry.id, AnimalEntry.exit_date).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
        ).first()

        if not exit_date:
            raise Exception(f"animal id {animal_id} has already an active entry")

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

    def get(self, query: AnimalQueryModel) -> AnimalModel:
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
                AnimalEntry.origin_city_code.label("rescue_city_code"),
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
                Animal.color,
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

        data = AnimalModel.model_validate(dict(zip(result._fields, result, strict=False)))
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

    def search(self, query: AnimalSearchModel) -> PaginationResult[AnimalSearchResult]:
        """
        Return the minimum data set of a list of
        animals which match the search query.
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
            .join(
                Adoption,
                and_(
                    Adoption.animal_id == Animal.id,
                    Adoption.returned_at.is_(None),
                ),
                isouter=True,
            )
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
            AnimalSearchResult.model_validate(AnimalSearchResultQuery(*r), from_attributes=True) for r in result
        ]

        return PaginationResult(items=response, total=total)

    def generate_code(self, race_id: str, rescue_city_code: str, rescue_date: date = None):
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
                AnimalEntry.created_at.between(rescue_date, rescue_date + timedelta(1)),
            )
        ).scalar_one()

        code = race_id + rescue_city_code + rescue_date.strftime("%y%m%d") + str(current_animals).zfill(2)

        return code

    def complete_entry(self, animal_id: str, data: CompleteEntryModel) -> int:
        entry_id = self.session.execute(
            select(AnimalEntry.id).where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.entry_date.is_(None),
            )
        ).scalar()

        if entry_id is None:
            raise Exception(f"complete entry: no entries to complete for animal {animal_id}")
        self.session.execute(update(AnimalEntry).where(AnimalEntry.id == entry_id).values(entry_date=data.entry_date))
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
                AnimalEntry,
                Animal.name,
                Animal.race_id,
                Race.name,
                Comune.name,
            )
            .select_from(AnimalEntry)
            .join(Animal, AnimalEntry.animal_id == Animal.id)
            .join(Race, Animal.race_id == Race.id)
            .join(Comune, Comune.id == AnimalEntry.origin_city_code)
            .where(AnimalEntry.id == entry_id)
        ).one()
        animal_entry: AnimalEntry
        result = AnimalEntryModel(
            id=animal_entry.id,
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
            entry_notes=animal_entry.entry_notes,
            exit_notes=animal_entry.exit_notes,
        )

        return result

    def get_animal_entries(self, animal_id: int) -> list[AnimalEntryModel]:
        entries_data = self.session.execute(
            select(
                AnimalEntry,
                Animal.name,
                Animal.race_id,
                Race.name,
                Comune.name,
            )
            .select_from(AnimalEntry)
            .join(Animal, AnimalEntry.animal_id == Animal.id)
            .join(Race, Animal.race_id == Race.id)
            .join(Comune, Comune.id == AnimalEntry.origin_city_code)
            .where(AnimalEntry.animal_id == animal_id)
            .order_by(AnimalEntry.entry_date.desc())
        ).all()

        results = []
        for (
            animal_entry,
            animal_name,
            animal_race_id,
            animal_race,
            origin_city_name,
        ) in entries_data:
            animal_entry: AnimalEntry
            result = AnimalEntryModel(
                id=animal_entry.id,
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
                entry_notes=animal_entry.entry_notes,
                exit_notes=animal_entry.exit_notes,
            )
            results.append(result)

        return results

    def update(self, id: str, updates: UpdateAnimalModel) -> int:
        """Return updated rowcound"""
        values = updates.model_dump(exclude_none=True)
        if updates.chip_code:
            is_set = self.session.execute(select(Animal.chip_code_set).where(Animal.id == id)).scalar_one()

            if is_set:
                logger.info("chip code already set for animal id %s", id)
                updates.chip_code = None
            values["chip_code_set"] = True

        try:
            result = self.session.execute(update(Animal).where(Animal.id == id).values(**values))
        except IntegrityError as e:
            if updates.chip_code and "chip_code" in e.orig.args[1]:
                other_animal_id = self.session.execute(
                    select(Animal.id).where(Animal.chip_code == updates.chip_code)
                ).scalar_one()
                raise ExistingChipCodeException(animal_id=other_animal_id) from e
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
            select(DocumentKind.id).where(DocumentKind.code == data.document_kind_code)
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
            document_kind_code=data.document_kind_code,
            created_at=animal_document.created_at,
        )

        return result

    def get_documents(self, animal_id: int):
        result = self.session.execute(
            select(
                AnimalDocument.document_id,
                DocumentKind.code,
                AnimalDocument.created_at,
            )
            .join(
                DocumentKind,
                DocumentKind.id == AnimalDocument.document_kind_id,
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
            select(
                Animal.race_id,
                AnimalEntry.entry_date,
                AnimalEntry.exit_date,
            )
            .join(Animal, Animal.id == AnimalEntry.animal_id)
            .join(Race, Race.id == Animal.race_id)
            .where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
        ).first()
        if not check:
            raise AnimalNotPresentException

        race_code, entry_date, exit_date = check
        if not entry_date:
            raise EntryNotCompleteException
        if exit_date:
            raise Exception(f"animal {animal_id} already is exit!")

        required_data = self.session.execute(
            select(*EXIT_REQUIRED_DATA[race_code]).where(
                Animal.id == animal_id,
            )
        ).one()
        if not all(r is not None for r in required_data):
            raise NoRequiredExitDataException

        if data.exit_date < entry_date:
            raise ExitNotValidException()

        if data.exit_type == ExitType.adoption:
            adoption_data = NewAdoption(
                animal_id=animal_id,
                adopter_id=data.adopter_id,
                location_address=data.location_address,
                location_city_code=data.location_city_code,
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
                exit_notes=data.notes,
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
            raise Exception(f"animal {data.animal_id} has no current entry with null exit date")

        adoption = Adoption(
            animal_id=data.animal_id,
            adopter_id=data.adopter_id,
            animal_entry_id=current_entry_id,
            completed_at=datetime.now(tz=timezone.utc),
            location_address=data.location_address,
            location_city_code=data.location_city_code,
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

            exit = (animal_exit_date and min(animal_exit_date, query.to_date) or query.to_date) + timedelta(days=1)

            delta: timedelta = exit - entry

            result_map[animal_id].animal_days += delta.days

        result = AnimalDaysResult(
            total_days=sum(r.animal_days for r in result_map.values()),
            items=list(result_map.values()),
        )

        return result

    def count_animal_entries(self, query: AnimalEntriesQuery) -> AnimalReportResult[AnimalEntriesItem]:
        stmt = (
            select(
                Animal.id,
                Race.name,
                Animal.name,
                Animal.birth_date,
                Animal.sex,
                Animal.chip_code,
                AnimalEntry.entry_date,
                AnimalEntry.entry_type,
                Comune.name,
            )
            .where(
                AnimalEntry.entry_date.is_not(None),
                AnimalEntry.entry_date <= query.to_date,
                AnimalEntry.entry_date >= query.from_date,
            )
            .join(Animal, Animal.id == AnimalEntry.animal_id)
            .join(Race, Race.id == Animal.race_id)
            .join(Comune, AnimalEntry.origin_city_code == Comune.id)
        )
        if query.city_code:
            stmt = stmt.where(AnimalEntry.origin_city_code == query.city_code)

        if query.entry_type:
            stmt = stmt.where(AnimalEntry.entry_type == query.entry_type)

        entries = self.session.execute(stmt).all()

        result = AnimalReportResult[AnimalEntriesItem](
            items=[
                AnimalEntriesItem(
                    animal_race=animal_race,
                    animal_chip_code=animal_chip_code,
                    animal_name=animal_name,
                    animal_sex=animal_sex,
                    animal_birth_date=animal_birth_date,
                    entry_date=animal_entry_date,
                    entry_type=entry_type,
                    entry_city=entry_city,
                )
                for (
                    animal_id,
                    animal_race,
                    animal_name,
                    animal_birth_date,
                    animal_sex,
                    animal_chip_code,
                    animal_entry_date,
                    entry_type,
                    entry_city,
                ) in entries
            ],
            total=len(entries),
        )
        return result

    def count_animal_exits(self, query: AnimalExitsQuery) -> AnimalReportResult[AnimalExitsItem]:
        stmt = (
            select(
                Animal.id,
                Race.name,
                Animal.name,
                Animal.birth_date,
                Animal.sex,
                Animal.chip_code,
                AnimalEntry.exit_date,
                AnimalEntry.exit_type,
            )
            .where(
                AnimalEntry.exit_date.is_not(None),
                AnimalEntry.exit_date <= query.to_date,
                AnimalEntry.exit_date >= query.from_date,
            )
            .join(Animal, Animal.id == AnimalEntry.animal_id)
            .join(Race, Race.id == Animal.race_id)
        )
        if query.city_code:
            stmt = stmt.where(AnimalEntry.origin_city_code == query.city_code)

        if query.exit_type:
            stmt = stmt.where(AnimalEntry.exit_type == query.exit_type)

        exits = self.session.execute(stmt).all()

        result = AnimalReportResult[AnimalExitsItem](
            items=[
                AnimalExitsItem(
                    animal_race=animal_race,
                    animal_chip_code=animal_chip_code,
                    animal_name=animal_name,
                    animal_sex=animal_sex,
                    animal_birth_date=animal_birth_date,
                    exit_date=animal_exit_date,
                    exit_type=exit_type,
                )
                for (
                    animal_id,
                    animal_race,
                    animal_name,
                    animal_birth_date,
                    animal_sex,
                    animal_chip_code,
                    animal_exit_date,
                    exit_type,
                ) in exits
            ],
            total=len(exits),
        )
        return result

    def add_vet_service_record(self, animal_id, data: AddMedicalRecordModel):
        medical_record = VetServiceRecord(animal_id=animal_id, **data.model_dump())
        result = self.session.add(medical_record)

        self.session.flush()

        return result

    def new_medical_activity(self, animal_id, data: MedicalActivityModel):
        return self.add_entity(
            MedicalActivity,
            animal_id=animal_id,
            **data.model_dump(),
        )

    def add_medical_activity_record(self, medical_activity_id: int):
        return self.add_entity(MedicalActivityRecord, medical_activity_id=medical_activity_id)

    def get_pending_medical_activities(self, animal_id: int | None = None):
        last_record = (
            select(
                MedicalActivityRecord.medical_activity_id,
                func.max(MedicalActivityRecord.created_at).label("last_record"),
            )
            .join(
                MedicalActivity,
                MedicalActivity.id == MedicalActivityRecord.medical_activity_id,
            )
            .group_by(
                MedicalActivity.animal_id,
                MedicalActivityRecord.medical_activity_id,
            )
        ).subquery()

        stmt = (
            select(
                MedicalActivity.id,
                MedicalActivity.animal_id,
                last_record.c.last_record,
            )
            .join(
                last_record,
                last_record.c.medical_activity_id == MedicalActivity.id,
                isouter=True,
            )
            .join(Animal, Animal.id == MedicalActivity.animal_id)
            .where(
                or_(
                    and_(
                        MedicalActivity.to_date.is_not(None),
                        MedicalActivity.to_date >= datetime.now().date(),
                    ),
                    MedicalActivity.to_date.is_(None),
                ),
                or_(
                    and_(
                        MedicalActivity.from_date.is_not(None),
                        MedicalActivity.from_date < datetime.now().date(),
                    ),
                    MedicalActivity.from_date.is_(None),
                ),
                or_(
                    last_record.c.medical_activity_id.is_(None),
                    last_record.c.last_record
                    >= func.now()
                    - func.Interval(
                        MedicalActivity.recurrence_type,
                        MedicalActivity.recurrence_value,
                    ),
                ),
            )
        )

        result = self.session.execute(stmt).all()

        return result

    def _get_animal_data_report_variables(self, animal_id: int) -> AnimalVariables:
        data = self.session.execute(
            select(
                Animal.name,
                Animal.chip_code,
                Breed.name.label("breed"),
                Animal.sex,
                self.animal_birth_date_to_age.label("age"),
                Animal.fur.label("fur_type"),
                FurColor.name.label("fur_color"),
                Comune.name.label("origin_city"),
                AnimalEntry.entry_date,
            )
            .select_from(Animal)
            .join(
                AnimalEntry,
                and_(
                    AnimalEntry.animal_id == Animal.id,
                    AnimalEntry.current.is_(True),
                ),
            )
            .join(Comune, AnimalEntry.origin_city_code == Comune.id)
            .join(Breed, Breed.id == Animal.breed_id, isouter=True)
            .join(Race, Race.id == Animal.race_id)
            .join(FurColor, FurColor.id == Animal.color, isouter=True)
            .where(Animal.id == animal_id)
        ).one()

        animal_variables = AnimalVariables.model_validate(dict(zip(data._fields, data, strict=False)))
        return animal_variables

    def _get_adopter_data_report_variables(self, adopter_id: int) -> AdopterVariables:
        comune_residence = aliased(Comune)
        comune_birth = aliased(Comune)

        data = self.session.execute(
            select(
                Adopter.name,
                Adopter.surname,
                Adopter.fiscal_code,
                Adopter.birth_date,
                comune_residence.name.label("residence_city"),
                comune_birth.name.label("birth_city"),
                Adopter.phone,
            )
            .join(
                comune_residence,
                Adopter.residence_city_code == comune_residence.id,
                isouter=True,
            )
            .join(
                comune_birth,
                Adopter.birth_city_code == comune_birth.id,
                isouter=True,
            )
            .where(Adopter.id == adopter_id)
        ).one()
        adopter_variables = AdopterVariables.model_validate(dict(zip(data._fields, data, strict=False)))

        return adopter_variables

    def get_adoption_report_variables(self, animal_id: int):
        adoption_date, exit_type, notes, adopter_id, location_address, location_city, location_province = (
            self.session.execute(
                select(
                    AnimalEntry.exit_date,
                    AnimalEntry.exit_type,
                    AnimalEntry.exit_notes,
                    Adoption.adopter_id,
                    Adoption.location_address,
                    Comune.name,
                    Comune.provincia,
                )
                .select_from(AnimalEntry)
                .join(
                    Adoption,
                    Adoption.animal_entry_id == AnimalEntry.id,
                )
                .join(Comune, Adoption.location_city_code == Comune.id)
                .where(
                    AnimalEntry.animal_id == animal_id,
                    AnimalEntry.current.is_(True),
                )
            ).one()
        )

        if exit_type not in ADOPTER_EXIT_TYPES:
            raise Exception("last exit is not an adoption")

        adopter = self._get_adopter_data_report_variables(adopter_id)
        animal_variables = self._get_animal_data_report_variables(animal_id)

        variables = ReportAdoptionVariables(
            animal=animal_variables,
            exit_date=adoption_date,
            adopter=adopter,
            notes=notes,
            location_address=location_address,
            location_city=location_city,
            location_province=location_province,
        )

        return variables

    def get_variation_report_variables(self, animal_id: int):
        variation_date, variation_type, notes, adopter_id = self.session.execute(
            select(
                AnimalEntry.exit_date,
                AnimalEntry.exit_type,
                AnimalEntry.exit_notes,
                Adoption.adopter_id,
            )
            .select_from(AnimalEntry)
            .join(
                Adoption,
                Adoption.animal_entry_id == AnimalEntry.id,
                isouter=True,
            )
            .where(
                AnimalEntry.animal_id == animal_id,
                AnimalEntry.current.is_(True),
            )
        ).one()

        adopter = variation_type in ADOPTER_EXIT_TYPES and self._get_adopter_data_report_variables(adopter_id) or None

        animal_variables = self._get_animal_data_report_variables(animal_id)

        variables = ReportVariationVariables(
            variation_type=variation_type,
            animal=animal_variables,
            variation_date=variation_date,
            adopter=adopter,
            notes=notes,
        )

        return variables

    def get_fur_colors(self) -> list[UtilElement]:
        data = self.session.execute(select(FurColor.id, FurColor.name.label("label"))).all()

        result = [UtilElement.model_validate(dict(zip(d._fields, d, strict=False))) for d in data]

        return result

    @validate_call
    def add_fur_color(self, name: FurColorName) -> UtilElement:
        try:
            result = self.session.execute(insert(FurColor).values({FurColor.name: name}))
            color_id = result.lastrowid
        except IntegrityError:
            result = self.session.execute(select(FurColor).where(FurColor.name == name)).scalar_one()
            color_id = result.id

        new_color = UtilElement(id=color_id, label=name)
        return new_color

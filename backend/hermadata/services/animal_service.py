from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, ExitType
from hermadata.dependancies import get_db_session
from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportGenerator,
)
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalEntriesQuery,
    AnimalExit,
    AnimalExitsQuery,
    CompleteEntryModel,
    NewAnimalDocument,
    UpdateAnimalModel,
)
from hermadata.repositories.document_repository import (
    NewDocument,
    SQLDocumentRepository,
)
from hermadata.storage.base import StorageInterface


class AnimalService:
    def __init__(
        self,
        animal_repository: SQLAnimalRepository,
        document_repository: SQLDocumentRepository,
        report_generator: ReportGenerator,
        storage: StorageInterface,
    ) -> None:
        self.animal_repository = animal_repository
        self.document_repository = document_repository
        self.report_generator = report_generator
        self.storage = storage

        self.document_kind_ids: dict[DocKindCode, int] = {}

    def __call__(self, session: Annotated[Session, Depends(get_db_session)]):
        self.animal_repository(session)
        self.document_repository(session)
        return self

    def _init_document_kind_ids_map(self):
        data = self.document_repository.get_document_kinds()
        for d in data:
            if d.code in DocKindCode:
                self.document_kind_ids[DocKindCode(d.code)] = d.id

    def update(self, animal_id: int, data: UpdateAnimalModel):
        affected = self.animal_repository.update(animal_id, data)

        if not affected:
            raise Exception(f"no animals affected by update, {animal_id=}")

        return affected

    def soft_delete(self, animal_id: int):
        self.animal_repository.soft_delete_animal(animal_id)

    def complete_entry(self, animal_id: int, data: CompleteEntryModel):
        self.animal_repository.complete_entry(animal_id, data)

    def generate_entry_report(self, entry_id: int):
        entry = self.animal_repository.get_animal_entry(entry_id)

        report = self.report_generator.build_animal_entry_report(
            ReportAnimalEntryVariables(
                city=entry.origin_city_name,
                animal_name=entry.animal_name,
                animal_type=entry.animal_race,
                entry_date=entry.entry_date,
            )
        )

        filename = f"ingresso_{entry.animal_name}_"
        f"{entry.entry_date.strftime('%Y-%m-%d')}"

        document_id = self.document_repository.new_document(
            NewDocument(
                filename=filename,
                data=report,
                mimetype="application/pdf",
                is_uploaded=False,
            )
        )

        self.animal_repository.new_document(
            entry.animal_id,
            NewAnimalDocument(
                document_id=document_id,
                document_kind_code=DocKindCode.comunicazione_ingresso,
                title="ingresso",
            ),
        )

    def exit(self, animal_id: int, data: AnimalExit):
        self.animal_repository.exit(animal_id, data)

        if data.exit_type in (ExitType.adoption, ExitType.custody):
            self.generate_adoption_report(animal_id)

        self.generate_variation_report(animal_id)

    def days_report(self, query: AnimalDaysQuery):
        animal_days = self.animal_repository.count_animal_days(query)
        filename, report = (
            self.report_generator.generate_animal_days_count_report(
                query, animal_days
            )
        )
        return filename, report

    def entries_report(self, query: AnimalEntriesQuery):
        entries = self.animal_repository.count_animal_entries(query)

        filename, report = (
            self.report_generator.generate_animal_entries_report(
                query, entries
            )
        )

        return filename, report

    def exits_report(self, query: AnimalExitsQuery):
        entries = self.animal_repository.count_animal_exits(query)

        filename, report = self.report_generator.generate_animal_exits_report(
            query, entries
        )

        return filename, report

    def generate_adoption_report(self, animal_id: int):
        variables = self.animal_repository.get_adoption_report_variables(
            animal_id
        )

        pdf = self.report_generator.build_adoption_report(variables)

        new_document_id = self.document_repository.new_document(
            data=NewDocument(
                storage_service=self.document_repository.selected_storage,
                filename=f"adozione_{variables.animal.chip_code}.pdf",
                data=pdf,
                mimetype="application/pdf",
                is_uploaded=False,
            )
        )

        self.animal_repository.new_document(
            animal_id=animal_id,
            data=NewAnimalDocument(
                document_id=new_document_id,
                document_kind_code=DocKindCode.adozione,
                title=f"Adozione {variables.animal.chip_code}",
            ),
        )

    def generate_variation_report(self, animal_id: int):
        variables = self.animal_repository.get_variation_report_variables(
            animal_id=animal_id
        )

        pdf = self.report_generator.build_variation_report(variables)

        new_document_id = self.document_repository.new_document(
            data=NewDocument(
                storage_service=self.document_repository.selected_storage,
                filename=f"variazione_{variables.animal.chip_code}.pdf",
                data=pdf,
                mimetype="application/pdf",
                is_uploaded=False,
            )
        )

        self.animal_repository.new_document(
            animal_id=animal_id,
            data=NewAnimalDocument(
                document_id=new_document_id,
                document_kind_code=DocKindCode.variazione,
                title="Variazione",
            ),
        )

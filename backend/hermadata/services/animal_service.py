from hermadata.constants import DocKindCode, ExitType
from hermadata.reports.report_generator import (
    ReportAdoptionVariables,
    ReportAnimalEntryVariables,
    ReportGenerator,
)
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalExit,
    CompleteEntryModel,
    NewAnimalDocument,
    UpdateAnimalModel,
)
from hermadata.repositories.document_repository import (
    NewDocument,
    SQLDocumentRepository,
    StorageType,
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

    def complete_entry(self, animal_id: int, data: CompleteEntryModel):
        entry_id = self.animal_repository.complete_entry(animal_id, data)

        entry = self.animal_repository.get_animal_entry(entry_id)

        report = self.report_generator.build_animal_entry_report(
            ReportAnimalEntryVariables(
                city=entry.origin_city_name,
                animal_name=entry.animal_name,
                animal_type=entry.animal_race,
                entry_date=entry.entry_date,
            )
        )

        filename = f"ingresso_{entry.animal_name}_{entry.entry_date.strftime('%Y-%m-%d')}"

        document_id = self.document_repository.new_document(
            NewDocument(
                storage_service=StorageType.disk,
                filename=filename,
                data=report,
                mimetype="application/pdf",
            )
        )

        self.animal_repository.new_document(
            entry.animal_id,
            NewAnimalDocument(
                document_id=document_id,
                document_kind_code=DocKindCode.documento_ingresso,
                title="ingresso",
            ),
        )

    def exit(self, animal_id: int, data: AnimalExit):
        self.animal_repository.exit(animal_id, data)

        report = None
        if data.exit_type == ExitType.adoption:
            # generate adoption document
            # report = self.report_generator.build_adoption_report(
            #     ReportAdoptionVariables()
            # )
            filename = "adozione_"
            doc_kind_code = DocKindCode.adozione

        if data.exit_type == ExitType.custody:
            # generate custody document
            # report = self.report_generator.build_adoption_report(
            #     ReportAdoptionVariables()
            # )
            filename = "affido_"
            doc_kind_code = DocKindCode.affido

        if report:
            filename += animal_id

            document_id = self.document_repository.new_document(
                NewDocument(
                    storage_service=StorageType.disk,
                    filename=filename,
                    data=report,
                    mimetype="application/pdf",
                )
            )

            self.animal_repository.new_document(
                animal_id,
                NewAnimalDocument(
                    document_id=document_id,
                    document_kind_code=doc_kind_code,
                    title=filename,
                ),
            )

    def animal_days_report(self, query: AnimalDaysQuery):
        animal_days = self.animal_repository.count_animal_days(query)
        filename, report = (
            self.report_generator.generate_animal_days_count_report(
                query, animal_days
            )
        )
        return filename, report

from hermadata.constants import DocKindCode
from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportGenerator,
)
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import (
    CompleteEntryModel,
    NewAnimalDocument,
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

    def update(self, animal_id: int):
        pass

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

    def exit(self, animal_id):
        pass

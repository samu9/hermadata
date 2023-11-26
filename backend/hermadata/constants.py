from enum import Enum


class EntryType(Enum):
    rescue = "R"
    surrender = "S"
    confiscation = "C"


ENTRY_TYPE_LABELS = {
    EntryType.rescue: "Recupero",
    EntryType.surrender: "Conferimento",
    EntryType.confiscation: "Sequestro",
}


class AnimalStage(Enum):
    shelter = ("S",)
    hospital = "H"


ANIMAL_STAGE_LABELS = {
    AnimalStage.hospital: "Sanitario",
    AnimalStage.shelter: "Rifugio",
}


class EntryResult(Enum):
    completed = "C"
    failed = "F"
    returned = "R"


ENTRY_RESULT_LABELS = {
    EntryResult.completed: "Completato",
    EntryResult.failed: "Fallito",
    EntryResult.returned: "Restituito",
}

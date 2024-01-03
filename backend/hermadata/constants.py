from enum import Enum, IntEnum


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
    shelter = "S"
    hospital = "H"


class AnimalSize(IntEnum):
    mini = 0
    small = 1
    medium = 2
    big = 3


SIZE_LABELS = {
    AnimalSize.mini: "Mini",
    AnimalSize.small: "Piccolo",
    AnimalSize.medium: "Medio",
    AnimalSize.big: "Grande",
}


class AnimalFur(IntEnum):
    short = 0
    curly_long = 1
    straight_long = 2


FUR_LABELS = {
    AnimalFur.short: "Corto",
    AnimalFur.curly_long: "Lungo riccio",
    AnimalFur.straight_long: "Lungo liscio",
}

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

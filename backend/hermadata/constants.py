from enum import Enum, IntEnum


class EntryType(str, Enum):
    rescue = "R"
    surrender = "S"
    confiscation = "C"


ENTRY_TYPE_LABELS = {
    EntryType.rescue: "Recupero",
    EntryType.surrender: "Conferimento",
    EntryType.confiscation: "Sequestro",
}


class ExitType(str, Enum):
    adoption = "A"
    death = "D"
    return_ = "R"


EXIT_TYPE_LABELS = {
    ExitType.adoption: "Adozione",
    ExitType.death: "Morte",
    ExitType.return_: "Restituzione",
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


class AnimalEvent(Enum):
    exit_ = "EX"

from enum import Enum, IntEnum, auto


class EntryType(str, Enum):
    rescue = "R"
    confiscation = "C"
    private_surrender = "P"
    quitclaim = "Q"
    temporary_owner_surrender = "T"


ENTRY_TYPE_LABELS = {
    EntryType.rescue: "Recupero",
    EntryType.confiscation: "Sequestro",
    EntryType.private_surrender: "Conferimento da privato",
    EntryType.quitclaim: "Rinuncia di proprietà",
    EntryType.temporary_owner_surrender: "Conferimento temporaneo del padrone",
}


class ExitType(str, Enum):
    adoption = "A"
    death = "D"
    return_ = "R"
    disappeared = "I"


EXIT_TYPE_LABELS = {
    ExitType.adoption: "Adozione",
    ExitType.death: "Morte",
    ExitType.return_: "Restituzione",
    ExitType.disappeared: "Scomparsa",
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
    very_short = auto()
    short = auto()
    curly_long = auto()
    straight_long = auto()
    curly = auto()
    semilong = auto()
    long = auto()
    hard = auto()
    frangiato = auto()
    cordato = auto()


FUR_LABELS = {
    AnimalFur.very_short: "Raso",
    AnimalFur.short: "Corto",
    AnimalFur.curly: "Riccio",
    AnimalFur.semilong: "Semilungo",
    AnimalFur.long: "Lungo",
    AnimalFur.hard: "Duro",
    AnimalFur.frangiato: "Frangiato",
    AnimalFur.cordato: "Cordato",
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
    create = "CR"
    exit_ = "EX"
    new_entry = "NE"
    entry_complete = "EC"
    data_update = "DU"


class ApiErrorCode(Enum):
    existing_chip_code = "ECC"


class DocKindCode(Enum):
    documento_ingresso = "IN"
    iscrizione_anagrafie_canina = "IA"
    spostamento_sanitario_rifugio = "SS"
    uscita = "U"
    documento_identita = "ID"
    varie = "V"
    assegnamento_chip = "C"

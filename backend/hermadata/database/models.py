from datetime import date, datetime
from sqlalchemy import (
    JSON,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from hermadata.constants import (
    AnimalFur,
    AnimalSize,
    AnimalStage,
    EntryResult,
    EntryType,
    ExitType,
)


class Base(DeclarativeBase):
    pass


class Animal(Base):
    __tablename__ = "animal"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(13), unique=True)
    race_id: Mapped[str] = mapped_column(ForeignKey("race.id"))
    rescue_city_code: Mapped[str] = mapped_column(String(4))

    entry_type: Mapped[EntryType] = mapped_column(String(1))
    entry_result: Mapped[EntryResult] = mapped_column(String(1), nullable=True)
    entry_date: Mapped[date] = mapped_column(Date(), nullable=True)

    stage: Mapped[AnimalStage] = mapped_column(String(1), nullable=True)

    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    chip_code: Mapped[str] = mapped_column(String(100), nullable=True)
    chip_code_set: Mapped[bool] = mapped_column(
        server_default=text("false"), default=False
    )
    breed_id: Mapped[str | None] = mapped_column(
        ForeignKey("breed.id"), nullable=True
    )
    sex: Mapped[int | None] = mapped_column(nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date(), nullable=True)

    sterilized: Mapped[bool | None] = mapped_column(nullable=True)
    adoptable: Mapped[bool | None] = mapped_column(nullable=True)
    adoptability_index: Mapped[int | None] = mapped_column(nullable=True)
    # behaviour: Mapped[str] = mapped_column(String(100), nullable=True)
    color: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    size: Mapped[AnimalSize | None] = mapped_column(Integer(), nullable=True)
    fur: Mapped[AnimalFur | None] = mapped_column(Integer(), nullable=True)
    # features: Mapped[str] = mapped_column(String(100), nullable=True)
    # medical_treatments: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(), nullable=True
    )

    vet: Mapped["Vet"] = relationship(back_populates="animals")
    vet_id: Mapped[int | None] = mapped_column(
        ForeignKey("vet.id"), nullable=True
    )

    exit_date: Mapped[date] = mapped_column(Date(), nullable=True)
    exit_type: Mapped[ExitType] = mapped_column(String(1), nullable=True)

    notes: Mapped[str] = mapped_column(Text(), nullable=True)
    img_path: Mapped[str] = mapped_column(String(100), nullable=True)

    adoptions: Mapped[list["Adoption"]] = relationship(back_populates="animal")
    logs: Mapped[list["AnimalLog"]] = relationship(back_populates="animal")


class AnimalLog(Base):
    __tablename__ = "animal_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="logs")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))

    event: Mapped[str] = mapped_column(String(10))

    data: Mapped[dict] = mapped_column(JSON, nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )


class Adoption(Base):
    __tablename__ = "adoption"
    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="adoptions")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    adopter_id: Mapped[int] = mapped_column(ForeignKey("adopter.id"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(), nullable=True
    )
    # adoptions can be returned, making the adoption null
    returned_at: Mapped[datetime | None] = mapped_column(
        DateTime(), nullable=True
    )


class Adopter(Base):
    __tablename__ = "adopter"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100))
    fiscal_code: Mapped[str] = mapped_column(String(16))
    birth_city_code: Mapped[str] = mapped_column(String(4))
    birth_date: Mapped[Date] = mapped_column(Date())
    residence_city_code: Mapped[str] = mapped_column(String(4))
    phone: Mapped[str] = mapped_column(String(15))
    document_type: Mapped[str] = mapped_column(String(3), nullable=True)
    document_number: Mapped[str] = mapped_column(String(20), nullable=True)
    document_release_date: Mapped[Date] = mapped_column(Date(), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class Vet(Base):
    __tablename__ = "vet"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100))

    animals: Mapped[list[Animal]] = relationship(back_populates="vet")


class Race(Base):
    __tablename__ = "race"
    id: Mapped[str] = mapped_column(String(1), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class Breed(Base):
    __tablename__ = "breed"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100))
    race_id: Mapped[str] = mapped_column(ForeignKey("race.id"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )

    __table_args__ = (UniqueConstraint("name", "race_id", name="unique_breed"),)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100), nullable=True)
    surname: Mapped[str] = mapped_column(String(100), nullable=True)

    email: Mapped[str] = mapped_column(String(100))

    password: Mapped[str] = mapped_column(String(15))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )
    deleted_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True)


class Procedure(Base):
    __tablename__ = "procedure"
    id: Mapped[int] = mapped_column(primary_key=True)

    kind_id: Mapped[int] = mapped_column(ForeignKey("procedure_kind.id"))
    status: Mapped[int] = mapped_column(server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )
    closed_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True)


class ProcedureKind(Base):
    __tablename__ = "procedure_kind"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class Document(Base):
    """physical document attached to a procedure"""

    __tablename__ = "document"
    id: Mapped[int] = mapped_column(primary_key=True)
    storage_service: Mapped[str] = mapped_column(String(2))
    key: Mapped[str] = mapped_column(String(40))
    storage_service: Mapped[str] = mapped_column(String(2))
    filename: Mapped[str] = mapped_column(String(100))
    mimetype: Mapped[str] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class DocumentKind(Base):
    __tablename__ = "document_kind"
    name: Mapped[str] = mapped_column(String(50), unique=True)
    id: Mapped[int] = mapped_column(primary_key=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class AnimalDocument(Base):
    __tablename__ = "animal_document"
    id: Mapped[int] = mapped_column(primary_key=True)

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    document_id: Mapped[int] = mapped_column(ForeignKey("document.id"))
    document_kind_id = mapped_column(ForeignKey("document_kind.id"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            "animal_id",
            "document_id",
            "document_kind_id",
            name="unique_animal_document",
        ),
    )


class ProcedureDocument(Base):
    __tablename__ = "procedure_document_checklist"
    procedure_id: Mapped[int] = mapped_column(
        ForeignKey("procedure.id"), primary_key=True
    )
    document_id: Mapped[int] = mapped_column(
        ForeignKey("document.id"), primary_key=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class ProcedureDocumentChecklist(Base):
    __tablename__ = "procedure_document"
    procedure_kind_id: Mapped[int] = mapped_column(
        ForeignKey("procedure_kind.id"), primary_key=True
    )
    document_kind_id: Mapped[int] = mapped_column(
        ForeignKey("document_kind.id"), primary_key=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class Terapy(Base):
    __tablename__ = "terapy"
    id: Mapped[int] = mapped_column(primary_key=True)

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    vet_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))

    med_name: Mapped[str] = mapped_column(String(100))

    notes: Mapped[str] = mapped_column(Text())

    from_date: Mapped[datetime] = mapped_column(nullable=True)
    to_date: Mapped[datetime] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class Provincia(Base):
    __tablename__ = "provincia"
    id: Mapped[str] = mapped_column(String(2), primary_key=True)
    name: Mapped[str] = mapped_column(String(50))


class Comune(Base):
    __tablename__ = "comune"
    id: Mapped[str] = mapped_column(String(4), primary_key=True)
    provincia: Mapped[str] = mapped_column(ForeignKey("provincia.id"))
    name: Mapped[str] = mapped_column(String(100))

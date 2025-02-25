from datetime import date, datetime

from sqlalchemy import (
    DECIMAL,
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    true,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import expression, func

from hermadata.constants import (
    AnimalFur,
    AnimalSize,
    AnimalStage,
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

    stage: Mapped[AnimalStage] = mapped_column(String(1), nullable=True)

    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    chip_code: Mapped[str] = mapped_column(String(100), nullable=True, unique=True)
    chip_code_set: Mapped[bool] = mapped_column(server_default=expression.false(), default=False)
    breed_id: Mapped[str | None] = mapped_column(ForeignKey("breed.id"), nullable=True)
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

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)

    notes: Mapped[str] = mapped_column(Text(), nullable=True)
    img_path: Mapped[str] = mapped_column(String(100), nullable=True)

    entries: Mapped[list["AnimalEntry"]] = relationship(back_populates="animal")
    adoptions: Mapped[list["Adoption"]] = relationship(back_populates="animal")
    logs: Mapped[list["AnimalLog"]] = relationship(back_populates="animal")


class AnimalEntry(Base):
    __tablename__ = "animal_entry"

    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="entries")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))

    entry_type: Mapped[EntryType] = mapped_column(String(1))
    entry_date: Mapped[date] = mapped_column(Date(), nullable=True)

    origin_city_code: Mapped[str] = mapped_column(String(4))

    exit_date: Mapped[date] = mapped_column(Date(), nullable=True)
    exit_type: Mapped[ExitType] = mapped_column(String(1), nullable=True)

    entry_notes: Mapped[str] = mapped_column(Text, nullable=True)
    exit_notes: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)

    current: Mapped[bool] = mapped_column(server_default=expression.true())


class FurColor(Base):
    __tablename__ = "fur_color"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class AnimalLog(Base):
    __tablename__ = "animal_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="logs")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))

    event: Mapped[str] = mapped_column(String(10))

    data: Mapped[dict] = mapped_column(JSON, nullable=True)

    # user_id: Mapped[int] = mapped_column(ForeignKey("users.id"),
    #  nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())


class Adoption(Base):
    __tablename__ = "adoption"
    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="adoptions")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    animal_entry_id: Mapped[int] = mapped_column(ForeignKey("animal_entry.id"))

    adopter_id: Mapped[int] = mapped_column(ForeignKey("adopter.id"))

    location_address: Mapped[str] = mapped_column(String(100))
    location_city_code: Mapped[str] = mapped_column(String(4))

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    # adoptions can be returned, making the adoption null
    returned_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)


# class Person(Base):
#     __tablename__ = "person"
#     id: Mapped[int] = mapped_column(primary_key=True)
#     name: Mapped[str] = mapped_column(String(100))
#     surname: Mapped[str] = mapped_column(String(100))
#     fiscal_code: Mapped[str] = mapped_column(String(16))
#     birth_city_code: Mapped[str] = mapped_column(String(4))
#     birth_date: Mapped[Date] = mapped_column(Date())
#     residence_city_code: Mapped[str] = mapped_column(String(4))
#     phone: Mapped[str] = mapped_column(String(15))

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_default=func.now()
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_onupdate=func.now(), nullable=True
#     )


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

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class Vet(Base):
    __tablename__ = "vet"
    id: Mapped[int] = mapped_column(primary_key=True)

    business_name: Mapped[str] = mapped_column(String(100))
    fiscal_code: Mapped[str] = mapped_column(String(100))

    name: Mapped[str] = mapped_column(String(100), nullable=True)
    surname: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class VetServiceRecord(Base):
    __tablename__ = "vet_service_record"
    id: Mapped[int] = mapped_column(primary_key=True)

    causal: Mapped[str] = mapped_column(String(100))

    price: Mapped[int] = mapped_column(DECIMAL(15, 2))

    vet_id: Mapped[int] = mapped_column(ForeignKey("vet.id"))

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))

    performed_at: Mapped[datetime] = mapped_column(Date())

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())


class Race(Base):
    __tablename__ = "race"
    id: Mapped[str] = mapped_column(String(1), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class Breed(Base):
    __tablename__ = "breed"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100))
    race_id: Mapped[str] = mapped_column(ForeignKey("race.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)

    __table_args__ = (UniqueConstraint("name", "race_id", name="unique_breed"),)


# class User(Base):
#     __tablename__ = "users"
#     id: Mapped[int] = mapped_column(primary_key=True)

#     name: Mapped[str] = mapped_column(String(100), nullable=True)
#     surname: Mapped[str] = mapped_column(String(100), nullable=True)

#     email: Mapped[str] = mapped_column(String(100))

#     password: Mapped[str] = mapped_column(String(15))

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_default=func.now()
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_onupdate=func.now(), nullable=True
#     )
#     deleted_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True)


# class Procedure(Base):
#     __tablename__ = "procedure"
#     id: Mapped[int] = mapped_column(primary_key=True)

#     kind_id: Mapped[int] = mapped_column(ForeignKey("procedure_kind.id"))
#     status: Mapped[int] = mapped_column(server_default=text("0"))

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_default=func.now()
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_onupdate=func.now(), nullable=True
#     )
#     closed_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True)


# class ProcedureKind(Base):
#     __tablename__ = "procedure_kind"

#     id: Mapped[int] = mapped_column(primary_key=True)
#     name: Mapped[str] = mapped_column(String(50))

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_default=func.now()
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_onupdate=func.now(), nullable=True
#     )


class Document(Base):
    """physical document attached to a procedure"""

    __tablename__ = "document"
    id: Mapped[int] = mapped_column(primary_key=True)
    storage_service: Mapped[str] = mapped_column(String(2))
    key: Mapped[str] = mapped_column(String(40))
    storage_service: Mapped[str] = mapped_column(String(2))
    filename: Mapped[str] = mapped_column(String(100))
    mimetype: Mapped[str] = mapped_column(String(50))

    is_uploaded: Mapped[str] = mapped_column(Boolean, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class DocumentKind(Base):
    __tablename__ = "document_kind"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(3), unique=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    uploadable: Mapped[bool] = mapped_column(Boolean(), server_default=true(), default=True)
    rendered: Mapped[bool] = mapped_column(Boolean(), server_default=true(), default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class AnimalDocument(Base):
    __tablename__ = "animal_document"
    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(100), nullable=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    document_id: Mapped[int] = mapped_column(ForeignKey("document.id"))
    document_kind_id = mapped_column(ForeignKey("document_kind.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "animal_id",
            "document_id",
            "document_kind_id",
            name="unique_animal_document",
        ),
    )


# class ProcedureDocument(Base):
#     __tablename__ = "procedure_document_checklist"
#     procedure_id: Mapped[int] = mapped_column(
#         ForeignKey("procedure.id"), primary_key=True
#     )
#     document_id: Mapped[int] = mapped_column(
#         ForeignKey("document.id"), primary_key=True
#     )

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_default=func.now()
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_onupdate=func.now(), nullable=True
#     )


# class ProcedureDocumentChecklist(Base):
#     __tablename__ = "procedure_document"
#     procedure_kind_id: Mapped[int] = mapped_column(
#         ForeignKey("procedure_kind.id"), primary_key=True
#     )
#     document_kind_id: Mapped[int] = mapped_column(
#         ForeignKey("document_kind.id"), primary_key=True
#     )

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_default=func.now()
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime(), server_onupdate=func.now(), nullable=True
#     )


class MedicalActivity(Base):
    __tablename__ = "medical_activity"

    id: Mapped[int] = mapped_column(primary_key=True)

    animal_id: Mapped[int] = mapped_column(ForeignKey(Animal.id))

    vet_id: Mapped[int] = mapped_column(ForeignKey(Vet.id), nullable=True)

    name: Mapped[str] = mapped_column(String(100))

    notes: Mapped[str] = mapped_column(Text(), nullable=True)

    from_date: Mapped[date] = mapped_column(nullable=True)

    to_date: Mapped[date] = mapped_column(nullable=True)

    recurrence_type: Mapped[str] = mapped_column(String(10), nullable=True)
    recurrence_value: Mapped[int] = mapped_column(nullable=True)

    scheduled_date: Mapped[date] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(), server_onupdate=func.now(), nullable=True)


class MedicalActivityRecord(Base):
    # TODO: add user id which performed the recurrent medical_activity
    __tablename__ = "medical_activity_record"
    id: Mapped[int] = mapped_column(primary_key=True)

    medical_activity_id: Mapped[int] = mapped_column(ForeignKey(MedicalActivity.id))

    notes: Mapped[str] = mapped_column(Text(), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())


class Provincia(Base):
    __tablename__ = "provincia"
    id: Mapped[str] = mapped_column(String(2), primary_key=True)
    name: Mapped[str] = mapped_column(String(50))


class Comune(Base):
    __tablename__ = "comune"
    id: Mapped[str] = mapped_column(String(4), primary_key=True)
    provincia: Mapped[str] = mapped_column(ForeignKey("provincia.id"))
    name: Mapped[str] = mapped_column(String(100))

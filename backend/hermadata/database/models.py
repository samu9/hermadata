from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Animal(Base):
    __tablename__ = "animal"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(13), unique=True)
    race_id: Mapped[str] = mapped_column(ForeignKey("race.id"))
    rescue_city_code: Mapped[str] = mapped_column(String(4))

    entry_type: Mapped[str] = mapped_column(String(1))
    entry_result: Mapped[str] = mapped_column(String(1))
    entry_date: Mapped[date] = mapped_column(Date(), nullable=True)

    name: Mapped[str] = mapped_column(String(100), nullable=True)
    breed_id: Mapped[str] = mapped_column(ForeignKey("breed.id"), nullable=True)
    sex: Mapped[int] = mapped_column(nullable=True)
    birth_date: Mapped[date] = mapped_column(Date(), nullable=True)

    # check_in_date: Mapped[datetime] = mapped_column(Date(), nullable=True)
    # check_out_date: Mapped[datetime] = mapped_column(Date(), nullable=True)
    # returned_to_owner: Mapped[bool] = mapped_column(
    #     server_default=text("false")
    # )

    sterilized: Mapped[bool] = mapped_column(nullable=True)
    adoptable: Mapped[bool] = mapped_column(nullable=True)
    adoptability_index: Mapped[int] = mapped_column(nullable=True)
    # behaviour: Mapped[str] = mapped_column(String(100), nullable=True)
    color: Mapped[str] = mapped_column(String(100), nullable=True)
    # fur: Mapped[str] = mapped_column(String(100), nullable=True)
    # features: Mapped[str] = mapped_column(String(100), nullable=True)
    # medical_treatments: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )
    deleted_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True)

    vet: Mapped["Vet"] = relationship(back_populates="animals")
    vet_id: Mapped[int] = mapped_column(ForeignKey("vet.id"), nullable=True)

    notes: Mapped[str] = mapped_column(Text(), nullable=True)

    adoptions: Mapped[list["Adoption"]] = relationship(back_populates="animal")


class Adoption(Base):
    __tablename__ = "adoption"
    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="adoptions")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    temporary: Mapped[bool]

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class Adopter(Base):
    __tablename__ = "adopter"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100))
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

    name: Mapped[str] = mapped_column(String(100), unique=True)
    race_id: Mapped[str] = mapped_column(ForeignKey("race.id"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100), nullable=True)
    surname: Mapped[str] = mapped_column(String(100), nullable=True)

    email: Mapped[str] = mapped_column(String(100))

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
    kind_id: Mapped[int] = mapped_column(ForeignKey("document_kind.id"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
    )


class DocumentKind(Base):
    __tablename__ = "document_kind"
    name: Mapped[str] = mapped_column(String(50))
    id: Mapped[int] = mapped_column(primary_key=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(), server_onupdate=func.now(), nullable=True
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

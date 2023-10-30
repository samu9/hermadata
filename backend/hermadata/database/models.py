from datetime import datetime
from sqlalchemy import Date, ForeignKey, String, Text, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Animal(Base):
    __tablename__ = 'animal'
    id: Mapped[int] = mapped_column(primary_key=True)
    race: Mapped[str] = mapped_column(ForeignKey("race.name"))
    breed: Mapped[str] = mapped_column(ForeignKey("breed.name"))

    name: Mapped[str] = mapped_column(String(100))
    sex: Mapped[int] = mapped_column()
    birth_date: Mapped[Date] = mapped_column(nullable=True)

    check_in_date: Mapped[datetime] = mapped_column(nullable=True)
    check_out_date: Mapped[datetime] = mapped_column(nullable=True)
    returned_to_owner: Mapped[bool] = mapped_column(server_default=text("false"))

    origin_city_code: Mapped[str] = mapped_column(String(4))

    sterilized: Mapped[bool] = mapped_column(nullable=True)
    adoptable: Mapped[bool] = mapped_column(nullable=True)
    behaviour: Mapped[str] = mapped_column(String(100))
    color: Mapped[str] = mapped_column(String(100))
    fur: Mapped[str] = mapped_column(String(100))
    features: Mapped[str] = mapped_column(String(100))
    medical_treatments: Mapped[str] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_onupdate=func.now())
    deleted_at: Mapped[datetime] = mapped_column(nullable=True)

    vet: Mapped["Vet"] = relationship(back_populates="animals")
    vet_id: Mapped[int] = mapped_column(ForeignKey("vet.id"))

    notes: Mapped[str] = mapped_column(Text())

    adoptions: Mapped[list["Adoption"]] = relationship(back_populates="animal")


class Adoption(Base):
    __tablename__ = 'adoption'
    id: Mapped[int] = mapped_column(primary_key=True)
    animal: Mapped[Animal] = relationship(back_populates="adoptions")

    animal_id: Mapped[int] = mapped_column(ForeignKey("animal.id"))
    temporary: Mapped[bool]

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_onupdate=func.now())


class Adopter(Base):
    __tablename__ = 'adopter'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100))
    birth_city_code: Mapped[str] = mapped_column(String(4))
    birth_date: Mapped[Date]
    residence_city_code: Mapped[str] = mapped_column(String(4))
    phone: Mapped[str] = mapped_column(String(15))
    document_type: Mapped[str]
    document_number: Mapped[str]
    document_release_date: Mapped[Date]

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_onupdate=func.now())


class Vet(Base):
    __tablename__ = 'vet'
    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100))

    animals: Mapped[list[Animal]] = relationship(back_populates="vet")


class Race(Base):
    __tablename__ = 'race'
    name: Mapped[str] = mapped_column(String(100), primary_key=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_onupdate=func.now())


class Breed(Base):
    __tablename__ = 'race'
    name: Mapped[str] = mapped_column(String(100), primary_key=True)
    race: Mapped[str] = mapped_column(ForeignKey("race.name"))

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_onupdate=func.now())

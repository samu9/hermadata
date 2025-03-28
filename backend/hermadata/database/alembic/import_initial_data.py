import csv
import os

from sqlalchemy import Engine, insert, select, update
from sqlalchemy.orm import sessionmaker

from hermadata.database.models import Comune, DocumentKind, Provincia, Race

INITIAL_DATA_DIR = os.path.join(os.path.dirname(__file__), "initial_data")


def import_comuni_and_province(engine: Engine):
    Session = sessionmaker(engine)
    with Session.begin() as s:
        with open(os.path.join(INITIAL_DATA_DIR, "province.csv"), "r") as fp:
            reader = csv.DictReader(fp, delimiter=";")
            for r in reader:
                check = s.execute(select(Provincia.id).where(Provincia.id == r["sigla_provincia"])).first()
                if check:
                    continue
                s.execute(
                    insert(Provincia).values(
                        id=r["sigla_provincia"],
                        name=r["denominazione_provincia"],
                    )
                )
        s.flush()
        with open(os.path.join(INITIAL_DATA_DIR, "comuni.csv"), "r") as fp:
            reader = csv.DictReader(fp, delimiter=";")
            for r in reader:
                check = s.execute(select(Comune.id).where(Comune.id == r["codice_belfiore"])).first()
                if check:
                    continue
                s.execute(
                    insert(Comune).values(
                        id=r["codice_belfiore"],
                        name=r["denominazione_ita"],
                        provincia=r["sigla_provincia"],
                    )
                )


def import_races(engine: Engine):
    Session = sessionmaker(engine)
    with Session.begin() as s:
        with open(os.path.join(INITIAL_DATA_DIR, "races.csv"), "r") as fp:
            reader = csv.DictReader(fp)
            for _, r in enumerate(reader):
                check = s.execute(select(Race.id).where(Race.id == r["id"])).first()
                if check:
                    continue
                s.execute(
                    insert(Race).values(
                        id=r["id"],
                        name=r["name"],
                    )
                )


def import_doc_kinds(engine: Engine | None = None):
    if not engine:
        from hermadata.dependancies import get_session_maker

        Session = get_session_maker()
    else:
        Session = sessionmaker(engine)
    with Session.begin() as s:
        with open(os.path.join(INITIAL_DATA_DIR, "doc-kinds.csv"), "r") as fp:
            rows = csv.reader(fp)
            for r in rows:
                code, name, uploadable, rendered = r
                uploadable = int(uploadable)
                rendered = int(rendered)
                check = s.execute(select(DocumentKind.id).where(DocumentKind.code == code)).first()
                if check:
                    s.execute(
                        update(DocumentKind)
                        .values(
                            name=name,
                            uploadable=uploadable,
                            rendered=rendered,
                        )
                        .where(DocumentKind.code == code)
                    )
                    continue
                s.execute(
                    insert(DocumentKind).values(
                        code=code,
                        name=name,
                        uploadable=uploadable,
                        rendered=rendered,
                    )
                )

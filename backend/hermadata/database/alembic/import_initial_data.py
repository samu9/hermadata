import csv
import os
from sqlalchemy import Engine, create_engine, insert, select
from sqlalchemy.orm import sessionmaker
from hermadata.settings import Settings
from hermadata.database.models import Comune, Provincia, Race


def import_initial_data(stage: str, engine: Engine):
    Session = sessionmaker(engine)
    initial_data_dir = os.path.join(os.path.dirname(__file__), 'initial_data')
    with Session.begin() as s:
        with open(os.path.join(initial_data_dir, 'province.csv'), 'r') as fp:
            reader = csv.DictReader(fp, delimiter=";")
            for r in reader:
                check = s.execute(
                    select(Provincia.id).where(Provincia.id == r['sigla_provincia'])
                ).first()
                if check:
                    continue
                s.execute(
                    insert(Provincia).values(
                        id=r['sigla_provincia'], name=r['denominazione_provincia']
                    )
                )
        s.flush()
        with open(os.path.join(initial_data_dir, 'comuni.csv'), 'r') as fp:
            reader = csv.DictReader(fp, delimiter=";")
            for i, r in enumerate(reader):
                if i >= 100 and stage == 'dev':
                    break
                check = s.execute(
                    select(Comune.id).where(Comune.id == r['codice_belfiore'])
                ).first()
                if check:
                    continue
                s.execute(
                    insert(Comune).values(
                        id=r['codice_belfiore'],
                        name=r['denominazione_ita'],
                        provincia=r['sigla_provincia'],
                    )
                )
        with open(os.path.join(initial_data_dir, 'races.csv'), 'r') as fp:
            reader = csv.DictReader(fp)
            for i, r in enumerate(reader):
                check = s.execute(select(Race.code).where(Race.code == r['id'])).first()
                if check:
                    continue
                s.execute(
                    insert(Race).values(
                        code=r['id'],
                        name=r['name'],
                    )
                )


if __name__ == '__main__':
    settings = Settings()
    import_initial_data(settings.stage, create_engine(settings.db.url))

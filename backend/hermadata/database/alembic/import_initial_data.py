import csv
import os

from sqlalchemy import Engine, insert, select, update
from sqlalchemy.orm import sessionmaker

from hermadata.database.models import (
    Comune,
    DocumentKind,
    Permission,
    Provincia,
    Race,
    UserRole,
    UserRolePermission,
)

INITIAL_DATA_DIR = os.path.join(os.path.dirname(__file__), "initial_data")


def import_comuni_and_province(engine: Engine):
    Session = sessionmaker(engine)
    with Session.begin() as s:
        with open(os.path.join(INITIAL_DATA_DIR, "province.csv"), "r") as fp:
            reader = csv.DictReader(fp, delimiter=";")
            for r in reader:
                check = s.execute(
                    select(Provincia.id).where(
                        Provincia.id == r["sigla_provincia"]
                    )
                ).first()
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
                check = s.execute(
                    select(Comune.id).where(Comune.id == r["codice_belfiore"])
                ).first()
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
                check = s.execute(
                    select(Race.id).where(Race.id == r["id"])
                ).first()
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
                check = s.execute(
                    select(DocumentKind.id).where(DocumentKind.code == code)
                ).first()
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


def import_roles(engine: Engine | None = None):
    """Import initial user roles from roles.csv"""
    if not engine:
        from hermadata.dependancies import get_session_maker

        Session = get_session_maker()
    else:
        Session = sessionmaker(engine)
    
    with Session.begin() as s:
        with open(os.path.join(INITIAL_DATA_DIR, "roles.csv"), "r") as fp:
            reader = csv.reader(fp)
            for row in reader:
                role_name = row[0].strip()
                
                # Check if role already exists
                check = s.execute(
                    select(UserRole.id).where(UserRole.name == role_name)
                ).first()
                
                if check:
                    continue
                    
                s.execute(
                    insert(UserRole).values(name=role_name)
                )


def import_permissions(engine: Engine | None = None):
    """Import initial permissions from permissions.csv"""
    if not engine:
        from hermadata.dependancies import get_session_maker

        Session = get_session_maker()
    else:
        Session = sessionmaker(engine)
    
    with Session.begin() as s:
        with open(
            os.path.join(INITIAL_DATA_DIR, "permissions.csv"), "r"
        ) as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                code = row["code"].strip()
                description = row["description"].strip()
                
                # Check if permission already exists
                check = s.execute(
                    select(Permission.id).where(Permission.code == code)
                ).first()
                
                if check:
                    # Update description if permission exists
                    s.execute(
                        update(Permission)
                        .values(description=description)
                        .where(Permission.code == code)
                    )
                    continue
                    
                s.execute(
                    insert(Permission).values(
                        code=code,
                        description=description
                    )
                )


def import_role_permissions(engine: Engine | None = None):
    """Import role-permission mappings from role-permissions.csv"""
    if not engine:
        from hermadata.dependancies import get_session_maker

        Session = get_session_maker()
    else:
        Session = sessionmaker(engine)
    
    with Session.begin() as s:
        with open(
            os.path.join(INITIAL_DATA_DIR, "role-permissions.csv"), "r"
        ) as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                role_name = row["role"].strip()
                permission_code = row["permission_code"].strip()
                
                # Get role ID
                role_result = s.execute(
                    select(UserRole.id).where(UserRole.name == role_name)
                ).first()
                
                if not role_result:
                    print(
                        f"Warning: Role '{role_name}' not found, "
                        f"skipping permission mapping"
                    )
                    continue
                
                role_id = role_result[0]
                
                # Check if mapping already exists
                check = s.execute(
                    select(UserRolePermission.id).where(
                        UserRolePermission.role_id == role_id,
                        UserRolePermission.permission_code == permission_code
                    )
                ).first()
                
                if check:
                    continue
                    
                s.execute(
                    insert(UserRolePermission).values(
                        role_id=role_id,
                        permission_code=permission_code
                    )
                )

"""
Render a PDF report from the database.

Usage:
    ENV_PATH=.dev.env python scripts/render_report.py <report_type> <entry_id> [output_path]

Arguments:
    report_type: variation | adoption | animal_entry | chip_assignment | custody
    entry_id:    the animal entry ID to retrieve data for
    output_path: optional output file path (default: <report_type>_<entry_id>.pdf)

Examples:
    ENV_PATH=.dev.env python scripts/render_report.py variation 42
    ENV_PATH=.dev.env python scripts/render_report.py adoption 42 output.pdf
"""

import argparse
import sys
from datetime import date

from sqlalchemy import and_, create_engine, select
from sqlalchemy.orm import sessionmaker

from hermadata.database.models import Animal, AnimalEntry
from hermadata.dependancies import get_jinja_env
from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportChipAssignmentVariables,
    ReportCustodyVariables,
    ReportGenerator,
)
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.settings import settings

REPORT_TYPES = [
    "variation",
    "adoption",
    "animal_entry",
    "chip_assignment",
    "custody",
]


def get_animal_id_from_entry(session, entry_id: int) -> int:
    animal_id = session.execute(
        select(AnimalEntry.animal_id).where(AnimalEntry.id == entry_id)
    ).scalar_one()
    return animal_id


def render_variation(repo, rg, animal_id):
    variables = repo.get_variation_report_variables(animal_id)
    return rg.build_variation_report(variables)


def render_adoption(repo, rg, animal_id):
    variables = repo.get_adoption_report_variables(animal_id)
    return rg.build_adoption_report(variables)


def render_animal_entry(repo, rg, entry_id):
    entry = repo.get_animal_entry(entry_id)
    variables = ReportAnimalEntryVariables(
        city=entry.origin_city_name,
        animal_name=entry.animal_name,
        animal_type=entry.animal_race,
        entry_date=entry.entry_date,
    )
    return rg.build_animal_entry_report(variables)


def render_chip_assignment(session, rg, animal_id):
    row = session.execute(
        select(Animal.name, Animal.chip_code).where(Animal.id == animal_id)
    ).one()
    variables = ReportChipAssignmentVariables(
        animal_name=row.name,
        chip_code=row.chip_code,
        assignment_date=date.today(),
    )
    return rg.build_chip_assignment_report(variables)


def render_custody(session, rg, animal_id):
    row = session.execute(
        select(Animal.name, Animal.chip_code, AnimalEntry.exit_date)
        .join(
            AnimalEntry,
            and_(
                AnimalEntry.animal_id == Animal.id,
                AnimalEntry.current.is_(True),
            ),
        )
        .where(Animal.id == animal_id)
    ).one()
    variables = ReportCustodyVariables(
        animal_name=row.name,
        chip_code=row.chip_code,
        exit_date=row.exit_date,
    )
    return rg.build_custody_report(variables)


def main():
    parser = argparse.ArgumentParser(
        description="Render a PDF report from the database."
    )
    parser.add_argument(
        "report_type",
        choices=REPORT_TYPES,
        help="Type of report to generate",
    )
    parser.add_argument(
        "entry_id",
        type=int,
        help="Animal entry ID to retrieve data for",
    )
    parser.add_argument(
        "output_path",
        nargs="?",
        default=None,
        help="Output file path (default: <report_type>_<entry_id>.pdf)",
    )
    args = parser.parse_args()

    output_path = args.output_path or f"{args.report_type}_{args.entry_id}.pdf"

    engine = create_engine(**settings.db.model_dump())
    Session = sessionmaker(engine)
    session = Session()

    repo = SQLAnimalRepository()
    repo(session)

    rg = ReportGenerator(get_jinja_env())

    try:
        if args.report_type == "animal_entry":
            pdf = render_animal_entry(repo, rg, args.entry_id)
        else:
            animal_id = get_animal_id_from_entry(session, args.entry_id)

            if args.report_type == "variation":
                pdf = render_variation(repo, rg, animal_id)
            elif args.report_type == "adoption":
                pdf = render_adoption(repo, rg, animal_id)
            elif args.report_type == "chip_assignment":
                pdf = render_chip_assignment(session, rg, animal_id)
            elif args.report_type == "custody":
                pdf = render_custody(session, rg, animal_id)
    except Exception as e:
        print(f"Error generating report: {e}", file=sys.stderr)
        session.close()
        sys.exit(1)

    session.close()

    with open(output_path, "wb") as f:
        f.write(pdf)

    print(f"Report saved to {output_path} ({len(pdf)} bytes)")


if __name__ == "__main__":
    main()

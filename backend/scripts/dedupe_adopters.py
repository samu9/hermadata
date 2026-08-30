"""
Detect adopters sharing the same fiscal code, merge their linked data
(adoptions) into a single kept record, then delete the duplicates.

Needed for databases that predate the `uq_adopter_fiscal_code` migration:
that migration fails if duplicate fiscal codes already exist, so this
cleanup must run first on any such database.

For each group of adopters sharing a fiscal code (compared case/whitespace
insensitively), the adopter with the earliest `created_at` (ties broken by
lowest id) is kept as "the original". For every other adopter in the group:
  - any `adoption.adopter_id` pointing at it is repointed to the kept adopter
  - any nullable field left empty on the kept adopter (document_type,
    document_number, document_release_date) is filled in from the duplicate,
    without ever overwriting data the kept adopter already has
  - the duplicate row is deleted

Usage:
    ENV_PATH=.dev.env uv run python scripts/dedupe_adopters.py
    ENV_PATH=.dev.env uv run python scripts/dedupe_adopters.py --apply

The first form is a dry run that only prints a report; pass --apply to
actually merge, move adoptions across, and delete the duplicates.
"""

import argparse
import logging

from sqlalchemy import create_engine, func, select, update
from sqlalchemy.orm import Session, sessionmaker

from hermadata.database.models import Adopter, Adoption
from hermadata.settings import settings

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

FILLABLE_FIELDS = (
    "document_type",
    "document_number",
    "document_release_date",
)


def normalized_fiscal_code():
    return func.upper(func.trim(Adopter.fiscal_code))


def find_duplicate_groups(session: Session) -> dict[str, list[Adopter]]:
    norm = normalized_fiscal_code()
    duplicate_codes = (
        session.execute(
            select(norm).group_by(norm).having(func.count(Adopter.id) > 1)
        )
        .scalars()
        .all()
    )

    groups: dict[str, list[Adopter]] = {}
    for code in duplicate_codes:
        rows = (
            session.execute(
                select(Adopter)
                .where(normalized_fiscal_code() == code)
                .order_by(Adopter.created_at.asc(), Adopter.id.asc())
            )
            .scalars()
            .all()
        )
        groups[code] = rows

    return groups


def merge_group(
    session: Session,
    fiscal_code: str,
    adopters: list[Adopter],
    apply: bool,
) -> None:
    keep, *duplicates = adopters
    logger.info(
        "fiscal_code=%s: keeping adopter #%s (created_at=%s), "
        "merging %s duplicate(s): %s",
        fiscal_code,
        keep.id,
        keep.created_at,
        len(duplicates),
        [d.id for d in duplicates],
    )

    if keep.fiscal_code != fiscal_code:
        logger.info(
            "  normalizing adopter #%s fiscal_code to %r",
            keep.id,
            fiscal_code,
        )
        if apply:
            keep.fiscal_code = fiscal_code

    for dup in duplicates:
        for field in FILLABLE_FIELDS:
            if (
                getattr(keep, field) is None
                and getattr(dup, field) is not None
            ):
                logger.info(
                    "  filling %s on adopter #%s from adopter #%s",
                    field,
                    keep.id,
                    dup.id,
                )
                if apply:
                    setattr(keep, field, getattr(dup, field))

        moved = session.execute(
            select(func.count(Adoption.id)).where(
                Adoption.adopter_id == dup.id
            )
        ).scalar_one()
        if moved:
            logger.info(
                "  moving %s adoption(s) from adopter #%s to #%s",
                moved,
                dup.id,
                keep.id,
            )
            if apply:
                session.execute(
                    update(Adoption)
                    .where(Adoption.adopter_id == dup.id)
                    .values(adopter_id=keep.id)
                )

        logger.info("  deleting duplicate adopter #%s", dup.id)
        if apply:
            session.delete(dup)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Merge adopters sharing the same fiscal code into a single "
            "record, moving their adoptions across, then delete the "
            "duplicates."
        )
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help=(
            "Actually perform the merge/move/delete. Without this flag, "
            "only a dry-run report is printed and nothing is changed."
        ),
    )
    args = parser.parse_args()

    engine = create_engine(**settings.db.model_dump())
    SessionMaker = sessionmaker(engine)
    session = SessionMaker()

    try:
        groups = find_duplicate_groups(session)

        if not groups:
            logger.info("No duplicate fiscal codes found.")
            return

        logger.info("Found %s fiscal code(s) with duplicates.", len(groups))
        for fiscal_code, adopters in groups.items():
            merge_group(session, fiscal_code, adopters, args.apply)

        if args.apply:
            session.commit()
            logger.info("Changes committed.")
        else:
            session.rollback()
            logger.info(
                "Dry run only, no changes were made. "
                "Re-run with --apply to commit."
            )
    finally:
        session.close()


if __name__ == "__main__":
    main()

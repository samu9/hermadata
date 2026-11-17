"""add comune favourite flag

Favourite comuni used to come from the APP__PREFERRED_CITIES setting; they
are now a DB flag managed by the admins. The comuni listed in that setting,
if any, are marked as favourite so the current ordering is kept.

Revision ID: a7b8c9d0e1f2
Revises: f1a2b3c4d5e6
Create Date: 2026-11-17 10:00:00.000000

"""

import json
import os
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from dotenv import dotenv_values

revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SETTING_NAME = "APP__PREFERRED_CITIES"


def _legacy_preferred_cities() -> list[str]:
    """The comune codes of the legacy setting, from the environment or the
    $ENV_PATH file (same sources as `Settings`)."""
    raw = os.environ.get(SETTING_NAME)
    env_path = os.environ.get("ENV_PATH")
    if raw is None and env_path and os.path.exists(env_path):
        values = {k.upper(): v for k, v in dotenv_values(env_path).items()}
        raw = values.get(SETTING_NAME)
    if not raw:
        return []
    try:
        codes = json.loads(raw)
    except ValueError:
        codes = raw.split(",")
    if isinstance(codes, str):
        codes = [codes]
    return [str(c).strip().upper() for c in codes if str(c).strip()]


def upgrade() -> None:
    op.add_column(
        "comune",
        sa.Column(
            "favourite",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )

    codes = _legacy_preferred_cities()
    if codes:
        comune = sa.table(
            "comune", sa.column("id", sa.String), sa.column("favourite")
        )
        op.execute(
            comune.update()
            .where(comune.c.id.in_(codes))
            .values(favourite=True)
        )


def downgrade() -> None:
    op.drop_column("comune", "favourite")

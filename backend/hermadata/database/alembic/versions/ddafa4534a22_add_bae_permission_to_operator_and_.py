"""add_bae_permission_to_operator_and_volunteer

Revision ID: ddafa4534a22
Revises: d2ba4ca405e3
Create Date: 2026-05-02 16:04:49.236139

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "ddafa4534a22"
down_revision: Union[str, None] = "b3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PERMISSION_CODE = "BAE"
PERMISSION_DESCRIPTION = "Browse animal events"
ROLES = ["operator", "volunteer"]


def upgrade() -> None:
    conn = op.get_bind()

    conn.execute(
        sa.text(
            "INSERT INTO permissions (code, description) VALUES (:code, :description)"
            " ON DUPLICATE KEY UPDATE code = code"
        ),
        {"code": PERMISSION_CODE, "description": PERMISSION_DESCRIPTION},
    )

    for role_name in ROLES:
        role_id = conn.execute(
            sa.text("SELECT id FROM user_roles WHERE name = :name"),
            {"name": role_name},
        ).scalar_one()

        conn.execute(
            sa.text(
                "INSERT INTO user_role_permissions (role_id, permission_code)"
                " VALUES (:role_id, :code)"
                " ON DUPLICATE KEY UPDATE role_id = role_id"
            ),
            {"role_id": role_id, "code": PERMISSION_CODE},
        )


def downgrade() -> None:
    conn = op.get_bind()

    for role_name in ROLES:
        role_id = conn.execute(
            sa.text("SELECT id FROM user_roles WHERE name = :name"),
            {"name": role_name},
        ).scalar_one_or_none()

        if role_id is not None:
            conn.execute(
                sa.text(
                    "DELETE FROM user_role_permissions "
                    "WHERE role_id = :role_id AND permission_code = :code"
                ),
                {"role_id": role_id, "code": PERMISSION_CODE},
            )

    conn.execute(
        sa.text("DELETE FROM permissions WHERE code = :code"),
        {"code": PERMISSION_CODE},
    )

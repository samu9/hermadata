"""add upload_animal_image permission to operator role

Revision ID: b3c4d5e6f7a8
Revises: a9f1b2c3d4e5
Create Date: 2025-05-01 13:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b3c4d5e6f7a8"
down_revision: Union[str, None] = "a9f1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PERMISSION_CODE = "UAI"
PERMISSION_DESCRIPTION = "Upload and manage animal images"
ROLE_NAME = "operator"


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "INSERT INTO permissions (code, description) VALUES (:code, :description)"
            " ON DUPLICATE KEY UPDATE code = code"
        ),
        {"code": PERMISSION_CODE, "description": PERMISSION_DESCRIPTION},
    )

    role_id = conn.execute(
        sa.text("SELECT id FROM user_roles WHERE name = :name"),
        {"name": ROLE_NAME},
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
    role_id = conn.execute(
        sa.text("SELECT id FROM user_roles WHERE name = :name"),
        {"name": ROLE_NAME},
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

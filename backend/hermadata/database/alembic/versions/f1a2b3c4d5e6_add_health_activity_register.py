"""Add animal health activity register and grant permissions to operator."""

import sqlalchemy as sa
from alembic import op

revision = "f1a2b3c4d5e6"
down_revision = "e9f0a1b2c3d4"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "animal_health_activity",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "animal_id",
            sa.Integer(),
            sa.ForeignKey("animal.id"),
            nullable=False,
        ),
        sa.Column("activity_date", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_animal_health_activity_animal_id",
        "animal_health_activity",
        ["animal_id"],
    )
    op.execute(
        "INSERT INTO permissions (code, description) "
        "VALUES ('BHA', 'Visualizza attività sanitarie') "
        "ON DUPLICATE KEY UPDATE code = code"
    )
    op.execute(
        "INSERT INTO permissions (code, description) "
        "VALUES ('CHA', 'Aggiungi attività sanitaria') "
        "ON DUPLICATE KEY UPDATE code = code"
    )
    op.execute(
        "INSERT INTO permissions (code, description) "
        "VALUES ('EHA', 'Modifica attività sanitaria') "
        "ON DUPLICATE KEY UPDATE code = code"
    )
    op.execute(
        "INSERT INTO permissions (code, description) "
        "VALUES ('DHA', 'Elimina attività sanitaria') "
        "ON DUPLICATE KEY UPDATE code = code"
    )
    op.execute("""
        INSERT INTO user_role_permissions (role_id, permission_code)
        SELECT r.id, p.code FROM user_roles r CROSS JOIN permissions p
        WHERE r.name = 'operator'
        AND p.code IN ('BHA', 'CHA', 'EHA', 'DHA')
        AND NOT EXISTS (
            SELECT 1 FROM user_role_permissions rp
            WHERE rp.role_id = r.id AND rp.permission_code = p.code
        )
    """)


def downgrade():
    op.execute(
        "DELETE FROM user_role_permissions "
        "WHERE permission_code IN ('BHA', 'CHA', 'EHA', 'DHA')"
    )
    op.execute(
        "DELETE FROM permissions WHERE code IN ('BHA', 'CHA', 'EHA', 'DHA')"
    )
    op.drop_table("animal_health_activity")

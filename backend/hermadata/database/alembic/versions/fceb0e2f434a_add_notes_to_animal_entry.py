"""add notes to animal_entry

Revision ID: fceb0e2f434a
Revises: 60bd24dc572c
Create Date: 2024-12-07 17:30:19.634413

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fceb0e2f434a"
down_revision: Union[str, None] = "60bd24dc572c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("animal_entry", sa.Column("entry_notes", sa.Text(), nullable=True))
    op.add_column("animal_entry", sa.Column("exit_notes", sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("animal_entry", "exit_notes")
    op.drop_column("animal_entry", "entry_notes")
    # ### end Alembic commands ###

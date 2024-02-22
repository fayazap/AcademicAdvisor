"""user table error1

Revision ID: 41779c14de8b
Revises: a09a5f9fe01a
Create Date: 2024-02-21 17:35:22.813102

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '41779c14de8b'
down_revision = 'a09a5f9fe01a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.String(),
               type_=sa.INTEGER(),
               existing_nullable=False)

    # ### end Alembic commands ###

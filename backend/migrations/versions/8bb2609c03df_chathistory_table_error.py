"""chatHistory table error

Revision ID: 8bb2609c03df
Revises: 41779c14de8b
Create Date: 2024-02-21 19:24:22.636062

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8bb2609c03df'
down_revision = '41779c14de8b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('chat_history', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('chat_history', schema=None) as batch_op:
        batch_op.alter_column('user_id',
               existing_type=sa.String(),
               type_=sa.INTEGER(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.String(),
               type_=sa.INTEGER(),
               existing_nullable=False)

    # ### end Alembic commands ###

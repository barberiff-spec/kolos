"""add site_settings table

Revision ID: 003
Revises: 002
Create Date: 2026-07-11

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hero_title", sa.String(length=255), nullable=True),
        sa.Column("hero_subtitle", sa.Text(), nullable=True),
        sa.Column("promo_banner_text", sa.String(length=500), nullable=True),
        sa.Column("promo_banner_enabled", sa.Boolean(), nullable=False),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("contact_address", sa.String(length=500), nullable=True),
        sa.Column("social_instagram", sa.String(length=500), nullable=True),
        sa.Column("social_telegram", sa.String(length=500), nullable=True),
        sa.Column("social_whatsapp", sa.String(length=500), nullable=True),
        sa.Column("social_vk", sa.String(length=500), nullable=True),
        sa.Column("footer_text", sa.String(length=500), nullable=True),
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=500), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("site_settings")

import os
import re
from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Integer, String, Text, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


class Base(DeclarativeBase):
    pass


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )


class Stat(Base):
    __tablename__ = "stats"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[int] = mapped_column(BigInteger, nullable=False)


_engine = None
_SessionLocal = None


def _build_database_url() -> str:
    """
    Uses DATABASE_URL (Neon/Postgres) if provided, otherwise SQLite locally.
    """

    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    # SQLite file DB in the project (backend folder's parent).
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sqlite_path = os.path.join(base_dir, "portfolio.sqlite3")
    return f"sqlite:///{sqlite_path}"


def get_engine():
    global _engine, _SessionLocal
    if _engine is not None:
        return _engine

    database_url = _build_database_url()

    connect_args = {}
    # Neon/Postgres typically requires SSL; if the user didn't include it, try enabling.
    if database_url.startswith("postgres://") or database_url.startswith("postgresql://"):
        # Only set sslmode if not already present in the URL.
        if "sslmode=" not in database_url:
            connect_args["sslmode"] = "require"

    _engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    return _engine


def init_db():
    engine = get_engine()
    Base.metadata.create_all(bind=engine)


def _simple_email_is_valid(email: str) -> bool:
    # Basic email validation: enough to prevent empty/malformed values.
    if not email or len(email) > 320:
        return False
    return re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) is not None


def create_contact(*, name: str, email: str, message: str) -> Contact:
    if not name or not message or not email:
        raise ValueError("name/email/message are required")
    if not _simple_email_is_valid(email):
        raise ValueError("invalid email")

    init_db()
    session = _SessionLocal()
    try:
        contact = Contact(name=name.strip(), email=email.strip(), message=message.strip())
        session.add(contact)
        session.commit()
        session.refresh(contact)
        return contact
    finally:
        session.close()


def get_contacts(limit: Optional[int] = None) -> list[Contact]:
    init_db()
    session = _SessionLocal()
    try:
        query = session.query(Contact).order_by(Contact.created_at.desc())
        if limit is not None:
            query = query.limit(limit)
        return list(query.all())
    finally:
        session.close()


def get_visitors() -> int:
    init_db()
    session = _SessionLocal()
    try:
        stat = session.get(Stat, "visitors")
        return int(stat.value) if stat is not None else 0
    finally:
        session.close()


def increment_visitors() -> int:
    init_db()
    session = _SessionLocal()
    try:
        stat = session.get(Stat, "visitors")
        if stat is None:
            stat = Stat(key="visitors", value=0)
            session.add(stat)
        stat.value = int(stat.value) + 1
        session.commit()
        return int(stat.value)
    finally:
        session.close()


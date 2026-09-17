
# SSD Python Database — PostgreSQL + SQLAlchemy 2.x มาตรฐาน

## บริบท

SSD Python ใช้ PostgreSQL เป็น database และ SQLAlchemy 2.x async สำหรับ ORM ร่วมกับ Alembic สำหรับ migration ทุก model และ migration ต้องเป็น async-first และปฏิบัติตาม naming convention ที่กำหนด

## กฎหลัก

1. ชื่อ table และ column ต้องใช้ `snake_case` เท่านั้น — ห้ามใช้ PascalCase หรือ camelCase
2. ORM class ต้องลงท้ายด้วย `Row` เช่น `TaskRow`, `UserRow` — ห้ามใช้ชื่อ domain entity ตรงๆ
3. ทุก table ต้องมี standard audit columns: `created_at`, `updated_at`, `is_active`
4. ต้องใช้ `DateTime(timezone=True)` เสมอ — ห้ามใช้ `DateTime()` ที่ไม่มี timezone
5. ห้ามใช้ native PostgreSQL enum (`Column(Enum(MyEnum))`) — ให้ใช้ `CheckConstraint` + `StrEnum`
6. Index ต้องตั้งชื่อตาม pattern: `ix_<table>_<cols>` เช่น `ix_tasks_owner_status`
7. ทุก migration ต้องมี `downgrade()` ที่ใช้งานได้จริง — ห้าม `pass`
8. ใช้ async engine และ `AsyncSession` เสมอ — ห้ามใช้ sync `Session`

---

## Naming Conventions

| สิ่ง | รูปแบบ | ตัวอย่างที่ดี | ตัวอย่างที่ไม่ดี |
|-----|-------|--------------|----------------|
| Table | `snake_case` พหูพจน์ | `tasks`, `order_items` | `Task`, `OrderItems`, `tbl_tasks` |
| Column | `snake_case` | `created_at`, `owner_id` | `CreatedAt`, `ownerId` |
| Primary key | `id` (ไม่ต้อง prefix) | `id` | `task_id`, `TaskId` |
| Foreign key | `{ref_table_singular}_id` | `owner_id`, `task_id` | `ownerId`, `FK_owner` |
| Boolean column | ขึ้นต้นด้วย `is_` หรือ `has_` | `is_active`, `has_attachment` | `active`, `ActiveFlag` |
| Index | `ix_{table}_{cols}` | `ix_tasks_owner_status` | `tasks_owner_idx`, `idx_1` |
| Unique constraint | `uq_{table}_{cols}` | `uq_users_email` | `unique_email` |
| Foreign key constraint | `fk_{table}_{ref}` | `fk_tasks_owner` | `tasks_owner_fk` |
| ORM row class | `{Entity}Row` | `TaskRow`, `UserRow` | `Task`, `TaskModel`, `TaskTable` |

---

## Standard Audit Columns

ทุก table ต้องมี 3 columns นี้:

```python
from sqlalchemy import Boolean, DateTime
from sqlalchemy.sql import func

is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), nullable=False, server_default=func.now()
)
updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), nullable=False,
    server_default=func.now(), onupdate=func.now()
)
```

---

## ORM Model (SQLAlchemy 2.x Declarative)

```python
# app/infrastructure/db/models.py
from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean, CheckConstraint, DateTime, ForeignKey,
    Index, String, Text, UniqueConstraint, Uuid,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class TaskStatus(StrEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskRow(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'in_progress', 'done')",
            name="ck_tasks_status",
        ),
        Index("ix_tasks_owner_status", "owner_id", "status"),
        UniqueConstraint("external_ref", name="uq_tasks_external_ref"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    external_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Foreign key
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", name="fk_tasks_owner"),
        nullable=False,
    )

    # Audit columns (ต้องมีทุก table)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now()
    )
```

---

## Async Engine และ Session

```python
# app/infrastructure/db/engine.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

def create_engine(database_url: str):
    # ต้องใช้ asyncpg driver: postgresql+asyncpg://...
    return create_async_engine(
        database_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=False,
    )

def create_session_factory(engine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
```

**Connection URL format:**
```
postgresql+asyncpg://user:password@host:5432/dbname
```

**Dependency (FastAPI):**
```python
# app/api/deps.py
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

async def get_session(session_factory = Depends(get_session_factory)) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session
```

---

## Repository Pattern

```python
# app/infrastructure/db/task_repository.py
from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.tasks.entities import Task
from app.domain.tasks.ports import TaskRepository
from app.infrastructure.db.models import TaskRow


class SqlAlchemyTaskRepository(TaskRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, task_id: uuid.UUID) -> Task | None:
        result = await self._session.execute(
            select(TaskRow).where(TaskRow.id == task_id, TaskRow.is_active == True)
        )
        row = result.scalar_one_or_none()
        return _to_domain(row) if row else None

    async def list_by_owner(self, owner_id: uuid.UUID) -> list[Task]:
        result = await self._session.execute(
            select(TaskRow)
            .where(TaskRow.owner_id == owner_id, TaskRow.is_active == True)
            .order_by(TaskRow.created_at.desc())
        )
        return [_to_domain(row) for row in result.scalars().all()]

    async def save(self, task: Task) -> None:
        existing = await self._session.get(TaskRow, task.id)
        if existing:
            _update_row(existing, task)
        else:
            self._session.add(_to_row(task))


def _to_domain(row: TaskRow) -> Task:
    return Task(
        id=row.id,
        title=row.title,
        description=row.description,
        status=TaskStatus(row.status),
        owner_id=row.owner_id,
    )


def _to_row(task: Task) -> TaskRow:
    return TaskRow(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status.value,
        owner_id=task.owner_id,
    )


def _update_row(row: TaskRow, task: Task) -> None:
    row.title = task.title
    row.description = task.description
    row.status = task.status.value
```

---

## Alembic Migration

### ตั้งค่า alembic.ini และ env.py

```python
# migrations/env.py (async-aware)
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.infrastructure.db.models import Base

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata


def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
    )

    async def do_run():
        async with connectable.connect() as connection:
            await connection.run_sync(_do_run_migrations)
        await connectable.dispose()

    asyncio.run(do_run())


def _do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


run_migrations_online()
```

### Migration revision ที่ดี

```python
# migrations/versions/20240601_001_create_tasks.py
"""create tasks table

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2024-06-01 10:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tasks",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("owner_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("status IN ('open', 'in_progress', 'done')", name="ck_tasks_status"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], name="fk_tasks_owner"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tasks_owner_status", "tasks", ["owner_id", "status"])


def downgrade() -> None:
    op.drop_index("ix_tasks_owner_status", table_name="tasks")
    op.drop_table("tasks")
```

---

## ข้อห้าม (Anti-patterns)

| ห้าม | ทำแทนด้วย |
|------|----------|
| `Column(Enum(MyEnum))` native PG enum | `CheckConstraint` + `StrEnum` |
| `DateTime()` ไม่มี timezone | `DateTime(timezone=True)` |
| `session.query(Model).filter(...)` legacy style | `select(Model).where(...)` + `scalars()` |
| `SessionLocal()` ระดับ module | inject ผ่าน `Depends(get_session)` |
| `def downgrade(): pass` | `op.drop_table(...)` ที่ใช้งานได้จริง |
| ชื่อ index ที่ไม่ตาม pattern | `ix_{table}_{cols}` |
| Return ORM row จาก repository | Return domain entity ผ่าน `_to_domain()` |
| `PascalCase` table/column name | `snake_case` เสมอ |

---

## Commands อ้างอิง

```bash
# สร้าง migration ใหม่
alembic revision --autogenerate -m "create tasks table"

# รัน migration
alembic upgrade head

# ย้อน migration 1 ขั้น
alembic downgrade -1

# ดู history
alembic history --verbose

# ดู current revision
alembic current
```

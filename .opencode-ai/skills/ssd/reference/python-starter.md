
# SSD Python Starter — เริ่มต้น Python Project ใหม่

## บริบท

SSD Python ใช้ `SSD-Python-Starter-Template` เป็น base ทุก project ใหม่ต้อง clone จาก template นี้เพื่อให้ได้ Clean Architecture + observability + auth + messaging ตั้งแต่ต้น ไม่เริ่มจาก `pip install fastapi` เปล่าๆ

**Stack ที่ template มีให้:**
- FastAPI + Uvicorn (HTTP framework)
- SQLAlchemy 2.x async + Asyncpg + Alembic (PostgreSQL ORM + migrations)
- Structlog (structured logging + DB/file sinks)
- APScheduler (background jobs)
- FastStream + NATS (messaging)
- HTTPX (async HTTP client)
- python-jose (JWT/OAuth2)
- pytest + pytest-asyncio + respx (testing)
- UV (package manager)

---

## ระยะที่ 1: Clone และ Configure

### 1.1 Clone template

**ก่อน clone เสมอ — ตรวจสอบว่า directory ปัจจุบันเป็น git repo ที่มีอยู่แล้วหรือไม่:**

```bash
git rev-parse --is-inside-work-tree 2>&1   # error = directory ใหม่ → กรณี A
git log --oneline -1 2>&1                  # มี output = มี commit อยู่แล้ว → กรณี C, ไม่มี output = กรณี B
```

#### กรณี A — Directory ใหม่ (ยังไม่มี .git)

```bash
gh repo clone SiamsmileDev/SSD-Python-Starter-Template {project-name}
cd {project-name}

# ถ้าต้องการเป็น repo ใหม่แยกต่างหาก (ไม่เก็บ git history ของ template)
rm -rf .git
git init
git add .
git commit -m "chore: initial project from SSD-Python-Starter-Template"
```

#### กรณี B — อยู่ใน repo ที่มีอยู่แล้วแต่ยังไม่มี commit (เช่น repo เปล่าที่สร้างไว้รอ)

`gh repo clone` จะ error เพราะ directory ปัจจุบันมีอยู่แล้ว — ห้ามรันตรงๆ และห้ามแตะ `.git` ของ directory ปัจจุบัน:

```bash
# 1. clone template ไปไว้ที่ temp directory แยก (ไม่ clone ทับ directory ปัจจุบัน)
gh repo clone SiamsmileDev/SSD-Python-Starter-Template /tmp/{project-name}-template

# 2. ลบ .git ของ template ออกจาก temp directory ก่อนเสมอ — ป้องกันการไปทับ .git เดิม
rm -rf /tmp/{project-name}-template/.git

# 3. copy เนื้อหา (ไม่มี .git ติดมาแล้ว) เข้า directory ปัจจุบัน
cp -r /tmp/{project-name}-template/. .
rm -rf /tmp/{project-name}-template

# 4. commit เข้า history เดิม (เก็บ branch ปัจจุบันไว้ครบ ไม่มีการ git init ใหม่)
git add .
git commit -m "chore: initial project from SSD-Python-Starter-Template"
```

#### กรณี C — repo ปัจจุบันมี commit/history อยู่แล้ว

**ห้ามรันคำสั่งใดๆ ที่แตะ `.git` หรือ copy ไฟล์ทับโดยไม่ถาม user ก่อนเสมอ** — ใช้ AskUserQuestion ถามว่าต้องการ:
- Clone template เป็น repo ใหม่แยกต่างหาก ที่ path อื่น (ไม่แตะ repo ปัจจุบันเลย) — ตัวเลือกที่ปลอดภัยที่สุด
- Merge ไฟล์จาก template เข้า repo ปัจจุบัน โดยใช้ขั้นตอนแบบกรณี B แต่ต้องตรวจ conflict ไฟล์ที่มีอยู่แล้วทีละไฟล์ก่อน copy ทับ

### 1.2 ตั้งค่า .env

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/{project_name}
BROKER_URL=nats://localhost:4222
```

### 1.3 แก้ไข `config/settings.yaml`

```yaml
App:
  app_title: "{Project Name}"
  app_version: "0.1.0"
  app_description: "{คำอธิบาย project}"
```

### 1.4 แก้ชื่อใน `pyproject.toml`

```toml
[project]
name = "{project-name}"
version = "0.1.0"
```

---

## ระยะที่ 2: เริ่มต้น Infrastructure

```bash
# เริ่ม PostgreSQL + NATS ผ่าน Docker
docker compose up -d

# ติดตั้ง dependencies
uv sync

# รัน migrations (สร้าง tables เริ่มต้น)
uv run alembic upgrade head

# ตรวจสอบว่าทุกอย่างพร้อม
uv run pytest

# เริ่ม dev server
uv run uvicorn app.main:app --reload
# เปิด http://localhost:8000/docs
```

---

## ระยะที่ 3: สร้าง Bounded Context ใหม่

ใช้ `tasks/` เป็น reference — สร้างตามลำดับชั้นจาก domain ออกมา

### 3.1 Domain Entity — `app/domain/{context}/entities.py`

```python
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid4
from app.domain.errors import ValidationFailed


class {Entity}Status(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


@dataclass(slots=True)
class {Entity}:
    id: UUID
    name: str
    status: {Entity}Status
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(cls, *, name: str) -> {Entity}:
        name = (name or "").strip()
        if not name:
            raise ValidationFailed("{Entity} name must not be empty")
        if len(name) > 200:
            raise ValidationFailed("{Entity} name must be 200 chars or fewer")
        now = datetime.now(UTC)
        return cls(
            id=uuid4(),
            name=name,
            status={Entity}Status.ACTIVE,
            created_at=now,
            updated_at=now,
        )
```

### 3.2 Domain Ports — `app/domain/{context}/ports.py`

```python
from __future__ import annotations
from typing import Protocol
from uuid import UUID
from app.domain.{context}.entities import {Entity}


class {Entity}Repository(Protocol):
    async def add(self, entity: {Entity}) -> None: ...
    async def get(self, entity_id: UUID) -> {Entity} | None: ...
    async def list_all(self, *, limit: int = 50) -> list[{Entity}]: ...
    async def update(self, entity: {Entity}) -> None: ...
    async def delete(self, entity_id: UUID) -> bool: ...
```

### 3.3 Application Service — `app/application/{context}_service.py`

```python
from __future__ import annotations
from uuid import UUID
from app.domain.{context}.entities import {Entity}
from app.domain.{context}.ports import {Entity}Repository
from app.domain.errors import NotFoundError
from app.observability.logging import get_logger

_logger = get_logger(__name__)


class {Entity}Service:
    def __init__(self, repo: {Entity}Repository) -> None:
        self._repo = repo

    async def create(self, *, name: str) -> {Entity}:
        _logger.debug("{context}_service.create", name=name)
        entity = {Entity}.create(name=name)
        await self._repo.add(entity)
        _logger.info("{context}_created", entity_id=entity.id)
        return entity

    async def get(self, *, entity_id: UUID) -> {Entity}:
        entity = await self._repo.get(entity_id)
        if entity is None:
            raise NotFoundError(f"{Entity} {entity_id} not found")
        return entity

    async def list_all(self) -> list[{Entity}]:
        _logger.debug("{context}_service.list_all")
        return await self._repo.list_all()
```

### 3.4 ORM Model — เพิ่มใน `app/infrastructure/db/models.py`

```python
from sqlalchemy import CheckConstraint, DateTime, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func, text
from uuid import uuid4
from app.infrastructure.db.base import Base


class {Entity}Row(Base):
    __tablename__ = "{context}s"   # lowercase, plural

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("status in ('active', 'inactive')", name="ck_{context}s_status"),
        Index("ix_{context}s_status", "status"),
    )
```

### 3.5 Repository — `app/infrastructure/db/{context}_repository.py`

```python
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.{context}.entities import {Entity}, {Entity}Status
from app.domain.{context}.ports import {Entity}Repository
from app.infrastructure.db.models import {Entity}Row


def _to_domain(row: {Entity}Row) -> {Entity}:
    return {Entity}(
        id=row.id,
        name=row.name,
        status={Entity}Status(row.status),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _to_row(entity: {Entity}) -> {Entity}Row:
    return {Entity}Row(
        id=entity.id,
        name=entity.name,
        status=entity.status.value,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )


class SqlAlchemy{Entity}Repository({Entity}Repository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, entity: {Entity}) -> None:
        self._session.add(_to_row(entity))
        await self._session.flush()

    async def get(self, entity_id: UUID) -> {Entity} | None:
        row = await self._session.get({Entity}Row, entity_id)
        return _to_domain(row) if row else None

    async def list_all(self, *, limit: int = 50) -> list[{Entity}]:
        stmt = select({Entity}Row).order_by({Entity}Row.created_at.desc()).limit(limit)
        rows = (await self._session.execute(stmt)).scalars().all()
        return [_to_domain(r) for r in rows]

    async def update(self, entity: {Entity}) -> None:
        row = await self._session.get({Entity}Row, entity.id)
        if row:
            row.name = entity.name
            row.status = entity.status.value
            row.updated_at = entity.updated_at
            await self._session.flush()

    async def delete(self, entity_id: UUID) -> bool:
        row = await self._session.get({Entity}Row, entity_id)
        if row:
            await self._session.delete(row)
            await self._session.flush()
            return True
        return False
```

### 3.6 Alembic Migration

สร้างไฟล์ใหม่ที่ `alembic/versions/{YYYYMMDD}_{NNNN}_create_{context}s.py`:

```python
"""create {context}s table

Revision ID: {auto-generated}
"""
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.create_table(
        "{context}s",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("status in ('active', 'inactive')", name="ck_{context}s_status"),
    )
    op.create_index("ix_{context}s_status", "{context}s", ["status"])

def downgrade() -> None:
    op.drop_index("ix_{context}s_status", "{context}s")
    op.drop_table("{context}s")
```

### 3.7 API Router — `app/api/{context}.py`

```python
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from app.api.deps import get_current_user, get_{context}_service
from app.application.{context}_service import {Entity}Service
from app.domain.{context}.entities import {Entity}

router = APIRouter(prefix="/api/{context}s", tags=["{context}s"])


class Create{Entity}Request(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class {Entity}Response(BaseModel):
    id: UUID
    name: str
    status: str
    created_at: str
    updated_at: str

    @classmethod
    def from_domain(cls, entity: {Entity}) -> {Entity}Response:
        return cls(
            id=entity.id,
            name=entity.name,
            status=entity.status.value,
            created_at=entity.created_at.isoformat(),
            updated_at=entity.updated_at.isoformat(),
        )


@router.post("", response_model={Entity}Response, status_code=status.HTTP_201_CREATED)
async def create_{context}(
    body: Create{Entity}Request,
    user: dict = Depends(get_current_user),
    service: {Entity}Service = Depends(get_{context}_service),
) -> {Entity}Response:
    entity = await service.create(name=body.name)
    return {Entity}Response.from_domain(entity)


@router.get("", response_model=list[{Entity}Response])
async def list_{context}s(
    user: dict = Depends(get_current_user),
    service: {Entity}Service = Depends(get_{context}_service),
) -> list[{Entity}Response]:
    entities = await service.list_all()
    return [{Entity}Response.from_domain(e) for e in entities]


@router.get("/{{{context}_id}}", response_model={Entity}Response)
async def get_{context}(
    {context}_id: UUID,
    user: dict = Depends(get_current_user),
    service: {Entity}Service = Depends(get_{context}_service),
) -> {Entity}Response:
    entity = await service.get(entity_id={context}_id)
    return {Entity}Response.from_domain(entity)
```

### 3.8 เพิ่ม Dependency — `app/api/deps.py`

เพิ่ม function:
```python
def get_{context}_service(
    session: AsyncSession = Depends(get_session),
) -> {Entity}Service:
    from app.infrastructure.db.{context}_repository import SqlAlchemy{Entity}Repository
    from app.application.{context}_service import {Entity}Service
    return {Entity}Service(SqlAlchemy{Entity}Repository(session))
```

### 3.9 Register Router — `app/main.py`

เพิ่มใน `create_app()`:
```python
from app.api.{context} import router as {context}_router
app.include_router({context}_router)
```

---

## ระยะที่ 4: Verify

```bash
# รัน migrations
uv run alembic upgrade head

# ตรวจสอบ tests ผ่าน
uv run pytest

# เริ่ม server
uv run uvicorn app.main:app --reload

# เปิด Swagger UI ตรวจ endpoints
# http://localhost:8000/docs
# ต้องเห็น /api/{context}s รายการ GET และ POST
```

---

## สิ่งที่ห้ามทำเมื่อสร้าง bounded context ใหม่

- ห้าม import FastAPI/SQLAlchemy ใน `domain/` — domain ต้องเป็น pure Python เท่านั้น
- ห้ามใช้ `@router.put()`, `@router.patch()`, `@router.delete()` — ใช้ POST + action path
- ห้าม raise `HTTPException` ใน `application/` หรือ `domain/` — ใช้ `DomainError` subclass
- ห้ามสร้าง session ระดับ module — inject ผ่าน `Depends(get_session)` เท่านั้น
- ห้ามใช้ `print()` — ใช้ `log.info(...)` พร้อม structured key=value

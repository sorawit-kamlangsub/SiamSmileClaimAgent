
# SSD Python Doctor — ตรวจสุขภาพโปรเจค FastAPI Clean Architecture

## บริบท

ใช้ skill นี้เพื่อ diagnose โปรเจค FastAPI ว่าถูกตั้งค่าตาม SSD standards ครบถ้วนหรือไม่ ตรวจ dependencies, Clean Architecture layers, main.py wiring, Alembic setup — ไม่ใช่ code quality (ใช้ `ssd-python-review` สำหรับนั้น)

---

## กฎหลัก

1. อ่านไฟล์เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน doctor
2. ตรวจ requirements.txt หรือ pyproject.toml ก่อนเสมอ — missing package ถือเป็น ❌
3. ตรวจ Clean Architecture layers ครบ 4 โฟลเดอร์: domain, application, api, infrastructure
4. ตรวจ main.py: ต้องมี `lifespan()` และ `install_error_handlers(app)` ทั้งคู่
5. ตรวจ DomainError base class ใน app/domain/
6. รายงาน ✅ ผ่าน / ❌ พบปัญหา / ⚠️ ไม่แน่ใจ / ⊘ ไม่พบไฟล์ ต่อทุก check item

---

## Checklist การตรวจสอบ

### Area 1: Dependencies (requirements.txt หรือ pyproject.toml)

| Package | หมายเหตุ |
|---------|----------|
| `fastapi` | web framework |
| `sqlalchemy>=2.0` | ORM (ต้องเป็น 2.x) |
| `alembic` | database migrations |
| `structlog` | structured logging |
| `httpx` | async HTTP client |
| `uvicorn[standard]` | ASGI server |
| `pytest` | testing |
| `pytest-asyncio` | async test support |

### Area 2: Clean Architecture Layers

| Path | Layer | ต้องมี |
|------|-------|-------|
| `app/domain/` | Domain — entities, ports, errors | ✅ |
| `app/application/` | Application — use cases, services | ✅ |
| `app/api/` | Presentation — routers, schemas | ✅ |
| `app/infrastructure/` | Infrastructure — repos, DB, HTTP clients | ✅ |

### Area 3: main.py Wiring

| Check | สิ่งที่ต้องมี |
|-------|-------------|
| `lifespan()` context manager | `@asynccontextmanager async def lifespan(app)` |
| `install_error_handlers(app)` | error mapping จาก DomainError → HTTP |
| ไม่มี module-level session | ❌ ถ้าพบ `SessionLocal()` นอก lifespan |
| ไม่มี module-level engine | ❌ ถ้าพบ `create_async_engine(...)` นอก lifespan |

### Area 4: DomainError Base Class

| Check | สิ่งที่ต้องมี |
|-------|-------------|
| `DomainError` class | ใน `app/domain/` (ไม่ว่าจะชื่อไฟล์ไหน) |
| Subclasses | เช่น `NotFoundError`, `ValidationError`, `ConflictError` |

### Area 5: Alembic Setup

| Check | สิ่งที่ต้องมี |
|-------|-------------|
| `alembic.ini` | config file ที่ root |
| `migrations/` หรือ `alembic/` | migration directory |
| `migrations/versions/` | มี migration files อย่างน้อย 1 ไฟล์ |
| `migrations/env.py` | Alembic env configuration |

### Area 6: Logging Convention (Quick Scan)

Grep ใน `app/` เพื่อหา violations ชัดเจน:

| Pattern | Status |
|---------|--------|
| `print(` | ❌ ถ้าพบ |
| `log.info(f"` หรือ `log.error(f"` | ❌ ถ้าพบ f-string ใน log |

---

## ขั้นตอนการตรวจสอบ

### ขั้นตอนที่ 1: ระบุ root ของโปรเจค

```
# หา requirements.txt หรือ pyproject.toml
# ถ้าไม่บอก path ให้ glob หาจาก cwd
```

### ขั้นตอนที่ 2: อ่านและตรวจทุก Area

อ่าน requirements.txt, main.py, list app/ subfolders, ตรวจ domain/ สำหรับ DomainError

### ขั้นตอนที่ 3: ออก Health Report

```
## Python Doctor Report — [project name]

### Area 1: Dependencies
| Package | Status | หมายเหตุ |
|---------|--------|----------|
| fastapi | ✅ | |
| sqlalchemy | ❌ | พบ 1.4.x — ต้องการ >=2.0 |
| structlog | ⊘ | ไม่พบ |

### Area 2: Clean Architecture Layers
| Layer | Path | Status |
|-------|------|--------|
| Domain | app/domain/ | ✅ |
| Application | app/application/ | ✅ |
| API | app/api/ | ✅ |
| Infrastructure | app/infrastructure/ | ⊘ ไม่พบ |

### Area 3: main.py
| Check | Status |
|-------|--------|
| lifespan() | ✅ |
| install_error_handlers | ❌ ไม่พบ |
| module-level session | ✅ ไม่พบ |

### Area 4: DomainError
| Check | Status |
|-------|--------|
| DomainError class | ✅ |

### Area 5: Alembic
| Check | Status |
|-------|--------|
| alembic.ini | ✅ |
| migrations/versions/ | ⚠️ ไม่มี migration files |

### Area 6: Logging Quick Scan
| Pattern | Status |
|---------|--------|
| print() calls | ⚠️ พบ 2 รายการ |
| f-string in log | ✅ ไม่พบ |

### สรุป
- ❌ Critical: X รายการ — ต้องแก้ก่อนพัฒนา
- ⚠️ Warning: X รายการ — ควรแก้
- ✅ ผ่าน: X รายการ
- แนะนำ: [ขั้นตอนถัดไป เช่น ใช้ ssd-python-starter เพื่อดู template structure]
```

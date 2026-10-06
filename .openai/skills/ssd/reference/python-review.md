
# SSD Python Review — ตรวจสอบ Code Python

## บริบท

SSD Python ใช้ Clean Architecture / Hexagonal Architecture บน FastAPI + SQLAlchemy async + structlog standard มาจาก `.cursor/rules/` 6 ไฟล์ใน `SSD-Python-Starter-Template` ใช้ร่วมกับ `ssd-python-refactor` เพื่อแก้ไขสิ่งที่พบ

---

## กฎหลัก

1. อ่าน code เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน review
2. รายงานทุก violation พร้อม file path และ line number
3. จัดกลุ่ม violations ตาม category ไม่ใช่ตาม file
4. ถ้าไม่แน่ใจว่า violation จริงหรือไม่ ให้ระบุเป็น Warning

---

## Checklist การตรวจสอบ

### Category 1: Clean Architecture

| กฎ | ถูก | ผิด |
|----|-----|-----|
| `domain/` ห้าม import framework | `from dataclasses import dataclass` | `from fastapi import HTTPException` ใน domain |
| `domain/` ห้าม import SQLAlchemy | domain entity ใช้ Python dataclass | `from sqlalchemy.orm import ...` ใน domain |
| `domain/` ห้าม import HTTPX/FastStream/APScheduler | — | `import httpx` ใน entities.py |
| Router ห้ามเรียก ORM โดยตรง | router → service → repository | router import SessionLocal และ query โดยตรง |
| Business logic ห้ามอยู่ใน router | logic อยู่ใน application service | if/for ซับซ้อนใน endpoint function |
| Composition root อยู่ใน `main.py` เท่านั้น | wire ใน `lifespan()` | สร้าง engine/scheduler ระดับ module |

### Category 2: HTTP Methods (SSD Policy)

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ใช้เฉพาะ GET และ POST | `@router.get()`, `@router.post()` | `@router.put()`, `@router.patch()`, `@router.delete()` |
| Update ต้องใช้ POST + action path | `POST /tasks/{id}/update` | `PUT /tasks/{id}` |
| Delete ต้องใช้ POST + action path | `POST /tasks/{id}/delete` | `DELETE /tasks/{id}` |

### Category 3: Naming Conventions

| สิ่ง | รูปแบบที่ถูก | ตัวอย่างที่ผิด |
|-----|-------------|--------------|
| Function/method | `snake_case` | `createTask()`, `CreateTask()` |
| Class / DTO | `PascalCase` | `create_task_request` |
| DTO suffix | `Request` / `Response` | `TaskDto`, `TaskData`, `TaskModel` |
| ORM row class | `{Entity}Row` | `TaskModel`, `TaskTable`, `TaskOrm` |
| Repository impl | `SqlAlchemy{Entity}Repository` | `TaskRepo`, `TaskRepository` |
| Private member | `_name` (single underscore) | `__name`, `name_` |
| Enum value | `SCREAMING_SNAKE_CASE` | `OpenStatus`, `open_status` |
| DB table name | `snake_case` | `TaskTable`, `tbl_tasks` |
| DB index | `ix_<table>_<cols>` | `tasks_idx`, `index_owner` |

### Category 4: Logging

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้ามใช้ `print()` | `log.info(...)` | `print("task created")` |
| ห้าม f-string ใน log event | `log.info("task_created", task_id=task.id)` | `log.info(f"task {task.id} created")` |
| ห้าม `log.error(str(e))` | `log.exception("operation_failed")` | `log.error(str(exc))` |
| ห้าม log sensitive data | — | `log.info("login", password=password)` |
| ต้องมี correlation_id ที่ entrypoint | `set_correlation_id(...)` ใน middleware/job | ไม่มี correlation_id ใน job function |

### Category 5: Error Handling

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Domain layer raise `DomainError` subclass | `raise NotFoundError("Task not found")` | `raise HTTPException(404)` ใน service |
| `HTTPException` ใน `api/` layer เท่านั้น | ใน deps.py หรือ error handler | `raise HTTPException(...)` ใน application service |
| ต้องมี error mapping | `install_error_handlers(app)` ใน main.py | ไม่มี exception handler สำหรับ DomainError |
| ห้าม swallow exception | re-raise หรือ `log.exception()` | `except Exception: pass` |

### Category 6: Database

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้าม module-level session | session inject ผ่าน `Depends(get_session)` | `session = SessionLocal()` ระดับ module |
| Repository return domain entity | `return _to_domain(row)` | `return row` (ORM object) |
| ต้องมี `_to_domain()` และ `_to_row()` | แยก converter function | map inline ใน repository method |
| SQLAlchemy 2.x async syntax | `select(Model).where(...).scalars().all()` | `session.query(Model).filter(...)` (legacy) |
| Timestamp column | `DateTime(timezone=True)` | `DateTime()` (ไม่มี timezone) |
| ห้ามใช้ native PG enum | `CheckConstraint("status in ('open',...)")` + `StrEnum` | `Column(Enum(MyEnum))` |
| Migration ต้องมี downgrade | `def downgrade(): ...` มี SQL ที่ใช้ได้ | `def downgrade(): pass` |
| Index naming | `ix_tasks_owner_sub` | `tasks_owner_idx`, `idx_owner` |

### Category 7: HTTP Client

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้าม ad-hoc httpx call | — | `response = await httpx.get(url)` ใน service |
| AsyncClient สร้างใน lifespan | `client = httpx.AsyncClient(...)` ใน `lifespan()` | `client = httpx.AsyncClient()` ระดับ module |
| ครอบเป็น domain port class | `class OAuthHttpClient: ...` | inject raw `AsyncClient` เข้า service |
| ต้องมี timeout | `httpx.Timeout(connect=2.0, read=5.0, ...)` | ไม่มี timeout config |

### Category 8: Scheduler Jobs

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ต้องมี `coalesce=True` | `scheduler.add_job(..., coalesce=True)` | ไม่มี coalesce |
| ต้องมี `max_instances=1` | `max_instances=1` | `max_instances=5` หรือไม่มี |
| ต้องมี `misfire_grace_time` | `misfire_grace_time=300` | ไม่มี misfire_grace_time |
| Business logic ใน application service | `await service.cleanup()` ใน job | SQL query โดยตรงใน job function |
| Job ต้องมี correlation_id | `set_correlation_id(new_correlation_id())` | ไม่มี correlation_id ใน job |

---

## ขั้นตอนการ Review

### ขั้นตอนที่ 1: กำหนด scope

```
# ระบุว่าจะ review ไฟล์ไหน เช่น:
# - app/domain/{context}/
# - app/api/{context}.py
# - ทุก .py ใน app/
```

### ขั้นตอนที่ 2: อ่านและตรวจตาม Checklist

อ่านทีละไฟล์ ตรวจทุก category ด้านบน บันทึก violations พร้อม line number

### ขั้นตอนที่ 3: สร้างรายงาน

```
## Python Review Report

### ❌ Violations (ต้องแก้ไข)

| File | Line | Category | ปัญหา | แนวทางแก้ไข |
|------|------|----------|-------|-------------|
| app/domain/orders/entities.py | 3 | Architecture | import HTTPException จาก fastapi | raise DomainError subclass แทน |
| app/api/orders.py | 45 | HTTP Methods | ใช้ @router.delete() | เปลี่ยนเป็น POST /orders/{id}/delete |
| app/application/order_service.py | 22 | Logging | print("order created") | log.info("order_created", order_id=...) |

### ⚠️ Warnings

| File | Line | Category | ข้อสังเกต |
|------|------|----------|----------|
| app/infrastructure/db/order_repository.py | 15 | Database | ไม่มี type annotation บน _to_domain() |

### ✅ ผ่าน

- HTTP methods: ใช้ GET/POST ถูกต้องทั้งหมด
- Naming: class/function ถูก convention
- Error handling: มี install_error_handlers() ใน main.py

### สรุป

- Violations: X รายการ ใน Y ไฟล์
- Warnings: X รายการ
- พร้อม refactor: ใช่ / ต้องพิจารณา Tier 4 ก่อน
```

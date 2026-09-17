
# SSD Python Refactor — แก้ไข Code Python อย่างปลอดภัย

## บริบท

Refactor ที่ไม่ระวังทำให้ pytest พัง หรือ runtime error ได้ skill นี้แบ่งการแก้ไขเป็น 4 Tiers ตามความเสี่ยง และบังคับ verify ด้วย `uv run pytest` หลังทุกไฟล์ Tier 2 ขึ้นไป

---

## Safety Tiers — ระดับความเสี่ยงการแก้ไข

| Tier | ประเภทการแก้ไข | Action |
|------|---------------|--------|
| **1 — ปลอดภัยเสมอ** | `print()` → `log.info()`, f-string log → structured key=value, import order, whitespace | แก้ได้เลย |
| **2 — ปลอดภัยหลัง pytest** | เพิ่ม type annotation, `log.error(str(e))` → `log.exception()`, เพิ่ม `_` prefix private member, เพิ่ม `coalesce`/`max_instances` ใน job | แก้ + `uv run pytest` |
| **3 — ตรวจ usages ก่อน** | Rename class/function, เพิ่ม error handler, แก้ ORM row → domain entity return, ย้าย business logic จาก router → service | `grep` หา usages ก่อน + แก้ + pytest |
| **4 — ห้ามแก้** | API route paths (GET→POST migration), DB column/table names, public interface ที่มี caller ภายนอก | skip — แจ้ง user |

---

## กฎหลัก

1. แก้ไขทีละ 1 ไฟล์เสมอ
2. Tier 2 ขึ้นไปต้องรัน `uv run pytest` หลังทุกไฟล์
3. ถ้า pytest fail → `git checkout -- <file>` แล้ว skip + บันทึก
4. ห้ามเปลี่ยน logic เปลี่ยนแค่ style/naming/structure
5. Tier 4 ห้ามแก้ไม่ว่าในกรณีใด
6. ถ้าไม่มี violation report ให้ใช้ `ssd-python-review` ก่อน

---

## ขั้นตอนการ Refactor

### ขั้นตอนที่ 1: เตรียม violation list

จัดเรียง violations ตาม Tier — Tier 1 ก่อน → Tier 2 → Tier 3  
Tier 4: แยกออกไป รายงาน user

### ขั้นตอนที่ 2: แก้ไขทีละไฟล์

```
สำหรับแต่ละไฟล์:
1. อ่านไฟล์
2. แก้ไข violations ตาม Tier (Tier 1 ก่อนในแต่ละไฟล์)
3. Tier 2+ → รัน pytest
4. บันทึกผล → ไปไฟล์ถัดไป
```

### ขั้นตอนที่ 3: Verify

```bash
uv run pytest
```

ถ้า fail → revert:
```bash
git checkout -- <file-path>
```

### ขั้นตอนที่ 4: สรุปผล

```
## Python Refactor Report

### ✅ แก้ไขสำเร็จ
| File | Violations ที่แก้ |
|------|-----------------|
| app/api/orders.py | print() → log.info() (line 12), f-string log → structured (line 45) |

### ⏭️ Skip (Tier 4)
| File | Line | ปัญหา | เหตุผล |
|------|------|-------|--------|
| app/api/orders.py | 23 | DELETE /orders/{id} ควรเป็น POST /orders/{id}/delete | เปลี่ยน route อาจทำให้ client พัง |

### ❌ Skip (pytest fail)
| File | ปัญหา |
|------|-------|
| app/application/order_service.py | Rename method แล้ว pytest fail — revert แล้ว |

### สรุป
- สำเร็จ: X ไฟล์
- Skip Tier 4: Y รายการ (รอ user)
- Skip error: Z รายการ (ตรวจเอง)
```

---

## ตัวอย่างการแก้ไขที่พบบ่อย

### Tier 1: print() → structlog

```python
# ก่อน
print(f"order {order_id} created")
print("error:", str(e))

# หลัง
log.info("order_created", order_id=order_id)
log.exception("order_creation_failed")
```

### Tier 1: f-string log → structured

```python
# ก่อน
log.info(f"Processing order {order_id} for user {user_id}")
log.error(f"Failed: {str(e)}")

# หลัง
log.info("processing_order", order_id=order_id, user_id=user_id)
log.exception("order_processing_failed")
```

### Tier 2: เพิ่ม type annotation

```python
# ก่อน
def _to_domain(row):
    return Order(id=row.id, title=row.title)

# หลัง
def _to_domain(row: OrderRow) -> Order:
    return Order(id=row.id, title=row.title)
```

### Tier 2: เพิ่ม scheduler job attributes

```python
# ก่อน
scheduler.add_job(
    cleanup_orders,
    trigger="cron",
    hour=2,
    id="orders.cleanup.daily",
)

# หลัง
scheduler.add_job(
    cleanup_orders,
    trigger="cron",
    hour=2,
    id="orders.cleanup.daily",
    coalesce=True,
    max_instances=1,
    misfire_grace_time=300,
    replace_existing=True,
)
```

### Tier 2: log.error → log.exception

```python
# ก่อน
except Exception as e:
    log.error(f"Failed: {str(e)}")

# หลัง
except Exception:
    log.exception("operation_failed")
    raise
```

### Tier 3: ORM row → domain entity return (ต้อง grep ก่อน)

```python
# ขั้นตอน:
# 1. ตรวจว่ามี _to_domain() อยู่แล้วหรือไม่
# 2. ถ้าไม่มี เพิ่มก่อน

# ก่อน
async def get(self, order_id: UUID) -> OrderRow | None:
    return await self._session.get(OrderRow, order_id)

# หลัง
async def get(self, order_id: UUID) -> Order | None:
    row = await self._session.get(OrderRow, order_id)
    return _to_domain(row) if row else None
```

### Tier 3: ย้าย business logic จาก router → service

```python
# ก่อน (business logic ใน router)
@router.post("/orders")
async def create_order(body: CreateOrderRequest, session = Depends(get_session)):
    order = OrderRow(title=body.title, ...)
    session.add(order)
    await session.commit()
    return {"id": str(order.id)}

# หลัง (router บาง — เรียก service)
@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    body: CreateOrderRequest,
    user: dict = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    order = await service.create(owner_sub=user["sub"], title=body.title)
    return OrderResponse.from_domain(order)
```

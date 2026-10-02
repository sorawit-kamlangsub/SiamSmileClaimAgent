
# SSD Python Streaming Doctor — ตรวจ Production-Readiness ของ SSE/Streaming Endpoint

## บริบท

ใช้ skill นี้ตรวจ FastAPI endpoint ที่ใช้ Server-Sent Events (SSE) หรือ streaming response (เช่น endpoint ที่สร้างจาก `python-feature` สำหรับ AI streaming) ว่าพร้อม deploy จริงหรือยัง — โค้ดที่รันผ่านบน `localhost` มักพังเงียบๆ ตอนขึ้น production เพราะ reverse proxy buffering, idle timeout, sync worker, resource leak ฯลฯ ที่ไม่โผล่ตอน dev — ไม่ใช่ code quality ทั่วไป (ใช้ `python-review` สำหรับนั้น) และไม่ใช่ Clean Architecture wiring (ใช้ `python-doctor` สำหรับนั้น)

---

## กฎหลัก

1. อ่านไฟล์เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน doctor
2. ต้องระบุประเภท stream ก่อนตรวจเสมอ (ดูขั้นตอนที่ 0) — ห้ามใช้ Area ทั้งหมดแบบเหมาะกับทุก endpoint เหมือนกัน เพราะ Area 5-7 ใช้กับ stream แบบ long-lived เท่านั้น ไม่ใช่กับ finite stream (เช่น AI completion ทีละ request)
3. ตรวจไฟล์จริง (โค้ด, nginx config, Dockerfile, start command) ไม่ตรวจจาก memory — ถ้าไม่พบไฟล์ infra ใน repo (เช่น nginx.conf อยู่ repo อื่น) ให้รายงาน ⊘ ไม่ใช่ ❌
4. รายงาน ✅ ผ่าน / ❌ พบปัญหา / ⚠️ ไม่แน่ใจ หรือเป็น judgment call / ⊘ ไม่พบไฟล์ หรือไม่เกี่ยวข้องกับ stream ประเภทนี้ ต่อทุก check item

---

## ขั้นตอนที่ 0: ระบุประเภท Stream ก่อนตรวจ

แหล่งข้อมูล/lore เรื่อง SSE productionส่วนใหญ่อ้างอิงจาก long-lived subscription stream (notification, dashboard) แต่ FastAPI streaming endpoint อีกแบบที่พบบ่อยคือ finite stream สำหรับ AI completion — ปัญหาที่ใช้ได้กับแบบหนึ่งอาจไม่เกี่ยวข้องกับอีกแบบเลย ต้องแยกก่อนตรวจ:

| ประเภท | ลักษณะ | ตัวอย่าง |
|--------|--------|---------|
| **(A) Finite / Request-scoped** | 1 request → stream ข้อมูลจำกัด → ปิด connection เมื่อจบ | AI chat completion (`python-feature` streaming pattern), file export progress |
| **(B) Long-lived / Subscription** | connection เปิดค้างไม่จำกัดเวลา server push event เมื่อมีจริง | Notification, real-time dashboard, live feed |

ระบุประเภทของแต่ละ endpoint ก่อนไปตาราง Area ด้านล่าง — แต่ละ Area มีคอลัมน์ "ใช้กับ" บอกว่าเกี่ยวกับ (A), (B), หรือทั้งสอง

---

## Checklist การตรวจสอบ

### Area 1: Reverse Proxy Buffering — ใช้กับ (A) และ (B)

proxy buffering ทำให้ token/event ไม่ไหลออกจริงจนกว่า buffer เต็มหรือ stream จบ — เกิดกับทุก stream ไม่ว่า finite หรือ long-lived:

| Check | ต้องมี |
|-------|-------|
| Response header `X-Accel-Buffering: no` | ต้องมีใน `StreamingResponse(...)` ทุกตัว |
| Response header `Cache-Control: no-cache` | ต้องมี |
| (ถ้าพบ nginx config ใน repo) `proxy_buffering off;` | ใน location block ของ endpoint นี้ |
| (ถ้าพบ nginx config) `proxy_cache off;`, `proxy_http_version 1.1;`, `chunked_transfer_encoding on;` | ใน location block เดียวกัน |

### Area 2: Timeout & Heartbeat — (B) บังคับ / (A) judgment call

| Check | ใช้กับ | ต้องมี |
|-------|-------|-------|
| Heartbeat (`: ping\n\n` หรือ `data: ping\n\n`) ทุก 15-30 วินาที | (B) บังคับ | ไม่มี = ❌ — connection จะถูก firewall/LB ตัดเงียบๆ ตอน idle |
| Heartbeat หรือมาตรการกัน time-to-first-byte ช้า | (A) judgment call | ขึ้นกับ upstream — ถ้าเป็น reasoning model ที่ time-to-first-token ช้า ให้ ⚠️ แนะนำพิจารณา ไม่ใช่ ❌ ทันที; ถ้า token ไหลเร็วต่อเนื่องอยู่แล้ว ให้ ✅/⊘ ได้ |
| (ถ้าพบ nginx config) `proxy_read_timeout`/`proxy_send_timeout` ปรับสูงกว่า default | (A) และ (B) | ค่า default มักสั้นเกินสำหรับ stream ที่ใช้เวลานาน |

### Area 3: ASGI/Worker และ Async Correctness — ใช้กับ (A) และ (B)

sync worker หรือ blocking call จะอุด event loop ทำให้ client อื่นรอ ไม่ว่า stream จะ finite หรือไม่:

| Check | ถูก | ผิด |
|-------|-----|-----|
| ASGI server/worker class | `uvicorn app.main:app` หรือ `gunicorn -k uvicorn.workers.UvicornWorker` | `gunicorn app:app` (sync worker default) |
| Sleep ใน generator | `await asyncio.sleep(...)` | `time.sleep(...)` (block ทั้ง event loop) |
| Blocking I/O ใน generator | async client (httpx.AsyncClient, asyncpg) | sync call (`requests.get`, sync DB driver) |

### Area 4: Connection Lifecycle & Resource Leak — ใช้กับ (A) และ (B) คนละน้ำหนัก

| Check | ใช้กับ | เหตุผล |
|-------|-------|--------|
| Generator เช็ค `await request.is_disconnected()` แล้ว break ใน loop เอง | (B) บังคับ | `while True` ที่ไม่มี natural end ต้องเช็คเอง ไม่งั้น loop ค้างไม่จำกัด = memory/connection leak เมื่อมี user เยอะ |
| Generator เช็ค `await request.is_disconnected()` แล้ว break | (A) **⚠️ ไม่บังคับ** | Starlette's `StreamingResponse` ยกเลิก (cancel) generator ให้อัตโนมัติเมื่อ client หลุด — ถ้า `async with`/`async for` ในโค้ดไม่มีอะไร swallow `CancelledError` ไว้ (เช่น `except Exception:` จะไม่โดน เพราะ `CancelledError` เป็น `BaseException` ตั้งแต่ Python 3.8 ไม่ใช่ `Exception`) cancellation จะปิด upstream connection ให้เองผ่าน context manager teardown โดยไม่ต้อง poll เพิ่ม — **สิ่งที่ต้องตรวจจริงสำหรับ (A) คือ ห้ามมี `except:` หรือ `except BaseException:` แบบกว้างที่ไป swallow cancellation** ไม่ใช่การไม่มี `is_disconnected()` |
| `asyncio.Queue()` ที่ใช้ fan-out มี `maxsize=` หรือ eviction policy | (B) เท่านั้น | client ช้ากว่า producer → queue โตไม่จำกัด = memory leak — (A) ไม่มี fan-out queue ภายใน ให้ ⊘ |

### Area 5: Reconnect & Delivery Guarantee — (B) ใช้เต็ม / (A) ⊘ โดย default

| Check | ใช้กับ | ต้องมี |
|-------|-------|-------|
| ส่ง `id:` ต่อ event | (B) | เพื่อให้ resume ได้ตอน reconnect |
| อ่าน header `Last-Event-ID` แล้ว replay event ที่ขาดไป | (B) | ชดเชยข้อมูลที่หายตอนสายหลุด |
| ส่ง `retry: <ms>\n\n` กำหนดจังหวะ reconnect | (B) | ป้องกัน reconnect storm จาก `EventSource` default |
| ทั้ง 3 ข้อข้างบน | (A) | **⊘ โดย default** — finite completion stream ไม่ resume กลางทางด้วย event ID ตามปรกติ (ยกเว้นทำ completion-resume แบบ advanced ซึ่งหายาก — ถ้าเจอให้ตรวจแยกเป็นกรณีพิเศษ ไม่ต้องบังคับ) |

### Area 6: Multi-Replica / Horizontal Scale Safety — (B) ใช้เต็ม / (A) ⊘

| Check | ใช้กับ | ต้องมี |
|-------|-------|-------|
| ห้ามมี in-process fan-out state ระดับ module (เช่น `clients: list = []`) | (B) | จะพังทันทีที่ scale เกิน 1 replica — event ที่ POST เข้ามาอาจตกที่ replica อื่นจากที่ client ถือ connection ไว้ |
| มี shared broker (Redis Pub/Sub, Redis Streams, หรือ NATS) สำหรับ fan-out ข้าม replica | (B) | ถ้าโปรเจคมี FastStream + NATS อยู่แล้ว (จาก `python-starter`) ให้แนะนำใช้ตัวที่มีอยู่ก่อน ไม่ต้องเพิ่ม Redis เป็น broker ที่สอง |
| ทั้ง 2 ข้อข้างบน | (A) | **⊘** — producer (เรียก LLM) กับ connection เป็น process เดียวกันตลอดอายุ request เดียว ไม่มี fan-out ข้าม replica ให้พัง |

### Area 7: Endpoint Design (Browser Connection Cap) — (B) ใช้เต็ม / (A) ⊘

| Check | ใช้กับ | ต้องมี |
|-------|-------|-------|
| ไม่มี SSE endpoint แยกย่อยเกินจำเป็นต่อ concern (เช่น `/events/user`, `/events/chat`, `/events/noti`) | (B) | HTTP/1.1 จำกัด ~6 persistent connections ต่อ domain (HTTP/2 ขยายขึ้นมาก) — ถ้ามีหลาย endpoint ให้รวมเป็นเส้นเดียวแล้วแยกด้วย SSE `event:` field แทน |
| ข้อข้างบน | (A) | **⊘** — POST-per-message completion stream เปิดแล้วปิดทันทีที่จบ ไม่ค้างสะสมแบบ dashboard tab ที่เปิดทิ้งไว้ |

---

## ขั้นตอนการตรวจสอบ

### ขั้นตอนที่ 1: หา streaming endpoint ทั้งหมด

```bash
grep -rn "StreamingResponse\|EventSourceResponse\|text/event-stream" app/
```

### ขั้นตอนที่ 2: ระบุประเภท stream ต่อ endpoint (ขั้นตอนที่ 0)

### ขั้นตอนที่ 3: ตรวจตาม Area ที่เกี่ยวข้องกับประเภทนั้น

อ่าน router/service/infra ของ endpoint นั้น + nginx config/Dockerfile/start command ถ้ามีใน repo

### ขั้นตอนที่ 4: ออก Health Report

```
## Python Streaming Doctor Report — [project name]

### Endpoint: POST /api/chat/stream — ประเภท: (A) Finite/Request-scoped

| Area | Check | Status | หมายเหตุ |
|------|-------|--------|----------|
| 1. Proxy Buffering | X-Accel-Buffering: no | ✅ | |
| 1. Proxy Buffering | nginx proxy_buffering off | ⊘ | ไม่พบ nginx config ใน repo นี้ |
| 2. Timeout/Heartbeat | time-to-first-token risk | ⚠️ | เรียก reasoning model — ควรพิจารณา heartbeat |
| 3. Worker/Async | uvicorn worker | ✅ | |
| 4. Resource Leak | cancellation ไม่ถูก swallow (ไม่มี `except:`/`except BaseException:` คลุม stream) | ✅ | ไม่มี broad except — Starlette cancel generator ให้เองตอน client หลุด |
| 5-7. Reconnect/Scale/Endpoint Cap | — | ⊘ | ไม่เกี่ยวข้องกับ finite stream |

### สรุป
- ❌ Critical: 0 รายการ
- ⚠️ Warning: 1 รายการ
- ✅ ผ่าน: 3 รายการ
- ⊘ ไม่เกี่ยวข้อง/ไม่พบไฟล์: 2 รายการ
```

ทำซ้ำต่อทุก streaming endpoint ที่พบในขั้นตอนที่ 1 — endpoint ประเภท (A) และ (B) ในโปรเจคเดียวกันให้แยกรายงานเป็นคนละ section เสมอ

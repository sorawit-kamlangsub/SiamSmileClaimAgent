
# SSD Python Feature — สร้าง Feature/Endpoint ใหม่จาก Natural Language

## บริบท

ใช้ skill นี้ในโปรเจค FastAPI ที่ setup ด้วย `python-starter` ไปแล้ว เพื่อสร้าง feature ใหม่จากคำอธิบายแบบ natural language (เช่น "I need a streaming AI chat API") ให้เป็นโค้ดตาม Clean Architecture ครบทุก layer (domain → application → infrastructure → api) รองรับทั้ง CRUD ปรกติและ pattern ที่ซับซ้อนกว่า เช่น streaming response และการเรียก external service (LLM API ฯลฯ) — ถ้าต้องการ review code ที่มีอยู่แล้วใช้ `python-review` แทน

## กฎหลัก

1. ต้องตีความ feature description ก่อนเขียนโค้ดเสมอ (ดูขั้นตอนที่ 0) — ห้ามเดาแล้วเริ่มเขียนโค้ดทันทีถ้าข้อมูลไม่พอ ใช้ AskUserQuestion ถาม
2. ต้องสร้างตามลำดับ layer เดียวกับ `python-starter` เสมอ: domain → application → infrastructure → api — ห้ามข้ามลำดับหรือปนกัน
3. Feature ที่ไม่ persist ข้อมูล (เช่น stateless proxy ไป external API) ไม่ต้องสร้าง ORM model / Repository / Migration
4. External service ใดๆ (LLM API, third-party HTTP) ต้องครอบเป็น domain port (`Protocol`) เสมอ ตาม `python-review` Category 7 — ห้าม inject `httpx.AsyncClient` ตรงเข้า service
5. Streaming endpoint: domain/application ต้อง return `AsyncIterator`/`AsyncGenerator` เท่านั้น — ผูกกับ `StreamingResponse` ที่ router layer เท่านั้น
6. ทุก endpoint ใหม่ต้องตาม REST policy เดิม (GET/POST เท่านั้น, ห้าม PUT/PATCH/DELETE)
7. ก่อนเขียนโค้ด CRUD ต้องอ่านไฟล์ `reference/python-starter.md` ด้วย Read tool เพื่อใช้โค้ดตัวอย่างแบบเต็ม — ห้ามเขียนจากความจำ

---

## ขั้นตอนที่ 0: ตีความ Feature Description

จาก feature description ที่ user ให้มา ต้องตอบคำถามเหล่านี้ก่อนเริ่มเขียนโค้ด (ถ้าไม่ชัดเจน ใช้ AskUserQuestion ถาม):

| คำถาม | ผลต่อโค้ด |
|-------|----------|
| ต้อง persist ข้อมูลไหม (เช่น เก็บ conversation history)? | มี → ต้องมี domain entity + ORM model + repository + migration (ขั้นตอนที่ 1) / ไม่มี → ข้าม layer เหล่านี้ |
| Response เป็น request/response ปรกติ หรือ streaming? | ปรกติ → ขั้นตอนที่ 1 / streaming → ขั้นตอนที่ 2 |
| ต้องเรียก external service (LLM API, third-party HTTP) ไหม? | ต้อง → สร้าง domain port + infrastructure adapter ตามขั้นตอนที่ 2.1-2.2 |
| ต้องใช้ messaging (NATS) หรือ background job (scheduler) ไหม? | ต้อง → อ้างอิง FastStream/APScheduler ที่ตั้งไว้แล้วจาก `python-starter` |

สรุปผลลัพธ์เป็น bounded context name (`{context}`, snake_case) และ entity name (`{Entity}`, PascalCase ถ้ามี persist) ก่อนไปขั้นตอนถัดไป — ตัวอย่าง: "streaming AI chat API" → `{context} = chat`, ไม่ persist (เบื้องต้น), streaming = ใช่, external service = ใช่ (LLM)

---

## ขั้นตอนที่ 1: Feature แบบ CRUD ปรกติ (มี persist, ไม่ streaming)

**อ่านไฟล์ `reference/python-starter.md` ด้วย Read tool ก่อนเขียนโค้ด** — ใช้โค้ดตัวอย่างจากระยะที่ 3 (3.1-3.9) ตรงๆ:

1. Domain Entity — `app/domain/{context}/entities.py`
2. Domain Ports — `app/domain/{context}/ports.py`
3. Application Service — `app/application/{context}_service.py`
4. ORM Model — `app/infrastructure/db/models.py`
5. Repository — `app/infrastructure/db/{context}_repository.py`
6. Alembic Migration — `alembic/versions/{YYYYMMDD}_{NNNN}_create_{context}s.py`
7. API Router — `app/api/{context}.py`
8. Dependency — `app/api/deps.py`
9. Register Router — `app/main.py`

ถ้า feature ไม่ persist ข้อมูล ให้ข้ามขั้นตอน 4-6 (ORM/Repository/Migration) — ยังคงต้องมี domain entity ถ้ามี business rule ที่ต้อง validate (เช่น `ChatMessage`) แม้ไม่เก็บลง DB

---

## ขั้นตอนที่ 2: Feature แบบ Streaming + External Service (เช่น AI Chat API)

### 2.1 Domain Port — `app/domain/{context}/ports.py`

Port ของ external service ต้องเป็น `Protocol` เหมือน Repository port — method ที่เป็น async generator ต้องประกาศ `async def` (เหมือน `get_session()` ใน `python-database` — `async def get_session(...) -> AsyncGenerator[AsyncSession, None]: ... yield session`) ห้ามใช้ sync `def`:

```python
from __future__ import annotations
from dataclasses import dataclass
from typing import AsyncIterator, Protocol


@dataclass(slots=True)
class ChatMessage:
    role: str   # "user" | "assistant"
    content: str


class ChatCompletionPort(Protocol):
    async def stream_completion(
        self, *, messages: list[ChatMessage]
    ) -> AsyncIterator[str]: ...
```

### 2.2 Infrastructure Adapter — `app/infrastructure/external/{context}_client.py`

> **หมายเหตุ:** `infrastructure/external/` เป็น subfolder ใหม่ที่ skill นี้กำหนดเพิ่ม (คู่กับ `infrastructure/db/` ที่มีอยู่แล้ว) — `python-starter`/`python-doctor` ยังไม่มี convention ของ subfolder สำหรับ non-DB HTTP client มาก่อน ใช้ `external/` เพื่อแยกจาก `db/` ให้ชัดเจน

ครอบ `httpx.AsyncClient` ไว้เป็น adapter — ห้าม inject `AsyncClient` ตรงเข้า service (ตาม `python-review` Category 7):

```python
from __future__ import annotations
import json
from typing import AsyncIterator
import httpx
from app.domain.chat.ports import ChatMessage


class HttpChatCompletionClient:
    def __init__(self, client: httpx.AsyncClient, *, base_url: str, api_key: str) -> None:
        self._client = client
        self._base_url = base_url
        self._api_key = api_key

    async def stream_completion(
        self, *, messages: list[ChatMessage]
    ) -> AsyncIterator[str]:
        payload = {
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
        }
        headers = {"Authorization": f"Bearer {self._api_key}"}

        async with self._client.stream(
            "POST", f"{self._base_url}/chat/completions", json=payload, headers=headers
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data = line.removeprefix("data: ").strip()
                if data == "[DONE]":
                    break
                chunk = json.loads(data)
                delta = chunk["choices"][0]["delta"].get("content")
                if delta:
                    yield delta
```

### 2.3 Application Service — `app/application/{context}_service.py`

Orchestrate ระหว่าง port + (ถ้ามี) repository — ห้ามใส่ logic เรียก HTTP ตรงในนี้ ต้องผ่าน port เท่านั้น:

```python
from __future__ import annotations
from typing import AsyncIterator
from app.domain.chat.ports import ChatCompletionPort, ChatMessage
from app.observability.logging import get_logger

_logger = get_logger(__name__)


class ChatService:
    def __init__(self, completion_port: ChatCompletionPort) -> None:
        self._completion_port = completion_port

    async def stream_reply(self, *, messages: list[ChatMessage]) -> AsyncIterator[str]:
        _logger.info("chat_stream_started", message_count=len(messages))
        full_reply = ""
        async for chunk in self._completion_port.stream_completion(messages=messages):
            full_reply += chunk
            yield chunk
        _logger.info("chat_stream_completed", reply_length=len(full_reply))
        # ถ้า feature ต้อง persist conversation history ให้ await repository.save(...) ที่นี่ หลัง stream จบ
```

### 2.4 API Router — `app/api/{context}.py`

`StreamingResponse` ต้องอยู่ใน router เท่านั้น domain/application ห้ามรู้จัก FastAPI:

```python
from __future__ import annotations
import json
from typing import AsyncIterator
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.api.deps import get_current_user, get_chat_service
from app.application.chat_service import ChatService
from app.domain.chat.ports import ChatMessage

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessageRequest(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    messages: list[ChatMessageRequest]


async def _to_sse(chunks: AsyncIterator[str]) -> AsyncIterator[str]:
    # ต้อง JSON-encode ทุก chunk ก่อนส่ง — SSE ตัดบรรทัดที่ไม่มี "data: " นำหน้าทิ้ง
    # chunk จาก LLM มักมี \n ปนอยู่ (เช่น code block) ส่ง raw text ตรงๆ จะทำให้ข้อมูลขาดที่ฝั่ง client
    try:
        async for chunk in chunks:
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception:
        # ห้าม raise HTTPException ที่นี่ — header/status ถูกส่งไปแล้วตั้งแต่ chunk แรก
        # ต้องส่ง error เป็น event ภายใน stream แทน
        yield 'event: error\ndata: {"message": "stream failed"}\n\n'


@router.post("/stream")
async def stream_chat(
    body: ChatStreamRequest,
    user: dict = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    messages = [ChatMessage(role=m.role, content=m.content) for m in body.messages]
    chunks = service.stream_reply(messages=messages)
    return StreamingResponse(
        _to_sse(chunks),
        media_type="text/event-stream",
        # ห้ามลืม 2 header นี้ — reverse proxy (Nginx/Cloudflare/ALB) จะ buffer response
        # ไว้ก่อนแล้วค่อยส่งทีเดียวถ้าไม่มี ทำให้ token ไม่ stream จริงตอนขึ้น production
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )
```

> **ข้อควรระวัง:** หลัง `StreamingResponse` ส่ง header ไปแล้ว (ตั้งแต่ chunk แรก) จะเปลี่ยน HTTP status ไม่ได้อีก — error ที่เกิดกลางทาง (เช่น LLM API ล้ม) ต้อง catch แล้วส่งเป็น event ภายใน stream (ตัวอย่างข้างบน) ห้าม raise `HTTPException`/`DomainError` ออกมาหลังจาก yield chunk แรกไปแล้ว

### 2.5 Wiring

**`app/main.py`** — สร้าง `httpx.AsyncClient` ใน `lifespan()` พร้อม timeout (ตาม `python-review` Category 7):

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    timeout = httpx.Timeout(connect=2.0, read=30.0, write=5.0, pool=2.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        app.state.http_client = client
        yield
```

**`app/api/deps.py`** — wiring port + service เหมือน pattern `get_{context}_service` ของ `python-starter`:

```python
from fastapi import Request


def get_chat_service(request: Request) -> ChatService:
    from app.infrastructure.external.chat_client import HttpChatCompletionClient
    from app.application.chat_service import ChatService

    # settings โหลดจาก config/settings.yaml (ตาม python-starter ขั้นตอนที่ 1.3) —
    # import ตาม config loader ที่โปรเจคใช้จริง ไม่ได้กำหนด path ตายตัวในสกิลนี้
    client = HttpChatCompletionClient(
        request.app.state.http_client,
        base_url=settings.llm_base_url,
        api_key=settings.llm_api_key,
    )
    return ChatService(client)
```

---

## ตัวอย่างแบบสมบูรณ์: Streaming AI Chat API

ไฟล์ที่ต้องสร้าง/แก้ทั้งหมดสำหรับ feature "streaming AI chat API" (ไม่ persist conversation, เรียก external LLM):

```
app/domain/chat/ports.py                     # ChatMessage, ChatCompletionPort (2.1)
app/infrastructure/external/chat_client.py   # HttpChatCompletionClient (2.2)
app/application/chat_service.py              # ChatService.stream_reply (2.3)
app/api/chat.py                              # POST /api/chat/stream (2.4)
app/api/deps.py                              # get_chat_service (2.5)
app/main.py                                  # httpx.AsyncClient ใน lifespan (2.5)
```

ถ้า feature ต้องการเก็บ conversation history เพิ่ม ให้ทำตามขั้นตอนที่ 1 คู่กัน (Entity `Conversation`/`Message`, Repository, Migration) แล้วเรียก repository หลัง stream จบใน `ChatService.stream_reply` (ดู comment ในขั้นตอนที่ 2.3)

---

## ขั้นตอนที่ 3: Verify

```bash
# รัน tests
uv run pytest

# เริ่ม server
uv run uvicorn app.main:app --reload

# ทดสอบ stream จริง — ต้องเห็น chunk ไหลออกมาเรื่อยๆ ไม่ใช่รอจบทีเดียว
curl -N -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}]}'
```

ถ้า `curl -N` แสดงผลทีเดียวตอนจบ (ไม่ stream จริง) ให้ตรวจ:
- มี middleware/proxy buffer response อยู่หรือไม่ (เช่น GZip middleware ครอบ StreamingResponse)
- `media_type="text/event-stream"` ถูกตั้งหรือไม่

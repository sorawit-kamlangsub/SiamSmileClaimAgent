---
name: ssd
description: "มาตรฐานการพัฒนาซอฟต์แวร์ของทีม SSD: React/TypeScript, .NET Core, Python, Git — ใช้เมื่อเขียนโค้ด, review, refactor, ตั้งค่าโปรเจค, หรือถามเรื่อง conventions ของ Smile Solution Development"
user-invocable: true
argument-hint: <command|partial> [target]
allowed-tools:
  - AskUserQuestion
  - Read
  - Glob
  - Bash
---

# SSD Agent Skills

คุณคือ AI assistant ที่ช่วยทีม Smile Solution Development (SSD) เขียนโค้ดตามมาตรฐานของทีม

## วิธีใช้

พิมพ์ `/ssd <command>` เพื่อเรียกใช้คำสั่ง เช่น:
- `/ssd frontend-setup` — ตั้งค่าโปรเจค React/TypeScript
- `/ssd git-commit` — เขียน commit message ตามมาตรฐาน
- `/ssd python-review` — review Python code

## คำสั่งที่มี (37 commands)

### Frontend (React + TypeScript)

| Command | รายละเอียด |
|---------|-----------|
| `frontend-init` | เริ่มโปรเจค Frontend ใหม่จาก react-ts-template-2023 v1.2.0 |
| `backend-init` | เริ่มโปรเจค Backend ใหม่จาก Net60_ApiTemplate_2023 (202306) |
| `frontend-setup` | ตั้งค่าโปรเจค React/TS ใหม่ — folder structure, tools, naming conventions |
| `frontend-feature` | สร้าง feature ใหม่จาก natural language — components, pages, Redux slice, API client ครบ |
| `react-component` | มาตรฐาน React functional component, Props typing, hooks |
| `react-form` | Formik form implementation กับ MUI |
| `react-state` | Redux slice, dispatch patterns |
| `react-api` | API client ด้วย Axios, React Query, NSwag |

### Backend (.NET Core)

| Command | รายละเอียด |
|---------|-----------|
| `backend-setup` | ตั้งค่าโปรเจค ASP.NET Core 6 ใหม่ |
| `backend-feature` | สร้าง feature ใหม่จาก natural language — Service, Controller, DTO ครบ (database-first, ต้องมี EF Core Model ก่อน) |
| `dotnet-controller` | ASP.NET API controllers, routing, authorization |
| `dotnet-service` | Service layer, DTO, AutoMapper |
| `dotnet-infra` | Serilog logging, Quartz jobs, RestSharp HTTP clients |
| `dotnet-scaffold` | EF Core Reverse Engineer ผ่าน CLI — dotnet ef dbcontext scaffold พร้อม SSD conventions |
| `dotnet-ef-query` | EF Core query patterns — AsNoTracking, Include, pagination, transaction, async |
| `database` | EF Core Reverse Engineer, database naming conventions |

### Python

| Command | รายละเอียด |
|---------|-----------|
| `python-starter` | เริ่มโปรเจค FastAPI ใหม่ด้วย Clean Architecture |
| `python-feature` | สร้าง feature/endpoint ใหม่จาก natural language — CRUD และ streaming + external service |
| `python-review` | Review Python code (architecture, HTTP methods, logging, SQLAlchemy) |
| `python-refactor` | Refactor .py files อย่างปลอดภัยพร้อม pytest |
| `python-database` | PostgreSQL + SQLAlchemy 2.x: naming, ORM models, Alembic migration |

### Review & Refactor

| Command | รายละเอียด |
|---------|-----------|
| `ts-fix-unused` | แก้ TS6133/TS6196 build errors — @ts-nocheck สำหรับ NSwag files, @ts-ignore สำหรับ manual code |
| `frontend-review` | Review React/TypeScript code |
| `backend-review` | Review C#/.NET code |
| `frontend-refactor` | Refactor .tsx/.ts files อย่างปลอดภัย |
| `backend-refactor` | Refactor .cs files อย่างปลอดภัย |

### Git & Release

| Command | รายละเอียด |
|---------|-----------|
| `git-commit` | Conventional Commits, Semantic Versioning |
| `git-flow` | Git Flow workflow, branch naming, pull request standards |
| `release-it-setup` | ตั้งค่า release-it สำหรับ automated GitHub releases |

### Specialized

| Command | รายละเอียด |
|---------|-----------|
| `contact-skill-gen` | สร้าง SKILL.md สำหรับ shared libraries |
| `bug-auth-redirect` | แก้ white screen / auth redirect loop |
| `bug-version-checker` | แก้ version cache race condition |

### Doctor (Project Health)

| Command | รายละเอียด |
|---------|-----------|
| `frontend-doctor` | ตรวจสุขภาพโปรเจค React/TypeScript — dependencies, config, folder structure, ENV pattern |
| `backend-doctor` | ตรวจสุขภาพโปรเจค ASP.NET Core — NuGet packages, middleware pipeline, appsettings |
| `python-doctor` | ตรวจสุขภาพโปรเจค FastAPI — dependencies, Clean Architecture layers, main.py wiring |
| `python-streaming-doctor` | ตรวจ production-readiness ของ SSE/streaming endpoint — proxy buffering, timeout, worker, resource leak, multi-replica |
| `db-doctor` | ตรวจสุขภาพ Database schema — standard columns, datetime2, naming, SP prefix |

## วิธีตอบสนองต่อคำสั่ง

เมื่อผู้ใช้พิมพ์ `/ssd <command>`:

1. **ตรงกับคำสั่งใดคำสั่งหนึ่งทั้งหมด (exact match)** — โหลดไฟล์ reference ที่ตรงกันจาก `reference/<command>.md`, ปฏิบัติตามมาตรฐาน SSD ที่ระบุในไฟล์นั้นทุกข้อ, เขียนโค้ดตาม conventions ที่กำหนดเท่านั้น ห้ามเบี่ยงเบน
2. **ไม่ได้ระบุคำสั่ง หรือพิมพ์ `help` / `--help` / `-h` / `?` / `-?`** — แสดงรายการคำสั่งทั้งหมดข้างต้น (จัดกลุ่มตามหมวด) แล้วถามว่าต้องการใช้คำสั่งใด
3. **พิมพ์ไม่ครบ/ไม่ตรงกับคำสั่งใดเลย (partial)** — แตกชื่อคำสั่งทั้งหมดด้วย `-` เป็น segment แล้วค้นหาคำสั่งที่มี segment ใด segment หนึ่ง "ขึ้นต้น" ด้วยข้อความที่พิมพ์ (prefix match ต่อ segment, ไม่สนตัวพิมพ์เล็ก/ใหญ่) ครอบคลุมทั้ง segment แรก (หมวด) และ segment ท้าย (keyword) เช่น:
   - พิมพ์ `dotn` → ตรงกับ segment แรกของ `dotnet-controller`, `dotnet-service`, `dotnet-infra`, `dotnet-scaffold`, `dotnet-ef-query` (5 คำสั่ง → แสดงเป็น plain text ห้ามใช้ AskUserQuestion)
   - พิมพ์ `doctor` → ตรงกับ segment ท้ายของ `frontend-doctor`, `backend-doctor`, `python-doctor`, `db-doctor`
   - พิมพ์ `review` → ตรงกับ segment ท้ายของ `frontend-review`, `backend-review`, `python-review`
   - **เจอ 1 คำสั่ง** — แนะนำคำสั่งนั้นทันที พร้อมคำอธิบายสั้นๆ และบรรทัด "ลองพิมพ์: `/ssd <command>`"
   - **เจอมากกว่า 1 คำสั่ง แต่ไม่เกิน 4 คำสั่ง** — แสดงเฉพาะคำสั่งที่ตรง (ไม่ใช่ทั้งหมด) พร้อมคำอธิบาย แล้วใช้ AskUserQuestion ถามผู้ใช้ว่าต้องการคำสั่งใดจากรายการที่ตรงนั้น (ใส่ทุกคำสั่งที่ตรงเป็น option — AskUserQuestion รับ option ได้สูงสุด 4 ตัวเท่านั้น)
   - **เจอมากกว่า 4 คำสั่ง** — **ห้ามใช้ AskUserQuestion** (option เกิน 4 จะถูกตัดออกบางส่วนโดยไม่มีกฎว่าตัดตัวไหน ทำให้บางคำสั่งเลือกไม่ได้) แสดงรายการคำสั่งที่ตรงทั้งหมดเป็นข้อความ แล้วถามให้ผู้ใช้พิมพ์ชื่อคำสั่งที่ต้องการจากรายการนั้นแทน
   - **ไม่เจอเลย** — fallback กลับไปแสดงรายการคำสั่งทั้งหมดและถามว่าต้องการใช้คำสั่งใด (เหมือนข้อ 2)

## บริบทร่วม (Shared Standards)

มาตรฐานเหล่านี้ใช้กับทุก skill:

**Stack หลัก:**
- Frontend: React 18.2 + TypeScript + Vite 4.3.9 + MUI v5
- Backend: ASP.NET Core 6 + Entity Framework Core 6
- Python: FastAPI + SQLAlchemy 2.x + Clean/Hexagonal Architecture

**Encoding:** UTF-8, line ending CRLF (Windows)

**Naming:**
- TypeScript: PascalCase (class/component), camelCase (var/func), CONSTANT_CASE (constants)
- C#: PascalCase (class/method), camelCase (local), `_camelCase` (private field)
- Python: snake_case (func/var), PascalCase (class)

**ข้อห้ามสากล:**
- ห้ามใช้ `any` type ใน TypeScript
- ห้ามใช้ f-string ใน logging (Python)
- ห้าม DELETE/PUT/PATCH ใน API ทุก stack (C#/.NET, Python) — มาตรฐานบริษัทใช้ REST API ไม่ใช่ RESTful มี HTTP method แค่ GET กับ POST เท่านั้น ใช้ POST + action path เช่น `{id}/update`, `{id}/delete`

config file: CLAUDE.md
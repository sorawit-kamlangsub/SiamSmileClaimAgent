
# SSD Frontend Feature — สร้าง Feature ใหม่จาก Natural Language

## บริบท

ใช้ skill นี้ในโปรเจค React/TypeScript ที่ setup ด้วย `frontend-setup` ไปแล้ว เพื่อสร้าง feature ใหม่จากคำอธิบายแบบ natural language (เช่น "หน้ารายการ order พร้อมค้นหาและฟอร์มเพิ่มข้อมูล") ให้เป็นโค้ดครบทุกชั้นของ module เดียว (components → pages → Redux slice → API client) — ถ้าต้องการ review code ที่มีอยู่แล้วใช้ `frontend-review` แทน ถ้าต้องการแค่ component เดียวไม่ครบ module ใช้ `react-component`/`react-form`/`react-state`/`react-api` ตรงๆ

## กฎหลัก

1. ต้องตีความ feature description ก่อนเขียนโค้ดเสมอ (ดูขั้นตอนที่ 0) — ห้ามเดาแล้วเริ่มเขียนโค้ดทันทีถ้าข้อมูลไม่พอ ใช้ AskUserQuestion ถาม
2. ทุก module ต้องมีโครงสร้าง `components/` + `pages/` subfolder พร้อม `index.ts` barrel ตาม `react-component.md` กฎข้อ 8-10 — ห้ามวางไฟล์ลอยที่ root ของ module
3. **List/table page ที่มี pagination หรือ search/filter ต้องสร้าง Redux slice เสมอ** ตาม `react-state.md` กฎข้อ 6 — ห้ามใช้ local `useState` แทน แม้จะตีความว่า feature นี้ "ไม่ซับซ้อน" ก็ตาม
4. ก่อนเขียนโค้ดแต่ละชั้น ต้องอ่านไฟล์ reference ของชั้นนั้นด้วย Read tool ก่อนเสมอ (`react-component.md`, `react-state.md`, `react-api.md`, `react-form.md`) — ห้ามเขียนจากความจำ
5. ทุก endpoint ที่เรียกผ่าน API client ต้องตาม REST policy เดิม (GET/POST เท่านั้น, ห้าม PUT/PATCH/DELETE)
6. ชื่อ Module ต้องเป็น PascalCase ไม่เกิน 3 คำ ตาม `frontend-setup.md`

---

## ขั้นตอนที่ 0: ตีความ Feature Description

จาก feature description ที่ user ให้มา ต้องตอบคำถามเหล่านี้ก่อนเริ่มเขียนโค้ด (ถ้าไม่ชัดเจน ใช้ AskUserQuestion ถาม):

| คำถาม | ผลต่อโค้ด |
|-------|----------|
| ชื่อ Module คืออะไร (PascalCase, ไม่เกิน 3 คำ)? | ใช้เป็นชื่อ folder ใน `src/app/modules/[ModuleName]/` |
| มีหน้ารายการ/ตาราง พร้อม pagination หรือ search/filter ไหม? | มี → **ต้อง** สร้าง Redux slice (ขั้นตอนที่ 3) ตามกฎข้อ 3 / ไม่มี → ข้ามได้ |
| มีฟอร์มสำหรับ submit ข้อมูลไหม? | มี → สร้างด้วย Formik (ขั้นตอนที่ 4) |
| ต้องเรียก backend API ไหม? | ต้อง → สร้าง API client (ขั้นตอนที่ 2) ก่อนเขียน component ที่ใช้ข้อมูลนั้น |

สรุปผลลัพธ์เป็นชื่อ Module (`{ModuleName}`, PascalCase) ก่อนไปขั้นตอนถัดไป — ตัวอย่าง: "หน้ารายการ order พร้อมค้นหาและฟอร์มเพิ่มข้อมูล" → `{ModuleName} = Order`, มี list+search (ต้องมี Redux), มี form (Formik), ต้องเรียก API

---

## ขั้นตอนที่ 1: สร้างโครงโมดูล

สร้างโครงสร้างไฟล์เปล่าก่อนตาม `frontend-setup.md`:

```
src/app/modules/[ModuleName]/
├── components/
│   └── index.ts      # barrel — เติม export เมื่อสร้าง component จริงในขั้นตอนถัดไป
├── pages/
│   ├── IndexPage.tsx # ทุก module ต้องมี — หน้าแรกของ module
│   └── index.ts      # barrel
└── [moduleName]Slice.ts  # เฉพาะกรณีมี list/pagination/search (ขั้นตอนที่ 3)
```

## ขั้นตอนที่ 2: API Client (ถ้าต้องเรียก backend)

**อ่านไฟล์ `reference/react-api.md` ด้วย Read tool ก่อนเขียนโค้ด** — รัน `npm run codegen` จริงด้วย Bash ก่อนเขียน client เอง (ตามกฎข้อ 2 ของไฟล์นั้น) แล้วทำตามลำดับนี้ครบทุกขั้น **ห้ามข้ามขั้นตอนเปลี่ยนชื่อไฟล์**:

1. รัน `npm run codegen` แล้วเช็ค `git status src/app/api/` ดูไฟล์ที่ถูกสร้าง — ไฟล์ดิบจะตั้งชื่อตาม **hostname** ของ `VITE_API_URL` (เช่น `localhost.api.ts`) ไม่ใช่ชื่อ module
2. **เปลี่ยนชื่อไฟล์ดิบนั้นทันที** ตาม class ที่ generate ออกมาในไฟล์ (เช่นเจอ `export class ChatClient` → เปลี่ยนชื่อเป็น `chatApi.client.ts`) เก็บไว้ที่ root ของ `src/app/api/` — ห้ามเหลือชื่อ hostname เดิมไว้ในโปรเจค
3. สร้าง wrapper ที่ `src/app/api/query/[moduleName]Api.api.ts` ที่ **import จากไฟล์ที่เปลี่ยนชื่อแล้วในขั้นที่ 2** (เช่น `import { ChatClient } from "../chatApi.client"`) — ห้าม import จากไฟล์ hostname เดิม
4. เขียน React Query hooks ใน `src/app/api/query/[moduleName].query.ts` ที่ import wrapper จากขั้นที่ 3

## ขั้นตอนที่ 3: Redux Slice (ถ้ามี list/pagination/search)

**อ่านไฟล์ `reference/react-state.md` ด้วย Read tool ก่อนเขียนโค้ด** — สร้าง `src/app/modules/[ModuleName]/[moduleName]Slice.ts` ตามรูปแบบ pagination/searchParams (หัวข้อ "Pagination/Search ของ List/Table Page" ในไฟล์นั้น) แล้วเพิ่ม reducer เข้า `src/redux/rootReducer.ts`

## ขั้นตอนที่ 4: Form (ถ้ามี)

**อ่านไฟล์ `reference/react-form.md` ด้วย Read tool ก่อนเขียนโค้ด** — ใช้ `useFormik` พร้อม `enableReinitialize: true` เมื่อ initial values มาจาก API, declare และ export type ของ form values เสมอ

## ขั้นตอนที่ 5: Component และ Page

**อ่านไฟล์ `reference/react-component.md` ด้วย Read tool ก่อนเขียนโค้ด** — เขียน component ใน `components/`, page ใน `pages/`, เพิ่ม named re-export เข้า barrel `index.ts` ของทั้งสอง folder ทุกครั้งที่สร้างไฟล์ใหม่

---

## ตัวอย่างแบบสมบูรณ์: หน้ารายการ Order พร้อมค้นหาและฟอร์มเพิ่มข้อมูล

ไฟล์ที่ต้องสร้าง/แก้ทั้งหมดสำหรับ feature นี้ (`{ModuleName} = Order`, มี list+search → ต้องมี Redux, มี form, เรียก API):

```
src/app/api/orderApi.client.ts                 # NSwag generated (2)
src/app/api/query/orderApi.api.ts              # wrapper (2)
src/app/api/query/order.query.ts               # React Query hooks (2)
src/app/modules/Order/orderSlice.ts            # pagination + searchParams state (3)
src/redux/rootReducer.ts                       # เพิ่ม order reducer (3)
src/app/modules/Order/components/OrderTable.tsx   # ตาราง (5)
src/app/modules/Order/components/OrderForm.tsx    # ฟอร์มเพิ่มข้อมูล ด้วย Formik (4, 5)
src/app/modules/Order/components/index.ts      # barrel (5)
src/app/modules/Order/pages/IndexPage.tsx      # หน้าหลัก ผูก Table + Form + Redux selector (5)
src/app/modules/Order/pages/index.ts           # barrel (5)
```

`pages/IndexPage.tsx` อ่าน pagination/searchParams จาก Redux selector แล้วส่งเป็น params ให้ React Query hook (`useOrderGetAll`) ตามตัวอย่างผสมใน `react-state.md` หัวข้อ "Pagination/Search ของ List/Table Page"

---

## ขั้นตอนที่ 6: Verify

```bash
npx tsc --noEmit
npm run dev
```

เปิดหน้า module ใหม่ในเบราว์เซอร์ ตรวจว่า: list โหลดข้อมูลจริง, เปลี่ยนหน้า/ค้นหาแล้ว Redux state เปลี่ยนตาม (เช็คผ่าน Redux DevTools), ฟอร์ม submit แล้วเรียก API จริงและแสดง error ถ้า `isSuccess` เป็น false

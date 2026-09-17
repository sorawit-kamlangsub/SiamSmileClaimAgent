
# SSD Frontend Doctor — ตรวจสุขภาพโปรเจค React/TypeScript

## บริบท

ใช้ skill นี้เพื่อ diagnose โปรเจค React/TypeScript ว่าถูกตั้งค่าตาม SSD standards ครบถ้วนหรือไม่ ตรวจ dependencies, config files, folder structure, และ integration points — ไม่ใช่ code quality (ใช้ `ssd-frontend-review` สำหรับนั้น)

---

## กฎหลัก

1. อ่านไฟล์เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน doctor
2. ตรวจ package.json ก่อนเสมอ — version mismatch ถือเป็น ❌
3. ตรวจ folder structure โดย list ไฟล์จริง ไม่ตรวจจาก memory
4. ตรวจ window.__CONST__ENV__ ใน public/index.html หรือ index.html
5. ตรวจ Redux typed hooks ว่า export `useAppSelector` และ `useAppDispatch`
6. รายงาน ✅ ผ่าน / ❌ พบปัญหา / ⚠️ ไม่แน่ใจ / ⊘ ไม่พบไฟล์ ต่อทุก check item

---

## Checklist การตรวจสอบ

### Area 1: Dependencies (package.json)

| Package | Version ที่ต้องการ | หมายเหตุ |
|---------|------------------|----------|
| `react` | `^18.2.0` | |
| `typescript` | `^5.x` หรือ `^4.x` | |
| `vite` | `^4.3.9` | devDependency |
| `@mui/material` | `^5.x` | |
| `@emotion/react` | `^11.x` | peer dep ของ MUI |
| `@emotion/styled` | `^11.x` | peer dep ของ MUI |
| `formik` | ใดๆ | |
| `yup` | ใดๆ | |
| `@tanstack/react-query` | `^4.x` หรือ `^5.x` | |
| `axios` | ใดๆ | |
| `@reduxjs/toolkit` | ใดๆ | |
| `react-redux` | ใดๆ | |
| `react-router-dom` | `^6.x` | |

### Area 2: Config Files

| ไฟล์ | สิ่งที่ต้องมี |
|------|-------------|
| `tsconfig.json` | `"strict": true` |
| `vite.config.ts` | ไฟล์ต้องมีอยู่ |
| `.env.example` | ไฟล์ต้องมีอยู่ (template ตัวแปร env) |
| `eslint.config.*` หรือ `.eslintrc.*` | ไฟล์ใดไฟล์หนึ่งต้องมีอยู่ |

### Area 3: Folder Structure (src/)

| Path | ต้องมี |
|------|-------|
| `src/app/modules/` | โฟลเดอร์ feature modules |
| `src/components/` | shared components |
| `src/redux/` หรือ `src/store/` | Redux setup |
| `src/utils/` | utility functions |
| `src/services/` หรือ `src/api/` | API clients / NSwag generated |

ตรวจ `src/app/api/` ที่ root (ไม่รวม `query/`) เพิ่ม — ไฟล์ NSwag generated ทุกไฟล์ต้องเปลี่ยนชื่อตาม class ที่ generate (`react-api.md` ขั้นตอนที่ 4) ห้ามเหลือชื่อตาม hostname ของ `VITE_API_URL` (เช่น `localhost.api.ts`, `staging.api.ts`) ค้างอยู่ → พบแล้ว = ❌

สำหรับแต่ละ module folder ที่เจอใน `src/app/modules/` (ไม่รวม `_auth`, `_common`) ตรวจเพิ่ม:

| Check | ต้องมี |
|-------|-------|
| ชื่อ module folder | PascalCase (เช่น `Order/` ไม่ใช่ `order/`) |
| `[Module]/components/` subfolder | มีอยู่จริง (ไม่ใช่ไฟล์ component ลอยที่ root ของ module) |
| `[Module]/pages/` subfolder | มีอยู่จริง พร้อม `IndexPage.tsx` |

### Area 4: window.__CONST__ENV__ Pattern

ค้นหาใน `index.html` หรือ `public/index.html`:
```html
window.__CONST__ENV__ = {
  VITE_API_URL: "${VITE_API_URL}"
  ...
}
```
ถ้าไม่พบ → ❌ ต้อง inject env vars ผ่าน `window.__CONST__ENV__` ไม่ใช่ `import.meta.env`

### Area 5: Redux Typed Hooks

ค้นหาใน `src/redux/hook.ts` หรือ `src/store/hook.ts`:
- export `useAppSelector` (typed selector)
- export `useAppDispatch` (typed dispatch)

---

## ขั้นตอนการตรวจสอบ

### ขั้นตอนที่ 1: ระบุ root ของโปรเจค

```
# หา package.json
# ถ้าไม่บอก path ให้ถาม หรือ glob หา package.json ใกล้สุด
```

### ขั้นตอนที่ 2: อ่านและตรวจทุก Area

อ่าน package.json, tsconfig.json, index.html และ list folders ใน src/

### ขั้นตอนที่ 3: ออก Health Report

```
## Frontend Doctor Report — [project name]

### Area 1: Dependencies
| Package | Status | พบ | ต้องการ |
|---------|--------|----|---------|
| react | ✅ | 18.2.0 | ^18.2.0 |
| @mui/material | ❌ | 4.11.0 | ^5.x |
| formik | ✅ | 2.4.5 | ใดๆ |

### Area 2: Config Files
| ไฟล์ | Status | หมายเหตุ |
|------|--------|----------|
| tsconfig.json (strict) | ✅ | |
| .env.example | ❌ | ไม่พบไฟล์ |

### Area 3: Folder Structure
| Path | Status |
|------|--------|
| src/app/modules/ | ✅ |
| src/redux/ | ⚠️ พบ src/store/ แทน |
| Order/ — PascalCase | ✅ |
| Order/components/, Order/pages/ | ✅ |
| productCategory/ — PascalCase | ❌ ควรเป็น ProductCategory/ |
| productCategory/components/, pages/ | ❌ ไม่พบ subfolder — ไฟล์ลอยที่ root ของ module |

### Area 4: ENV Pattern
| Check | Status |
|-------|--------|
| window.__CONST__ENV__ | ✅ |

### Area 5: Redux Typed Hooks
| Export | Status |
|--------|--------|
| useAppSelector | ✅ |
| useAppDispatch | ❌ ไม่พบใน hook.ts |

### สรุป
- ❌ Critical: X รายการ — ต้องแก้ก่อนพัฒนา
- ⚠️ Warning: X รายการ — ควรแก้
- ✅ ผ่าน: X รายการ
- แนะนำ: [ขั้นตอนถัดไป เช่น ใช้ ssd-frontend-setup เพื่อ setup ที่ขาดหายไป]
```

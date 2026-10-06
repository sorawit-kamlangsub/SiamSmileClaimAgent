
# SSD Frontend Setup — การตั้งค่าโปรเจค Frontend

## บริบท

Frontend ของ SSD ใช้ React + TypeScript (TSX) เป็นหลัก โดยมี Template มาตรฐานที่ดาวน์โหลดได้จาก GitHub Organization ของ SSD ทุกโปรเจคต้องใช้ Template เดียวกันและ Package ชุดเดียวกัน

## กฎหลัก

1. ต้องใช้ TypeScript + TSX เสมอ ห้ามใช้ JavaScript ล้วน
2. ต้องใช้ Template ของ SSD เป็นพื้นฐาน ห้ามสร้างโปรเจคเปล่าเอง
3. ต้องบันทึกไฟล์ทุกไฟล์เป็น encoding UTF-8 และลงท้ายบรรทัดด้วย CRLF
4. ต้องใช้ Package ที่กำหนดเท่านั้น หากจะใช้ Package อื่นต้องปรึกษาหัวหน้างานก่อน
5. ต้องปฏิบัติตาม Style Guide อย่างสม่ำเสมอ: ไฟล์ใหม่ต้องใช้ Style Guide ทันที

## เครื่องมือที่ต้องติดตั้ง

**VS Code Extensions:**
- Auto Close Tag
- Auto Rename Tag
- ESLint
- Path Intellisense
- Prettier - Code formatter
- ES7+ React/Redux/React-Native snippets
- Error Lens

**Chrome Extensions:**
- Redux Devtools
- React Developer Tools

**Prettier Config (ตั้งค่าใน .prettierrc):**
```json
{
  "trailingComma": "es5",
  "tabWidth": 4,
  "semi": true,
  "singleQuote": false,
  "printWidth": 120,
  "editorconfig": false,
  "eslintIntegration": true,
  "stylelintIntegration": true,
  "endOfLine": "crlf"
}
```

## Package มาตรฐานที่ต้องใช้

**ต้องใช้:**
- Vite 4.3.9, React 18.2
- @mui/material ^5.13.4 — UI components
- @tanstack/react-query ^4.29.17 — API state management
- axios 1.4.0 — HTTP client
- formik 2.4.1 — Form management
- react-redux 8.0.7, redux-persist 6.0.0 — State management
- react-router-dom 6.12.1 — Routing
- oidc-client-ts 2.2.4 — SSO/Identity Server
- dayjs 1.11.8, @mui/x-date-pickers ^6.9.0 — Date handling
- sweetalert2 11.7.12 — Popup dialogs

**ควรใช้ตามความเหมาะสม:**
- zod ^3.22.4 + zod-formik-adapter ^1.2.0 — Validation
- apexcharts ^3.35.0 — Charts
- pdfmake ^0.2.10, html-to-image ^1.11.11 — Export

## โครงสร้าง Folder มาตรฐาน

```
src/app/
├── layout/          # Template layout (ไม่ควรแก้ไข)
├── api/             # API client files
│   ├── orderApi.client.ts   # NSwag generated (root)
│   └── query/
│       ├── orderApi.api.ts  # wrapper — instantiate client
│       └── order.query.ts   # React Query hooks
├── modules/         # UI screens และ components
│   ├── _common/    # Shared components (Template, ไม่ควรแก้)
│   ├── _auth/      # Auth components (Template, ไม่ควรแก้)
│   └── Order/      # ชื่อ Module ต้องขึ้นต้นด้วยตัวใหญ่
│       ├── components/
│       │   ├── OrderTable.tsx
│       │   ├── OrderTable.hook.tsx
│       │   └── index.ts
│       ├── pages/
│       │   ├── IndexPage.tsx    # หน้าแรกของ module ต้องชื่อนี้
│       │   ├── OrderPage.tsx    # ทุก page ต้องลงท้ายด้วย Page
│       │   └── index.ts
│       ├── orderSlice.ts
│       └── orderSchema.ts      # (ไม่บังคับ) Zod validation สำหรับ search/filter params
├── routes/
│   ├── Routes.tsx        # Route configuration
│   └── ASideMenuList.tsx # Sidebar menu
└── redux/                # Redux store configuration

src/
├── const.ts              # Constants และ environment variables
└── vite-env.d.ts         # Type definitions สำหรับ env vars
```

## Naming Conventions

### TypeScript/JavaScript
| รูปแบบ | ใช้กับ |
|--------|--------|
| `PascalCase` | class, interface, type, enum, component functions, TSX |
| `camelCase` | variable, parameter, function, method, property |
| `CONSTANT_CASE` | global constants, enum values |

- ตัวย่อ 2+ คำ: ตัวใหญ่ทั้งหมด เช่น `DTO`, `API`, `HTML`
- ตัวย่อ 1 คำ: PascalCase เช่น `Id`, `Doc`, `Cust`
- ห้ามใช้ `any` type — ให้ใช้ `unknown` หรือ type ที่ชัดเจน
- ห้ามใช้ `{}` type — ให้ใช้ `Record<string, T>` แทน

### React/File Naming
- ไฟล์ component ใช้ `.tsx` เสมอ
- ชื่อไฟล์ component: PascalCase เช่น `ReservationCard.tsx`
- Component หลักของ folder ชื่อ `index.tsx`
- Module names: PascalCase, ไม่เกิน 3 คำ
- Page names: ขึ้นต้นตัวใหญ่, ลงท้ายด้วย `Page`
- Component naming suffixes: `Container`, `View`, `Card`, `Form`, `Table`, `List`, `Item`

### Route Naming
- ตัวพิมพ์เล็กทั้งหมด, ใช้ `-` แทน space
- ห้ามใช้เครื่องหมายวรรคตอน
- ไม่เกิน 70 ตัวอักษร

## ขั้นตอนการตั้งค่า Environment Variables

### ขั้นตอนที่ 1: เพิ่ม Type ใน vite-env.d.ts
```typescript
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SSO_ISSUER: string;
    // ชื่อ config ต้องขึ้นต้นด้วย VITE_ เสมอ
}
```

### ขั้นตอนที่ 2: ตั้งค่าใน .env files
```
VITE_APP_NAME = "ชื่อระบบ"
VITE_APP_VERSION = "1.0.0"
VITE_BASE_URL = "https://..."
VITE_API_URL = "https://...api..."
VITE_SSO_ISSUER = "https://...sso..."
VITE_SSO_CLIENT_ID = "..."
VITE_SSO_SCOPE = "openid profile roles email ..."
```

| ไฟล์ | ใช้กับ |
|------|--------|
| `.env` | ค่าพื้นฐาน |
| `.env.production` | Production |
| `.env.uat` | UAT |
| `.env.dev` | Development |
| `.env.local` | เครื่องตัวเอง |

### ขั้นตอนที่ 3: Export ผ่าน const.ts (แนะนำ)
```typescript
// /src/const.ts
export { VITE_BASE_URL, VITE_API_URL } = window.__CONST__ENV__;
```

```typescript
// เรียกใช้ใน Component
import { API_URL } from '../Const';
```

> ห้ามใช้ `import.meta.env` โดยตรง ให้ใช้ `window.__CONST__ENV__` หรือผ่าน const.ts

## RPA & Automation Test

เพื่อให้ component สามารถทดสอบด้วย RPA และ automation test ได้:
1. Standard form components ทุกตัวต้องใช้งานได้ตามปกติ
2. Button ต้องใส่ attribute `name`
3. Label, Typography ที่แสดงผล ต้องใส่ `name`
4. Dynamic render component ต้องใส่ attribute `id`

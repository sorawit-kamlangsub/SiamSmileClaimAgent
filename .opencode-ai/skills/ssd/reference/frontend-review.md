
# SSD Frontend Review — ตรวจสอบ Code React/TypeScript

## บริบท

ใช้ skill นี้เพื่อ audit code frontend ก่อน PR หรือก่อน refactor เพื่อให้ได้รายงาน violations ที่ชัดเจน ใช้ร่วมกับ `ssd-frontend-refactor` เพื่อแก้ไขสิ่งที่พบ

---

## กฎหลัก

1. อ่าน code เท่านั้น — ห้ามแก้ไขไฟล์ใดๆ ในขั้นตอน review
2. รายงานทุก violation พร้อม file path และ line number
3. จัดกลุ่ม violations ตาม category ไม่ใช่ตาม file
4. ถ้าไม่แน่ใจว่า violation จริงหรือไม่ ให้ระบุเป็น Warning (ไม่ใช่ Error)

---

## Checklist การตรวจสอบ

### Category 1: TypeScript Types

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้ามใช้ `any` | `unknown`, `Record<string, T>` | `any` |
| ห้ามใช้ `{}` เป็น type | `Record<string, unknown>` | `{}` |
| ห้ามใช้ `as any` | type guard หรือ `as unknown as T` | `as any` |

### Category 2: Naming Conventions

| สิ่ง | รูปแบบที่ถูก | ตัวอย่างที่ผิด |
|-----|-------------|--------------|
| Component | PascalCase, max 3 คำ | `orderPageComponent` |
| Props type | `[ComponentName]Props` | `Props`, `IProps`, `OrderProps` (ถ้า component ไม่ชื่อ Order) |
| Module folder name | PascalCase เช่น `Order/` | camelCase เช่น `order/`, `productCategory/` |
| Component/Page อยู่ใน subfolder | `[Module]/components/*.tsx`, `[Module]/pages/*.tsx` | ไฟล์ลอยอยู่ที่ root ของ module เช่น `[Module]/OrderForm.tsx` |
| Page component | ลงท้ายด้วย `Page` | `OrderList`, `OrderScreen` |
| Route path | lowercase kebab-case | `/orderList`, `/Order_List` |
| Variable/function | camelCase | `OrderName`, `order_name` |
| Global constant | `CONSTANT_CASE` | `baseUrl`, `BaseUrl` |
| Custom hook file | ลงท้ายด้วย `.hook.tsx` | `useOrder.ts`, `order.hook.ts` |

### Category 3: Component Structure

| กฎ | ถูก | ผิด |
|----|-----|-----|
| 1 component ต่อ 1 ไฟล์ | ไฟล์แยกกัน | 2 exported components ในไฟล์เดียว |
| Fragment syntax | `<>...</>` | `<React.Fragment>...</React.Fragment>` |
| ห้าม `React.createElement` | JSX เสมอ | `React.createElement('div', ...)` |
| Event handler | arrow function | `function handleClick() {}` |
| Boolean prop | ไม่ต้องใส่ `={true}` | `<Button disabled={true}>` |
| ห้าม DOM prop เป็น prop ชื่อ | ชื่อ prop ที่สื่อความหมาย | prop ชื่อ `className`, `style` |

### Category 4: List Keys

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้ามใช้ index เป็น key | unique id จาก data | `key={index}` |

### Category 5: Environment Variables

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้ามใช้ `import.meta.env` ตรงๆ | `window.__CONST__ENV__.VAR_NAME` | `import.meta.env.VITE_API_URL` |
| Env var ต้องขึ้นต้นด้วย `VITE_` | `VITE_API_URL` | `API_URL` (ใน .env file) |

### Category 6: Form Handling

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Form ต้องใช้ Formik | `useFormik<T>()` หรือ `<Formik>` | `useState` + `onChange` สำหรับ form |
| Validation ต้องใช้ Yup หรือ validate function | `validationSchema: Yup.object(...)` | manual validation ใน submit handler |

### Category 7: State Management

| กฎ | ถูก | ผิด |
|----|-----|-----|
| Redux ต้องใช้ `createSlice` | `createSlice({ name, initialState, reducers })` | `createReducer`, manual switch |
| ใช้ typed hooks | `useAppSelector`, `useAppDispatch` จาก `redux/hook.ts` | `useSelector`, `useDispatch` โดยตรง |
| List/table pagination หรือ search/filter ต้องอยู่ใน Redux slice | `dispatch(setXxxPagination(...))`, อ่านค่าผ่าน `useAppSelector` | `useState` สำหรับ pagination/search ของ list/table page |

### Category 8: API Calls

> ไฟล์ NSwag generated (`.client.ts`) ได้รับการยกเว้นจากการตรวจ **เนื้อหา** ภายในไฟล์เท่านั้น (เพราะ regenerate ทับทุกครั้งที่รัน `npm run codegen`) — **ชื่อไฟล์และตำแหน่งไฟล์ยังต้องตรวจเสมอ** ห้ามถือว่า "เป็นไฟล์ generated" แล้วข้ามการตรวจทั้งไฟล์ไปเลย

| กฎ | ถูก | ผิด |
|----|-----|-----|
| ห้าม axios ใน component โดยตรง | `useQuery`, `useMutation` จาก React Query | `axios.get()` ใน useEffect หรือ component body |
| Query key ต้องใช้ `queryKeys` object | `queryKeys.orders.list()` | `['orders', 'list']` แบบ inline |
| ไฟล์ NSwag generated ที่ root ของ `src/app/api/` ต้องเปลี่ยนชื่อตาม class ที่ generate ออกมา (`react-api.md` ขั้นตอนที่ 4) — **ห้ามเหลือชื่อ hostname เดิม** | `orderApi.client.ts`, `chatApi.client.ts` | `localhost.api.ts`, `staging.api.ts` (ยังเป็นชื่อ hostname ของ `VITE_API_URL` ไม่ได้เปลี่ยน) → ❌ Violation |

### Category 9: Automation Testing Attributes

| Element | กฎ |
|---------|-----|
| `<Button>` | ต้องมี `name` attribute |
| `<Label>` / `<Typography>` ที่แสดงข้อมูล | ต้องมี `name` attribute |
| Dynamic render (list items, conditional) | ต้องมี `id` attribute |

---

## ขั้นตอนการ Review

### ขั้นตอนที่ 1: กำหนด scope

```
# ถามหรือตรวจสอบว่าจะ review ไฟล์ไหน
# ตัวอย่าง scope:
# - ทั้ง src/modules/Order/
# - เฉพาะไฟล์ที่เปลี่ยนใน PR นี้
# - ทุก .tsx ใน src/
```

### ขั้นตอนที่ 2: อ่านไฟล์และตรวจตาม Checklist

อ่านทีละไฟล์ ตรวจทุก category ด้านบน บันทึก violations พร้อม line number — ถ้า scope แตะ `src/app/api/` ให้ Glob `src/app/api/*.ts` ที่ root (ไม่รวม `query/`) เพื่อเช็ค Category 8 แถวสุดท้ายด้วยเสมอ ไม่ใช่แค่ไฟล์ที่ระบุ scope มาให้

### ขั้นตอนที่ 3: สร้างรายงาน

ออก report ในรูปแบบนี้:

```
## Frontend Review Report

### ❌ Violations (ต้องแก้ไข)

| File | Line | Category | ปัญหา | แนวทางแก้ไข |
|------|------|----------|-------|-------------|
| src/app/modules/Order/components/OrderForm.tsx | 12 | Types | ใช้ `any` | เปลี่ยนเป็น `unknown` หรือระบุ type ชัดเจน |
| src/app/modules/Order/components/OrderList.tsx | 45 | Lists | ใช้ index เป็น key | ใช้ `order.orderId` แทน |

### ⚠️ Warnings (ควรแก้ไข)

| File | Line | Category | ข้อสังเกต |
|------|------|----------|----------|
| src/app/modules/Order/components/OrderCard.tsx | 8 | Testing | ไม่มี `name` attribute บน Button |

### ✅ ผ่าน

- Naming conventions: ผ่านทุก component และ page
- Fragment syntax: ใช้ `<>` ถูกต้องทุกที่
- Environment variables: ไม่พบการใช้ `import.meta.env`

### สรุป

- Violations: X รายการ ใน Y ไฟล์
- Warnings: X รายการ
- พร้อม refactor ด้วย `ssd-frontend-refactor`: ใช่ / ต้องพิจารณา Tier 4 ก่อน
```

> ไฟล์นี้มี 2 ภาษาในไฟล์เดียว: ภาษาไทย (เริ่มด้านล่าง) และ English (เลื่อนลงไปหา `# AUN.md — Knowledge Base for AI Agents...`) เนื้อหาทั้งสองภาษาตรงกันทุก section

# AUN.md — Knowledge Base สำหรับ AI Agent เขียนโค้ด React สไตล์ SmileHCM

> เอกสารนี้สังเคราะห์มาจาก `AGENTS.md`, `docs/Architecture/*`, `docs/Patterns/*` และโค้ดจริงในโปรเจค `SmileHCM-develop`
> เป้าหมาย: ให้ AI agent ที่ไม่เคยเห็นโปรเจคนี้มาก่อน **สามารถเดาสไตล์การเขียนโค้ดได้ถูกต้อง แม้เจอโจทย์ใหม่ที่ไม่มี pattern ตรงเป๊ะมาก่อน**
> วิธีอ่าน: อ่าน §0–§2 ก่อนเสมอเพื่อเข้าใจ "วิธีคิด" จากนั้นอ่านเฉพาะ section ที่เกี่ยวกับงานที่ทำ

---

## §0. หลักคิดเวลาเจอโจทย์ใหม่ (สำคัญที่สุด)

เมื่อเจอโจทย์ที่ไม่มี pattern ในเอกสารนี้ตรง ๆ ให้ทำตามลำดับนี้เสมอ — **ห้ามคิด mechanism ใหม่เองก่อนทำตามลำดับนี้**

1. **หา module/ไฟล์ที่ใกล้เคียงที่สุดในโปรเจคก่อนเสมอ** แล้วเลียนแบบโครงสร้าง, การตั้งชื่อ, และลำดับ import
2. **Reuse ก่อนสร้างใหม่** — เช็คว่ามี component/hook/type/enum ที่ทำงานคล้ายกันอยู่แล้วหรือยังใน `_common`, `api/`, `hook/` ก่อนเขียนเอง
3. **Backend คือ source of truth ของ business rule** — Frontend validate แค่ shape/required/format เพื่อ UX เท่านั้น ห้าม infer/preempt business logic จาก dropdown หรือ options response
4. **ห้ามเดา API contract** — ใช้ type จาก `smilehcmapi.api.ts` เท่านั้น ถ้า field ไม่มีให้บอกผู้ใช้ว่าต้องรัน `npm run codegen` หรือ backend ยังไม่มี endpoint นี้ ห้ามสร้าง DTO ปลอมหรือ bypass
5. **แก้เฉพาะที่จำเป็น** — ห้าม refactor ไฟล์อื่นแถม ห้ามเปลี่ยนชื่อ route/exported hook/shared props โดยไม่ถูกขอ
6. **ถ้าข้อมูลไม่พอจะกระทบ contract/authorization/business rule ที่มองเห็นได้ต่อผู้ใช้ → ถามก่อน** ถ้าไม่กระทบระดับนั้น ให้ตัดสินใจเองแบบ minimal assumption ที่สอดคล้องกับโค้ดใกล้เคียง แล้วบอกสมมติฐานที่ใช้
7. เขียนเสร็จแล้ว **ห้ามใส่คอมเมนต์ในโค้ด** (รวม section divider comment) และห้าม `as any`

กฎเช็คลิสต์สั้น ๆ ก่อนส่งงาน: component ไม่ใช้ `React.FC` → ฟอร์มผ่าน Formik+Zod ครบ 10 ข้อ → table ใช้ `StandardDataTable` → แจ้งเตือนใช้ Swal → วันที่ใช้ `formatThaiBuddhistDate` → ปุ่ม icon ใช้ `@mui/icons-material` → เช็ค `isSuccess === false` ทุก API call → มี loading/error/empty state → ไม่มี comment ในโค้ด → ไม่มี `React.FC`, ไม่มี Breadcrumbs

---

## §1. Stack และโครงสร้างโปรเจค

**Stack หลัก**: React 18 + TypeScript 5 + Vite · MUI 5 (icon จาก `@mui/icons-material` เท่านั้น) · Formik + Zod (`zod-formik-adapter`, ห้ามใช้ Yup) · React Query v4 (`@tanstack/react-query`) · Redux Toolkit + redux-persist · React Router v6 · `sweetalert2` · `dayjs` · `mui-datatables` (ผ่าน `StandardDataTable`) · `oidc-client-ts` (OIDC auth) · `@microsoft/signalr` (realtime) · `nswag` (codegen API client)

```
src/
├── app/
│   ├── api/                      API layer
│   │   ├── smilehcmapi.api.ts    auto-generated (nswag) — ห้ามแก้มือ
│   │   ├── index.ts              export client instances
│   │   └── <module>Api.ts        service + React Query hook ต่อ module
│   ├── layout/                   Layout, sidebar, theme
│   ├── modules/                  Feature module (module-first structure)
│   │   ├── _common/              Shared: CustomFormik, DataTable, zodHelpers, sweetAlert, apiErrorMessage
│   │   ├── _auth/                AuthProvider, PermissionProvider, ApprovalGuard
│   │   ├── Employee/ EmployeePrograms/ HRPrograms/ Movement/ Notifications/ Organization/ Setting/
│   ├── pages/                    หน้าทั่วไป
│   ├── routes/                   Routes.tsx, ASideMenuList.tsx
│   └── hook/                     shared hooks
├── redux/                        store, hooks
├── services/                     service เสริม (SignalR, lookups)
└── types/                        ambient .d.ts
```

**Source of truth เมื่อกฎขัดกัน**: user instruction ปัจจุบัน > `AGENTS.md`/local override > โค้ดจริง+generated type+pattern ที่มีอยู่ > `docs/`

**ห้ามสร้าง top-level folder ใหม่** เว้นแต่ architecture ปัจจุบันรองรับไม่ได้จริง ๆ

---

## §2. Global Coding Principles

- อ่านโค้ดใกล้เคียงก่อนแก้ทุกครั้ง
- คง route path, menu code, API wrapper contract, generated DTO name, response shape เดิมไว้ เว้นแต่ถูกขอให้เปลี่ยน
- ย้าย reusable data access ไปไว้ที่ hook/api file, shared UI behavior ไปไว้ที่ local component/shared helper — อย่าให้ page component อ้วน
- อย่าเพิ่ม package ใหม่โดยไม่จำเป็น
- ใช้ type จาก generated API contract เสมอที่ทำได้ หลีกเลี่ยง `any`
- **ห้ามเขียนคอมเมนต์ในโค้ดแอปพลิเคชันเด็ดขาด** (รวม section divider comment แบบ `// ─── ... ───`) ใช้ชื่อตัวแปร/ฟังก์ชันที่สื่อความหมายแทน — คอมเมนต์เดิมที่จำเป็นให้คงไว้ถ้าไม่ได้เกี่ยวกับส่วนที่แก้
- Import: จัดเรียงตาม style ไฟล์ข้างเคียงในโมดูลเดียวกัน (external lib → internal absolute/relative → local)

---

## §3. Component Pattern

```tsx
interface Props {
    employeeId: number;
    onClose: () => void;
}

function EmployeeSummaryCard({ employeeId, onClose }: Props) {
    return <Card>...</Card>;
}

export default EmployeeSummaryCard;
```

กฎ:
- **ห้ามใช้ `React.FC`** — ประกาศเป็นฟังก์ชันธรรมดา + `interface Props` เมื่อมี props
- Icon ใช้ `@mui/icons-material` เท่านั้น (ห้ามเพิ่ม icon package อื่น เว้นแต่หน้าที่แก้มีของเดิมใช้อยู่แล้วเพื่อความ consistent)
- **ห้ามใช้ Breadcrumbs**
- ตารางทุกที่ใช้ `StandardDataTable` (ดู §6)
- ใน filter row: input/dropdown/autocomplete/date picker/action button ทุกตัวต้องสูงเท่ากับ `TextField size="small"` ที่อยู่ข้างกัน — ห้ามบังคับ fixed height โดยไม่เทียบสายตาก่อน และห้ามจองพื้นที่ helper-text ว่างไว้ (ให้ validation message ขยายเฉพาะ field ตัวเองลงล่างได้)

### Dialog ที่เนื้อหาสูง (กัน double-scroll)

```tsx
<Dialog PaperProps={{ sx: { height: "90vh", overflow: "hidden" } }}>
    <DialogContent sx={{ minHeight: 0 }}>
```

ถ้ามี unsaved/temporary server state ให้ปิด backdrop/Escape dismiss แล้วมีปุ่ม cancel/close ที่ทำ cleanup ให้ชัดเจนแทน

### ปุ่ม action ใน dialog สร้าง/แก้ไข

Cancel = `variant="contained" color="error"`, Save = `variant="contained" color="success"` (เว้นแต่หน้าที่แก้มี design เฉพาะทางอยู่แล้ว)

---

## §4. Formik + Zod Contract (บังคับทุกฟอร์มใหม่/ที่แก้)

```tsx
interface FormValues {
    employeeId: number | null;
    startDate: Dayjs | null;
    reasonId: string;
    remark: string;
}

const schema = z.object({
    employeeId: z.number({ required_error: "กรุณาเลือกพนักงาน" }),
    startDate: zod.dayjs("กรุณาเลือกวันที่"),
    reasonId: z.string().min(1, "กรุณาเลือกเหตุผล"),
    remark: z.string(),
}).superRefine((values, ctx) => {
    if (someConditionalRule(values)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ข้อความ error", path: ["remark"] });
    }
});

const initialValues: FormValues = { employeeId: null, startDate: null, reasonId: "", remark: "" };

<Formik<FormValues>
    initialValues={initialValues}
    validationSchema={toFormikValidationSchema(schema)}
    onSubmit={async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
        ...
    }}
>
    {(formik) => (
        <Form>
            <FormikDropdown name="reasonId" label="เหตุผล" formik={formik} options={reasonOptions} />
            <FormikDatePicker name="startDate" label="วันที่เริ่มต้น" formik={formik} size="small" hideEmptyHelperText />
            <FormikTextField name="remark" label="หมายเหตุ" formik={formik} />
        </Form>
    )}
</Formik>
```

กฎบังคับ 10 ข้อ:
1. `interface FormValues` typed เสมอ
2. `<Formik<FormValues>>` ใส่ generic ชัดเจน
3. `validationSchema` จาก Zod + `toFormikValidationSchema(schema)` — **ห้ามใช้ Yup, ห้ามผสม Yup กับ Zod**
4. `initialValues` type ครบ ไม่มี implicit `any`
5. ใช้ input จาก `CustomFormik` ก่อนเสมอ: `FormikTextField`, `FormikDropdown` (**ใช้แทน `FormikSelect` เสมอ**), `FormikDatePicker`, `FormikAutocomplete`/`FormikAutocompleteApi`/`FormikAutocompleteMultiple`, `FormikCheckbox`/`FormikCheckboxGroup`, `FormikRadioGroup`, `FormikSwitch`, `FormikTextNumber`, `FormikTextMask`/`FormikTextMaskPhone`, `FormikSlider`, `FormikRating`, `FormikDropdownMultiple`, `FormikMobileTimePicker`
6. ห้ามผูก raw MUI input กับ `formik.handleChange` มือเปล่า เว้นแต่ shared control รองรับ interaction นั้นจริง ๆ ไม่ได้
7. **ห้าม `as any`** กับ formik/field values — แก้ type ที่ต้นตอ
8. `setFieldValue(name, value, shouldValidate)`: `true` = user action ที่ต้อง revalidate ทันที, `false` = derived field ภายใน
9. Field ที่ dependent กัน ต้อง clear/update field ปลายทางใน handler เดียวกันแบบ deterministic
10. submit handler type: `(values: FormValues, helpers: FormikHelpers<FormValues>) => ...`

Validation อื่น ๆ:
- Logic ทั้งหมด (รวม conditional) อยู่ใน Zod schema; ใช้ `superRefine` เมื่อจำเป็น
- Error message ต้อง user-facing เป็นภาษาไทยถ้าหน้าเป็นไทย
- ถ้า rule ขึ้นกับ type/policy ที่เลือก → compute flag ก่อน แล้วค่อยสร้าง schema จาก flag นั้น
- ห้ามมี form state manager ตัวที่สองซ้อน, ห้ามเก็บ canonical value ซ้ำใน local `useState`
- ข้อยกเว้นเดียว: `FormikTextField deferChangeUntilBlur` ใช้ได้เฉพาะ field ภายใน `mui-datatables` cell เพื่อกัน caret กระโดด (ดู §6) — Formik ยังเป็น canonical state, commit ตอน blur เท่านั้น

`FormikDatePicker` gotcha: default `size="medium"` และจอง helper text แถวว่างไว้เสมอ (สูงกว่า `size="small"` ~23px) — ถ้าวางในแถวเดียวกับ dropdown/autocomplete ขนาด small ให้ส่ง `size="small" hideEmptyHelperText` เสมอ

Zod helper ที่มีให้แล้ว (`_common/zodHelpers.ts`): `zod.dayjs(errorMessage)`, `zod.string.isThaiCitizenID(...)`, `zod.string.isPhoneNumber(...)`, `zod.number.coerce(...)`, `zod.number.supportDropdown(...)`, `zod.boolean.required(...)`, `zod.helpers.zodInitLazy(...)`, `zod.addIssue.custom(...)` — เช็คก่อนเขียน custom validator เอง

---

## §5. API Hook Pattern

Reference ไฟล์: `src/app/api/employeeApi.ts`

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveRequestClient } from ".";
import { CreateLeaveRequestDto, ServiceResponse } from "./smilehcmapi.api";

export const employeeLeaveRequestsQueryKeys = {
    all: ["employee-leave-requests"] as const,
    list: (params: LeaveRequestListParams) => [...employeeLeaveRequestsQueryKeys.all, "list", params] as const,
    detail: (id: number) => [...employeeLeaveRequestsQueryKeys.all, "detail", id] as const,
};

export const useEmployeeLeaveRequestsQuery = (params: LeaveRequestListParams) =>
    useQuery({
        queryKey: employeeLeaveRequestsQueryKeys.list(params),
        queryFn: () => leaveRequestClient.getLeaveRequests(params),
    });

export const useCreateLeaveRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateLeaveRequestDto) => leaveRequestClient.createLeaveRequest(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeeLeaveRequestsQueryKeys.all });
        },
    });
};
```

กฎบังคับ:
1. **ห้ามเขียน raw path หรือเรียก `axios.request` ตรง ๆ** ใช้ generated client จาก `smilehcmapi.api.ts` ผ่าน instance ที่ export ใน `src/app/api/index.ts` เท่านั้น
2. ถ้า client instance ที่ต้องใช้ยังไม่มีใน `index.ts` → เพิ่มและ export ที่นั่นก่อน
3. Service function: PascalCase; React Query hook: ขึ้นต้นด้วย `use...`
4. ต้องมี `queryKeys` object แยกเฉพาะโมดูล ตาม style ของ `employeeApi.ts`
5. โครง `useQuery`/`useMutation` ต้องตรงกับไฟล์ api อื่นในโปรเจค
6. ทุก mutation ที่สำเร็จ ต้อง invalidate query key ที่เกี่ยวข้องทั้งหมด
7. ใช้ type จาก `smilehcmapi.api.ts` เท่านั้น — **ห้ามสร้าง DTO/type ซ้ำ**
8. **ห้ามแก้ `smilehcmapi.api.ts` ด้วยมือ** (auto-generated จาก nswag) — ถ้าขาด field/method ให้รัน `npm run codegen` แล้วตรวจอีกครั้ง ถ้ายังขาดให้แจ้งผู้ใช้ ห้ามสร้าง DTO หรือ bypass contract ทดแทน

### Gotcha: HTTP 200 ไม่ได้แปลว่าสำเร็จ

ไม่มี axios interceptor ตัวไหนเช็ค `isSuccess` — API ตอบ `200 { isSuccess: false, message: "..." }` ได้โดยไม่ throw ทุก call site ต้องเช็คเอง

**มาตรฐานโปรเจกต์: `isSuccess === false` = ล้มเหลว** (response ที่ไม่มี `isSuccess` เช่น 204 ถือว่าสำเร็จ — **ห้ามใช้ `isSuccess !== true`** เพราะจะทำให้ 204 กลายเป็น error ปลอม)

```ts
const isServiceSuccess = (response?: { isSuccess?: boolean | null }) => response?.isSuccess !== false;

const response = await someMutation.mutateAsync(payload);
if (!isServiceSuccess(response)) {
    throw response;
}
```

ถ้า endpoint คืน structured error (`errors.header`/`errors.message`) ห้ามสร้าง `Error(message)` ใหม่ (จะทิ้งรายละเอียด) — throw response envelope เดิม แล้ว normalize ด้วย `getApiErrorMessage` (`src/app/modules/_common/apiErrorMessage.ts`) ตอนแสดงผล

### Gotcha: `invalidateQueries` ใน hook + `refetch()` ใน component = ยิง GET ซ้ำ

`mutateAsync` รอ `onSuccess` (รวม `invalidateQueries`) ให้เสร็จก่อนคืนค่า ดังนั้น**หลัง mutation อย่าเรียก `refetch()` เองถ้า hook มี `invalidateQueries` อยู่แล้ว** — ยกเว้นตารางที่ไม่ได้ใช้ react-query (ดึงเข้า `useState` ตรง ๆ) ต้องเรียก reload เองเพราะ invalidation ไปไม่ถึง

### Pagination — ใช้ query parameter ชื่อเดิมเสมอ

`page`, `recordsPerPage`, `ascendingOrder`, `orderingField`, `searchDetail` (default page = 1, default recordsPerPage = 10 เว้นแต่โมดูลใกล้เคียงกำหนดต่าง) และ sync table state กับ `response.pagination.currentPage`/`recordsPerPage`/`totalAmountRecords`

Search box ที่ trigger ด้วยปุ่ม Search/Enter ต้องส่ง keyword ที่ trim แล้วโดยไม่มี minimum length ซ่อนอยู่ — ถ้าเป็น typeahead/debounced ถึงกำหนด minimum ได้ แต่ต้องบอกผู้ใช้ใน UI ชัดเจน

---

## §6. Table Pattern

Component หลัก: `StandardDataTable` (`src/app/modules/_common/components/DataTable`) — **ตารางทุกที่ในระบบใช้ตัวนี้เป็น default ห้ามสร้างตารางเอง**

```tsx
<StandardDataTable
    title="รายการคำขอ"
    data={rows}
    columns={columns}
    options={{
        serverSide: true,
        page: pagination.currentPage - 1,
        count: pagination.totalAmountRecords,
        sortOrder: { name: pagination.orderingField, direction: pagination.ascendingOrder ? "asc" : "desc" },
        onColumnSortChange: handleSort,
        onChangePage: handlePageChange,
    }}
/>
```

กฎ:
- Action column อยู่ **ขวาสุดเสมอ** ใช้ `TableActionButtons` (`_common/components/DataTable/TableActionButtons.tsx`) — ห้าม hand-roll `IconButton` เอง (รองรับ `onView`, `onEdit`, `editDisabled`, `editMenuCode` — ใส่ `editMenuCode` จะห่อปุ่ม edit ด้วย `PermissionGuard` ให้อัตโนมัติ)
- Status: boolean คงที่ (active/inactive) → `ColumnIsActive`; label จาก API เอง → `StatusDotChip` ตรง ๆ ด้วย palette กลาง `bgColor="#E9FFEF" color="#409261"` (true/positive) และ `bgColor="#FFE4E4" color="#C62828"` (false/negative) — **ห้าม hand-roll `<Chip>` เองหรือเขียน status text เอง**
- วันที่ในตารางใช้ `formatThaiBuddhistDate` เสมอ
- Pagination/filter/search ต้องตาม pattern เดิมที่มีอยู่แล้ว ห้ามคิด mechanism ใหม่

### Gotcha: server-side sort ต้องส่ง `sortOrder` เอง

ถ้าไม่ส่ง `options.sortOrder` เข้าไป mui-datatables จะถือว่า sort state เป็น uncontrolled แล้วรีเซ็ตทิศทางทุกครั้งที่ `columns` เปลี่ยน reference (เกิดแทบทุก render) → กดหัวตารางแล้วลูกศรไม่สลับ ต้องส่ง `sortOrder: { name, direction }` เสมอ และชื่อคอลัมน์ (`name`) ต้องตรงกับ field ที่ BE ใช้เรียง ถ้าไม่ตรงต้อง map ตอนยิง request

### Gotcha: checkbox หัวตาราง + `selectToolbarPlacement: "none"`

**ไม่ต้องใส่ `selectToolbarPlacement: "none"`** — `StandardDataTable` ซ่อน toolbar ด้วย CSS ให้แล้ว ถ้าใส่แล้วมีแถวที่ `isRowSelectable` คืน false แม้แถวเดียว checkbox หัวตารางจะพังกลายเป็น "ยกเลิกการเลือก" เสมอ นอกจากนี้ `isRowSelectable` ต้องตรงเงื่อนไขเดียวกับ reducer ที่เก็บรายการที่เลือกเสมอ (เพราะ `rowsSelected` เป็น controlled prop)

### Gotcha: caret กระโดดไปท้ายข้อความใน input ที่อยู่ใน cell

Controlled `TextField` ใน `customBodyRender`/`customBodyRenderLite` ที่ `onChange` แก้ state ระดับหน้าตรง ๆ จะทำให้ทุก keystroke สร้าง cell ใหม่ (caret กระโดด) — ใช้ `EditableTableTextField` (ถือ draft ระหว่าง focus, commit ตอน blur) หรือ `FormikTextField deferChangeUntilBlur` สำหรับ field ใน Formik เฉพาะกรณีนี้เท่านั้น

---

## §7. Notification Pattern (Swal)

ใช้ `sweetalert2` (`import Swal from "sweetalert2"`) ทุกกรณี — **ห้ามใช้ browser `alert()`, MUI Snackbar หรือ library อื่น**

```ts
await Swal.fire({ icon: "success", title: "บันทึกข้อมูลเรียบร้อย", confirmButtonText: "ตกลง" });

await Swal.fire({
    icon: "error",
    title: "บันทึกไม่สำเร็จ",
    text: getApiErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
    confirmButtonText: "ตกลง",
});

const result = await Swal.fire({
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#2e7d32",
    cancelButtonColor: "#d32f2f",
    reverseButtons: true,
    allowOutsideClick: false,
});
if (result.isConfirmed) { /* ... */ }
```

`getApiErrorMessage` (`_common/apiErrorMessage.ts`) รองรับทั้ง HTTP error และ HTTP 200 ที่ `isSuccess === false`, direct envelope, Axios `response.data`, NSwag `result`/`response`, JSON string — ลำดับที่ใช้คือ structured `errors` (ไม่ซ้ำ สูงสุด 3 รายการ) → `message` ระดับบน → fallback ของ FE **ห้ามแสดง `exceptionMessage`, stack trace หรือ transport message ตรง ๆ**

---

## §8. Date, Enum/Constant, Authorization

- แสดงผลวันที่: `formatThaiBuddhistDate(...)` เสมอ
- ส่งวันที่ไป API: `YYYY-MM-DD` หรือ `toISOString()` ตาม endpoint contract ที่ยืนยันแล้ว
- **ห้าม hardcode magic string ถ้ามี enum/constant อยู่แล้ว** — reuse helper/type ที่มีก่อนสร้างใหม่เสมอ
- Frontend permission check เป็นแค่ navigation/UX เท่านั้น — backend คือ security boundary จริง ห้าม bypass `AuthProvider`, `PermissionProvider`, `ApprovalGuard`, route permission handle หรือ OIDC token flow
- หน้าใหม่ทุกหน้าต้องใส่ permission ให้ครบ: route handle, sidebar menu (`ASideMenuList.tsx` ผูกกับ `menuCode` เดียวกับ `Routes.tsx`), ปุ่ม action ครอบด้วย `PermissionGuard`
- อย่า hardcode role check (`ADMIN`/`DEVELOPER`) ในฟีเจอร์ UI เว้นแต่ business rule ต้องการจริง ๆ — ให้ data-driven จาก backend permission layer

---

## §9. Data-fetching page ต้องมี 3 state เสมอ

ทุกหน้าที่ดึงข้อมูลต้องจัดการ **loading, error, empty** อย่างชัดเจน — error ใช้ pattern เดียวกับ §7

---

## §10. Commit & PR

Commit: `<type>: <subject ภาษาไทย>` เช่น `feat: เพิ่มหน้าจัดการบทบาท` (type: feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert) — **ห้ามใส่ `Co-Authored-By` หรือ AI attribution**

ก่อนเปิด/push PR ต้องรัน `npm run build` ผ่าน (ระหว่าง dev ใช้ `npx tsc --noEmit` เร็วกว่า)

PR body ใช้ `## Summary` เดียว bullet ภาษาไทย ครอบคลุม implementation detail, user/operational impact, API/security impact, ผลทดสอบ/ข้อจำกัด — **ห้ามมี footer เครดิต AI**

---

## §11. Do-Not List สรุปรวม

- ห้าม `React.FC`, ห้าม Breadcrumbs, ห้าม icon นอก `@mui/icons-material`
- ห้ามคอมเมนต์ในโค้ดแอป (รวม section divider), ห้าม `as any` กับ formik/field
- ห้ามใช้ Yup, ห้ามผสม Yup+Zod, ห้าม form state manager ซ้อนสอง, ห้าม `FormikSelect` (ใช้ `FormikDropdown`)
- ห้ามแก้ `smilehcmapi.api.ts` มือ, ห้ามสร้าง DTO/response envelope/pagination model ซ้ำ, ห้าม raw `axios.request`
- ห้ามใช้ `isSuccess !== true` (ใช้ `!== false`), ห้ามเรียก `refetch()` ซ้ำหลัง mutation ที่มี `invalidateQueries` แล้ว
- ห้ามสร้างตารางเอง (ใช้ `StandardDataTable`), ห้าม hand-roll action button/status chip เอง
- ห้าม browser `alert()`/MUI Snackbar (ใช้ Swal), ห้ามโชว์ exception/stack trace ตรง ๆ ให้ผู้ใช้
- ห้าม bypass authorization/OIDC, ห้าม hardcode role check โดยไม่จำเป็น, ห้าม client เลือก owner/approver identity เอง (ต้องมาจาก token)
- ห้าม refactor/เปลี่ยนชื่อ route, hook, props ที่ไม่ถูกขอ, ห้ามสร้าง top-level folder ใหม่โดยไม่จำเป็น

---

## §12. พฤติกรรม/สไตล์การเขียนโค้ดที่แกะจากโค้ดจริง (ไม่ใช่กฎที่เขียนไว้ใน `AGENTS.md`)

Section นี้ได้มาจากการ grep/สถิติโค้ดจริงในโปรเจค ไม่ใช่กฎที่ประกาศไว้ — เป็น "นิสัย" ของทีมที่ agent ควรเลียนแบบเพื่อให้โค้ดใหม่กลมกลืนกับของเดิม แม้ไม่มีกฎบังคับตรง ๆ

### Formatting (บังคับผ่าน Prettier, `.prettierrc.json`)

```json
{ "trailingComma": "es5", "tabWidth": 4, "semi": true, "singleQuote": false, "printWidth": 120, "endOfLine": "crlf" }
```

→ เว้นวรรค 4 spaces, ใช้ double quote เสมอ (พบ single quote หลุดมาแค่ 4 ครั้งจากทั้งโปรเจค), ปิด semicolon ทุกบรรทัด, บรรทัดยาวได้ถึง 120 ตัวอักษร, trailing comma แบบ ES5, line ending เป็น **CRLF** (ระวังเครื่องมือที่ normalize เป็น LF ทั้งไฟล์ จะทำให้ diff มี noise — ดู gotcha เรื่อง `vite.config.ts` ใน §1)

### การประกาศ component: `function` มากกว่า arrow function ชัดเจน

จากการสุ่มตรวจ พบ `function ComponentName(...)` (function declaration) มากกว่า `const ComponentName = (...) =>` ราว 4-5 เท่า → เขียน component เป็น `function` declaration เป็นค่าเริ่มต้นเสมอ ไม่ใช่ arrow function const เว้นแต่เป็น helper เล็ก ๆ ในไฟล์เดียวกัน

### Export: ประกาศแล้ว `export default` ทันที ไม่แยกท้ายไฟล์

รูปแบบหลักที่เจอเกือบทั้งหมด (289 ไฟล์) คือ

```tsx
export default function EmployeeSummaryCard({ mode = "single" }: EmployeeSummaryCardProps) {
```

คือ `export default` ติดกับ `function` ตรง ๆ ในบรรทัดประกาศ ไม่ใช่ declare ก่อนแล้วค่อย `export default ComponentName;` ท้ายไฟล์ (มีแบบ named export แยก (`export function X`) อยู่บ้างแต่น้อยกว่ามาก ~13 ไฟล์) — ถ้า component ต้อง wrap ด้วย `memo` ให้เขียนแยก `export default memo(ComponentName);` ท้ายไฟล์ (พบ pattern นี้ซ้ำหลายจุดในกลุ่ม tab component เช่น `ContactTab`, `WorkTab`, `LicenseTab`)

### `interface` vs `type` สำหรับ Props: ไม่ตายตัว แต่ `interface` คือทางการ

`AGENTS.md`/Conventions พูดถึง `interface Props` เป็นมาตรฐาน แต่ในโค้ดจริงพบทั้ง `interface XxxProps` (65 ไฟล์) และ `type XxxProps` (100 ไฟล์) ปนกัน → **ให้ยึดตามไฟล์ข้างเคียงในโมดูลเดียวกันเป็นหลัก** ถ้าไม่มีของเดิมให้อ้างอิง ใช้ `interface Props` ตามที่ระบุไว้ใน Conventions

### ตั้งชื่อ event handler แบบ `handleVerbNoun` เสมอ

พบรูปแบบซ้ำสม่ำเสมอทั้งโปรเจค: `handleSave`, `handleSearch`, `handleCancel`, `handleSubmit`, `handleDelete`, `handleClose`, `handleClearSearch`, `handleConfirm`, `handleChange`, `handleOpenCreate` / `handleOpenEdit`, `handleCloseDialog`, `handleConfirmRejectDialog`, `handleChangeStatus`, `handleSelectionChange` → เวลาสร้าง handler ใหม่ ตั้งชื่อรูปแบบ `handle` + Verb (+ Noun/Context) เสมอ อย่าตั้งชื่ออื่น เช่น `onSaveClick` หรือ `saveHandler`

### Dialog/modal state: boolean `open...` คู่กับ setter เดียวกัน ไม่ใช้ anchorEl pattern

รูปแบบที่พบซ้ำมาก: `const [openDetail, setOpenDetail] = useState(false)`, `const [openRejectDialog, setOpenRejectDialog] = useState(false)`, `const [openCancelDialog, ...]`, `const [openDialog, ...]` → ตั้งชื่อ state ว่า `open` + ชื่อ dialog/บริบท (ไม่ใช่แค่ `open` เฉย ๆ เว้นแต่หน้ามี dialog เดียว) และใช้คู่กับ `handleOpen...`/`handleClose...`

### Loading/processing flag: prefix `is` + verb-ing เสมอ

`isSaving`, `isSubmitting`, `isExporting`, `isDownloading`, `isValidating`, `isLoadingRows`, `isActionDelayLoading` → boolean flag ทุกตัวที่สื่อสถานะกำลังทำงานใช้ prefix `is` + คำกริยา -ing เสมอ ไม่ใช้ชื่ออื่นเช่น `saving` เฉย ๆ หรือ `loading` เปล่า ๆ ถ้ามีหลาย loading ในหน้าเดียว

### `useState` ค่าเริ่มต้น: นิยม `null` มากกว่า `undefined`

พบ `useState<T | null>(null)` (157 จุด) มากกว่า `useState<T | undefined>(undefined)` (35 จุด) ~4.5 เท่า → สำหรับ state ที่ยังไม่มีค่า/ยังไม่เลือก ให้ default เป็น `null` เป็นค่าเริ่มต้น ไม่ใช่ `undefined`

### `useMemo` ใช้บ่อยกว่า `useCallback` มาก

พบ `useMemo` ใน 247 ไฟล์ เทียบกับ `useCallback` ใน 69 ไฟล์ → พฤติกรรมของทีมคือ derive ข้อมูล (filtered options, table columns, table rows ที่ map แล้ว) ผ่าน `useMemo` เป็นหลัก ส่วน `useCallback` ใช้เฉพาะเมื่อจำเป็นจริง ๆ (ส่งเป็น dependency ของ effect อื่น หรือส่งลง memoized child) — **อย่าห่อทุก handler ด้วย `useCallback` พร่ำเพรื่อ** เพราะไม่ใช่พฤติกรรมที่ทีมทำ

### Optional chaining ใช้ทุกที่ (`?.`)

พบการใช้ `?.` มากกว่า 5,800 ครั้งทั่วโปรเจค → เข้าถึง property ที่อาจเป็น null/undefined ให้ใช้ `?.` เป็นค่าเริ่มต้นเสมอ แทนการเช็ค `if (x && x.y)` แยก

### Error handling behavior: `catch` แล้วต้องขึ้น Swal เสมอ ไม่ silent catch/console.error

แทบทุกจุดที่มี `catch (error)` ในโค้ดฝั่ง UI จะตามด้วย `await Swal.fire({ icon: "error", ..., text: getApiErrorMessage(error), confirmButtonText: "ตกลง" })` ทันที ไม่พบ pattern ที่ `console.error` เงียบ ๆ แล้วปล่อยผ่าน → พฤติกรรมมาตรฐานของโปรเจคคือ **error ที่ผู้ใช้ trigger ต้องแสดงผลให้ผู้ใช้เห็นเสมอ ไม่ log เงียบอย่างเดียว**

### Loading indicator: `CircularProgress` คือ default จริง ๆ

`CircularProgress` ถูกใช้ 226 ครั้ง เทียบกับ `Skeleton` 17 ครั้ง และ `LoadingBackdrop` 8 ครั้ง → ใช้ spinner (`CircularProgress`) เป็นตัวเลือกแรกเสมอสำหรับ loading state ทั่วไป ใช้ `Skeleton` เฉพาะหน้า list ที่เน้นเนื้อหาเยอะ และใช้ `LoadingBackdrop` เฉพาะ full-page/full-dialog block เท่านั้น

### โครงสร้างโฟลเดอร์ต่อ feature: `page/` + `components/` เกือบทุกครั้ง

ทุก feature module ที่เจอ (เช่น `Leave/LeaveRequest`, `TimeAttendance/AttendanceHistory`) มี subfolder `page/` (หน้าเพจหลัก) และ `components/` (component ย่อยเฉพาะ feature นั้น) เกือบเสมอ บางอันมี `data/` (static option/config เฉพาะ feature), `components/Tabs/`, `components/detail/` สำหรับ sub-view ที่ซ้อนลึกลงไป — เวลาสร้าง feature ใหม่ให้ตามโครงนี้เสมอ อย่าใส่ page component และ sub-component ปนกันไฟล์เดียว

### `index.ts` barrel export: ใช้น้อยมาก ไม่นิยมสร้างใหม่

ทั้งโปรเจคมี `index.ts` แค่ 7 ไฟล์ (ส่วนใหญ่อยู่ใน `_common`) → import ส่วนใหญ่ชี้ path เต็มของไฟล์ตรง ๆ ไม่นิยมสร้าง barrel file ใหม่พร่ำเพรื่อสำหรับ feature module ปกติ ให้สร้างเฉพาะเมื่อ export ชุดใหญ่จริง ๆ แบบ `CustomFormik/index.ts`

---

## §12. Observed Code Style & Behavior Patterns (extracted from real code, not from `AGENTS.md`)


---


# AUN.md — Knowledge Base for AI Agents Writing React Code in SmileHCM Style

> This document is synthesized from `AGENTS.md`, `docs/Architecture/*`, `docs/Patterns/*`, and real code in the `SmileHCM-develop` project.
> Goal: let an AI agent that has never seen this project before **infer the correct coding style even when facing a brand-new problem with no exact matching pattern**.
> How to read: always read §0–§2 first to understand the "way of thinking", then read only the sections relevant to the task at hand.

---

## §0. Mindset for a Brand-New Problem (most important)

When facing a problem with no exact pattern in this document, always follow this order — **never invent a new mechanism before going through these steps**.

1. **Always find the closest existing module/file in the project first**, then mirror its structure, naming, and import order.
2. **Reuse before building new** — check whether a similar component/hook/type/enum already exists in `_common`, `api/`, `hook/` before writing your own.
3. **The backend is the source of truth for business rules** — the frontend only validates shape/required/format for UX. Never infer or pre-enforce business logic from dropdown or options responses.
4. **Never guess the API contract** — use types from `smilehcmapi.api.ts` only. If a field doesn't exist, tell the user they need to run `npm run codegen` or that the backend endpoint doesn't exist yet. Never fabricate a DTO or bypass the contract.
5. **Change only what's necessary** — don't refactor unrelated files as a bonus, don't rename routes/exported hooks/shared props unless asked.
6. **If missing information would materially affect a contract/authorization/user-visible business rule → ask first.** If it doesn't rise to that level, decide with a minimal assumption consistent with nearby code, and state the assumption you used.
7. Once written, **never add comments to the code** (including section-divider comments), and never use `as any`.

Quick pre-submit checklist: component doesn't use `React.FC` → form goes through the full 10-point Formik+Zod contract → tables use `StandardDataTable` → notifications use Swal → dates use `formatThaiBuddhistDate` → icon buttons use `@mui/icons-material` → every API call checks `isSuccess === false` → loading/error/empty states are handled → no comments in code → no `React.FC`, no Breadcrumbs

---

## §1. Stack and Project Structure

**Core stack**: React 18 + TypeScript 5 + Vite · MUI 5 (icons from `@mui/icons-material` only) · Formik + Zod (`zod-formik-adapter`, no Yup) · React Query v4 (`@tanstack/react-query`) · Redux Toolkit + redux-persist · React Router v6 · `sweetalert2` · `dayjs` · `mui-datatables` (via `StandardDataTable`) · `oidc-client-ts` (OIDC auth) · `@microsoft/signalr` (realtime) · `nswag` (API client codegen)

```
src/
├── app/
│   ├── api/                      API layer
│   │   ├── smilehcmapi.api.ts    auto-generated (nswag) — never hand-edit
│   │   ├── index.ts              exports client instances
│   │   └── <module>Api.ts        service + React Query hook per module
│   ├── layout/                   Layout, sidebar, theme
│   ├── modules/                  Feature modules (module-first structure)
│   │   ├── _common/              Shared: CustomFormik, DataTable, zodHelpers, sweetAlert, apiErrorMessage
│   │   ├── _auth/                AuthProvider, PermissionProvider, ApprovalGuard
│   │   ├── Employee/ EmployeePrograms/ HRPrograms/ Movement/ Notifications/ Organization/ Setting/
│   ├── pages/                    General pages
│   └── routes/                   Routes.tsx, ASideMenuList.tsx
│   └── hook/                     shared hooks
├── redux/                        store, hooks
├── services/                     supporting services (SignalR, lookups)
└── types/                        ambient .d.ts
```

**Source of truth when rules conflict**: current user instruction > `AGENTS.md`/local override > actual code + generated types + existing patterns > `docs/`

**Do not create new top-level folders** unless the current architecture genuinely can't accommodate the need.

---

## §2. Global Coding Principles

- Read nearby code before changing anything.
- Preserve existing route paths, menu codes, API wrapper contracts, generated DTO names, and response shapes unless explicitly asked to change them.
- Move reusable data access into a hook/API file, and shared UI behavior into a local component/shared helper — don't let page components bloat.
- Don't add new packages unless necessary.
- Use types from the generated API contract wherever possible; avoid `any`.
- **Never write comments in application code** (including section-divider comments like `// ─── ... ───`) — use descriptive naming instead. Keep any pre-existing comment that is still necessary and unrelated to the part being changed.
- Imports: follow the ordering style of neighboring files in the same module (external libs → internal absolute/relative → local).

---

## §3. Component Pattern

```tsx
interface Props {
    employeeId: number;
    onClose: () => void;
}

function EmployeeSummaryCard({ employeeId, onClose }: Props) {
    return <Card>...</Card>;
}

export default EmployeeSummaryCard;
```

Rules:
- **Never use `React.FC`** — declare as a plain function + `interface Props` when props exist.
- Icons come from `@mui/icons-material` only (don't add another icon package, unless the screen you're touching already relies on one for consistency).
- **No Breadcrumbs.**
- All tables use `StandardDataTable` (see §6).
- In a filter row: every input/dropdown/autocomplete/date picker/action button must render at the same compact height as the adjacent `TextField size="small"` — don't force a fixed height without a visual comparison, and don't reserve blank helper-text space (let validation messages expand only their own field downward).

### Tall dialogs (preventing double-scroll)

```tsx
<Dialog PaperProps={{ sx: { height: "90vh", overflow: "hidden" } }}>
    <DialogContent sx={{ minHeight: 0 }}>
```

If there's unsaved/temporary server state, disable backdrop/Escape dismissal and provide a clear cancel/close action that does the cleanup instead.

### Create/Edit dialog action buttons

Cancel = `variant="contained" color="error"`, Save = `variant="contained" color="success"` (unless the screen already has an established feature-specific design).

---

## §4. Formik + Zod Contract (mandatory for every new/modified form)

```tsx
interface FormValues {
    employeeId: number | null;
    startDate: Dayjs | null;
    reasonId: string;
    remark: string;
}

const schema = z.object({
    employeeId: z.number({ required_error: "Please select an employee" }),
    startDate: zod.dayjs("Please select a date"),
    reasonId: z.string().min(1, "Please select a reason"),
    remark: z.string(),
}).superRefine((values, ctx) => {
    if (someConditionalRule(values)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Error message", path: ["remark"] });
    }
});

const initialValues: FormValues = { employeeId: null, startDate: null, reasonId: "", remark: "" };

<Formik<FormValues>
    initialValues={initialValues}
    validationSchema={toFormikValidationSchema(schema)}
    onSubmit={async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
        ...
    }}
>
    {(formik) => (
        <Form>
            <FormikDropdown name="reasonId" label="Reason" formik={formik} options={reasonOptions} />
            <FormikDatePicker name="startDate" label="Start Date" formik={formik} size="small" hideEmptyHelperText />
            <FormikTextField name="remark" label="Remark" formik={formik} />
        </Form>
    )}
</Formik>
```

10 mandatory rules:
1. Always declare a typed `interface FormValues`.
2. `<Formik<FormValues>>` — always pass an explicit generic.
3. `validationSchema` from a Zod schema + `toFormikValidationSchema(schema)` — **never use Yup, never mix Yup and Zod.**
4. `initialValues` must be fully typed, no implicit `any`.
5. Always prefer `CustomFormik` inputs first: `FormikTextField`, `FormikDropdown` (**always used instead of `FormikSelect`**), `FormikDatePicker`, `FormikAutocomplete`/`FormikAutocompleteApi`/`FormikAutocompleteMultiple`, `FormikCheckbox`/`FormikCheckboxGroup`, `FormikRadioGroup`, `FormikSwitch`, `FormikTextNumber`, `FormikTextMask`/`FormikTextMaskPhone`, `FormikSlider`, `FormikRating`, `FormikDropdownMultiple`, `FormikMobileTimePicker`.
6. Don't wire a raw MUI input to `formik.handleChange` by hand unless a shared control genuinely can't support the interaction.
7. **Never use `as any`** on formik or field values — fix the type at its source.
8. `setFieldValue(name, value, shouldValidate)`: `true` = a user action that must revalidate immediately, `false` = an internal derived update.
9. Dependent fields must be cleared/updated deterministically in the same handler.
10. Submit handler type: `(values: FormValues, helpers: FormikHelpers<FormValues>) => ...`

Other validation rules:
- All logic (including conditionals) lives in the Zod schema; use `superRefine` when needed.
- Error messages must be user-facing, in Thai when the screen is Thai.
- When a rule depends on a selected type/policy, compute the flag first, then build the schema from that flag.
- No second form-state manager nested in, and don't duplicate the canonical value in local `useState`.
- One exception: `FormikTextField deferChangeUntilBlur` is only for fields inside `mui-datatables` cells, to prevent caret jumping (see §6) — Formik is still the canonical state, committed only on blur.

`FormikDatePicker` gotcha: defaults to `size="medium"` and always reserves a blank helper-text line (~23px taller than `size="small"`) — when placed in the same row as small dropdowns/autocompletes, always pass `size="small" hideEmptyHelperText`.

Available Zod helpers (`_common/zodHelpers.ts`): `zod.dayjs(errorMessage)`, `zod.string.isThaiCitizenID(...)`, `zod.string.isPhoneNumber(...)`, `zod.number.coerce(...)`, `zod.number.supportDropdown(...)`, `zod.boolean.required(...)`, `zod.helpers.zodInitLazy(...)`, `zod.addIssue.custom(...)` — check these before writing a custom validator.

---

## §5. API Hook Pattern

Reference file: `src/app/api/employeeApi.ts`

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveRequestClient } from ".";
import { CreateLeaveRequestDto, ServiceResponse } from "./smilehcmapi.api";

export const employeeLeaveRequestsQueryKeys = {
    all: ["employee-leave-requests"] as const,
    list: (params: LeaveRequestListParams) => [...employeeLeaveRequestsQueryKeys.all, "list", params] as const,
    detail: (id: number) => [...employeeLeaveRequestsQueryKeys.all, "detail", id] as const,
};

export const useEmployeeLeaveRequestsQuery = (params: LeaveRequestListParams) =>
    useQuery({
        queryKey: employeeLeaveRequestsQueryKeys.list(params),
        queryFn: () => leaveRequestClient.getLeaveRequests(params),
    });

export const useCreateLeaveRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateLeaveRequestDto) => leaveRequestClient.createLeaveRequest(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeeLeaveRequestsQueryKeys.all });
        },
    });
};
```

Mandatory rules:
1. **Never write a raw path or call `axios.request` directly** — use generated clients from `smilehcmapi.api.ts` only, through the instances exported in `src/app/api/index.ts`.
2. If the client instance you need isn't in `index.ts` yet → add and export it there first.
3. Service functions: PascalCase; React Query hooks: prefixed with `use...`.
4. Must have a dedicated `queryKeys` object per module, matching the style in `employeeApi.ts`.
5. The `useQuery`/`useMutation` structure must match other API files in the project.
6. Every successful mutation must invalidate all related query keys.
7. Use types from `smilehcmapi.api.ts` only — **never duplicate a DTO/type.**
8. **Never hand-edit `smilehcmapi.api.ts`** (auto-generated by nswag) — if a field/method is missing, run `npm run codegen` and check again. If it's still missing, tell the user; never fabricate a DTO or bypass the contract.

### Gotcha: HTTP 200 doesn't mean success

No axios interceptor checks `isSuccess` — an API can respond `200 { isSuccess: false, message: "..." }` without throwing. Every call site must check it itself.

**Project standard: `isSuccess === false` = failure** (a response without `isSuccess`, e.g. a 204, is considered success — **never use `isSuccess !== true`**, since that turns a 204 into a false error).

```ts
const isServiceSuccess = (response?: { isSuccess?: boolean | null }) => response?.isSuccess !== false;

const response = await someMutation.mutateAsync(payload);
if (!isServiceSuccess(response)) {
    throw response;
}
```

If an endpoint returns a structured error (`errors.header`/`errors.message`), don't build a new `Error(message)` (it drops the detail) — throw the original response envelope and normalize it with `getApiErrorMessage` (`src/app/modules/_common/apiErrorMessage.ts`) at display time.

### Gotcha: `invalidateQueries` in the hook + `refetch()` in the component = a duplicate GET

`mutateAsync` waits for `onSuccess` (including `invalidateQueries`) to finish before resolving, so **don't call `refetch()` after a mutation if the hook already has `invalidateQueries`** — the exception is tables that don't use react-query (fetched straight into `useState`), which must reload manually since invalidation doesn't reach them.

### Pagination — always use the existing query parameter names

`page`, `recordsPerPage`, `ascendingOrder`, `orderingField`, `searchDetail` (default page = 1, default recordsPerPage = 10 unless a nearby module sets a different default), and keep table state synced with `response.pagination.currentPage`/`recordsPerPage`/`totalAmountRecords`.

A search box triggered by an explicit Search button or Enter must send the trimmed keyword with no hidden minimum length. Typeahead/debounced inputs may enforce a minimum, but the UI must make that clear.

---

## §6. Table Pattern

Main component: `StandardDataTable` (`src/app/modules/_common/components/DataTable`) — **every table in the system uses this as the default; never build a table from scratch.**

```tsx
<StandardDataTable
    title="Request List"
    data={rows}
    columns={columns}
    options={{
        serverSide: true,
        page: pagination.currentPage - 1,
        count: pagination.totalAmountRecords,
        sortOrder: { name: pagination.orderingField, direction: pagination.ascendingOrder ? "asc" : "desc" },
        onColumnSortChange: handleSort,
        onChangePage: handlePageChange,
    }}
/>
```

Rules:
- Action column is always **rightmost**, using `TableActionButtons` (`_common/components/DataTable/TableActionButtons.tsx`) — don't hand-roll `IconButton`s (supports `onView`, `onEdit`, `editDisabled`, `editMenuCode` — passing `editMenuCode` auto-wraps the edit button in `PermissionGuard`).
- Status: a fixed boolean (active/inactive) → `ColumnIsActive`; a label coming straight from the API → `StatusDotChip` directly, with the shared palette `bgColor="#E9FFEF" color="#409261"` (true/positive) and `bgColor="#FFE4E4" color="#C62828"` (false/negative) — **never hand-roll a `<Chip>` or write status text yourself.**
- Dates in tables always use `formatThaiBuddhistDate`.
- Pagination/filter/search must follow the existing pattern — don't invent a new mechanism.

### Gotcha: server-side sort must control `sortOrder` yourself

If you don't pass `options.sortOrder`, mui-datatables treats sort state as uncontrolled and resets direction every time `columns` changes reference (which happens on nearly every render) → clicking the header stops toggling the arrow, i.e. "sorting doesn't work". Always pass `sortOrder: { name, direction }`, and the column `name` must match the field the backend sorts by — if it doesn't, map it when firing the request.

### Gotcha: header checkbox + `selectToolbarPlacement: "none"`

**Don't set `selectToolbarPlacement: "none"`** — `StandardDataTable` already hides the toolbar via CSS. If it's set and even one row has `isRowSelectable` returning false, the header checkbox breaks into an always-"deselect" state. Also, `isRowSelectable` must match the same condition as the reducer that stores the selected rows (since `rowsSelected` is a controlled prop).

### Gotcha: the caret jumps to the end of the text in a cell input

A controlled `TextField` inside `customBodyRender`/`customBodyRenderLite` whose `onChange` updates page-level state directly causes every keystroke to rebuild the cell (caret jumps to the end) — use `EditableTableTextField` (holds a draft while focused, commits on blur) or `FormikTextField deferChangeUntilBlur` for Formik fields, and only in this specific case.

---

## §7. Notification Pattern (Swal)

Use `sweetalert2` (`import Swal from "sweetalert2"`) for every case — **never use the browser `alert()`, MUI Snackbar, or another library.**

```ts
await Swal.fire({ icon: "success", title: "Saved successfully", confirmButtonText: "OK" });

await Swal.fire({
    icon: "error",
    title: "Save failed",
    text: getApiErrorMessage(error, "Please try again"),
    confirmButtonText: "OK",
});

const result = await Swal.fire({
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#2e7d32",
    cancelButtonColor: "#d32f2f",
    reverseButtons: true,
    allowOutsideClick: false,
});
if (result.isConfirmed) { /* ... */ }
```

`getApiErrorMessage` (`_common/apiErrorMessage.ts`) handles both HTTP errors and HTTP 200 with `isSuccess === false`, a direct envelope, Axios `response.data`, NSwag `result`/`response`, and JSON strings — the priority order is structured `errors` (deduplicated, max 3 items) → top-level `message` → FE fallback. **Never show `exceptionMessage`, stack traces, or raw transport messages.**

---

## §8. Dates, Enums/Constants, Authorization

- Always display dates with `formatThaiBuddhistDate(...)`.
- Send dates to the API as `YYYY-MM-DD` or `toISOString()`, per the confirmed endpoint contract.
- **Never hardcode a magic string when an existing enum/constant represents it** — always reuse existing helpers/types before creating new ones.
- Frontend permission checks are for navigation/UX only — the backend is the real security boundary. Never bypass `AuthProvider`, `PermissionProvider`, `ApprovalGuard`, route permission handles, or the OIDC token flow.
- Every new page must have permission wired at all levels: route handle, sidebar menu (`ASideMenuList.tsx` bound to the same `menuCode` as `Routes.tsx`), and action buttons wrapped in `PermissionGuard`.
- Don't hardcode role checks (`ADMIN`/`DEVELOPER`) in feature UI unless a business rule genuinely requires it — keep it data-driven from the backend permission layer.

---

## §9. Data-Fetching Pages Must Always Handle 3 States

Every data-fetching page must explicitly handle **loading, error, and empty** states — error handling follows the same pattern as §7.

---

## §10. Commit & PR

Commit: `<type>: <subject>` (Thai subject in the original project convention), type ∈ feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert — **never include `Co-Authored-By` or AI attribution.**

Before opening/pushing a PR, `npm run build` must pass (use `npx tsc --noEmit` during dev for faster type feedback).

PR body uses a single `## Summary` section with bullet points, covering implementation details, user/operational impact, API/security impact, and test results/limitations — **no AI credit footer.**

---

## §11. Combined Do-Not List

- No `React.FC`, no Breadcrumbs, no icons outside `@mui/icons-material`.
- No comments in app code (including section dividers), no `as any` on formik/field values.
- No Yup, no mixing Yup+Zod, no second nested form-state manager, no `FormikSelect` (use `FormikDropdown`).
- Never hand-edit `smilehcmapi.api.ts`, never duplicate a DTO/response envelope/pagination model, never call raw `axios.request`.
- Never use `isSuccess !== true` (use `!== false`), never call `refetch()` again after a mutation that already has `invalidateQueries`.
- Never build a table from scratch (use `StandardDataTable`), never hand-roll action buttons/status chips.
- No browser `alert()`/MUI Snackbar (use Swal), never show a raw exception/stack trace to the user.
- Never bypass authorization/OIDC, never hardcode role checks unnecessarily, never let the client choose the owner/approver identity itself (it must come from the token).
- Don't refactor/rename routes, hooks, or props that weren't asked for; don't create new top-level folders unnecessarily.

---

## §12. Observed Code Style & Behavior Patterns (extracted from real code, not from `AGENTS.md`)

This section comes from grepping/statistically sampling the real codebase, not from any declared rule — these are the team's actual "habits" an agent should mimic so new code blends in, even where no explicit rule exists.

### Formatting (enforced via Prettier, `.prettierrc.json`)

```json
{ "trailingComma": "es5", "tabWidth": 4, "semi": true, "singleQuote": false, "printWidth": 120, "endOfLine": "crlf" }
```

→ 4-space indentation, double quotes always (only 4 stray single-quote imports found in the whole project), semicolons on every statement, lines up to 120 chars, ES5 trailing commas, **CRLF** line endings (careful with tools that normalize a whole file to LF — see the `vite.config.ts` gotcha in §1).

### Component declaration: `function` clearly dominates over arrow functions

Sampling shows `function ComponentName(...)` (function declarations) outnumbering `const ComponentName = (...) =>` roughly 4-5x → default to writing components as `function` declarations, not arrow-function consts, except for tiny helpers local to the same file.

### Export: `export default` inline with the declaration, not at the end of the file

The dominant pattern (289 files) is:

```tsx
export default function EmployeeSummaryCard({ mode = "single" }: EmployeeSummaryCardProps) {
```

i.e. `export default` sits directly on the declaration line, not declared first and exported later as `export default ComponentName;` at the bottom (a separate named-export style, `export function X`, exists but is much rarer, ~13 files). When a component must be wrapped in `memo`, write it as a separate `export default memo(ComponentName);` line at the end of the file — this repeats across several tab components (`ContactTab`, `WorkTab`, `LicenseTab`).

### `interface` vs `type` for Props: not fixed, but `interface` is the documented standard

`AGENTS.md`/Conventions call for `interface Props` as the standard, but real code mixes both `interface XxxProps` (65 files) and `type XxxProps` (100 files) → **follow the nearest neighboring file in the same module first**; if there's nothing to go on, default to `interface Props` per the Conventions doc.

### Event handlers are always named `handleVerbNoun`

A consistent pattern across the whole project: `handleSave`, `handleSearch`, `handleCancel`, `handleSubmit`, `handleDelete`, `handleClose`, `handleClearSearch`, `handleConfirm`, `handleChange`, `handleOpenCreate` / `handleOpenEdit`, `handleCloseDialog`, `handleConfirmRejectDialog`, `handleChangeStatus`, `handleSelectionChange` → always name new handlers `handle` + Verb (+ Noun/context). Don't use alternate shapes like `onSaveClick` or `saveHandler`.

### Dialog/modal state: a boolean `open...` paired with its own setter, not an `anchorEl` pattern

Recurring shape: `const [openDetail, setOpenDetail] = useState(false)`, `const [openRejectDialog, setOpenRejectDialog] = useState(false)`, `const [openCancelDialog, ...]`, `const [openDialog, ...]` → name the state `open` + the dialog/context name (not just bare `open` unless the screen has exactly one dialog), paired with `handleOpen...`/`handleClose...`.

### Loading/processing flags: always `is` + verb-ing

`isSaving`, `isSubmitting`, `isExporting`, `isDownloading`, `isValidating`, `isLoadingRows`, `isActionDelayLoading` → every boolean flag representing an in-progress state uses the `is` + verb-ing prefix. Don't use bare names like `saving` or a plain `loading` when a screen has multiple loading flags.

### `useState` initial value: `null` is preferred over `undefined`

`useState<T | null>(null)` (157 occurrences) outnumbers `useState<T | undefined>(undefined)` (35 occurrences) by ~4.5x → for state that has no value yet / nothing selected, default to `null`, not `undefined`.

### `useMemo` is used far more often than `useCallback`

`useMemo` appears in 247 files vs `useCallback` in 69 → the team's habit is to derive data (filtered options, table columns, mapped table rows) via `useMemo` as the default, and reach for `useCallback` only when genuinely needed (passed as another effect's dependency, or passed down to a memoized child). **Don't wrap every handler in `useCallback` reflexively** — that's not how this codebase actually behaves.

### Optional chaining (`?.`) is used everywhere

Over 5,800 occurrences of `?.` across the project → default to `?.` when accessing a property that might be null/undefined, rather than a separate `if (x && x.y)` check.

### Error-handling behavior: every `catch` surfaces a Swal, never a silent `console.error`

Nearly every `catch (error)` block in UI code is immediately followed by `await Swal.fire({ icon: "error", ..., text: getApiErrorMessage(error), confirmButtonText: "ตกลง" })`. No pattern of a silent `console.error` that swallows the error was found → the project's standard behavior is that **any user-triggered error must always be surfaced to the user, never just logged silently**.

### Loading indicator: `CircularProgress` is the real default

`CircularProgress` is used 226 times, vs `Skeleton` 17 times and `LoadingBackdrop` 8 times → use a spinner (`CircularProgress`) as the first choice for a general loading state. Reserve `Skeleton` for content-heavy list screens, and `LoadingBackdrop` only for full-page/full-dialog blocking.

### Per-feature folder structure: `page/` + `components/` almost always

Every feature module sampled (e.g. `Leave/LeaveRequest`, `TimeAttendance/AttendanceHistory`) almost always has a `page/` subfolder (the main page) and a `components/` subfolder (feature-specific sub-components); some also have `data/` (static feature-specific options/config), `components/Tabs/`, `components/detail/` for deeper nested sub-views — always follow this shape for a new feature; don't mix the page component and its sub-components into a single file.

### `index.ts` barrel exports: rare, and not created casually

Only 7 `index.ts` files exist in the whole project (mostly under `_common`) → most imports point directly at a file's full path; the team doesn't casually create new barrel files for ordinary feature modules — reserve that for genuinely large export sets like `CustomFormik/index.ts`.
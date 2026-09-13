# ⚠️ งาน "โอนเงินเคลมเพิ่ม" / โอนเงินเพิ่ม / ขยายวงเงิน (IncreaseLimitTransfer)

> **เวลาทำงานเกี่ยวกับโอนเงินเพิ่ม (โอนเงินเคลมเพิ่ม / ขยายวงเงิน / IncreaseLimitTransfer) ต้องเปิดไฟล์นี้มาอ่านก่อนทุกครั้ง**
> ห้ามข้ามแม้ภารกิจจะดูง่าย ทุกงานของโมดูล `IncreaseLimitTransfer` + ของที่อ้างข้ามโมดูลจาก Refund

---

## งานเสร็จแล้ว ✅ — ย้าย API ไปใช้ VITE_APIGW_CLAIM_FUND_API_URL

เป้า: งานโอนเงินเคลมเพิ่มทั้งหมด (โมดูล `IncreaseLimitTransfer`) ให้ใช้ API จาก env `VITE_APIGW_CLAIM_FUND_API_URL = "https://localhost:5001/api/ClaimFund"`

### ไฟล์ที่แก้
- **`src/vite-env.d.ts`** — เพิ่ม type `VITE_APIGW_CLAIM_FUND_API_URL: string` (+ มี `VITE_NPL_URL` ของฝั่งอื่นอยู่)
- **`src/Const.ts`** — เพิ่มตัวแปรใน destructure + export `APIGW_CLAIM_FUND_URL = VITE_APIGW_CLAIM_FUND_API_URL`
- **`IncreaseLimitTransfer/_common/masterAPI.ts`** — จุดที่ใช้ API จริงของโมดูลนี้ (มีแค่ masterAPI):
  - `useGetBranch` (ตัวเลือกสาขา) → **คง API เดิม** `{APIGW_URL}/claim/core/Masters/branch`
  - `useGetPaymentStatus(enabled = true)` → `{APIGW_CLAIM_FUND_URL}/Masters/GetPaymentStatuses` (ตัด `/ClaimFund` เพราะ base มี `/api/ClaimFund` แล้ว) — มี opt-in `enabled` ใช้ได้กับ flow ที่ต้องการ defer
- **`.env`** — มี `VITE_APIGW_CLAIM_FUND_API_URL = "https://localhost:5001/api/ClaimFund"` อยู่แล้ว
- `.env.dev` / `.env.uat` / `.env.production` — **ไม่ override** → inherit ค่า localhost:5001 จาก `.env`

### ผลกระทบที่ต้องรู้
- `Refund/_common/SearchByBranchAndStatus.tsx` + `Refund/_common/RefundSearchFilterForm.tsx` import `useGetBranch`/`useGetPaymentStatus` จาก masterAPI → policy: สาขา = API เดิม, status = ClaimFund ตัวใหม่
- `increaseLimitTransferAPI.ts` ยังว่าง; ตาราง `ClaimDetailsDataTableHook.tsx` ยังใช้ mock (`dataMock`) ยังไม่ยิง API จริง — รอเชื่อม API เหมือน RefundApprove
- typecheck: error เหลือเฉพาะกลุ่มเดิม (AdjustTransfer, BankStatus, ManageClaimTransferDetails, ManageTransfer) — ไฟล์ที่แก้ต้องไม่มี error

### สมมติฐานที่ใช้ (ยังไม่ยืนยันจาก backend)
- endpoint payment status ใหม่ = `{base}/Masters/GetPaymentStatuses` (ตัด `/ClaimFund` ที่ซ้ำ) — ถ้า endpoint จริงไม่ตรง ต้องแก้ตาม

---

## โครงสร้างโมดูล IncreaseLimitTransfer (ขยายวงเงิน)

```
IncreaseLimitTransfer/
├── page/IncreaseLimitTransfer.tsx          หน้า: ClaimSearchFilterForm + ClaimDetailsDataTable
├── _common/ClaimSearchFilterForm.tsx       ฟอร์มค้นหา (ค้นหาจาก/CPG-CL/สาขา/สถานะ/ช่วงวันที่) — payment-only shared
├── _common/masterAPI.ts                    useGetBranch / useGetPaymentStatus
├── increaseLimitTransferAPI.ts             ว่าง (ยังไม่ได้เขียน hook)
├── hooks/ClaimSearchFilterFormHook.tsx     ClaimSearchFilterValues + useFormik (onSubmit ว่าง)
├── hooks/ClaimDetailsDataTableHook.tsx     ตาราง mock (dataMock), columns + StatusPill, actions TODO
└── components/ClaimDetailsDataTable.tsx    ใช้ StandardDataTable (name cpgTransfer)
```

- route: `/manage/increase-limit-transfer` (title "ขยายวงเงิน") — `Routes.tsx`, เมนู `ASideMenuList.tsx:78`
- `ClaimDetailsDataTableHook.tsx` fields: `cpgCode, claimNo, createdDate, branch, amount, accountNo, transferType ("โอนเงินเพิ่ม"/"โอนเงินครั้งแรก"), status (รอตรวจสอบ/อนุมัติ/ปฏิเสธ), reason`

---

## งานที่รอต่อ (ถ้าทำต่อ)
1. เขียน `increaseLimitTransferAPI.ts` — hook ยิง API หน้าจริง + ต่อ `handleSummit` ที่ `page/IncreaseLimitTransfer.tsx` (ตอนนี้ว่าง) ให้ยิง API ทุกกดค้นหา (แบบ RefundApprove: `filter` + `hasSearched` + `searchKey` ใน query key)
2. เปลี่ยน `ClaimDetailsDataTableHook.tsx` จาก mock → response จริง + connect action view/edit
3. หลังแก้ทุกครั้ง: `npx tsc --noEmit` ตรวจ error เฉพาะไฟล์ที่แก้
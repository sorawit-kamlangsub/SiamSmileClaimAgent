# ⚠️ งาน "โอนเงินเคลมเพิ่ม" / โอนเงินเพิ่ม / ขยายวงเงิน (IncreaseLimitTransfer)

> **เวลาทำงานเกี่ยวกับโอนเงินเพิ่ม (โอนเงินเคลมเพิ่ม / ขยายวงเงิน / IncreaseLimitTransfer) ต้องเปิดไฟล์นี้มาอ่านก่อนทุกครั้ง**
> ห้ามข้ามแม้ภารกิจจะดูง่าย ทุกงานของโมดูล `IncreaseLimitTransfer` + ของที่อ้างข้ามโมดูลจาก Refund

---

## งานเสร็จแล้ว ✅ (ล่าสุด) — flow "โอนเพิ่ม" ย้ายเข้า CodeGen `coreClaimApi` แล้ว

> อัปเดต: flow **โอนเพิ่ม (AdditionalTransfer = menu `/manage/adjust-transfer` เริ่มที่ AdjustTransferPage)** ย้ายจาก raw axios ไปใช้ CodeGen `ClaimFundClient` ทั้งหมดแล้ว — ใช้ base `API_URL` (= `VITE_API_URL`, ไม่ใช่ APIGW) ตามคำสั่ง user "ให้ใช้ VITE_API_URL อย่างเดียว ของเมนูโอนเพิ่ม"

- **ที่เดียวที่แก้:** `src/app/api/coreClaimApi.ts` (wrapper ตัวเขียนเอง) ต่อท้าย block "โอนเพิ่ม (ClaimFund / AdditionalTransfer)" — `claimFundClient = new ClaimFundClient(API_URL, axios)` (coreClaimApi.ts:29, มีมานานแล้ว) hooks ใหม่ 8 ตัว:
  - `useGetAdditionalTransferMonitor(searchDetail?, orderingField?, ascendingOrder?, page?, recordsPerPage?, filter?{branceId?,paymentStatusId?}, searchTrigger?, enabled?)`
  - `useGetAdditionalTransferAccountDetail(paymentId?)`
  - `useSearchClaimOrCase(onSuccess?, onError?)` — mutation `(searchDetail: string)` → `GET Setting/SearchClaimOrCase` (dialog search ใช้ร่วมกับ Refund)
  - `useGetAdditionalTransferDetails(caseId?)` · `useGetAdjustmentReasons(adjustmentTypeId?)` · `useGetClaimTransactions(caseId?, ..., page?, recordsPerPage?)` · `useGetTransferHistory(caseId?, ..., page?, recordsPerPage?)`
  - `useSaveAdditionalTransfer(onSuccess?, onError?)` — mutation `(body: SaveAdditionalTransferRequest)`; invalidate monitor/details/transactions/history
- **ลบไฟล์ hand-rolled 3 ไฟล์แล้ว:** `AdjustTransfer/adjustTransferMonitorAPI.ts`, `DialogSearchByClaimOrCase/dialogSearchClaimAPI.ts`, `ManageClaimTransferDetails/adjustClaimAPI.ts`
- **Consumer ที่ย้าย:** `AdjustTransfer/hooks/AdjustTransferDataTableHook.tsx` (monitor table) · `AdditionalTransferAccountDetailHook.tsx` (edit bank dialog) · `DialogSearchByClaimOrCase/hooks/DialogSearchHook.tsx` · `ManageClaimTransferDetails/hooks/Adjust/{ManageAdjustDetailHook,TransactionClaimDetailHook,TransferHistoryTransferHook}.tsx` (+ components ออก shape ให้ตรง DTO: `TransferItemRow`, `ReceivingAccountCardProps`, `PayTransferDetail`)
- **`coreClaimApi.client.ts` ไม่ได้แตะ** — endpoint พวกนี้มีใน client อยู่ก่อนแล้ว (ตั้งแต่ commit `5aed3a8`) ทีมรัน codegen เองตอน merge dev ก็ยังได้ method เดิม → wrapper ไม่สลัด
- ⚠️ **`GetPaymentStatuses` ใน flow นี้ยังไม่เข้า CodeGen** — ตัวเลือก status ใน `SearchByBranchAndStatus.tsx` (ใช้ทั้งหน้าโอนเพิ่ม AdjustTransferPage + RefundPage) ยังเรียก `IncreaseLimitTransfer/_common/masterAPI.ts` `useGetPaymentStatus` → URL = `${APIGW_URL}/claim/core/ClaimFund/Masters/GetPaymentStatuses` (base `APIGW_URL` = **`VITE_APIGW_BASEURL`**) — ต่างจาก `api/coreClaimMastersApi.ts` `useGetPaymentStatus` ที่ใช้ `VITE_API_URL`; สาขา `useGetBranch` ก็มาจาก masterAPI เดิม (policy เดิม: สาขา/status = API เดิม ไม่ย้าย)
- ตรวจแล้ว: `npx tsc --noEmit` ผ่าน (ไม่มี error) + lint ไฟล์ที่แก้ไม่มี error

---

## งานเสร็จแล้ว (เก่า) — ย้าย API ไปใช้ VITE_APIGW_CLAIM_FUND_API_URL

เป้า: งานโอนเงินเคลมเพิ่มทั้งหมด (โมดูล `IncreaseLimitTransfer`) ให้ใช้ API จาก env `VITE_APIGW_CLAIM_FUND_API_URL = "https://localhost:5001/api/ClaimFund"`

ขอบเขตล่าสุดกว้างขึ้น: ย้าย **ทุก API ที่อ้าง host เก่า `https://claimfundapi.uatsiamsmile.com`** (เดิม `VITE_CLAIM_FUND_API_URL` / export `API_CLAIM_FUND_URL`) ไปใช้ `VITE_APIGW_CLAIM_FUND_API_URL` **ยกเว้น master สาขา** (branch) ที่ยังใช้ API เดิม

### ไฟล์ที่แก้
- **`src/vite-env.d.ts`** — เพิ่ม type `VITE_APIGW_CLAIM_FUND_API_URL: string` (+ มี `VITE_NPL_URL` ของฝั่งอื่นอยู่)
- **`src/Const.ts`** — เพิ่มตัวแปรใน destructure + export `APIGW_CLAIM_FUND_API_URL = VITE_APIGW_CLAIM_FUND_API_URL` (ชื่อจริงที่ใช้คือ `APIGW_CLAIM_FUND_API_URL:57`; `API_CLAIM_FUND_URL:56` เหลือเป็น definition อย่างเดียว ไม่มีใครใช้แล้ว)
- **`IncreaseLimitTransfer/_common/masterAPI.ts`** — จุดที่ใช้ API จริงของโมดูลนี้ (มีแค่ masterAPI):
  - `useGetBranch` (ตัวเลือกสาขา) → **คง API เดิม** `{APIGW_URL}/claim/core/Masters/branch`
  - `useGetPaymentStatus(enabled = true)` → `${APIGW_URL}/claim/core/ClaimFund/Masters/GetPaymentStatuses` — ⚠️ base คือ **`VITE_APIGW_BASEURL`** (`APIGW_URL` ต่อ `/claim/core` แล้วต่อ `/ClaimFund` อีกทอด) ไม่ใช่ `APIGW_CLAIM_FUND_API_URL` — ตัวนี้คือที่ user ถาม "ทำไม GetPaymentStatuses เรียกจาก VITE_APIGW_BASEURL"; มี opt-in `enabled` ใช้ได้กับ flow ที่ต้องการ defer
- **`.env`** — มี `VITE_APIGW_CLAIM_FUND_API_URL = "https://localhost:5001/api/ClaimFund"` อยู่แล้ว
- `.env.dev` / `.env.uat` / `.env.production` — **ไม่ override** → inherit ค่า localhost:5001 จาก `.env`

### ไฟล์ที่ย้ายจาก host เก่า → APIGW_CLAIM_FUND_API_URL แล้ว (base = `https://localhost:5001/api/ClaimFund`)
| ไฟล์ | base เดิม (host เก่า) | path ต่อท้าย (คงเดิม) |
|---|---|---|
| ~~`AdjustTransfer/adjustTransferMonitorAPI.ts`~~ | ~~`${API_CLAIM_FUND_URL}/api/ClaimFund`~~ | ~~`/AdditionalTransfer/...`~~ — **ลบแล้ว** → ใช้ CodeGen `coreClaimApi.ts` (`ClaimFundClient` + `VITE_API_URL`) ดูหัวข้อ "งานเสร็จแล้ว ✅ (ล่าสุด)" ด้านบน |
| ~~`ManageClaimTransferDetails/adjustClaimAPI.ts`~~ | ~~`${API_CLAIM_FUND_URL}/api/ClaimFund`~~ | ~~`.../AdditionalTransfer/...`~~ — **ลบแล้ว** → ใช้ CodeGen `coreClaimApi.ts` (`useGetAdditionalTransferDetails`/`useSaveAdditionalTransfer` ฯลฯ) ดูหัวข้อด้านบน |
| `api/claimFundApi.ts` | `${API_CLAIM_FUND_URL}/api` | `/Transfer/v1/...` |
| `BankStatus/bankStatusCheckAPI.ts` | **ย้อนกลับแล้ว (คำสั่งรอบหลัง)** — ไม่ใช้ APIGW; กลับใช้ `${API_CLAIM_FUND_URL}/api/ClaimFund` (host เก่า `claimfundapi.uatsiamsmile.com`) → `/Inquiry/...` |
| `ManageTransfer/repayAPI.ts` | `${API_CLAIM_FUND_URL}` (host root) | `/FailTransfer/...` |
| `Survey/surveyAPI.ts` | **ข้อยกเว้น** — คงไว้ `API_CLAIM_FUND_URL/api` (host เก่า) ตามคำสั่ง เหมือน master สาขา | `/Notification/...`,`/Transfer/v1/PaymentDetails` |
| `ManageClaimFund/manageClaimFundAPI.ts` | `${API_CLAIM_FUND_URL}/api/ClaimFund` | `/Setting/...` |

- `BankStatus/bankStatusCheckAPI.ts` ยังมี `payTransferGWAPI_URL = ${APIGW_URL}/pay` (ไม่ใช่ claimfund host) — ปล่อยไว้
- ~~ตรวจแล้ว: generated `coreClaimApi.client.ts` มี class `ClaimFundApi` (endpoint AdditionalTransfer) แต่ **ไม่ถูก instantiate ที่ไหน** — งานใช้ raw axios ผ่านไฟล์ข้างบนทั้งหมด~~ → ข้อนี้เก่าแล้ว: `claimFundClient = new ClaimFundClient(API_URL, axios)` ที่ `coreClaimApi.ts:29` ถูก instantiate และ flow โอนเพิ่มใช้หมดแล้ว

### ผลกระทบที่ต้องรู้
- `Refund/_common/SearchByBranchAndStatus.tsx` + `Refund/_common/RefundSearchFilterForm.tsx` import `useGetBranch`/`useGetPaymentStatus` จาก masterAPI → policy: สาขา = API เดิม, status = ClaimFund ตัวใหม่
- `increaseLimitTransferAPI.ts` ยังว่าง; ตาราง `ClaimDetailsDataTableHook.tsx` ยังใช้ mock (`dataMock`) ยังไม่ยิง API จริง — รอเชื่อม API เหมือน RefundApprove
- typecheck: error เหลือเฉพาะกลุ่มเดิม (AdjustTransfer, BankStatus, ManageClaimTransferDetails, ManageTransfer) — ไฟล์ที่แก้ต้องไม่มี error

### สมมติฐานที่ใช้ (ยังไม่ยืนยันจาก backend)
- endpoint payment status ใหม่ = `{base}/Masters/GetPaymentStatuses` (ตัด `/ClaimFund` ที่ซ้ำ) — ถ้า endpoint จริงไม่ตรง ต้องแก้ตาม
- `repayAPI.ts` เดิม base = host root (`https://claimfundapi.uatsiamsmile.com` ไม่มี `/api`) → map เป็น `{base}/FailTransfer/...`; `claimFundApi`/`surveyAPI` เดิม `/api` → `{base}/...` (ทุก path ตอนนี้อยู่ใต้ `/api/ClaimFund` ทั้งหมด)

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
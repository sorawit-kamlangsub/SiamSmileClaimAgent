# Memory — ClaimAgent

## หมายเหตุสำคัญที่สุด (อ่านก่อนเสมอ)

- **รากที่เชื่อถือได้ = `D:\source\repo\ClaimAgent\src\app\modules\...`** (ผ่าน `read`/`edit` tool)
- มี mirror/ghost อีกต้น (`D:\source\repo` ตัวอื่น) ซึ่ง bash/git/Select-String มัก resolve ไปเจอทุกที และทำลาย byte string (`0hed`, `useTime`, `useState(0hed)` ฯลฯ) ตลอด
- **กฎ 2 ข้อที่ทำให้งานสำเร็จ (แทนที่จะวนลูป):**
  1. `read` tool เท่านั้น → เอา `oldString` มาจาก output ของ `read` ตรงตัว (byte-for-byte)
  2. ห้ามเอาค่า byte ใด ๆ จาก bash/git มาใส่ใน `edit` — git diff/bash มักถูกแทน CRLF/LF และ byte-corrupt จน `edit` ไปไม่ถึง

## สถานะงาน: Refund decoupling (ย้าย search form ออกจาก shared module)

เป้า: `ClaimSearchFilterForm` ที่ `IncreaseLimitTransfer/_common/` เป็นของ payment (IncreaseLimitTransfer) ล้วน อย่าให้มีคนใช้ module นั้นต้องแตะ Refund — ย้ายลอจิก refund ไปเป็นโมดูล Refund ของตัวเอง

### เสร็จแล้ว ✅
- `ClaimSearchFilterForm.tsx` (shared) = **payment-only กลับมาแล้ว** — ไม่มี `useGetRefundStatus` / `statusSource` / `statusId`-refund อีกต่อไป
- **โมดูลใหม่ `Refund/_common/RefundSearchFilterForm.tsx`** — self-contained:
  - import เฉพาะ: `useGetBranch` (IncreaseLimitTransfer/masterAPI) + `useGetRefundStatus` (Refund/refundAPI)
  - export: `RefundSearchFilterValues` (`searchBy`, `searchText`, `branchId`, `statusId`, `transferDateFrom/To`) + `RefundSearchFilterFormProps` (`initialValues?`, `onSubmit`)
  - มี dropdown สาขา / สถานะ refund / ช่วงวันที่, ปุ่มค้นหา
- **`refundAPI.ts`** → ขยาย `GetRefundMonitorFilterType` เพิ่ม `searchDetail?`, `searchKey?`, `enabled?` และรวมเข้า query key — **ทุกกดค้นหา (searchKey เปลี่ยน) call API ใหม่เสมอ** ส่วน `enabled` default เท่าเดิม (`!!refundStatusId`) จึงไม่กระทบ `RefundDataTableHook` เดิม
  - `getRefundMonitorData` POST body เพิ่ม `searchDetail` เฉพาะเมื่อมีค่า (ไม่ส่งถ้า null/empty)
- **`RefundApprovePage.tsx`** → ใช้ `RefundSearchFilterForm` แล้ว
  - state: `filter: RefundSearchFilterValues | undefined`, `hasSearched: boolean`, `searchKey: number`
  - `handleSearch` = setFilter + hasSearched=true + `searchKey+1` → **ทุกกดค้นหา call API ใหม่ (searchKey ใน query key)**
- **`RefundApprove/hooks/RefundApproveDataTableHook.tsx`** → เลิกใช้ mock dataMock เปลี่ยนเป็นยิง `useGetRefundMonitorWithFilter` จริง
  - รับ props `{ filter, hasSearched, searchKey }` (import type จาก `Refund/_common/RefundSearchFilterForm`)
  - mapping: `searchText→searchDetail`, `branchId→branceId`, `statusId→refundStatusId`
  - columns แสดงผลจาก response จริง; actions: status 2 → ดำเนินการ, status 3 → ดูรายละเอียด
- **`RefundApprove/components/RefundApproveDataTable.tsx`** → รับ props `{ filter, hasSearched, searchKey }` ส่งต่อให้ hook
  - ใช้ `ClaimFundStandardDataTable` + `delayNoMatch={hasSearched}`

### เสร็จแล้วเพิ่มเติม (session รอบหลัง) ✅
- **ตาราง monitor อนุมัติคืนเงิน (RefundApprove) → switch ไปใช้ API `Refund/RefundApproveMonitor`** (เดิมใช้ `Refund/RefundMonitor` ร่วมกับหน้า Refund)
  - `refundAPI.ts`: เพิ่ม key `getRefundApproveMonitorKey` + `useGetRefundApproveMonitorWithFilter` + `getRefundApproveMonitorData` — contract เดียวกับ `RefundMonitor` (POST body `branceId`/`refundStatusId`/`searchDetail` + query `Page`/`recordsPerPage`, response pagination เดิม) — `RefundMonitor` และ hook เดิมคงไว้ให้หน้า Refund ใช้ต่อ
  - `RefundApproveDataTableHook.tsx`: import สลับเป็น `useGetRefundApproveMonitorWithFilter`
- **Empty state (โหลดเสร็จแล้ว `data=[]`) → ขึ้น "ไม่พบข้อมูล" ทันที**
  - `RefundApproveDataTable.tsx`: ใช้ `noMatchText={NOT_FOUND_MESSAGE}` (constant จาก `claimFundStandardAlertMessage.ts`) + `delayNoMatch={false}` — เลิกแสดง "กำลังโหลดข้อมูล..." ค้างอีก 30 วิ (pitfall จาก `LOADING_NO_DATA_DELAY_MS` ใน `ClaimFundStandardDataTable`: effect reset timer ตอน `isLoading` เปลี่ยน → `minDelayReached` มา 30 วิหลังโหลดเสร็จ)
  - **`RefundDataTable.tsx` (หน้า monitor คืนเงิน `/manage/refund`) แก้ตามด้วย (รอบล่าสุด): เลิกใช้ `delayNoMatch={isStatusSelected}` → `delayNoMatch={false}` + `noMatchText={NOT_FOUND_MESSAGE}`** — เลือกสถานะแล้ว api ตอบ `data: []` ขึ้น "ไม่พบข้อมูล" ทันที
- **Error display 404 / error อื่น → เข้า table ผ่าน `mapErrorMessage` กลางของ ClaimFund**
  - `RefundApproveDataTable.tsx`: ส่ง `isError`/`error` ต่อจาก hook → `ClaimFundStandardDataTable` (ถ้า `isError` จะแสดงข้อความ error แทน noMatch)
  - `getRefundApproveMonitorData`: เปลี่ยนลอจิก error — `isSuccess:false` เดิมคืน `{...res.data, data:[]}` เงียบ (ขึ้น "ไม่พบข้อมูล") → เปลี่ยนเป็น throw `res.data.message`; catch สำคัญเอา `response.data?.message` ก่อน `err.message` แล้วค่อย fallback เป็น ""
  - **อย่าลืม:** อย่า `throw err.message` ตรง ๆ จาก `catch (err: Error)` เพราะ axios HTTP error จะได้แค่ "Request failed with status code 404" เสมอ — ต้องขุด `err.response.data.message` ก่อนเสมอ
- **Timeout API monitor อนุมัติคืนเงิน = 30 วิ** — `.post(url, body, { timeout: 30000 })` เฉพาะ `getRefundApproveMonitorData` (หน้า Refund ยังไม่ได้ตั้ง)
- **ส่งช่วงวันที่โอนคืน (`transferDateFrom`/`transferDateTo`) เฉพาะ monitor อนุมัติคืนเงิน (RefundApproveMonitor)** — contract ยืนยันกับ user แล้ว
  - `GetRefundMonitorFilterType` เพิ่ม `transferDateFrom?`/`transferDateTo?` (type `Dayjs`)
  - `getRefundApproveMonitorData`: ใส่ใน POST body **เฉพาะเมื่อมีค่า โดย field name ใน body = `fromDate`/`toDate`** (ไม่ใช่ `transferDateFrom/To`) `format("YYYY-MM-DD")` (เหมือน `searchDetail` — null/undefined = ไม่ส่ง) — ใส่ใน query key ด้วย (กดค้นหาใหม่ call ใหม่)
  - `RefundApproveDataTableHook`: ส่ง `filter?.transferDateFrom/To` ต่อจาก `RefundSearchFilterForm` (filter form default = วันนี้ทั้ง From และ To)
- **คอลัมน์ "เลขที่ CPG" → "เลขที่ CL"** — `RefundApproveDataTableHook` column `claimNo` label เปลี่ยนเป็น "เลขที่ CL" (เลขที่ CL = claimNo แบบเดียวกับหน้า Refund)
- **ข้อมูลต่อหน้าเริ่มที่ 10 (หน้า monitor อนุมัติคืนเงิน + หน้า Refund)**
  - `RefundApproveDataTableHook`: default state `recordsPerPage` 5 → **10** (ส่ง API + dropdown เริ่มที่ 10)
  - **ต้นตอที่แก้ไปแล้วยังเห็น 5:** `pagination` memo ใช้ `recordsPerPage: getRefundMonitorData?.recordsPerPage ?? 0` — ตอนยังไม่มี API response (หลังโหลดหน้าก่อนค้นหา) ค่าเป็น 0 → `StandardDataTable` เผลอ fallback ไป `rowsPerPageOptions[0]` = 5
  - **ทางแก้:** เปลี่ยน fallback เป็น `?? paginated.recordsPerPage` + ใส่ `paginated` ใน deps ของ `useMemo` — ทำทั้ง `RefundApproveDataTableHook` และ `Refund/RefundDataTableHook` (ฝั่ง Refund set state เป็น 10 อยู่แล้ว แก้แค่ memo)
  - ไม่แก้ใน `ClaimFundStandardDataTable`/`StandardDataTable` เพราะ default `[5,10,...]` เป็น shared ที่กระทบทุกตาราง ClaimFund — ถ้า user อยากให้ทั่วระบบค่อยว่าใหม่

### เสร็จแล้ว: หน้า `/manage/refund/detail` — เชื่อม API `Refund/CreateCaseRefund` ✅
- ปุ่ม "แจ้งคืนเงิน" (`ManageRefundDetailPage.tsx` → `formik.handleSubmit()`) ยิง API จริงแทน mock แล้ว:
  - `Refund/refundAPI.ts`: เพิ่ม `useCreateCaseRefund(onSuccess, onError)` + `createCaseRefund()` → `POST {APIGW_CLAIM_FUND_API_URL}/Refund/CreateCaseRefund` (mirror `useSaveAdjustTransfer` ใน `adjustClaimAPI.ts`)
  - `ManageRefundDetailHook.tsx`: เลิก mock `mutate` → `const { mutate: saveCaseRefundMutate } = useCreateCaseRefund(handleSaveSuccess, handleSaveError)` (success=`swalSuccess`, error=`swalError`)
- Mapping body `CreateCaseRefundPayload` (ยืนยันกับ user แล้ว):
  - `adjustmentTypeId` = `values.refundTransferType` (dropdown ประเภทการโอน)
  - `refundReasonId` = `values.reasonId` (dropdown สาเหตุที่โอนคืน)
  - `cacseId` = route param `id` (caseId) — **แก้จากเดิมที่ hardcode `"CL690400010"`**
  - `claimId` = `detailData?.claimId` (จาก response `SaveRefundDetails`; mock ยังไม่มี field นี้)
  - `refundDate` = `values.refundSlipDateTime` format `YYYY-MM-DDTHH:mm:ss`
  - `remark` = `values.note`
  - `decreaseAmount` = **ผลรวม** `additionalAmount` ทั้งตาราง (เดิม validate ใช้แค่ `items[0]` → เปลี่ยนเป็น sum ทุกแถว)
- ยังคงลอจิก validate เดิม + `swalConfirm`; `slipFile` ยังเป็น required ที่ฟอร์ม **แต่ body ไม่มี field ไฟล์** (API ยังไม่เปิดรับ — ถ้า backend รับ slip แยกค่อยต่อ)
- **หลังบันทึกสำเร็จ → `navigate("/manage/refund")`** (หน้า monitor คืนเงิน `RefundPage`; route parent `/manage/refund` มี child `refund` เป็น index + `detail/:id`) — เติม `useNavigate` ใน `ManageRefundDetailHook`, เรียกใน `handleSaveSuccess`
- **ดัก `isSuccess === false` หลังกดแจ้งคืนเงิน + แสดง message จาก API** (รองรับ HTTP 200 ที่ `isSuccess:false` เช่น `"เกิดข้อผิดพลาด รายการอยู่อยู่ระหว่างรออนุมัติ"`):
  - ต้นตอ: `createCaseRefund` เดิม `throw res.data.message` (string) แล้ว `.catch` อ่าน `err.message` จาก string → ได้ `undefined` → message หาย ผู้ใช้ไม่เห็นอะไรหลังกดแจ้งคืนเงิน
  - แก้ใน `refundAPI.ts`: `throw new Error(res.data.message ?? "")` + `.catch` ขุด `err.response.data.message` ก่อนแล้ว fallback `err.message` (pattern เดียวกับ `getRefundApproveMonitorData`) → `useCreateCaseRefund.onError` ได้ `error.message` จริง → `handleSaveError` → `swalError` แสดง message API
- **ดัก `data.isSuccess === false` (ชั้นในของ envelope) หลังกดแจ้งคืนเงิน → แสดงเป็น warning Icon ! สีส้ม (`swalWarning`)** (ตัวอย่าง envelope: `data: { caseAdjustmentId: null, isSuccess: false, message: "รายการอยู่อยู่ระหว่างรออนุมัติ" }` แต่ `data` ระดับบน `isSuccess: true`):
  - วิธีแยก: `isWarning = res.data.isSuccess === true && res.data.data?.isSuccess === false` — ระดับบน success แต่ชั้นใน fail = business warning (orange `!`); ระดับบน fail = error (แดง)
  - แก้ใน `refundAPI.ts`: `createCaseRefund` throw `Error` ที่ attach `isWarning` flag แล้ว `.catch` rethrow เดิมตอนไม่มี `.response` (ไม่ swallow flag); `useCreateCaseRefund` เพิ่ม param 3 (`onWarningCallback?`) ตรวจ `err.isWarning` → แยกไป warning
  - `ManageRefundDetailHook.tsx`: เพิ่ม `handleSaveWarning` = `swalWarning("แจ้งเตือน", err)` ส่งเป็น callback ตัวที่ 3 — ตัวอย่าง case นี้จะโชว์ "รายการอยู่อยู่ระหว่างรออนุมัติ" แบบ warning
  - clean อีก: ตัด branch `!response.isSuccess` ใน `onSuccess` (dead code หลัง refactor — createCaseRefund throw ทั้ง fail ชั้นนอก/ในแล้ว)
- typecheck: ผ่านในไฟล์ที่แก้ (error เหลือ pre-existing จาก AdjustTransfer/BankStatus/ManageTransfer)

### ค้าง ⏳ (งานต่อไป)
- ปุ่มดำเนินการ/ดูรายละเอียดในตารางยังเป็น TODO (console.log) — รอเชื่อม dialog/detail page
- typecheck: ผ่านในไฟล์ที่แก้ ทั้งหมด error เหลือจาก module อื่นที่มีอยู่เดิม (AdjustTransfer, BankStatus, ManageClaimTransferDetails, ManageTransfer)

### เสร็จแล้วเพิ่มเติม: กรองตัวเลือกสาขาตามสิทธิ์ employee_branchid ✅
- ที่มา: `employee_branchid` จาก userinfo (`https://authlogin.uatsiamsmile.com/connect/userinfo`) — `loadUserInfo: true` ใน oidc config จึงอยู่ใน `user.profile` อยู่แล้ว
- กฎ (ถาม user แล้ว): ถ้า `employee_branchid = 70` (สำนักงานใหญ่) → เห็นสาขาทั้งหมด; ไม่ใช่ 70 → เห็นเฉพาะสาขาที่ตรงกับ `employee_branchid`; claim หาย (undefined/null) → **ไม่เห็นสาขาไหนเลย** (dropdown ว่าง)
- ไฟล์ที่แก้:
  - `Const.ts`: เพิ่ม `HEAD_OFFICE_BRANCH_ID = 70`
  - `_auth/auth.d.ts`: `CustomClaims.employee_branchid` + `UserProperties.employeeBranchId`
  - `_auth/components/AuthProvider.tsx`: map `employeeBranchId = Number(profile.employee_branchid)` (normalize เป็น number, null/undefined → undefined)
  - **ใหม่ `_common/branchPermission.ts`**: `useBranchByUserPermission<T extends { branchId?: number }>(branches)` — hook เดียวที่ใช้ `useAuth` กรองตามกฎข้างบน
  - `IncreaseLimitTransfer/_common/masterAPI.ts` `useGetBranch`: กรองผ่าน hook แล้ว wrap `data.data` กลับ (ครอบ RefundSearchFilterForm, SearchByBranchAndStatus, ClaimSearchFilterForm)
  - `api/coreClaimMastersApi.ts` `useGetBranch`: กรองเหมือนกัน (ครอบ `BranchAutocomplete` ฝั่ง ExtraPayment ด้วย — USER เลือกเอาด้วย)
- typecheck: ผ่าน
- **รอบเพิ่มเติม (user สั่ง):** ถ้าไม่ใช่สำนักงานใหญ่ ให้เอาตัวเลือก "ทั้งหมด" ออกด้วย — เพิ่ม `useIsHeadOfficeBranch()` ใน `branchPermission.ts`, `RefundSearchFilterForm`/`SearchByBranchAndStatus` เปลี่ยน `firstItemText` เป็น `isHeadOfficeBranch ? "ทั้งหมด" : undefined`, `BranchAutocomplete` ใช้ `!withAllOption || !isHeadOfficeBranch` เป็นเงื่อนไขไม่เพิ่ม option "ทั้งหมด" (`ClaimSearchFilterForm` ไม่มี firstItemText อยู่แล้ว ไม่ต้องแก้)
- ข้อควรระวัง: เป็น UI-level filter เท่านั้น backend ยังคือ security boundary — ถ้าจะกันข้อมูลข้ามสาขาจริงต้องบังคับฝั่ง API ด้วย

### งานที่ควรทำถัดไป (Note ไว้ — ทำได้เลยโดยไม่ต้องรอสั่ง)
- **ลบ mock ในหน้า refund detail** (`ManageRefundDetailHook.tsx`): มี `mockDetailData: any` + `const detailData = refundDetailRes?.data ?? mockDetailData` + TODO "ลบ mock เมื่อ backend คืนข้อมูลจริงจาก /Refund/SaveRefundDetails" — เมื่อ API คืน `data.caseDetails` จริงแล้วให้ลบ mock, TODO comment, และ `any` (`mapCaseDetailsRows(caseDetails: any[])` → type จริง)
- **callback type `any` ใน refundAPI** (`onSuccessCallBack: (response: any)`, `reasonOptions: any[]` ฯลฯ) — ถ้าจะ clean ให้ใช้ type จาก contract จริง
- **`onClNoClick` ใน `ClaimSummaryHeader` ยัง `console.log`** (หน้า refund detail) — ควร navigate ไปหน้า CL detail จริง
- **ปุ่มดำเนินการ/ดูรายละเอียดใน `RefundApproveDataTableHook` ยัง TODO (console.log)** — เชื่อม dialog/detail ต่อ

### ขั้นตอนต่อไป (ถ้าทำต่องาน)
1. เปิด dialog / navigate เมื่อกด action ใน `RefundApproveDataTableHook`
2. `npx tsc --noEmit` สำหรับ typecheck

## เดินหน้าแบบตรงไปตรงมา
- อ่านด้วย `read` → แก้ด้วย `edit` (oldString จาก read แท้) — อย่าใช้ bash เป็นแหล่ง byte

## ความรู้ที่เจอระหว่างงาน (ถ้าเจอซ้ำให้ใช้แบบนี้)

### @tanstack/react-query v4 — `isLoading` เป็น `true` ถ้า query ถูก disabled ยังไม่เคย fetch
- ใน v4 `isLoading = (status === 'loading')` ซึ่งมีค่า true ตั้งแต่ mount ถ้ายังไม่มี data แม้ `enabled: false` (ต่างจาก v5 ที่ `isLoading = isPending && isFetching`)
- ผล: monitor table ที่ยิง query แบบ conditional (`enabled: hasSearched` / `!!statusId`) จะขึ้น "กำลังโหลดข้อมูล..." ทั้งที่ยังไม่ได้ค้นหา
- **ทางแก้ (ตามแบบ RefundDataTable): gate `isLoading` ที่ส่งให้ table ด้วยเงื่อนไขเดียวกับ `enabled`**

```tsx
// RefundApprove/RefundDataTable ใช้ pattern นี้
<ClaimFundStandardDataTable
    ...
    isLoading={hasSearched ? isLoading : false}   // แทนที่จะส่ง isLoading ตรงๆ
    delayNoMatch={hasSearched}
/>
```

- เมื่อยังไม่ search (`hasSearched=false`): `isLoading=false` → `ClaimFundStandardDataTable` แสดง default `noMatchText` = **"ไม่พบข้อมูล"**
- เมื่อ search แล้ว: `isLoading` ตามจริง → ขึ้น "กำลังโหลดข้อมูล..." ระหว่าง fetch ตามปกติ
- กรณี `enabled` ไม่ได้ใช้และ query fire ทันที (ไม่มี gate) จะไม่เกิดปัญหานี้ 

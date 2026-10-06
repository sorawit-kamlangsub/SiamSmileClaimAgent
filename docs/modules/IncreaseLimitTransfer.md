# IncreaseLimitTransfer

`เพิ่มวงเงินโอน` — search + review CPG-to-claim transfer records awaiting inspection/approval
(first transfer vs. additional transfer types). Monitor table **wired to the real backend**
(`IncreaseTransferLimitMonitors`); ยังไม่ map ข้อมูล field (row mapping ยังเป็น DTO เดิม —
field `limitStatusNameTH`/`reason` ไม่มีใน contract จริง → แสดง "-"). Detail dialog + status
dropdown ยังเป็น mock; no store. Route:
`/manage/increase-limit-transfer` — see [routes.md](../routes.md).

## pages/

⚠️ Folder is `page/` (**singular**), not `pages/` — `page/IncreaseLimitTransfer.tsx`. Composes
`ClaimSearchFilterForm` (below) + `ClaimDetailsDataTable`; `handleSearch` lifts
`filter`/`hasSearched`/`searchKey` state (รูปแบบเดียวกับ RefundApprove) และทริกเกอร์ refetch
ทุกกดค้นหา.

## components/

`ClaimDetailsDataTable.tsx` — `ClaimFundStandardDataTable` wrapper (ไม่ใช่ `StandardDataTable`
อีกต่อไป); รับ `filter`/`hasSearched`/`searchKey` ส่งต่อให้ hook + `onEdit` callback
ส่งให้ hook (FactCheckIcon → `onEdit(row)` → page เปิด dialog). loading/error/noMatch
แสดงเฉพาะหลัง `hasSearched` (แบบ RefundApprove).

`IncreaseLimitDetailDialog.tsx` — dialog ตรวจสอบขยายวงเงิน (mockup "ขยายวงเงิน" modal);
`maxWidth="xs"` compact layout ตาม mockup, รับ `open`/`row`/`onClose` props
(mirror `ApproveRefundDialog`). ดึงข้อมูลผ่าน `useGetIncreaseTransferLimitDetail(row.caseId)`.
แสดง: เลข CL, ชื่อผู้เอาประกัน, จำนวนเงิน (฿), วงเงินปัจจุบัน/ที่ใช้ไป (stat boxes),
จำนวนคงเหลือ (ภายในวัน) red flat, วงเงินที่ขอเพิ่ม (readonly), สาเหตุการปฏิเสธ select
(จาก `rejectReasons`), วงเงินคงเหลือ (ครั้งใหม่) green flat. ปุ่ม ปฏิเสธ (disabled จนกว่า
เลือกสาเหตุ) + อนุมัติ → `swalConfirmAction` → ส่ง `useUpdateIncreaseTransferLimitStatus`
(POST `${API_CLAIM_FUND_URL}/api/ClaimFund/IncreaseTransfer/UpdateIncreaseTransferLimitStatus`):
อนุมัติส่ง `increaseTransferLimitStatusId: 3` (caseId + claimId), ปฏิเสธส่ง
`increaseTransferLimitStatusId: 4` + `rejectReasonsId` (draft — map จาก `rejectReasonCode`
ชั่วคราว, backend ยังไม่มี field นี้). สำเร็จ → `swalSuccess` ด้วย `data.message` จาก response
(เช่น "อนุมัติขยายวงเงินสำเร็จ") แล้ว close; หลังสำเร็จ refetch monitor list ผ่าน
`queryClient.invalidateQueries`. ⚠ ยังเป็น mock endpoint (Postman) — contract เป็น placeholder.

## `_common/` (module-local, non-standard folder name)

`ClaimSearchFilterForm.tsx` — self-contained formik search form (search-by/search-text/
branch/status/date-range); `statusId` populated from `useGetTransferApprovalStatus`
(`api/coreClaimApi.ts`, codegen `claimFundClient.getTransferApprovalStatus` → `GET {API_URL}/ClaimFund/Masters/GetTransferApprovalStatus`,
DTO `TransferApprovalStatusResponseDto {id,name}`), `searchBy` has fixed options **เลขที่ CL (1) / เลขที่ CC (2)**;
branch/date ยังไม่ถูกส่งไป API. **Reused cross-module by `RefundApprove`** — see
[RefundApprove.md](RefundApprove.md).

`IncreaseLimitTransfer/_common/masterAPI.ts` — **ถูกลบแล้ว** (ไม่มีผู้ใช้: `useGetBranch`/`useGetPaymentStatus`/`useGetPaymentIncreaseStatus` เป็น dead code หลังสลับทั้งหมดไป codegen) — สาขาผ่าน `BranchAutocomplete` (codegen `coreClaimMastersApi.useGetBranch`), สถานะโอนผ่าน `useGetTransferApprovalStatus` (codegen).

`increaseLimitTransferAPI.ts` — module API file: `useGetIncreaseTransferLimitMonitors` +
`useGetIncreaseTransferLimitDetail` (detail GET, mock). Response types exported:
`IncreaseTransferLimitDetailDto`, `IncreaseTransferLimitDetailRejectReasonDto`,
`IncreaseTransferLimitDetailResponse`.

## hooks/

`ClaimDetailsDataTableHook.tsx` — calls `useGetIncreaseTransferLimitMonitors` (`enabled:
hasSearched` + `searchKey` bust, ไม่มี mock ภายในไฟล์); columns: **เลขที่ CL (link ดูรายละเอียด)**,
เลขที่ CC, วันที่สร้างเคลม, สาขา, จำนวนเงิน, เลขที่บัญชี, ประเภทโอนเงิน, สถานะ (`StatusPill`
สีตาม `limitStatusId`), สาเหตุ, ดำเนินการ (view stub + edit = `onEdit(row)` → dialog).
**คอลัมน์ เลขที่ CPG ถูกเอาออกแล้ว.** FactCheckIcon แสดงเฉพาะ `limitStatusId === 2`.
`ClaimSearchFilterFormHook.tsx` — **orphaned/unused**, nothing imports it; the actual form has
its own independent inline `useFormik` instead.

## store/ — none

## API hooks called

- `useGetIncreaseTransferLimitMonitors` (`increaseLimitTransferAPI.ts`) — GET
  `{API_CLAIM_FUND_URL}/api/ClaimFund/IncreaseTransfer/IncreaseTransferLimitMonitors` (base
  `.../api/ClaimFund`), monitor table. ✅ **Real API** — เชื่อม backend จริงแล้ว
  (`VITE_CLAIM_FUND_API_URL` + `/api/ClaimFund`); ยังไม่ map ข้อมูล field.
- `useGetIncreaseTransferLimitDetail` (`increaseLimitTransferAPI.ts`) — GET
  `{API_CLAIM_FUND_URL}/api/ClaimFund/IncreaseTransfer/IncreaseTransferLimitDetail` (base
  `.../api/ClaimFund`), detail dialog. ⚠ **Mock path** เดียวกับข้างบน; fields ตรงกับ
  `IncreaseTransferLimitDetailDto` (caseId, claimNo, insuredName, amount, วงเงินต่างๆ,
  rejectReasons).
- `useGetTransferApprovalStatus` (`api/coreClaimApi.ts`, codegen) — GET
  `{API_URL}/ClaimFund/Masters/GetTransferApprovalStatus`, feeds the status dropdown. ✅ **Real codegen API**
  (เดิมใช้ `useGetPaymentIncreaseStatus` ใน `masterAPI.ts` — ถูกลบแล้ว).
- `useUpdateIncreaseTransferLimitStatus` (`increaseLimitTransferAPI.ts`) — POST
  `{API_CLAIM_FUND_URL}/api/ClaimFund/IncreaseTransfer/UpdateIncreaseTransferLimitStatus` (base
  `.../api/ClaimFund`), เปลี่ยนสถานะอนุมัติ/ปฏิเสธขยายวงเงิน. Response envelope
  `UpdateIncreaseTransferLimitStatusDtoServiceResponse` (`data: { isSuccess, message }`).

## Gotchas

monitor ต่อ backend จริงแล้ว (`IncreaseTransferLimitMonitors`); detail dialog / update-status ยังเป็น mock endpoint — ยังไม่มี backend จริง, view action ยังเป็น stub
(`console.log` + `// TODO`), `rejectReasonsId` ใน payload เป็น
**draft** (map จาก `rejectReasonCode` ชั่วคราว เพราะ backend ยังไม่มี field นี้), `page/`
(singular) folder naming, dead `ClaimSearchFilterFormHook.tsx`.

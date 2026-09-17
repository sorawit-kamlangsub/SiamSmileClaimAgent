# IncreaseLimitTransfer

`เพิ่มวงเงินโอน` — search + review CPG-to-claim transfer records awaiting inspection/approval
(first transfer vs. additional transfer types). Table **wired to a mock monitor API** — status +
search-from dropdowns populated, but real backend not ready; no store. Route:
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
(POST `${APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer/UpdateIncreaseTransferLimitStatus`):
อนุมัติส่ง `increaseTransferLimitStatusId: 3` (caseId + claimId), ปฏิเสธส่ง
`increaseTransferLimitStatusId: 4` + `rejectReasonsId` (draft — map จาก `rejectReasonCode`
ชั่วคราว, backend ยังไม่มี field นี้). สำเร็จ → `swalSuccess` ด้วย `data.message` จาก response
(เช่น "อนุมัติขยายวงเงินสำเร็จ") แล้ว close; หลังสำเร็จ refetch monitor list ผ่าน
`queryClient.invalidateQueries`. ⚠ ยังเป็น mock endpoint (Postman) — contract เป็น placeholder.

## `_common/` (module-local, non-standard folder name)

`ClaimSearchFilterForm.tsx` — self-contained formik search form (search-by/search-text/
branch/status/date-range); `statusId` populated from `useGetPaymentIncreaseStatus`
(`masterAPI.ts`, mock), `searchBy` has fixed options **เลขที่ CL (1) / เลขที่ CC (2)**;
branch/date ยังไม่ถูกส่งไป API. **Reused cross-module by `RefundApprove`** — see
[RefundApprove.md](RefundApprove.md).

`masterAPI.ts` — `useGetBranch`, `useGetPaymentStatus`, `useGetPaymentIncreaseStatus`.

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
  `{APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer/IncreaseTransferLimitMonitors` (base
  `.../api/ClaimFund`), monitor table. ⚠ **Mock path** — `VITE_APIGW_CLAIM_FUND_API_URL` in
  `.env` points at a Postman mock (no real backend yet); treat its response as placeholder,
  not a binding contract until the real endpoint exists.
- `useGetIncreaseTransferLimitDetail` (`increaseLimitTransferAPI.ts`) — GET
  `{APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer/IncreaseTransferLimitDetail` (base
  `.../api/ClaimFund`), detail dialog. ⚠ **Mock path** เดียวกับข้างบน; fields ตรงกับ
  `IncreaseTransferLimitDetailDto` (caseId, claimNo, insuredName, amount, วงเงินต่างๆ,
  rejectReasons).
- `useGetPaymentIncreaseStatus` (`_common/masterAPI.ts`) — GET
  `{APIGW_CLAIM_FUND_API_URL}/Masters/GetPaymentIncreaseStatuses` (base `.../api/ClaimFund`),
  feeds the status dropdown. ⚠ **Mock path** เดียวกับข้างบน.
- `useUpdateIncreaseTransferLimitStatus` (`increaseLimitTransferAPI.ts`) — POST
  `{APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer/UpdateIncreaseTransferLimitStatus` (base
  `.../api/ClaimFund`), เปลี่ยนสถานะอนุมัติ/ปฏิเสธขยายวงเงิน. Response envelope
  `UpdateIncreaseTransferLimitStatusDtoServiceResponse` (`data: { isSuccess, message }`).

## Gotchas

ข้อมูลทั้งหมดมาจาก mock endpoint (monitor + status + detail) — ยังไม่มี backend จริง,
view action ยังเป็น stub (`console.log` + `// TODO`), `rejectReasonsId` ใน payload เป็น
**draft** (map จาก `rejectReasonCode` ชั่วคราว เพราะ backend ยังไม่มี field นี้), `page/`
(singular) folder naming, dead `ClaimSearchFilterFormHook.tsx`.

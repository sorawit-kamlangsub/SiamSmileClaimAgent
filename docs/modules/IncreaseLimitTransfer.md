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
อีกต่อไป); รับ `filter`/`hasSearched`/`searchKey` ส่งต่อให้ hook, loading/error/noMatch แสดง
เฉพาะหลัง `hasSearched` (แบบ RefundApprove).

## `_common/` (module-local, non-standard folder name)

`ClaimSearchFilterForm.tsx` — self-contained formik search form (search-by/search-text/
branch/status/date-range); `statusId` populated from `useGetPaymentIncreaseStatus`
(`masterAPI.ts`, mock), `searchBy` has fixed options **เลขที่ CL (1) / เลขที่ CC (2)**;
branch/date ยังไม่ถูกส่งไป API. **Reused cross-module by `RefundApprove`** — see
[RefundApprove.md](RefundApprove.md).

`masterAPI.ts` — `useGetBranch`, `useGetPaymentStatus`, `useGetPaymentIncreaseStatus`.

`increaseLimitTransferAPI.ts` — module API file: `useGetIncreaseTransferLimitMonitors`.

## hooks/

`ClaimDetailsDataTableHook.tsx` — calls `useGetIncreaseTransferLimitMonitors` (`enabled:
hasSearched` + `searchKey` bust, ไม่มี mock ภายในไฟล์); columns: **เลขที่ CL (link ดูรายละเอียด)**,
เลขที่ CC, วันที่สร้างเคลม, สาขา, จำนวนเงิน, เลขที่บัญชี, ประเภทโอนเงิน, สถานะ (`StatusPill`
สีตาม `limitStatusId`), สาเหตุ, ดำเนินการ (view/edit stubs `console.log`). **คอลัมน์ เลขที่ CPG
ถูกเอาออกแล้ว.**
`ClaimSearchFilterFormHook.tsx` — **orphaned/unused**, nothing imports it; the actual form has
its own independent inline `useFormik` instead.

## store/ — none

## API hooks called

- `useGetIncreaseTransferLimitMonitors` (`increaseLimitTransferAPI.ts`) — GET
  `{APIGW_CLAIM_FUND_API_URL}/IncreaseTransfer/IncreaseTransferLimitMonitors` (base
  `.../api/ClaimFund`), monitor table. ⚠ **Mock path** — `VITE_APIGW_CLAIM_FUND_API_URL` in
  `.env` points at a Postman mock (no real backend yet); treat its response as placeholder,
  not a binding contract until the real endpoint exists.
- `useGetPaymentIncreaseStatus` (`_common/masterAPI.ts`) — GET
  `{APIGW_CLAIM_FUND_API_URL}/Masters/GetPaymentIncreaseStatuses` (base `.../api/ClaimFund`),
  feeds the status dropdown. ⚠ **Mock path** เดียวกับข้างบน.

## Gotchas

ข้อมูลทั้งหมดมาจาก mock endpoint (monitor + status) — ยังไม่มี backend จริง, view/edit
actions ยังเป็น stub (`console.log` + `// TODO`), `page/` (singular) folder naming, dead
`ClaimSearchFilterFormHook.tsx`.

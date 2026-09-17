# IncreaseLimitTransfer

`เพิ่มวงเงินโอน` — search + review CPG-to-claim transfer records awaiting inspection/approval
(first transfer vs. additional transfer types). Table/data **still 100% mock** — only the status
dropdown is now wired to a (mock) API; no store. Route:
`/manage/increase-limit-transfer` — see [routes.md](../routes.md).

## pages/

⚠️ Folder is `page/` (**singular**), not `pages/` — `page/IncreaseLimitTransfer.tsx`. Composes
`ClaimSearchFilterForm` (below) + `ClaimDetailsDataTable`; submit handler is a no-op stub.

## components/

`ClaimDetailsDataTable.tsx` — `StandardDataTable` wrapper feeding `dataMock` from its hook,
local-only pagination.

## `_common/` (module-local, non-standard folder name)

`ClaimSearchFilterForm.tsx` — self-contained formik search form (search-by/search-text/
branch/status/date-range); `statusId` populated from `useGetPaymentIncreaseStatus`
(`masterAPI.ts`), the rest of the dropdowns are still `data={[]}` — empty, unwired options.
**Reused cross-module by `RefundApprove`** — see [RefundApprove.md](RefundApprove.md).

`masterAPI.ts` — `useGetBranch`, `useGetPaymentStatus`, `useGetPaymentIncreaseStatus`.

## hooks/

`ClaimDetailsDataTableHook.tsx` — hardcoded 3-row `dataMock` (`CpgTransferRow`), local
`StatusPill`, `handleViewRow`/`handleEditRow` stubs (`console.log` + `// TODO`).
`ClaimSearchFilterFormHook.tsx` — **orphaned/unused**, nothing imports it; the actual form has
its own independent inline `useFormik` instead.

## store/ — none

## API hooks called

- `useGetPaymentIncreaseStatus` (`_common/masterAPI.ts`) — GET
  `{APIGW_CLAIM_FUND_API_URL}/Masters/GetPaymentIncreaseStatuses` (base `.../api/ClaimFund`),
  feeds the status dropdown. ⚠ **Mock path** — `VITE_APIGW_CLAIM_FUND_API_URL` in `.env`
  points at a Postman mock (no real backend yet); treat its response as placeholder, not a
  binding contract until the real endpoint exists.

## Gotchas

100% mock except the status dropdown (also mock), unimplemented view/edit actions, `page/`
(singular) folder naming, dead `ClaimSearchFilterFormHook.tsx`.

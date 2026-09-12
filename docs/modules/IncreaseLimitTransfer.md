# IncreaseLimitTransfer

`เพิ่มวงเงินโอน` — search + review CPG-to-claim transfer records awaiting inspection/approval
(first transfer vs. additional transfer types). **100% mock**, no store. Route:
`/manage/increase-limit-transfer` — see [routes.md](../routes.md).

## pages/

⚠️ Folder is `page/` (**singular**), not `pages/` — `page/IncreaseLimitTransfer.tsx`. Composes
`ClaimSearchFilterForm` (below) + `ClaimDetailsDataTable`; submit handler is a no-op stub.

## components/

`ClaimDetailsDataTable.tsx` — `StandardDataTable` wrapper feeding `dataMock` from its hook,
local-only pagination.

## `_common/` (module-local, non-standard folder name)

`ClaimSearchFilterForm.tsx` — self-contained formik search form (search-by/search-text/
branch/status/date-range); all dropdown `data={[]}` — empty, unwired options.
**Reused cross-module by `RefundApprove`** — see [RefundApprove.md](RefundApprove.md).

## hooks/

`ClaimDetailsDataTableHook.tsx` — hardcoded 3-row `dataMock` (`CpgTransferRow`), local
`StatusPill`, `handleViewRow`/`handleEditRow` stubs (`console.log` + `// TODO`).
`ClaimSearchFilterFormHook.tsx` — **orphaned/unused**, nothing imports it; the actual form has
its own independent inline `useFormik` instead.

## store/ — none

## API hooks called — none

No shared api-layer usage, no network calls.

## Gotchas

100% mock, unimplemented view/edit actions, `page/` (singular) folder naming, dead
`ClaimSearchFilterFormHook.tsx`.

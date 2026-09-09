# RefundApprove

`อนุมัติคืนเงิน` — approval queue for refund requests raised in `Refund` (approver view).
**100% mock**, no store, and largely a copy-paste of `Refund`'s table/hook with different field
names. Route: `/manage/refund-approve` — see [routes.md](../routes.md).

## pages/

`RefundApprovePage.tsx` — reuses `ClaimSearchFilterForm` from **`IncreaseLimitTransfer/_common`**
(cross-module) as the search bar, then `RefundApproveDataTable` in a plain bordered `Box`.
`handleSearch` is a no-op stub.

## components/

`RefundApproveDataTable.tsx` — `StandardDataTable` wrapper, same shape as `Refund`'s table.

## hooks/

`RefundApproveDataTableHook.tsx` — `RefundTransactionRow` type (adds `cpgCode`/`branch` vs.
Refund's `clNo`/`ccNo`), hardcoded `dataMock`, columns incl. `StatusPill`. Action column: shows
`FactCheckIcon` for `รอดำเนินการ`, `VisibilityIcon` for `คืนเงินสำเร็จ`, else `-`.
`handleView`/`handleEdit` are `console.log` stubs (`// TODO`).

## store/ — none

## API hooks called — none

## Gotchas

Near-duplicate of `Refund` (see [Refund.md](Refund.md)) — copy-paste, different field names,
same mock/unwired state. Cross-module `_common` import from `IncreaseLimitTransfer` is a coupling
smell worth flagging if either module gets refactored.

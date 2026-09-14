# Refund

`คืนเงิน` — refund/money-return request queue for a claim; branch staff view + action pending
refund transactions. **100% mock**, no store. Route: `/manage/refund` — see [routes.md](../routes.md).

## pages/

`RefundPage.tsx` — composes `SearchByBranchAndStatus` + `RefundDataTable`; `handleSearch` is a
no-op stub.

## components/

`RefundDataTable.tsx` — `StandardDataTable` wrapper, `columns`/`dataMock` from the hook,
local-only pagination.

## `_common/` (module-local, not the shared `modules/_common`)

`SearchByBranchAndStatus.tsx` — formik search bar (branch/status dropdowns); dropdown
`data={[]}` hardcoded empty; `onButtonClick` prop unused by the caller.
**Reused cross-module by `AdjustTransfer`** — see [AdjustTransfer.md](AdjustTransfer.md).

## hooks/

`RefundDataTableHook.tsx` — `ClRefundTransactionRow` type, hardcoded `dataMock`, columns incl.
`StatusPill`; `handleView`/`handleReject` are `console.log` stubs
(`// TODO: open view dialog / navigate to detail page`).

## store/ — none

## API hooks called — none

No shared api-layer usage.

## Gotchas

Entirely mock/scaffold — action buttons unwired, filter dropdowns empty. `RefundApprove` is a
near-duplicate of this module's table/hook — see [RefundApprove.md](RefundApprove.md). A
`RefundTransactionHistoryTable` from this module is also cross-imported (unwired) by
`ExtraPaymentTabs.tsx`.

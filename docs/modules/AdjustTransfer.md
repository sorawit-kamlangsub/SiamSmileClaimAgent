# AdjustTransfer

`โอนเพิ่ม` (จัดการเงินเคลม) — review claims where the initial transfer amount was insufficient
and needs a supplementary top-up transfer. **100% mock**, no store. Route:
`/manage/adjust-transfer` — see [routes.md](../routes.md).

## pages/

`AdjustTransferPage.tsx` — composes `SearchByBranchAndStatus` (reused cross-module from
`Refund/_common/`) + `AdjustTransferDataTable`; search handler is a no-op stub.

## components/

`AdjustTransferDataTable.tsx` — `StandardDataTable` wrapper, feeds it `dataMock` from the hook,
local-only pagination.

## hooks/

`AdjustTransferDataTableHook.tsx` — `AdditionalTransferRow`/`AdditionalTransferStatus` types,
hardcoded 4-row `dataMock`, column defs incl. a local `StatusPill`, `handleView`/`handleEdit` are
`console.log` stubs (`// TODO: open view/edit dialog`).

## store/ — none

## API hooks called — none

No import from any of `coreClaimApi` / `coreClaimMastersApi` / `docstorageApi` / `claimFundApi` /
`ocrApi`, and no module-local API file either.

## Gotchas

100% mock (hardcoded array), view/edit unimplemented, cross-module dependency on
`Refund/_common/SearchByBranchAndStatus.tsx`.

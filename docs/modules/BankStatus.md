# BankStatus

`ตรวจสอบสถานะธนาคาร` — query/inquire pending pay-transfer transactions' bank status, manually
re-trigger a "sent to bank" inquiry. **Real API** (via a bespoke module-local API file, not the
shared `src/app/api/*`). Route: `/manage/bank/status` — see [routes.md](../routes.md).

## pages/

`BankStatusCheck.tsx` — composes `SearchFilterClaimForBank` + `BankStatusCheckDataTable`.

## components/

- `BankStatusCheckDataTable.tsx` — main table with expandable-row detail
  (`TransactionStatusDataTable`); `Backdrop`/spinner while the "send to bank" mutation runs
- `SearchFilterClaimForBank.tsx` — CPG/CL search box, dispatches to this module's redux slice
- `TransactionStatusDataTable.tsx` — nested table on row-expand: bank inquiry detail for one
  `transactionId`. **Reused cross-module by `ManageTransfer`** (with a hardcoded `transactionId="1"`
  there — see [ManageTransfer.md](ManageTransfer.md))

## hooks/

`BankStatusCheckDataTableHook.tsx` (list via `useGetInquiryMonitors`, mutate via `useSentToBank`
with swal confirm/success/error), `SearchFilterClaimForBank.tsx` (hook, same name as the
component — formik wrapper dispatching `setSearchBankStatusBySearchDetail`),
`TransactionStatusDataTableHook.tsx` (`useGetInquiryDetailMonitors` for the expanded-row detail).

## store/ — `bankStatusCheckSlice` (`state.bankStatusCheck`)

`searchBankStatusCheck: { searchDetail }`. Actions: `setSearchBankStatusBySearchDetail`,
`resetToDefault` (⚠ buggy — the reducer body doesn't actually mutate/return state, it's a no-op).

## API hooks called

**Own local file** `bankStatusCheckAPI.ts` (not `src/app/api/*`) — real axios + react-query
against `API_CLAIM_FUND_URL` (`Setting/InquiryMonitors`, `Setting/InquiryDetail`) and
`APIGW_URL/pay` (`PayTransfer/inquirytransectionbank`): `useGetInquiryMonitors`,
`useGetInquiryDetailMonitors`, `useSentToBank`. No usage of the shared api layer.

## Gotchas

`resetToDefault` reducer is broken (no-op). `ManageTransfer` imports `TransactionStatusDataTable`
directly from this module with a hardcoded id — see that module's doc.

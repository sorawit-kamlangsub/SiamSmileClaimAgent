# ManageTransfer

`จัดการโอนเงิน > แก้ไขการโอนเงิน` (Repay) — search + list claim repayment/re-transfer
transactions with per-row expandable bank-inquiry detail and a retry icon. **Mock data**, no
store. Route: `/manage/transfer/repay` — see [routes.md](../routes.md).

## pages/

`RepayPage.tsx` — composes `SearchFilter` + `ManageTransferRepayDataTable`.

## components/

`ManageTransferRepayDataTable.tsx` — `StandardDataTable` with expandable rows rendering
`TransactionStatusDataTable` **imported cross-module from `BankStatus`**
(see [BankStatus.md](BankStatus.md)), called with a **hardcoded `transactionId="1"` for every
row** — not row-specific, likely unfinished wiring. `SearchFilter.tsx` — CPG/CL search box;
Search button has no `onClick`/submit wiring (formik `handleSubmit` not attached).

## hooks/

`SearchFilterHook.tsx` (formik wrapper, `onSubmit` no-op), `TransferRepayDataTableHook.tsx`
(hardcoded 6-row `dataMock`: claimNo/account/bank/amount/transferStatus; retry `IconButton`
column has no `onClick`).

## store/ — none

## API hooks called

None of the shared api files directly, but **indirectly** pulls in `BankStatus`'s real
`useGetInquiryDetailMonitors` via the reused `TransactionStatusDataTable` — effectively
non-functional here due to the hardcoded id.

## Gotchas

Mock data (hardcoded array). Cross-module coupling to `BankStatus` with a bogus static id — expand-row
detail always shows the same transaction regardless of which row was expanded. Search button and
retry button are both non-functional stubs.

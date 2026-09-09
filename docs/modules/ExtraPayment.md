# ExtraPayment

`โอนเพิ่ม` (Monitor-โอนเงิน) — search a CPG/CL, review claim items, adjust an "extra transfer
amount" per item, pick a payout bank account, submit; separate list/monitor page plus a
retry-failed-transfer flow. **Mock data throughout**, gated by a single flag. Routes:
`/payment-monitor` (index → list, `/extra-payment` → detail flow) — see [routes.md](../routes.md).

## pages/

- `ExtraPaymentListPage.tsx` — list/monitor: branch+status filter, table of
  `ExtraPaymentListItem`, view-detail / edit-bank-account-and-retry actions, search modal to
  start a new flow. **Good reference for the list-page-with-filter-and-table idiom** — see
  [project-structure.md](../project-structure.md#forms--tables).
- `ExtraPaymentPage.tsx` — detail router: reads `cpgNo` from redux, fetches CPG detail, branches
  to `ExtraPaymentPHpage`/`ExtraPaymentPApage` by `productTypeId`; redirects home if no `cpgNo`;
  TODO — no card yet for `CLAIM_MISC` product group.
- `ExtraPaymentPApage.tsx` / `ExtraPaymentPHpage.tsx` — product-specific detail/submit forms
  (`PHpage` restricted to a single `claimOnLineId` from redux via `restrictToClaimOnLineId`).

## components/ (16 files, selected)

`ExtraPaymentClaimTable.tsx` (editable claim-line table), `ExtraPaymentRecordSection.tsx`
(composes bank account + reason), `BankAccountSection.tsx`/`BankAccountCard.tsx`,
`OldBankAccountCard.tsx` (read-only, retry flow), `EditBankAccountModal.tsx` →
`ConfirmRetryTransferModal.tsx` → `RetryTransferSuccessModal.tsx`, `ExtraPaymentSuccessModal.tsx`,
`ExtraPaymentSearchModal.tsx`, `ExtraPaymentReasonForm.tsx`, `ExtraPaymentTabs.tsx` (detail /
history / transfer-history — history tabs are TODO placeholders, one panel cross-imports
`Refund`'s `RefundTransactionHistoryTable`, unwired), `TransferStatusChip.tsx`.

## hooks/

`useGetExtraPaymentList.ts`, `useGetCpgExtraPaymentDetail.ts`, `useGetBankAccounts.ts`,
`useGetExtraPaymentReasonOptions.ts`, `useGetMasterOptions.ts` — each a hand-rolled
`useState`/`useEffect` fetch hook gated by `USE_MOCK_DATA`. `useSearchExtraPayment.ts` (mock
CPG/CL lookup table `MOCK_CL_TO_CPG`). `useSubmitExtraPayment.ts` (see gotcha).
`useEditBankAccountForm.ts` (only mock branch implemented; real branch is
`// TODO: ต่อ endpoint จริง`). `useExtraPaymentForm.ts` (main formik + redux submit
orchestration). `TransferStatus.ts` (status→color/label maps, `isRetryableTransferStatus` only
true for statusId 5).

## store/ — `extraPaymentSlice` (`state.extraPayment`)

`cpgNo, claimOnLineId, claimItems, selectedBankAccountId, reasonId, remark`.

`ExtraPayment.types.ts` — all module DTOs, header TODO:
`// TODO: ยืนยัน field name จริงกับ backend DTO ก่อนใช้งานจริง`.
`ExtraPaymentMock.ts` — **`export const USE_MOCK_DATA = true;`** + all fixtures
(`MOCK_CPG_EXTRA_PAYMENT_DETAIL`, `MOCK_BANK_ACCOUNTS`, `MOCK_REASON_OPTIONS`,
`MOCK_BRANCH_OPTIONS`, `MOCK_EXTRA_PAYMENT_LIST`, `MOCK_BANK_OPTIONS`,
`MOCK_BANK_ACCOUNT_RELATION_OPTIONS`).

## API hooks called — none of the shared api files

Every data hook branches on `USE_MOCK_DATA` and otherwise hits ad-hoc `fetch("/api/extra-payment/...")`
placeholder endpoints — **not implemented anywhere in this repo**, pure stand-ins.

## Gotchas

- `useSubmitExtraPayment.submit()` runs the mock delay but **always falls through to the real
  `fetch('/api/extra-payment')` call even when `USE_MOCK_DATA` is true** (a commented-out mock
  return makes the two hooks' mock-gating inconsistent) — check this before relying on the mock
  path being fully isolated.
- `ExtraPaymentTabs` cross-references `Refund`'s `RefundTransactionHistoryTable` as an unwired
  placeholder.

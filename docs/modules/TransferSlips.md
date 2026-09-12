# TransferSlips

`ใบสรุปแจ้งการโอนเงิน` — printable/viewable payment-transfer slip (bank transfer confirmation
report), linked from `Survey`'s summary page. **Real API, but no API file of its own** — depends
entirely on `Survey/surveyAPI.ts`. **Public route** (no auth) — see
[`_auth.md`](_auth.md#public-routes). Route: `/slip/:id` under `LayoutPublic` — see [routes.md](../routes.md).

## pages/

`TransferSlipPage.tsx` — full-screen fixed layout (locks scroll on desktop, like `SurveyPage`):
`HeaderSlip` + `ContentDetail` + `PaymentDataTable` in a `Paper`, `FooterSlip` below.

## components/

- `HeaderSlip.tsx` — logo, icon avatar, title, `data?.data?.paymentCode`
- `ContentDetail.tsx` — responsive grid of account/bank/amount/date/time fields (heavy inline `sx`)
- `PaymentDataTable.tsx` — `StandardDataTable` of `paymentItemDetail[]` (Claim No / Customer Name
  / Transaction Amount / Narrative / Approved Amount), custom gradient `Chip`, manual
  `customTableBodyFooterRender` grand-total row (client-side `reduce`)
- `FooterSlip.tsx` — static contact info, no data

## hooks/

`useGetPaymentData.tsx` — reads `id` from route, calls `useGetPaymentDetails(id)`
**imported from `../../Survey/surveyAPI`** (not its own API file), builds MUIDataTable columns
(custom gradient `customHeadRender` per column) used by `PaymentDataTable`.

## store/ — none

## API hooks called

None of the shared api files; indirectly depends on `Survey/surveyAPI.ts`'s `useGetPaymentDetails`.

## Gotchas

Fully depends on Survey's local API — if `getPaymentDetailsKey`'s unparameterized react-query key
(see [Survey.md](Survey.md)) is stale from a prior visit, this page could show cached data from a
different `id`. All 4 display components independently call `useGetPaymentDataHook()` (react-query
dedupes the network call, but each recomputes/re-renders).

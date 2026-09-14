# ManageClaimFund

`จัดการเงินเคลม > ตั้งค่าการโอนเงิน` — on/off toggle for the automatic claim-payment transfer
system, plus a history log of on/off changes. **Real API** (via a bespoke module-local API file).
Route: `/manage/setting/transfer` — see [routes.md](../routes.md).

## pages/

`ManageTransferPage.tsx` — `AutoTransferPaymentCard` (toggle) + `AutoTransferHistory` (log table)
on the left, `AutoTransferHint` (static help) on the right; global loading `Backdrop`.

## components/

`ManageTransfers/AutoTransferPaymentCard.tsx` (presentational switch card, controlled by parent
formik), `ManageTransfers/AutoTransferHistory.tsx` (history table + hook), `AutoTransferHint.tsx`
(static tips, no data), `common/StatusPill.tsx` (on/off pill, used in history table).

## hooks/

- `ManageTransferHook/ManageAutoTransferHook.tsx` — formik toggle synced to server via
  `useGetCurrentSettingHistory` + `useUpdateSetting`; **auto-fires the update mutation from a
  `useEffect`** whenever the formik value diverges from the last-known server value
  (ref-tracked) — implicit save-on-toggle, no explicit submit button.
- `ManageTransferHook/AutoTransferDataTableHook.tsx` — history table columns
  (createdByUser/employeeCode, createdDate, isAutoTransfer via `StatusPill`).

## store/ — none

State lives in local formik + react-query, no redux slice.

## API hooks called

Own local file `manageClaimFundAPI.ts` (not `src/app/api/*`) — real axios + react-query against
`API_CLAIM_FUND_URL`: `useGetCurrentSettingHistory` (`GET Setting/GetCurrentSetting`),
`useUpdateSetting` (`POST Setting/UpdateSettingAutoTransfer`).

## Gotchas

No mocks/TODOs — clean real-API module. The implicit-save-on-toggle pattern in
`ManageAutoTransferHook` is unusual (side effect reacting to its own controlled form state);
worth knowing about before copying it elsewhere.

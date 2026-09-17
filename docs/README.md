# ClaimAgent Docs Index

Reference docs for this repo, written to be read *instead of* re-exploring the codebase — check
here first before grepping/reading source. Keep entries terse (bullets, not prose); update the
relevant file whenever a module/route/API hook is added or changed.

For conventions (commands, code style, env vars, git flow) see [`CLAUDE.md`](../CLAUDE.md) —
these docs don't repeat that, only add the concrete inventory CLAUDE.md doesn't have.

- [project-structure.md](project-structure.md) — bootstrap order, routing/menu mechanics, data
  layer pattern, state pattern, module shape. Read this first if you're new to the repo.
- [routes.md](routes.md) — every route in `Routes.tsx`/`AuthRoutes.tsx`, the full sidebar menu
  tree, and the `path:label` mismatches between them.
- [api-inventory.md](api-inventory.md) — every React Query hook exported from `src/app/api/*.ts`,
  grouped by wrapper file, with the endpoint and a one-line purpose. Check here before writing a
  new API hook — it may already exist.
- [modules/](modules) — one file per `src/app/modules/<Feature>/`: purpose, pages/components/
  hooks/store inventory, which API hooks it actually calls, and whether its data is real or mock.

## Module status at a glance

| Module | Status | Data |
|---|---|---|
| BillingClaim | Active — hospital list + review; customer is a placeholder | Real API (hospital only; customer has no endpoint) |
| ClaimConsider | Active — customer + hospital claim consideration | Real API (hospital monitor endpoint has a query-key cache-collision bug, see its doc) |
| CreatedClaim | Active — PH/PA claim notification flow | Real API |
| CheckEligible | Active — eligibility check | Real API |
| ClaimSimulate | Active — claim limit calculator | Real API |
| ExtraPayment | Active | **Mock** (`ExtraPaymentMock.ts`, TODO to confirm DTO field names) |
| AdjustTransfer | Active | **Mock** rows in `AdjustTransferDataTableHook.tsx` |
| Refund | Active | see module doc |
| RefundApprove | Active | see module doc |
| ManageTransfer / ManageClaimFund / IncreaseLimitTransfer / BankStatus | Active — money-management pages | see module docs |
| Survey / TransferSlips | Public routes (no auth), under `LayoutPublic` | see module docs |

Full detail in each `modules/*.md`.

> ⚠ **Mock API note** — ใช้ base `VITE_APIGW_CLAIM_FUND_API_URL` (= Postman mock ใน `.env`):
> เส้นที่เพิ่มไปเป็น **mock ทั้งคู่** — ยังไม่มี backend จริง เก็บไว้เป็น placeholder จนกว่าเส้นจริงจะมา:
> 1. **`/api/ClaimFund/Masters/GetPaymentIncreaseStatuses`** (`useGetPaymentIncreaseStatus`
>    → `{base}/Masters/GetPaymentIncreaseStatuses`, status dropdown หน้า ขยายวงเงิน)
> 2. **`/api/ClaimFund/IncreaseTransfer/IncreaseTransferLimitMonitors`**
>    (`useGetIncreaseTransferLimitMonitors` → `{base}/IncreaseTransfer/IncreaseTransferLimitMonitors`,
>    monitor table หน้า ขยายวงเงิน)

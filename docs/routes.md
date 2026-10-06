# Routes &amp; Menu

Two separate registries — see [project-structure.md](project-structure.md#routing) for why they
don't derive from each other. Both must be updated by hand when adding a page.

## Route table (`src/app/routes/Routes.tsx`)

| Path | Title | Element | Module |
|---|---|---|---|
| `/blank-page` | Blank Page | `BlankPage` | `pages/` |
| `/test-sweetalert` | test-sweetalert | `SweetAlertTestPage` | `pages/` |
| `/checkeligible/detail/:cusId` | ตรวจสอบสิทธิ์ - รายละเอียด | `CheckEligibleDetailPage` | CheckEligible |
| `/monitor-claim` | Monitor - แจ้งเคลม | `MonitorPage` | CreatedClaim |
| `claim/ph/:appId/:refId/:isContinuous/:oldClaimId` | แจ้งเคลม - PH | `Outlet` → `ClaimPHPage` (index), `.../summary` → `ClaimPHSummaryPage` | CreatedClaim |
| `claim/pa/:appId/:refId/:isContinuous/:oldClaimId` | แจ้งเคลม - PA | `Outlet` → `ClaimPAPage` (index), `.../summary` → `ClaimPASummaryPage` | CreatedClaim |
| `/claim-simulation` | คำนวณวงเงินเคลม | `Outlet` → `ClaimSimulatePage` (index), `/summary` → `ClaimSimulateSummaryPage` | ClaimSimulate |
| `/consideration` | พิจารณาเคลม | `BlankPage` (unused stub — real pages are under `/consider/*` below) | — |
| `/payment-monitor` | Monitor-โอนเงิน | `Outlet` → `ExtraPaymentListPage` (index), `/extra-payment` → `ExtraPaymentPage` | ExtraPayment |
| `/manage/adjust-transfer` | โอนเพิ่ม | `AdjustTransferPage` | AdjustTransfer |
| `/manage/refund` | คืนเงิน | `RefundPage` | Refund |
| `/manage/refund-approve` | อนุมัติคืนเงิน | `RefundApprovePage` | RefundApprove |
| `/manage/increase-limit-transfer` | ขยายวงเงิน | `IncreaseLimitTransfer` | IncreaseLimitTransfer |
| `/manage/transfer/repay` | แก้ไขการโอนเงิน | `RepayPage` | ManageTransfer |
| `/manage/bank/status` | สอบถามธนาคาร | `BankStatusCheck` | BankStatus |
| `/manage/setting/transfer` | ตั้งค่าการโอนเงิน | `ManageTransferPage` | ManageClaimFund |
| `/consider/monitor` | พิจารณาเคลม - เคลมลูกค้า | `Outlet` → `ConsiderMonitorPage` (child `path:"customers"`, also `index:true` — see quirk below), `customers/:id/:caseId` → `ConsiderDetailPage` (both params `btoa`-encoded; `:caseId` feeds `useGetClaimDetailConsider`) | ClaimConsider |
| `/consider/hospital-monitor` | พิจารณาเคลม - เคลมโรงพยาบาล | `Outlet` → `ConsiderHospitalMonitorPage` (index), `hospital/:id/:caseId` → `ConsiderHospitalDetailPage`, `hospital/:id/:caseId/document` → `ConsiderHospitalDocumentPage` (both params `btoa`-encoded; `:caseId` feeds `useGetClaimDetailConsider`) | ClaimConsider |
| `/billing` | วางบิลเคลม | `Outlet` → `Navigate to="hospital"` (index), `customers` → `BillingFundDisbursementPage` (ตั้งเบิกกองทุน), `hospital` → `BillingHospitalMonitorPage` (ตรวจสอบรพ.วางบิล), `hospital/:id/review` → `BillingHospitalReviewPage`, `hospital/:id/document` → `BillingHospitalDocumentPage` | **BillingClaim** |

Plus `src/App.tsx` itself: `AuthRoutes` (callbacks, `/unauthorized`), `/` → `Home`, public
`/slip/:id` + `/survey/*` under `<LayoutPublic />`, `*` → `/not-found`.

`:id` params across `ClaimConsider`/`BillingClaim` detail routes are `btoa(...)`-encoded on
navigate and `atob(...)`-decoded via `useParams()` in the hook — `ClaimConsider` encodes
`claimId`; `BillingClaim` encodes `billingDetailId` (**not** `caseId` — a case can have multiple
billing rounds over time, so the id must be round-level to unambiguously identify which round is
being reviewed).

### Known quirk — don't repeat it

`/consider/monitor`'s child has **both** `path: "customers"` and `index: true` set on the same
route object — redundant/contradictory react-router config that happens to still resolve because
`ConsiderMonitorPage` is the only thing at that branch. `BillingClaim` hit the sharp edge of this
same pattern: `BillingHospitalMonitorPage` was originally registered as *both* `/billing`'s index
route *and* `/billing/hospital`, and a relative `navigate("hospital/:id/review")` call from a
table row resolved differently depending on which of the two URLs the user was actually on —
correct at `/billing`, but doubled to `/billing/hospital/hospital/:id/review` (404) when at
`/billing/hospital`, which is what the sidebar actually links to. Fixed by making the index
route `<Navigate to="hospital" replace />` and switching the table's row-action links to
absolute paths (`/billing/hospital/...`) instead of relative ones. **Rule of thumb: one
canonical path per page component; alias the parent with `<Navigate>`, and prefer absolute paths
in `navigate()` calls from deeply-nested table/row components.**

## Sidebar menu (`src/app/routes/ASideMenuList.tsx`) — hand-written, not derived from Routes

```
Home                                          → /
แจ้งเคลม (ParentMenu)
  └ แจ้งเคลม                                  → /monitor-claim
คำนวณวงเงินเคลม                                → /claim-simulation
จัดการเงินเคลม (ParentMenu)
  ├ โอนเพิ่ม                                   → /manage/adjust-transfer
  ├ คืนเงิน                                    → /manage/refund
  ├ อนุมัติคืนเงิน                             → /manage/refund-approve
  ├ ขยายวงเงิน                                 → /manage/increase-limit-transfer
  ├ แก้ไขการโอนเงิน                            → /manage/transfer/repay
  ├ สอบถามธนาคาร                               → /manage/bank/status
  └ ตั้งค่าการโอนเงิน                          → /manage/setting/transfer
พิจารณาเคลม (ParentMenu)
  ├ เคลมลูกค้า                                 → /consider/monitor
  └ เคลมโรงพยาบาล                              → /consider/hospital-monitor
วางบิลเคลม (ParentMenu)
  ├ ตั้งเบิกกองทุน (UI shell, ไม่มี backend)   → /billing/customers
  └ ตรวจสอบรพ.วางบิล                           → /billing/hospital
```

All entries pass `permissions: []` (guarding is not enforced yet — see project-structure.md).
`ParentMenu`/`MenuItem` props: `icon` (Material ligature string or JSX element), `text`,
`permissions?`, `condition?`. `MenuItem.path` is matched against `location.pathname` for the
`selected` highlight — must be an *exact* match, not a prefix.

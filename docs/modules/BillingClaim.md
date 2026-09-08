# BillingClaim

`วางบิลเคลม` — hospital/customer billing intake: hospitals submit bills for claims, an officer
reviews/verifies documents and expense line items, then confirms a review result that updates the
case (and, once all cases under a billing agree, the billing) status. **Built this session**, from
`handoff-dev-billing-hospital-claim.md` + a demo HTML mockup. **All data is mock** — no backend
endpoint exists yet (see [api-inventory.md](../api-inventory.md#still-no-api-for)).

Routes: `/billing/*` — see [routes.md](../routes.md). Menu: ParentMenu "วางบิลเคลม" in
`ASideMenuList.tsx`, submenu "เคลมลูกค้า" (placeholder) + "เคลมโรงพยาบาล" (built).

## Scope

Only `วางบิลเคลม > เคลมโรงพยาบาล` is implemented. `เคลมลูกค้า` is a placeholder page
(`BillingCustomerPage.tsx`, "อยู่ระหว่างพัฒนา") — out of scope per the handoff, would need the
demo's checkbox-multi-select-then-confirm-billing flow if picked up later.

## pages/

| File | Purpose |
|---|---|
| `BillingHospitalMonitorPage.tsx` | List page: dashboard + filter + table |
| `BillingHospitalReviewPage.tsx` | Review page shell: header cards + 6 shared tabs + `BillingClaimDetailsTab` (tab 1 only, `readOnly?` prop) |
| `BillingHospitalDocumentPage.tsx` | 4-line wrapper = `<BillingHospitalReviewPage readOnly />` (the "ดูรายละเอียด" eye-icon route) |
| `BillingCustomerPage.tsx` | Placeholder |

## components/

**`BillingHospitalMonitor/`** (list page)
- `BillingHospitalHeader.tsx` — dashboard card; wraps `ClaimConsider`'s reusable
  `SummaryHeaderCard`, counts the 4 statuses from `rows`
- `BillingHospitalFilter.tsx` — ค้นหาจาก dropdown + คำค้นหา + segmented status (reuses
  `ClaimConsider`'s `StatusFilterToggle`); status change calls `onStatusChange` directly
  (bypasses the formik-value staleness you'd get from just reading `formik.values` right after
  `setFieldValue`) so the table updates on click, no separate "ค้นหา" needed
- `BillingHospitalDataTable.tsx` — thin `StandardDataTable` wrapper

**`BillingHospitalReview/`** (review page)
- `BillingClaimDetailsTab.tsx` — the 3-step orchestrator (`StepToggleBar` + step content +
  กลับ/ถัดไป/ยืนยันผลตรวจสอบ buttons), single `FormikProvider` spans all 3 steps so nothing is
  lost switching steps
- `SubDetailsTab/BillingExpenseTable.tsx` — Step 2 editable line-item table (plain React state,
  not Formik — see Store below)
- `SubDetailsTab/BillTailDiscountCard.tsx` — Step 2 "สรุปยอดเงิน" + "ส่วนลดท้ายบิล" +
  ยอดเบิกสุทธิ (`max(0, grandTotal - discount)`)
- `SubDetailsTab/BillingSummaryStep3.tsx` — Step 3 read-only recap (`CustomDisplayText` grid)
- `SubDetailsTab/BillingReviewResultSection.tsx` — Step 3 ผลการตรวจสอบ 4-button selector +
  หมายเหตุ, styled after `ClaimConsider`'s `ConsiderSection`

### Reused as-is from `ClaimConsider` (no changes needed)

`SummaryHeaderCard`, `StatusFilterToggle`, `StepToggleBar`, `HeaderCardCustomerDetails`,
`ClaimDetail`, `CollapsibleSection`, `RecordClaimData`, `TreatmentInfoSection`,
`AttendingDoctorSection`, `DocumentVerifyTable`,
`CLAIM_LIST_TYPE_CONFIG` / `DOCUMENT_CHECK_RESULTS` (from `hospitalConsiderMock.tsx`). The
Formik-context components (`RecordClaimData` etc.) work because `BillingHospitalValues extends
HospitalConsiderValues` — same field names, so `useFormikContext<HospitalConsiderValues>()`
inside those shared components resolves fine against our form.

### Deliberately NOT reused

- `ExpenseRecords` / `useClaimExpenseDetailHook` — pulls `useConsiderDetailHook()` internally
  (hardcoded to read `claimId` from `useParams()`) and writes to the *global*
  `claimConsider.filledItems` redux state. Reusing it would mean refactoring two hooks used by
  the live consider flow, or silently sharing state with whatever consider page is also open.
  Built `BillingExpenseTable` + `BillingExpenseHook` instead — same UX intent, isolated state.
- `ClaimSummaryStep3` — that's the claim-consider compensation/payout-account summary; billing
  doesn't have compensation accounts or ส่วนลด SS ท้ายบิล, so `BillingSummaryStep3` +
  `BillTailDiscountCard` were written fresh instead.
- `ConsiderSection` — decision-reason dropdown workflow specific to claim consider; billing's
  ผลการตรวจสอบ is a flat 4-option pick + free-text remark, no reason master data involved.

## hooks/

- `BillingHospitalMonitor/BillingSearchFilterHook.tsx` — `useFormik<BillingSearchFilterValues>`,
  default `statusId = waitReview` per Handoff
- `BillingHospitalMonitor/BillingHospitalDataTableHook.tsx` — in-memory filter/paginate over
  `rows`, returns `PaginationResultDto`-shaped pagination so swapping to a real API later means
  changing only this file, not the components that consume it. Row-action buttons navigate with
  **absolute** paths (`/billing/hospital/${btoa(caseId)}/review`) — see the routing quirk in
  [routes.md](../routes.md#known-quirk--dont-repeat-it) for why this matters
- `BillingHospitalReview/BillingReviewDetailHook.tsx` — `BillingHospitalValues` type +
  `useFormik`, `validateStep1` (mirrors `ClaimConsider`'s `validateHospitalConsider`), and
  `handleConfirmReview()` which runs all 8 Handoff validation rules before dispatching the
  status update. Reuses the **real** master hooks (`useGetIncidentType`,
  `useGetIncidentTypeMapping`, `useGetDocumentReviewStatus`) since those are generic master
  data, not billing-specific — only the billing row itself is mocked
- `BillingHospitalReview/BillingExpenseHook.tsx` — Step 2 state (see Store below)

## store/ — `billingClaimSlice.ts` (redux key: `billingClaim`)

```ts
interface BillingClaimState { rows: BillingHospitalRow[] }  // seeded from MOCK_BILLING_HOSPITAL_ROWS
```

**Deliberately minimal** — only `rows` lives in redux (so the list page sees status changes made
on the review page across navigation, standing in for a query-cache invalidation once there's a
real API). Step 2's `expenseItems`/`billTailDiscount` are **local `useState`** inside
`BillingExpenseHook`, *not* redux — the plan originally called for them in the slice too, but
that would reproduce the exact `claimConsider.filledItems` global-state trap documented in
[project-structure.md](../project-structure.md#state-redux). Nothing about this data needs to
survive navigation away from the review page.

Billing-level status is **derived, not stored**: `billingStatusHelpers.ts`'s
`recalcBillingStatus(cases)` computes it live from all rows sharing a `billingId` — "ผ่าน" only
when every case is "ผ่าน", per Handoff. `updateBillingCaseStatus` action only ever touches one
case's `statusId`; nothing double-books the rollup.

`billingClaim.types.ts` is marked `// TODO: ยืนยัน field name จริงกับ backend DTO` (same
convention as `ExtraPayment.types.ts`) — replace `MOCK_BILLING_HOSPITAL_ROWS` /
`buildMockExpenseItems` with real API hooks when the backend ships, the table/hook boundary was
built so that's a `store/` + `hooks/BillingHospitalDataTableHook.tsx` +
`hooks/BillingReviewDetailHook.tsx` change only.

## Known gaps (by design, documented in the plan)

- Tabs 2–6 on the review page (`ประวัติทำรายการ`, `ความคุ้มครอง`, …) are `disabled` — same as
  `ClaimConsider`'s hospital review page today. Their underlying hooks
  (`useClaimTransactionHook`, `usePolicyBenefitHook`) hardcode `atob(useParams().id)` as a
  *claimId*, which this module's `:id` (a `caseId`) isn't. Enabling them needs those hooks
  refactored to take an optional `claimId` param — do it for both modules together.
- `PermissionList` guarding not wired (matches the rest of the repo today).

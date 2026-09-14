# BillingClaim

`วางบิลเคลม` — hospital billing intake: hospitals submit bills for claims, an officer reviews
documents and expense line items, then confirms a review result that the backend records as an
immutable review revision for that billing round. **Real backend** — see
[api-inventory.md](../api-inventory.md) (`hospitalBillingApi.ts` section) for the wrapper hooks,
and the source handoff (`hospital-billing-frontend-structure-handoff-2026-09-08.md`, 2026-09-08
restructure) for the base contract.

Routes: `/billing/*` — see [routes.md](../routes.md). Menu: ParentMenu "วางบิลเคลม" in
`ASideMenuList.tsx`, submenu "เคลมลูกค้า" (placeholder) + "เคลมโรงพยาบาล" (built).

**2026-09 UI rewrite** — the review page (`BillingClaimDetailsTab` and everything under it) was
rebuilt against a new 4-tab spec sheet (Monitor + 3 product variants: OPD Half/A, OPD Full/B,
IPD/C). The headline change: **Step 1 and Step 2 are now fully read-only** (mirrors data from
SmileConnect, no input controls) — the only things a reviewer can still edit are the document
review result/note per row, the scan-document action, and the "แจ้งผลการพิจารณาโรงพยาบาล" block
(Step 1 + Step 2). Step 3 no longer has that block — it has a dedicated "อนุมัติ" button instead.
See "Read-only by design" and "Known gaps" below before touching any Step 1/2 section.

## Scope

Only `วางบิลเคลม > เคลมโรงพยาบาล` is implemented. `เคลมลูกค้า` is a placeholder page
(`BillingCustomerPage.tsx`, "อยู่ระหว่างพัฒนา") — out of scope, no endpoint exists; would need a
checkbox-multi-select-then-confirm-billing flow if picked up later.

## pages/

| File | Purpose |
|---|---|
| `BillingHospitalMonitorPage.tsx` | List page: dashboard + filter + table |
| `BillingHospitalReviewPage.tsx` | Review page shell: header cards (+ ข้อมูลสถานศึกษา card when `variant.isPA`) + 2 active tabs (`ข้อมูลเคลม`, `ประวัติทำรายการ`) + 4 disabled tabs, `BillingClaimDetailsTab` |
| `BillingHospitalDocumentPage.tsx` | 4-line wrapper = `<BillingHospitalReviewPage readOnly />` (the "ดูรายละเอียด" eye-icon route) |
| `BillingCustomerPage.tsx` | Placeholder |

## components/

**`BillingHospitalMonitor/`** (list page)
- `BillingHospitalHeader.tsx` — dashboard card; wraps `ClaimConsider`'s reusable
  `SummaryHeaderCard`, reads counts from the filter API's `counts` map and labels from
  `BILLING_STATUS_LABEL` (single source of truth for status wording — see below)
- `BillingHospitalFilter.tsx` — ค้นหาจาก dropdown + คำค้นหา + segmented status (reuses
  `ClaimConsider`'s `StatusFilterToggle`); status change calls `onStatusChange` directly so the
  table refetches on click, no separate "ค้นหา" needed
- `BillingHospitalDataTable.tsx` — thin `StandardDataTable` wrapper; row actions navigate with
  **absolute** paths built from `btoa(row.billingDetailId)` — see the routing quirk in
  [routes.md](../routes.md#known-quirk--dont-repeat-it) for why this matters

**`BillingHospitalReview/`** (review page)
- `BillingClaimDetailsTab.tsx` — the 3-step orchestrator (`StepToggleBar` + step content), single
  `FormikProvider` spans all 3 steps so nothing is lost switching steps. Footer buttons differ by
  step: Step 1/2 = กลับ / **ยืนยันบันทึกผลพิจารณา** (submits `values.reviewStatusId`, enabled once
  a result is picked) / ถัดไป (Step 1 validates document coverage; Step 2 confirms an
  amount-mismatch dialog, non-blocking); Step 3 = กลับ / **อนุมัติ** (its own validation, submits
  `passed`)
- `BillingHistoryTab.tsx` — "ประวัติทำรายการ": `rounds` table (all billing rounds of the same
  case, clickable to switch which round's `revisions` are shown) + `revisions` table (review
  history of the selected round, each with an embedded `snapshot`)
- `SubDetailsTab/BillingContinuousClaimSection.tsx` — Step 1 "เคลมต่อเนื่อง" checkbox → reuses
  `CheckEligible/components/ContinuousClaimDialog.tsx` as-is (props-only, no foreign Formik
  context) to pick a continuous claim
- `SubDetailsTab/BillingClaimInfoSection.tsx`, `BillingTreatmentSection.tsx`,
  `BillingAttendingDoctorSection.tsx` — Step 1, **read-only** (`CustomDisplayText` grids). Names
  for `incidentTypeId`/`coverageTypeId`/`medicalTypeId`/`diagnosis1..3Id` are resolved via
  `useBillingClaimLabels` since the DTO only carries IDs. `BillingTreatmentSection`/
  `BillingAttendingDoctorSection` are wrapped in `ClaimConsider`'s `CollapsibleSection`
  (Default Expand per spec)
- `SubDetailsTab/BillingDocumentTable.tsx` — Step 1 "ตรวจสอบเอกสาร", the one editable table: 6
  columns (รายการเอกสาร / **สแกนเอกสาร** / จำนวนเอกสาร / รายละเอียด (eye → `DocumentFileViewer`) /
  ผลการตรวจ / หมายเหตุ). Backed by `useBillingDocumentHook` which joins `documents[]` with
  DocStorage (`useGetDocumentListByIds`) for real `fileCount` + scan-link metadata
- `SubDetailsTab/BillingOcrReceiptViewer.tsx` — Step 2 "OCR ใบแจ้งค่ารักษา" (variant A only),
  disabled shell (spec: no new upload/delete/re-OCR allowed on this page)
- `SubDetailsTab/BillingHospitalExpenseSummary.tsx` — Step 2 "รายการค่ารักษา(จากโรงพยาบาล)"
  (variant A only), read-only
- `SubDetailsTab/BillingExpenseTable.tsx` — Step 2 "รายการค่ารักษา(เบื้องต้น)", **read-only**
  (`claimAmount` bound to "ยอดเงินตามใบเสร็จ"); add/delete-row controls are disabled shells;
  variant B/C show the Sim B1/B2 selector (disabled — no `simBCategory` source yet)
- `SubDetailsTab/BillingExpenseSummaryCard.tsx` — Step 2 "สรุปยอดเงิน", 5 read-only totals from
  `useBillingExpenseHook`
- `SubDetailsTab/BillingSummaryStep3.tsx` — Step 3 "สรุปรายการเคลม": read-only recap
  (`CustomDisplayText` grid) + `BillingScanDocumentTable` + `ClaimSummaryStep3` (reused, see below)
- `SubDetailsTab/BillingScanDocumentTable.tsx` — Step 3 "สแกนเอกสาร" (separate table from Step 1's
  ตรวจสอบเอกสาร; spec says explicitly this one does **not** sync back to SmileConnect)
- `SubDetailsTab/BillingReviewResultSection.tsx` — "แจ้งผลการพิจารณาโรงพยาบาล", rendered on
  **Step 1 and Step 2 only** (not Step 3 — spec moved that block off the last step and gave Step 3
  its own "อนุมัติ" button instead). Only 2 outcomes here: รอแก้ไข / ปฏิเสธ (อนุมัติ isn't a button
  in this block anymore) + conditional สาเหตุ dropdown + รายละเอียด (required for รอแก้ไข only) +
  เอกสารประกอบการปฏิเสธ table (shown when ปฏิเสธ is selected)

### Reused as-is

- `SummaryHeaderCard`, `StatusFilterToggle`, `StepToggleBar`, `HeaderCardCustomerDetails`,
  `ClaimDetail`, `CollapsibleSection`, `DocumentFileViewer` from `ClaimConsider` — see
  [routes.md](../routes.md) note on `claimType`: the backend dropped `claimType` from the Billing
  DTOs (2026-09-08 codegen), so `variant.claimListTypeLabel` (derived client-side, see below) is
  used instead of a DTO field
- `HeaderCardSchoolDetails` (ClaimConsider) — renders `-` in every field when given
  `customerDetail={undefined}`, which is exactly the placeholder billing needs today; gated on
  `variant.isPA` (always `false` until the backend adds a product-type field, so it doesn't render
  yet — see Known gaps)
- `ContinuousClaimDialog` + `useContinuousClaimTable` (`CheckEligible`) — props-only, no shared
  Formik context, safe to reuse directly for "เคลมต่อเนื่อง"
- `ClaimSummaryStep3` (`ClaimConsider/.../ExpensesTabs/`) — the รายการค่ารักษา (benefit
  breakdown) / สรุปค่าชดเชย / สรุปค่าใช้จ่ายโรงพยาบาล / บัญชีรับเงินค่าชดเชย block on Step 3.
  Reused via **3 additive props** (default = old behaviour, so `ClaimConsider`'s own hospital
  review page is unaffected): `hideCompensationTable` (billing has no per-line compensation
  table), `lastSummaryLine: "compensateRemain"` (billing's spec ends the "สรุปค่าใช้จ่ายโรงพยาบาล"
  card with "ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)", not the "ส่วนเกิน (ลูกค้าจ่าย)" line
  `ClaimConsider` uses), `disableAccountEdit` (spec: ปุ่มแก้ไขบัญชี *Disable). Billing calls it
  with `treatmentRows=[]` and `compensationRows=[]` — no per-benefit/compensation breakdown exists
  yet (see Known gaps) — and derives `summary.medicalNet`/`medicalPay` from
  `useBillingExpenseHook`'s real totals

### Deliberately NOT reused

- `OcrReceiptSection.tsx` (ClaimConsider) — a 700+ line uploader with its own mutation state and
  **no `readOnly` prop**; the billing review page must never allow upload/delete/re-OCR, and
  adding a disabled mode would mean touching the file the live claim-consider flow uses. Built
  `BillingOcrReceiptViewer` (disabled shell) instead.
- `DocumentVerifyTable.tsx` (ClaimConsider) — bound to `useFormikContext<HospitalConsiderValues>`
  and the `DocumentCheckRow` type from its module's `mock/` file; the column layout was copied
  into `BillingDocumentTable.tsx` instead of generalizing that component (would risk the live
  consider page).
- `ContinuousClaimSection.tsx` (ClaimConsider) — same Formik-context + mock-type coupling as
  above; `ContinuousClaimDialog` (CheckEligible) was reused instead (see above).
- `ClaimInformationSection.tsx` (ClaimConsider) — takes `values: ClaimConsiderValues`
  (`values.diagnoses[]`, `values.hospitalName`, …), a different shape than
  `BillingReviewFormValues`; `BillingSummaryStep3`'s own recap grid was written instead.
- `ClaimDocumentTable.tsx` (ClaimConsider) — missing the "สแกนเอกสาร" column and the
  disable-when-empty rule Step 3's ตาราง needs, and opens files in a new tab instead of the
  eye → `DocumentFileViewer` dialog pattern used everywhere else on this page.
  `BillingScanDocumentTable.tsx` was written fresh (it does reuse `DocumentFileViewer`).
- `SummaryTreatmentCost.tsx` (ClaimConsider) — **dead code**, not imported anywhere, every value
  hardcoded to `0`. Do not import it as a shortcut for "สรุปยอดเงิน" layout ideas — copy the idea,
  not the file.
- `ExpenseRecords` / `useClaimExpenseDetailHook` — pulls `useConsiderDetailHook()` internally
  (hardcoded to read `claimId` from `useParams()`) and writes to the *global*
  `claimConsider.filledItems` redux state. Reusing it would mean refactoring two hooks used by
  the live consider flow, or silently sharing state with whatever consider page is also open.
  Built `BillingExpenseTable` + `BillingExpenseHook` instead — same UX intent, isolated state.
- `ConsiderSection` — decision-reason dropdown workflow specific to claim consider (4 outcomes,
  attachment requirement on ปฏิเสธ); billing's ผลการพิจารณา now has only 2 outcomes in this block
  (อนุมัติ moved to its own Step 3 button), so `BillingReviewResultSection` stays a separate
  component. It **does** reuse the same master hook (`useGetDecisionReason`) and the same
  `decisionId` numbering as `ConsiderSection` (see Reason fields below).
- `CLAIM_LIST_TYPE_CONFIG` (ClaimConsider `.../mock/hospitalConsiderMock.tsx`) — the file is named
  `mock` and mixes real config with mock data; the 3-flag shape was copied into
  `BILLING_CLAIM_LIST_TYPE_CONFIG` (`billingClaim.types.ts`) instead of importing across modules.

## hooks/

- `BillingHospitalMonitor/BillingSearchFilterHook.tsx` — `useFormik<BillingSearchFilterValues>`,
  default `statusId = pendingReview` (1) per handoff
- `BillingHospitalMonitor/BillingHospitalDataTableHook.tsx` — thin adapter over
  `useGetHospitalBillingFilter` (server-side filter/sort/paginate); columns + row actions
- `BillingHospitalReview/BillingReviewDetailHook.tsx` — `BillingReviewFormValues` + `useFormik`,
  loads `useGetHospitalBillingDetail` once into the form (`hasSyncedRef` guards against
  `enableReinitialize` clobbering user edits on refetch). One submit endpoint
  (`useSubmitHospitalBilling`) backs every outcome — `submitReview(statusId)` is the single call
  site; `handleSubmitReviewResult()` (Step 1/2 "ยืนยันบันทึกผลพิจารณา") and `handleApprove()`
  (Step 3 "อนุมัติ", runs `validateApprove()` first) both call it. `requestId`
  (`crypto.randomUUID()`, one per submit *intent*) resets whenever `reviewStatusId`/
  `reviewReasonId`/`reviewRemark` change, not just on success/409 — otherwise a failed submit
  followed by the reviewer changing their mind would retry with the *old* requestId against a
  *new* payload. Handles `409` by `swalWarning` + resetting `hasSyncedRef` + `refetchDetail()`
  (never auto-resubmits the stale payload).
- `BillingHospitalReview/BillingDocumentHook.tsx` — joins `documents[]` with DocStorage
  (`useGetDocumentListByIds`) for real `fileCount` + scan-link metadata; exposes
  `hasAnyMissingResult()` (Step 1 "ถัดไป" gate), `hasAnyNotPassed()` (Step 3 "อนุมัติ" gate)
- `BillingHospitalReview/BillingClaimLabelsHook.tsx` — resolves the ID-only fields on
  `BillingClaimDto` (`incidentTypeId`/`coverageTypeId`/`medicalTypeId`/`diagnosis1..3Id`) to
  display names via the same master endpoints `ClaimTypeSelector`/`CD10Autocomplete` used when
  those fields were still editable — called once per ID list (not per-ID) to avoid N separate
  ICD10 requests
- `BillingHospitalReview/BillingProductVariantHook.tsx` — the single place every product/variant
  gate reads from (see Known gaps for what's real vs. derived-for-now)
- `BillingHospitalReview/BillingHistoryHook.tsx` — wraps `useGetHospitalBillingHistory`;
  `selectedRoundId` starts at the current round and can be pointed at any `billingDetailId` from
  `rounds` to inspect an older round's `revisions`
- `BillingHospitalReview/BillingExpenseHook.tsx` — derives all Step 2 totals **from
  `formik.values.expenses` via `useMemo`** (no local `useState` — a previous version of this doc
  said otherwise; that was stale). `netAmount` ("ยอดเงินสุทธิ") is computed from real DTO fields
  (`claimAmount`/`discountAmount`/`nonCoveredAmount`); `transferAmount` ("ยอดเงินโอน") is an
  interim approximation until Benefit-aware calculation exists (see Known gaps)

## store/ (no redux slice — react-query cache only)

`BillingClaim` has **no Redux slice**. All server state lives in the `hospitalBillingApi.ts`
react-query cache; `useSubmitHospitalBilling` invalidates the filter/detail/history query keys on
success, which is what makes the list page reflect a status change made on the review page.

- `billingClaim.types.ts` — `BILLING_STATUS` (1 pendingReview / 2 needsCorrection / 3 passed / 4
  rejected / 5 cancelled — numbers are the real backend contract, not mock placeholders) +
  `BILLING_STATUS_LABEL` (the one place status wording lives — Monitor cards, filter chips, the
  Step review-result buttons all read from it, not their own string literals),
  `BILLING_DOCUMENT_REVIEW_STATUS` (document result ids 2 ผ่าน / 3 ไม่ผ่าน / 4 รอเอกสารเพิ่มเติม —
  **unconfirmed with backend**, copied from the same assumption `ClaimConsider`'s mock file makes),
  `BILLING_CLAIM_LIST_TYPE_CONFIG` (variant A/B/C flags, keyed by the `?type=` query param — see
  Known gaps), `BILLING_DECISION_ID` (maps a review status to the Decision-master `decisionId`
  used to fetch its สาเหตุ options — see below), `BillingReviewFormValues` (flat form shape; see
  the doc comment in the file for why it isn't nested like the DTO — plus a block of **FE-only**
  fields added for the new spec that `toReviewDataDto` intentionally does not send to the backend
  yet, see Read-only by design below)
- `billingMappers.ts` — the DTO ⇄ form boundary: `toFormValues` (load), `toReviewDataDto` (submit
  `data`), `parseTimeSpan`/`toTimeSpanString` (BE's `TimeSpan` fields are `"HH:mm:ss"` strings on
  the wire, not the generated `TimeSpan` object shape), `round2` (money fields ≤2 decimals)
- `billingStatusHelpers.ts` — `billingStatusLabel`/color maps for `BILLING_STATUS`, and
  `billingReturnStatusLabel` (renders the raw `"Pending"` `returnStatus` string as "รอดำเนินการ
  ส่งกลับ" — Pending means the backend recorded the return request, **not** that SmileConnect
  has received it; outbound publish is still a backend TODO)
- `billingPendingFields.ts` — the placeholder convention for the new spec's UI gaps: `PENDING_BE`
  (display value, `"-"`), `PENDING_BE_TOOLTIP` (put on every disabled control that's waiting on a
  contract field), `PENDING_BE_FIELDS` (screen field → expected DTO/endpoint map — the index for
  the table below). `grep -rn "PENDING_BE" src/app/modules/BillingClaim` lists every stub in the
  module in one shot.

## Reason fields (สาเหตุ) on submit

The 2026-09-08 restructure added three write-only fields to `SubmitHospitalBillingDto` that the
handoff's status matrix requires per `reviewStatusId`:

| `reviewStatusId` | Fields sent |
|---:|---|
| 2 (รอแก้ไข) | `decisionId` + `decisionReasonId` |
| 3 (อนุมัติ) | none (all three `undefined`) |
| 4 (ปฏิเสธ) | `rejectReasonId` only |
| 5 (ยกเลิก) | `decisionId` + `decisionReasonId` (hidden from this UI, CR Ver2) |

There is no dedicated `RejectReason` master in the generated client, and the handoff doesn't name
the `decisionId` values to use — `BILLING_DECISION_ID` reuses the same numbering
`ClaimConsider/ClaimDetailActionHook.tsx` already sends BE (`4` รอแก้ไข / `5` ปฏิเสธ / `6`
ยกเลิก) and the same `useGetDecisionReason(undefined, decisionId)` master hook, on the assumption
the reason master is shared across claim-consider and billing decisions. **Unconfirmed with
backend** — flagged with a `TODO` at `BILLING_DECISION_ID`'s definition, now higher-stakes since
the save action lives on every step instead of just the last one.

The form keeps a single `reviewReasonId` field (not three) so switching status can't leave a
stale reason from a different `decisionId` behind — `BillingReviewResultSection` clears it on
every status button click, and `submitReview(statusId)` in `BillingReviewDetailHook.tsx` is the
only place that decides which of the three DTO fields the value lands in.

These fields are **submit-only** — `BillingDetailDto` / `BillingRevisionDto` don't return them,
so a submitted row's สาเหตุ can't be shown when reopening it (Step 3's dropdown is simply absent
in read-only mode, same as any other write-only field). Revisit if backend adds them to the read
side.

## Read-only by design

Step 1 and Step 2 dropped every input control (`ClaimTypeSelector`, date/time pickers, text
fields, the expense table's editable cells, ส่วนลด SS ท้ายบิล) in favour of `CustomDisplayText`
grids, per the new spec's "Field ทั้งหมดใน Section นี้ ให้ระบบแสดงข้อมูลที่ได้รับจาก SmileConnect
ในรูปแบบ Read-only" instruction repeated on every Step 1/2 section.

Despite that, `BillingReviewFormValues` still carries every field those inputs used to bind to
(`hn`, `vn`, `medicalLicenseNo`, `expenses[].claimAmount`, `ssEndDiscountAmount`, …) — **do not
delete them**. `toReviewDataDto` builds the submit payload from the *whole* form, not a diff/PATCH
(`BillingReviewDataDto` has no partial-update variant), so the form is effectively an echo-back
buffer: whatever loaded via `toFormValues` must round-trip back unchanged on submit, or the
backend receives a payload that silently blanks fields the reviewer never touched.

The new spec also added several fields with **no matching DTO field at all** (เคลมต่อเนื่อง
selection, วันที่เอกสารครบ, ข้อบ่งชี้การ Admit, วันนอน IPD/ICU, Sim B category, …). Those were
added to `BillingReviewFormValues` as FE-only fields (see the comment block in the interface) so
the UI has somewhere to bind them, but `toReviewDataDto` deliberately does **not** map them to the
DTO — there's nowhere on the wire for them to go yet. When the backend adds the corresponding DTO
fields, wire the mapper both ways and drop the `PENDING_BE` stand-ins in the components that
display them.

## Known gaps (by design)

Fields the new spec asks for that `BillingDetailDto` (and friends) don't carry yet. Every spot
below renders `PENDING_BE` (`"-"` or a disabled control with `PENDING_BE_TOOLTIP`) instead —
`grep -rn "PENDING_BE" src/app/modules/BillingClaim` finds them all.

| Screen field | Where | Expected DTO/endpoint | Current stand-in |
|---|---|---|---|
| Product type (PA/PH) | Header, Step 3 บัญชีรับเงินค่าชดเชย gate | `BillingDetailDto.productTypeId` | `useBillingProductVariant` hardcodes `false` for both `isPA`/`isPH` |
| Claim list variant (OPD Half/Full/IPD) | Whole review page | `BillingDetailDto.claimListTypeId` | `?type=` query param (`BILLING_CLAIM_LIST_TYPE_CONFIG`) |
| ข้อมูลสถานศึกษา | Header (PA only) | `BillingDetailDto` school block | `HeaderCardSchoolDetails` never renders (`isPA` false) |
| เลขบัตรประชาชน / เบอร์โทรศัพท์ / สถานะ App | Header ข้อมูลผู้เอาประกัน | `BillingInsuredDto.idCardNo`/`phoneNumber`/`appStatus` | `PENDING_BE` |
| สถานะเคลม (CL) | Header | separate claim-status field (today shows the *billing* status — see risk 7.8 in the design conversation) | `billingStatusLabel(detail.statusId)` |
| วันที่เอกสารครบ | Step 1 รายละเอียดเคลม | `BillingClaimDto.documentCompleteDate` | form field defaults to today, no DTO round-trip |
| ข้อบ่งชี้การ Admit | Step 1 ข้อมูลการเข้ารับการรักษา (IPD) | `BillingClaimDto.admitIndication` | `PENDING_BE` |
| จำนวนวันนอน IPD/ICU | Step 1/3 (IPD) | `BillingClaimDto.ipdDays`/`icuDays` | form field defaults `0`, no DTO round-trip |
| ยอดเงินตามใบเสร็จ / สิทธิ์เบิก ต่อรายการ | Step 2 ตาราง | `claimAmount` reused for ยอดเงินตามใบเสร็จ (real); สิทธิ์เบิก needs Benefit calc | `PENDING_BE` for สิทธิ์เบิก only |
| ประเภทรายการค่าใช้จ่าย (Sim B1/B2) | Step 2 (variant B/C) | `BillingReviewDataDto.simBCategory` | disabled toggle, form default `SimB2` |
| เป็นส่วนเกินจากบริษัทประกัน + บริษัทประกัน | Step 2 ตาราง (variant B/C) | `BillingExpenseDto.isInsuranceExcess`/`insuranceCompanyName` | `PENDING_BE` |
| OCR ใบแจ้งค่ารักษา (ไฟล์/สถานะ) | Step 2 (variant A) | `BillingReviewDataDto.ocrReceiptFiles` | disabled shell, empty list |
| รายการค่ารักษา(จากโรงพยาบาล) — ส่วนลด/สุทธิ | Step 2 (variant A) | separate discount field alongside `originalBilledAmount` | `originalBilledAmount` shown as ยอดเบิกทั้งหมด; ส่วนลด/สุทธิ = `PENDING_BE` |
| รายการค่ารักษา Benefit breakdown | Step 3 | billing-scoped calculation endpoint (`useCalculateCaseClaim` needs a `productId` billing doesn't have — don't try to call it) | `ClaimSummaryStep3` gets `treatmentRows={[]}` |
| สรุปค่าชดเชย / สรุปค่าใช้จ่ายโรงพยาบาล | Step 3 | same billing-scoped calculation endpoint | derived from `useBillingExpenseHook` real totals only (no compensation) |
| บัญชีรับเงินค่าชดเชย | Step 3 (PH + IPD) | `BillingReviewDataDto.payoutAccount` | never renders (`allowSeparateCompensation` false until `isPH` is real) |
| เคลมต่อเนื่อง default จาก SmileConnect | Step 1 | `BillingReviewDataDto.continuousClaim` | checkbox starts unchecked; picking one manually via the dialog still works |
| Step 3 ตารางสแกนเอกสาร | Step 3 | `BillingDetailDto` doesn't expose this document set | `BillingScanDocumentTable` gets `rows=[]` |
| เอกสารประกอบการปฏิเสธ (ประเภทเอกสาร master) | Step 1/2 บล็อกปฏิเสธ | `useGetDocumentType` needs a `productTypeId` billing doesn't have | table renders empty, สแกน button disabled |

Also unchanged from before this rewrite:

- Tabs 3–6 on the review page (`ความคุ้มครอง`, `ประวัติเคลม`, `ประวัติการชำระเงิน`,
  `บันทึกข้อความ`) are `disabled` — same as `ClaimConsider`'s hospital review page today. Their
  underlying hooks (`useClaimTransactionHook`, `usePolicyBenefitHook`) hardcode
  `atob(useParams().id)` as a *claimId*, which this module's `:id` (a `billingDetailId`) isn't.
  Enabling them needs those hooks refactored to take an optional `claimId` param — do it for both
  modules together.
- `BILLING_DECISION_ID`'s numbering is unconfirmed with backend (see above).
- `BILLING_DOCUMENT_REVIEW_STATUS`'s numbering is unconfirmed with backend (copied from
  `ClaimConsider`'s mock assumption) — the "ต้องผ่านครบก่อนอนุมัติ" rule depends on it being right.
- `PermissionList` guarding not wired (matches the rest of the repo today).

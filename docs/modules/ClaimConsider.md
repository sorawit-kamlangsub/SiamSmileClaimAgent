# ClaimConsider

`พิจารณาเคลม` — claim adjudication: officer reviews a submitted claim's data, verifies documents,
edits/records expense line items, and records a decision (approve / pending-doc / revision /
reject / cancel). Two sub-flows: customer claims (`/consider/monitor`) and hospital claims
(`/consider/hospital-monitor`) — hospital shares most of the customer flow's components.
**Real API** (with one known bug, below). This is the module `BillingClaim` was built to sit
alongside and reuse from — see [BillingClaim.md](BillingClaim.md) for the reuse boundary.

Routes: see [routes.md](../routes.md). `:id` = `btoa(claimId)`.

## pages/

| File | Purpose |
|---|---|
| `ConsiderMonitorPage.tsx` | List "เคลมลูกค้า" |
| `ConsiderDetailPage.tsx` | Detail/review, customer — delegates to `HeaderDetails` |
| `ConsiderHospitalMonitorPage.tsx` | List "เคลมโรงพยาบาล" |
| `ConsiderHospitalDetailPage.tsx` | Detail/review, hospital — header cards + 6 tabs + `HospitalClaimDetailsTab` (`readOnly?` prop) |
| `ConsiderHospitalDocumentPage.tsx` | 11-line wrapper = `<ConsiderHospitalDetailPage readOnly />` |

## components/

**`_common/`** — the genuinely reusable pieces (no URL/redux coupling, prop-driven):
`SummaryHeaderCard` (generic 2-panel dashboard tile), `ConsiderCustomerHeaderCard` /
`ConsiderHospitalHeaderCard` (thin color/icon variants of it), `StatusFilterToggle` (generic
segmented status filter bound to any Formik field), `CardClaimInfo`, `Constant/ConstantValues.ts`
(dropdown option constants).

**`ConsiderCustomerMonitor/`** — list-page pieces: `ConsiderCustomerHeader.tsx` (renders both
dashboard panels), `ConsiderCustomerMonitorFilter.tsx` (search form, `isHospital` flag swaps one
label), `ConsiderCustomerDataTable.tsx` / `ConsiderHospitalMonitor/ConsiderHospitalDataTable.tsx`
(thin `StandardDataTable` wrappers).

**`ConsiderDetails/`** — customer-side detail components, **heavily reused by the hospital
flow**: `HeaderDetails.tsx` (customer shell: header cards + tabs), `HeaderDetailCards/` (
`HeaderCardCustomerDetails` — policy-holder banner, `ClaimDetail` — claim-meta card row; both
**fully prop-driven, reused as-is by BillingClaim**), `TabDetails/` (`ClaimDetailsTab` —
customer's 3-step flow, `ClaimTransationTab` — timeline, `PolicyBenefitTab` — coverage table,
`SubDetailsTab/` — `StepToggleBar` (**reused as-is by BillingClaim**), `RecordClaimData`
(**reused as-is**), `StayDaysSummary`, `ExpenseDetails`, `ExpenseRecords` (1100+ lines — the real
expense editor, **not** reusable without refactor, see below), `OcrReceiptSection`,
`ClaimSummary`, `ConsiderSection` (decision-reason picker), `PaymentSummaryCard`).

**`ConsiderHospitalDetails/`** — hospital-specific: `HospitalClaimDetailsTab.tsx` (the 3-step
hospital flow orchestrator), `mock/hospitalConsiderMock.tsx` (⚠ **partly still mock** —
`ClaimListType` config, `DOCUMENT_CHECK_RESULTS` + colors, `DocumentCheckRow`/`DocumentFile`
types, `ContinuousClaimRow`; the "ตรวจสอบเอกสาร" table is real now — documentIds/result/remark
from `useGetCaseReviewOverview`, display name (`documentTypeName`) + file count + scan-link data
(`documentCode`/`mainIndex`/`searchIndex`) from `useGetDocumentListByIds` (keyed by documentId →
`documentInfoByDocId`). "สแกนเอกสาร" opens `${DOC_STORAGE_URL}/document/scan?...` in a new tab
(like `CreatedClaim/DocumentScanTable`) **and** still clears that row's result (CR Ver2 ข้อ 4);
the detail modal (`DocumentFileViewer`) fetches its file list via `useGetDocumentFileByDocumentId`,
is disabled when a documentId has no files in DocStorage, and opens non-image files via
`pathFullDoc` in a new tab. The "ถัดไป"/"อนุมัติ" gates in `HospitalClaimDetailsTab`
(`isDocumentResultAllSelected` / `isDocumentResultAllPassed`) key on `documentInfoByDocId`'s
`fileCount`, not the (now always empty) row `files`. All mapped in `HospitalConsiderDetailHook`.
Header/continuous-claim data still mock; **reused directly by `BillingClaim`**, don't fork it),
`SubDetailsTab/`
(`CollapsibleSection`, `TreatmentInfoSection`, `AttendingDoctorSection`, `ContinuousClaimSection`
/`ContinuousClaimBanner`, `DocumentVerifyTable`, `DocumentFileViewer`, `ExpensesTabs/` —
`TreatmentCostTable`, `ClaimSummaryStep3` (prop-driven money summary, good reuse candidate),
`SummaryTreatmentCost` (half-finished, unused, don't build on it), `_common/HighlightRow.tsx` /
`SummaryBox.tsx` / `calculateCompensationSummary.ts`).

## hooks/

**`ClaimConsiderCustomerMonitor/`**: `SearchFilterHook.tsx` (formik + `SearchFilterType`/
`AppliedFilter`/`getDefaultSearchFilter`), `DashboardHook.tsx` (wraps
`useGetDashboardCustomerConsider`), `DataTableConsiderCustomer.tsx` / `DataTableConsiderHospital.tsx`
(columns + pagination + the API call).

**`ClaimConsiderDetail/`**: `ConsiderDetailHook.tsx` (customer: `useFormik<ClaimConsiderValues>`
+ detail/customer queries, reads `atob(useParams().id)` internally), `ClaimDetailActionHook.tsx`
(builds `SaveClaimEditDraft`/`UpsertClaimDecision` payloads — generic over
`<T extends ClaimConsiderValues>`, a documented extension point), `ClaimStepCalculateHook.tsx`
(step state + `POST calculate/caseclaim` → redux), `ClaimExpenseDetailHook.tsx` (all expense-line
logic — category tree, add/update/remove, totals, `hasDiscountError`/`hasNotCoveredError`;
writes to **global** `claimConsider.filledItems`, see gotcha below), `ClaimTransactionHook.tsx` /
`PolicyBenefitHook.tsx` (both hardcode `atob(useParams().id)` — not reusable without a param).

**`ClaimConsiderHospital/`**: `HospitalConsiderDetailHook.tsx` (`HospitalConsiderValues extends
ClaimConsiderValues` — the type `BillingClaim`'s `BillingHospitalValues` also extends; formik +
`validateHospitalConsider` + master-data hooks + continuous-claim + document-check handlers),
`TreatmentCostsHook.tsx` (dead/stub, ignore).

## store/ — `claimConsiderSlice.ts` (redux key: `claimConsider`)

```ts
interface ClaimConsiderState {
    form: ClaimConsiderValues;        // Step 1 fields (incident/coverage/medical type, dates, diagnoses, …)
    filledItems: ClaimExpenseItem[];  // Step 2 expense line items
    calculateResult: CalculateCaseClaimDtoResponse | null;
}
```

⚠️ **`filledItems` and `form` are global** — shared by whatever page currently mounts
`ExpenseRecords`/`useClaimExpenseDetailHook`. Two consider pages open at once (or a different
module reusing these hooks) will clobber each other's data. This is exactly why `BillingClaim`
did **not** reuse `ExpenseRecords` — see [BillingClaim.md](BillingClaim.md#store--billingclaimslicets-redux-key-billingclaim).

## API hooks called

`coreClaimApi`: `useGetDashboardCustomerConsider`, `useGetCustomerClaimAdjudicationMonitor`,
`useGetHospitalClaimAdjudicationMonitor` (⚠ see below), `useGetClaimDetailConsider`,
`useGetCustomerDetailById`, `useGetClaimTransactionLog`, `useGetPolicyBenefit`,
`useSaveClaimEditDraft`, `useUpsertClaimDecision`, `useGetClaimContinue`,
`useGetStandardMedicalExpenseByCase`, `useGetCustomerBankAccount`.
`coreClaimMastersApi`: `useGetIncidentType`, `useGetIncidentTypeMapping`, `useGetDecisionReason`,
`useGetDocumentReviewStatus`, `useGetNonCoveredReason`, `useGetInsuranceCompany`,
`useGetSimBCategory`, `useGetBank`.

## Known bugs (pre-existing, not introduced this session — flagged for whoever picks them up)

- **[coreClaimApi.ts:633](../../src/app/api/coreClaimApi.ts)** — `useGetHospitalClaimAdjudicationMonitor`
  reuses `getCustomerClaimAdjudicationMonitorQueryKey` instead of its own key. With identical
  filter params, the customer and hospital monitor tables can share a react-query cache entry.
- **`DataTableConsiderHospital.tsx`** — a column is declared `name: "decisionNameTH"` but the DTO
  field is `decisionName`; renders fine only because the cell uses `customBodyRenderLite` and
  reads `row?.decisionName` directly — sort/filter on that column name would silently no-op.
- Tabs 2–6 (`ประวัติทำรายการ`, `ความคุ้มครอง`, `ประวัติเคลม`, `ประวัติการชำระเงิน`,
  `บันทึกข้อความ`) are `disabled` on the hospital detail page; only tabs 1–3 exist at all
  (customer side). `ClaimTransationTab`/`PolicyBenefitTab` hardcode `atob(useParams().id)` as the
  claim id — can't be mounted under a route whose `:id` means something else (e.g. `BillingClaim`'s
  `caseId`) without a refactor to accept an optional param.

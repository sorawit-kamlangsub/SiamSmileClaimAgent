# API Inventory

Every React Query hook exported from `src/app/api/*.ts` (the hand-written wrappers — never call
the generated `*.client.ts` classes directly, see [project-structure.md](project-structure.md#data-layer)).
Check here before adding a new hook — it may already exist. Names are self-explanatory `useGetX`
query hooks unless noted `(mutation)`.

## `coreClaimApi.ts` — Core Claim API (`API_URL`), client = `CoreClaimClient`

| Hook | Purpose |
|---|---|
| `useCalculateCaseClaim` **(mutation)** | POST `/calculate/caseclaim` — runs the claim calculation (medical/compensate expense split, pay/unpay) that feeds Step 3 summaries |
| `useGetCustomerSearch` | Search customers (create-claim flow) |
| `useGetCustomerDetailById(id)` | Customer/policy-holder detail by numeric id |
| `useGetCustomerBenefitDetailSearch` | Coverage/benefit detail search |
| `useCreateCoreClaim` **(mutation)** | Create a new claim (V2 request) |
| `useGetDocumentType(request, isEnabled)` | Document sub-type list |
| `useGetClaimContinue` | Continuous-claim candidates for a policy (feeds "เคลมต่อเนื่อง" picker) |
| `useGetClaimHistory` | Claim history list |
| `useGetCustomerBankAccount(applicationId)` | Customer's bank account(s) |
| `useGetContactPerson(applicationId, productTypeId)` | Contact person info |
| `useGetCaseByClaimId` | Case record for a claim |
| `useCalculateCaseDisability` **(mutation)** | Disability compensation calculation |
| `useGetCustomerBenefitDetailHalf` | Benefit detail (half-year variant) |
| `useGetCustomerSearchByPolicyCode` | Search customer by policy code |
| `useGetPolicyBenefitShered` | Shared policy benefit lookup (sic — "Shered" in source) |
| `useGetDashboardCustomerConsider(dateType, from, to)` | Dashboard summary counts for the consider-monitor pages (`customerTotalCount`, `hospitalWaitConsiderCount`, `hospitalRequestBillingCount`, …) |
| `useGetCustomerClaimAdjudicationMonitor` | List rows for `/consider/monitor` (customer) |
| `useGetClaimDetailConsider(claimId)` | Full claim detail for the consider/review detail pages |
| `useGetClaimTransactionLog` | Transaction/status-change timeline for a claim |
| `useGetPolicyBenefit` | Policy benefit table (grouped by category) |
| `useSaveClaimEditDraft` **(mutation)** | POST `/claim/decision/draft` — save without finalizing a decision |
| `useUpsertClaimDecision` **(mutation)** | POST `/claim/decision` — finalize a decision |
| `useGetPreviousClaim(claimId)` | Previous claim linked to this one |
| `useGetStandardMedicalExpenseByCase` | Standard medical-expense category tree for a case (feeds the expense line-item picker) |
| `useGetHospitalClaimAdjudicationMonitor` | List rows for `/consider/hospital-monitor`. **⚠ Bug**: reuses `getCustomerClaimAdjudicationMonitorQueryKey` instead of its own key ([coreClaimApi.ts:633](../src/app/api/coreClaimApi.ts)) — with identical filter params, this can serve the customer monitor's cached data. Don't copy this pattern. |

**Not yet wrapped**: `CoreClaimClient.approveClaimDecision` (`POST /claim/decision/approve`) exists
on the generated client (added by an NSwag regen currently sitting as an uncommitted change to
`coreClaimApi.client.ts`) but has no `useApproveClaimDecision` hook yet — next piece of work if
you're touching the decision/approve flow.

## `coreClaimMastersApi.ts` — Core Claim master data (`API_URL`), client = `MastersClient`

All read-only `useGetX(id?)` lookups against `/Masters/*`. One row per master:

`useGetUser`, `useGetIncidentType`, `useGetIncidentTypeMapping` (the big one — filters
incident/coverage/medical/cause-of-incident combos by product+claim-source, drives the cascading
selectors in `RecordClaimData`), `useGetSimBCategory`, `useGetSimB`, `useGetChiefComplaint`,
`useGetDocumentRecipientType`, `useGetNonCoveredReason`, `useGetProvince`,
`useGetBankAccountRelationType`, `useGetContactPersonType`, `useGetBank`, `useGetZebraCarOwner`,
`useGetSchoolByProvinceId`, `useGetAllHospital`, `useGetHospitalDetailAllFilter`,
`useGetFormatType`, `useGetBeneficiary`, `useGetRelationType`, `useGetTitle`,
`useGetDisabilityLossPart`, `useGetBodyPartByDisabilityLossPart`, `useGetBranch`,
`useGetPaymentStatus`, `useGetDeductionSource`, `useGetEmployeeClaimPaymentLimit`,
`useGetDecision`, `useGetDocumentReviewStatus` (feeds the ผ่าน/ไม่ผ่าน/รอเอกสารเพิ่มเติม toggle
in `DocumentVerifyTable`), `useGetDecisionReason`, `useGetInsuranceCompany`.

## `docstorageApi.ts` — DocStorage API (`DOCSTORAGE_API_URL`)

| Hook | Purpose |
|---|---|
| `useGetDocumentById(documentId)` | Fetch stored document metadata |
| `useCreateDocumentToDocStorage` **(mutation)** | Upload a document |

## `claimFundApi.ts` — Claim Fund / Transfer service (raw axios, no NSwag client, `${API_CLAIM_FUND_URL}/api`)

| Export | Purpose |
|---|---|
| `useCreatePayment` **(mutation)** | POST `/Transfer/v1/CreatePayment` |
| `getEncryptText` (plain async fn, not a hook) | POST `/Transfer/v1/EncryptText` |

## `ocrApi.ts` — OCR service (raw axios, `OCR_API_URL`)

Plain async functions (no React Query hooks): `uploadIDCard`, `uploadReceipt`,
`uploadMedicalCertificate`, `uploadPassport`, `uploadAlienCard` — all `POST .../ai/ocr/...`.

## Dead / unused

- `claimAgentApi.client.ts` (`ClaimAgentMasterClient`) — generated, but **no wrapper imports it anywhere**.
- `claimAgentApi.ts` — empty file (0 bytes).
- `claimAgentMaster.ts` — fully commented out; an intended wrapper that was never enabled.

## Still no API for

- **Billing rows** (`วางบิลเคลม`) — no `Billing`/`Invoice`/`PlaceBill` endpoint anywhere in the
  generated clients. The only trace is the `hospitalRequestBillingCount` dashboard counter field.
  `BillingClaim` module runs entirely on local mock data — see
  [modules/BillingClaim.md](modules/BillingClaim.md).

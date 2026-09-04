# CheckEligible

`ตรวจสอบสิทธิ์` — pre-claim eligibility/benefit check (coverage limits, waiting periods,
exclusions) for a customer before a claim is filed. Real API for core data, but **several UI
pieces are still mock** (below). Route: `/checkeligible/detail/:cusId` — see [routes.md](../routes.md).

## pages/

- `CheckEligibleDetailPage.tsx` — the module's only page. Shows insured info, coverage summary,
  policy conditions per product type (PH/PA). Explicit gap: no card for `PRODUCT_TYPE_GROUP.CLAIM_MISC`
  (motor/home/fire) — renders `null` for that group ([CheckEligibleDetailPage.tsx:57]).

## components/

- `SearchToolbar.tsx` — search/filter bar (claim type, cause, coverage/medical cascades);
  contains a hardcoded `mockNotes` personal-exclusion note (not from API)
- `CoverageSummaryPanel.tsx` — coverage/benefit usage summary (claim history via `coreClaimApi`)
- `PolicyBenefitSharedPanel.tsx` — shared-benefit-pool display (`useGetPolicyBenefitShered`)
- `PolicyConditionCard.tsx` / `PolicyConditionExclusionModal.tsx` — policy condition summary +
  exclusion modal; exclusion list is **entirely mock** (`MOCK_EXCLUSIONS`)
- `WaitingPeriodStatusBanner.tsx` / `WaitingPeriod120DetailModal.tsx` — 120-day waiting period
  banner + detail; detail modal uses **mock data** (`MOCK_WAITING_120_ITEMS`)
- `InsuredInfoCardPH.tsx` / `InsuredInfoCardPA.tsx` — insured info cards per product
- `ClaimHistoryModalMore.tsx`, `ContinuousClaimDialog.tsx` (backed by `mockClaimContinue.ts`),
  `PersonalExclusionCard.tsx`, `BenefitIcon.tsx`

## hooks/

`useCheckEligibleDetail.ts` (main orchestration), `useCheckEligibleToolbar.ts` (defines
`ToolbarFormValues`, also used by the store), `useClaimTypeCascadeFields.ts` (cascading
claim/incident/coverage type via `coreClaimMastersApi`), `useContinuousClaimTable.ts`
(`useGetClaimContinue`).

## store/ — `checkeligibleSlice` (`state.checkeligible`)

`isSearchcheckeligibleMonitor`, `CheckeLigibleDetails: ToolbarFormValues` (`claimType,
incidentDate, isContinuous, claimCause, coverageType, medicalType, causeOfIncident,
continuousClaim`), `isSearchCheckeLigibleDetails`.

Also `mockClaimContinue.ts` — **not a real slice**, a standalone mock-data file with its own
delete-me TODO: `// TODO: ไฟล์นี้ไว้ทดสอบ UI เฉยๆ ลบทิ้งหรือ disable การใช้งานตอนต่อ backend จริงแล้ว`.

## API hooks called

`coreClaimApi`: `useGetCaseByClaimId`, `useGetClaimHistory`, `useGetPolicyBenefitShered`,
`useGetClaimContinue`, `useGetCustomerBenefitDetailSearch`, `useGetCustomerDetailById`.
`coreClaimMastersApi`: `useGetIncidentType`, `useGetIncidentTypeMapping`. No `docstorageApi` /
`claimFundApi` / `ocrApi` usage.

## Gotchas

- Mock reliance: `MOCK_EXCLUSIONS`, `MOCK_WAITING_120_ITEMS`, `mockNotes`, and all of
  `mockClaimContinue.ts` are UI placeholders — don't treat eligibility exclusion/waiting-period
  data as backend-driven yet.
- `InsuredInfoCardPH.tsx` — dangling TODO about an undeclared URL variable inherited from legacy code.

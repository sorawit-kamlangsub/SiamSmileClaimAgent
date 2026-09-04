# ClaimSimulate

`คำนวณวงเงินเคลม` — claim-amount simulation/calculator (estimate payable claim amount before
actually filing), standalone from `CreatedClaim`'s PH/PA intake flow. **Real API.** Routes:
`/claim-simulation`, `/claim-simulation/summary` — see [routes.md](../routes.md).

## pages/

`ClaimSimulatePage.tsx` (wraps `<ClaimSimulate>`), `ClaimSimulateSummaryPage.tsx` (wraps
`<ClaimSimulateSummary>`) — both thin.

## components/

- `ClaimSimulate.tsx` (1952 lines, largest file in the module) — main form: insured search,
  header fields, days calc, claim-line items table
- `ClaimSimulateSummary.tsx` (610 lines) — result summary page
- `ConfirmCalaulateModal.tsx` (706 lines — note the filename typo "Calaulate") — confirms/shows
  the calculation breakdown; internal var named `MOCK_COMPENSATION` is **misleadingly named**,
  it's actually built from the real `calculateResult?.compensateExpense` API response, not mock data
- `InsuredSearchModal.tsx`, `CategoryIcon.tsx`

## hooks/

`useClaimSimulatePage.ts` (orchestrator: `useClaimLineHeader` + `useDaysCalculate` +
`useClaimLineCalculate`; `handleNext` validates header → items → days in sequence),
`useClaimLineHeader.ts`, `useDaysCalculate.ts` (calls `useCalculateCaseClaim`),
`useClaimLineCalculate.ts`, `useInsuredSearchModal.ts`, `useGetDataFromApi.ts` (builds
continuous-claim dropdown labels in Buddhist-era date format).

## store/ — `claimSimulateSlice` (`state.claimsimulate`)

`selectedInsured, isInsuredSearchOpen, header: ClaimLineHeaderState, daysCalculate:
DaysCalculateState, filledItems, medicalTypeId, calculateResult`. Plus `Claimsimulateutils.ts`
(calc helpers) and `claimSimulateOptions.ts` (static dropdown constants) — neither is a slice.

## API hooks called

`coreClaimApi`: `useCalculateCaseClaim`, `useGetClaimContinue`, `useGetCustomerSearch`.
`coreClaimMastersApi`: `useGetSimB`, `useGetSimBCategory`, `useGetNonCoveredReason`,
`useGetIncidentType`, `useGetIncidentTypeMapping`, `useGetFormatType`. No docstorage/claimFund/OCR
(pure calculator, no documents/payment step).

## Gotchas

- This module **replaced** the old `CreatedClaim/pages/ClaimSimulate/*` pages — see
  [CreatedClaim.md](CreatedClaim.md) for the dead commented-out imports left behind in `Routes.tsx`.
- `ConfirmCalaulateModal.tsx` filename typo + `MOCK_COMPENSATION` variable name are both
  misleading — not actually mock/fake, sourced from live API. Worth a rename if you touch it.
- `ClaimSimulate.tsx` at ~2000 lines is a strong split candidate.

# CreatedClaim

`แจ้งเคลม` — claim intake/submission for PH (สุขภาพ/Health) and PA (อุบัติเหตุ/Personal
Accident) products, plus a `Monitor` worklist to find a customer/claim to start or continue.
**Real API.** Routes: `/monitor-claim`, `claim/ph/:appId/:refId/:isContinuous/:oldClaimId(/summary)`,
`claim/pa/:appId/:refId/:isContinuous/:oldClaimId(/summary)` — see [routes.md](../routes.md).

Dead code in `Routes.tsx` (lines 10–13, commented out): `ClaimLinePage`, `ClaimLineSummaryPage`,
`DaysCalculatePage`, `ClaimLineCalculatePage` under `CreatedClaim/pages/ClaimLine|ClaimSimulate/`
— **files no longer exist on disk**, superseded by the standalone `ClaimSimulate` module. Safe
to delete the commented imports if touching that area.

## pages/

- `CreateClaim/ClaimPH/ClaimPHPage.tsx` / `ClaimPHSummaryPage.tsx` — PH entry form / confirm
- `CreateClaim/ClaimPA/ClaimPAPage.tsx` / `ClaimPASummaryPage.tsx` — PA entry form / confirm
- `Monitor/MonitorPage.tsx` — worklist to create/continue a claim from

## components/ (selected — 30+ files total)

**Shared across the whole app, reused by other modules — check here before writing a duplicate:**
- `CreateClaim/DocumentScanTable.tsx` — reused by `ClaimConsider` (`ClaimDetailsTab`, `ConsiderSection`)
- `CreateClaim/ClaimTypeSelector.tsx` (+ `ClaimTypeOption` type) — component reused by `ClaimConsider`'s
  `RecordClaimData` (and transitively by `BillingClaim`); type reused more widely
- `CreateClaim/ChipSelector.tsx` (+ `ChipOption` type) — same reuse pattern as above

**PH/PA form internals:**
- `CreateClaim/OcrDocumentScanSection.tsx` (1228 lines) — OCR upload/scan for 5 doc types, wired to `docstorageApi` + `ocrApi`
- `CreateClaim/OrganLossSelector.tsx` (1290 lines) + `OrganLossIcons.tsx` — organ-loss/disability picker for PA death/dismemberment
- `CreateClaim/ClaimStickyHeader.tsx`, `CoverageBox.tsx`/`CoverageAndTransferBox.tsx`, `ClaimTransferConfig.tsx` (static lookup, not API), `ClaimTypeOptions.tsx` (static icon maps)
- `CreateClaim/AddBankAccountModal.tsx`, `AddContactModal.tsx`, `BankAccountCard.tsx`, `ContactCard.tsx`
- `CreateClaim/ClaimHistoryCard.tsx`, `ViewClaimHistoryModal.tsx`, `ViewClaimDetailModal.tsx`, `ConfirmExcessLimitTransferDialog.tsx`
- `CreateClaim/ClaimPH/*` — `ClaimFormSection.tsx` (734 lines, main form), `BeneficiarySectionPH.tsx`, `ClaimSummaryPHTable.tsx`, `ConfirmTransferPHModal.tsx`, `DeathClaimAmountCardPH.tsx`, `InsuredInfoCardPH.tsx`, `OldClaimSection.tsx`
- `CreateClaim/ClaimPA/*` — `ClaimPAFormSection.tsx` (872 lines), `AddInsuredModal.tsx` (592 lines), `BeneficiarySectionPA.tsx`, `ClaimHistoryPASection.tsx`, `ClaimSummaryPAInfo.tsx`, `ConfirmTransferPAModal.tsx`, `ContinuedDeathExtraCoverageSection.tsx`, `DeathClaimAmountCardPA.tsx`, `InsuredInfoSection.tsx`, `SchoolInfoSection.tsx`
- `Monitor/MonitorTable.tsx`, `MonitorCard.tsx`, `MonitorToolbar.tsx`, `ClaimHistoryTable.tsx`, `ClaimHistoryPH.tsx`, `ClaimHistoryPA.tsx`, `RemainCreditLimit.tsx`

## hooks/

- `ClaimPH/`: `useClaimPH.ts`, `useClaimPHForm.ts`, `useCreateClaimPH.ts`, `useCreateContinuedClaimPH.ts`, `useBeneficiaryPH.ts`
- `ClaimPA/`: `useClaimPA.ts`, `useClaimPAForm.ts`, `useCreateClaimPA.ts`, `useCreateContinuedClaimPA.ts`, `useBeneficiaryPA.ts`, `useConfirmClaimPayment.ts`
- `useOcrDocumentScan.ts` — builds `CaseDocumentV2Request[]` from OCR results
- `useOrganLoss.ts` / `organLoss.types.ts` — organ-loss options + calc
- `Monitor/`: `useMonitorTable.ts`, `useMonitorToolbarForm.ts`, `useMonitorClaimHistory.ts`, `useClaimHistory.ts`

## store/

- `claimPHSlice` (`state.claimph`) — `isContinuous, oldClaim, form, bankAccounts, contacts, insured, documentDetailById, isEnabled, organLossItems, beneficiaries, caseItems, documentScanList`
- `claimPASlice` (`state.claimpa`, name `claimPA`) — `isContinuous, oldClaim, insured, pendingInsured, school, form, claimItems, bankAccounts, contacts, editingItemId, beneficiaries, organLossItems, tmpCoreClaim`
- `monitorSlice` (`state.monitorcreatedclaim`, name `monitor-created-claim`) — `search, selectedPolicy, claimHistory, isSearchMonitor, selectedRowIndex`

## API hooks called

`coreClaimApi`: `useGetClaimHistory`, `useGetCustomerSearchByPolicyCode`, `useGetDocumentType`,
`useGetCustomerBenefitDetailHalf`, `useCreateCoreClaim`, `createContinuedClaim` (plain fn, not
`use*`-prefixed — rule-of-hooks lint won't catch misuse), `useCalculateCaseDisability`,
`useGetCaseByClaimId`, `useGetCustomerDetailById`, `useGetCustomerSearch`, `useGetPreviousClaim`.
`coreClaimMastersApi`: `useGetPaymentStatus`, `useGetDeductionSource`,
`useGetEmployeeClaimPaymentLimit`, `useGetBeneficiary`, `useGetIncidentType`,
`useGetIncidentTypeMapping`, `useGetDisabilityLossPart`, `useGetNonCoveredReason`,
`useGetBodyPartByDisabilityLossPart`. `docstorageApi`: `useGetDocumentById`,
`useCreateDocumentToDocStorage`. `claimFundApi`: `useCreatePayment`, `getEncryptText`. `ocrApi`:
multiple OCR-scan calls inside `OcrDocumentScanSection.tsx`.

## Gotchas

- `useCreateContinuedClaimPA.ts:2` — comment `// ปรับ path ตามจริง` next to the
  `createContinuedClaim` import (placeholder/unverified relative path).
- `claimPASlice.ts:112` — `FuneralExpense = 8 // TODO: เช็ค id จริงจาก backend` (unconfirmed enum id).
- `ClaimHistoryPASection.tsx:107,250` — TODOs: claim status / case-count fields don't exist in
  the API yet, static placeholders used.
- `OcrDocumentScanSection.tsx` (1228 lines) and `OrganLossSelector.tsx` (1290 lines) — largest
  files in the repo, candidates for splitting if you're touching either.

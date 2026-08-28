import { CaseItemSaveClaimEditDraftRequest } from "../../../../api/coreClaimApi.client";

type ExpenseItem = {
    caseItemId?: string;
    inputToStandardMappingId?: number;
    standardMedicalExpenseId?: number;
    quantity?: number;
    perUnit?: number;
    originalAmount?: number;
    discountAmount?: number;
    netCaseAmount?: number;
    medicalTypeId?: number;
    nonCoveredAmount?: number;
    nonCoveredReasonId?: number;
    nplAmount?: number | undefined;
};

type MapCaseItemParams = {
    item: ExpenseItem;
};

export const mapCaseItem = ({ item }: MapCaseItemParams): CaseItemSaveClaimEditDraftRequest => ({
    caseItemId: item.caseItemId,
    inputToStandardMappingId: item.inputToStandardMappingId,
    standardMedicalExpenseId: item.standardMedicalExpenseId,
    quantity: item.quantity,
    perUnit: item.perUnit,
    originalAmount: item.originalAmount,
    discountAmount: item.discountAmount,
    netCaseAmount: item.netCaseAmount,
    medicalTypeId: item.medicalTypeId,
    nonCoveredAmount: item.nonCoveredAmount,
    nonCoveredReasonId: item.nonCoveredReasonId,
    nplAmount: item.nplAmount,
});

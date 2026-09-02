import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import {
    CaseV2Request,
    ClaimV2Request,
    CreateCoreClaimDtoResponseServiceResponse,
    CreateCoreClaimV2DtoRequest,
    GetCustomerBenefitDetailHalfDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import {
    claimPASelector,
    LocalBeneficiary,
    LocalCaseDisability,
    LocalCaseEntry,
    LocalCaseItem,
    LocalClaimEntry,
    LocalCoreClaim,
} from "../../../store/claimPASlice";
import { BeneficiaryForm, ClaimBankAccount, ContactInfo } from "../../../store/claimPHSlice";
import { FingerKey, OrganLossItem } from "../organLoss.types";
import { CoverageType } from "../../../../../functionHelpers";
import { useConfirmClaimPayment } from "./useConfirmClaimPayment";

const generateRequestId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const mapBenefitToCaseItems = (
    benefits: GetCustomerBenefitDetailHalfDtoResponse[],
    amountByStandardMedicalExpenseId: Record<number, number>
): LocalCaseItem[] =>
    benefits.map((b) => {
        const amount = amountByStandardMedicalExpenseId[b.standardMedicalExpenseId ?? -1] ?? 0;
        return {
            inputToStandardMappingId: b.inputToStandardMappingId,
            standardMedicalExpenseId: b.standardMedicalExpenseId,
            quantity: 1,
            perUnit: b.pricePerUnit,
            originalAmount: amount,
            discountAmount: 0,
            netCaseAmount: amount,
            medicalTypeId: b.medicalTypeId,
            nonCoveredAmount: 0,
            nonCoveredReasonId: undefined,
        };
    });

export const buildUniformBenefitAmountMap = (
    benefits: GetCustomerBenefitDetailHalfDtoResponse[],
    amount: number
): Record<number, number> =>
    benefits.reduce<Record<number, number>>((acc, b) => {
        if (b.standardMedicalExpenseId != null) acc[b.standardMedicalExpenseId] = amount;
        return acc;
    }, {});

export const mapOrganLossToDisabilityRequests = (organLossItems: OrganLossItem[]): LocalCaseDisability[] => {
    const requests: LocalCaseDisability[] = [];
    for (const organ of organLossItems) {
        if (organ.fingers) {
            const sides: ("left" | "right")[] = ["left", "right"];
            for (const side of sides) {
                for (const fingerKey of Object.keys(organ.fingers[side]) as FingerKey[]) {
                    const finger = organ.fingers[side][fingerKey];
                    if (!finger.selected || !finger.bodyPartId) continue;
                    requests.push({
                        bodyPartId: finger.bodyPartId,
                        disabilityTypeId: undefined,
                        disabilityLevel: undefined,
                        disabilityPercent: undefined,
                    });
                }
            }
        } else if (organ.bodyPartId) {
            requests.push({
                bodyPartId: organ.bodyPartId,
                disabilityTypeId: organ.bodyPartId === 67 ? 3 : organ.bodyPartId === 68 ? 2 : undefined,
                disabilityLevel: undefined,
                disabilityPercent: undefined,
            });
        }
    }
    return requests;
};

export const mapBeneficiariesToRequest = (
    beneficiaries: BeneficiaryForm[],
    tempClaimId?: string,
    tempCaseId?: string
): LocalBeneficiary[] =>
    beneficiaries.map((b) => ({
        tempClaimId,
        tempCaseId,
        policyBeneficiaryId: undefined,
        titleId: b.titleId?.toString(),
        firstName: b.firstName ?? "",
        lastName: b.lastName ?? "",
        idCard: b.citizenId,
        phoneNo: b.phoneNumber,
        relationId: b.relationTypeId,
        bankAccountRelationTypeId: undefined,
        bankId: b.bankId,
        bankAccountNo: b.bankAccountNo,
        bankAccountName: b.bankAccountName,
        payoutAmount: b.amount,
    }));

export const mapBankAccountToBeneficiary = (
    selectedAccount: ClaimBankAccount | undefined,
    selectedContact: ContactInfo | undefined,
    caseAmount: number,
    tempClaimId?: string,
    tempCaseId?: string
): LocalBeneficiary[] =>
    selectedAccount
        ? [
              {
                  tempClaimId,
                  tempCaseId,
                  policyBeneficiaryId: undefined,
                  firstName: "",
                  lastName: "",
                  phoneNo: selectedContact?.contactPhoneNo,
                  bankAccountRelationTypeId: selectedAccount.bankAccountRelationTypeId,
                  bankId: selectedAccount.bankId,
                  bankAccountNo: selectedAccount.bankAccountNo,
                  bankAccountName: selectedAccount.bankAccountName,
                  payoutAmount: caseAmount,
              },
          ]
        : [];

export const mapCaseEntryToV2 = (caseEntry: LocalCaseEntry): CaseV2Request => {
    const {
        tempCaseId,
        tempClaimId,
        payableCategoryId,
        createCaseItem,
        createCaseRegistration,
        createCaseAssessment,
        createCaseDeath,
        createCaseDisability,
        createCaseDocument,
        createCaseContact,
        createCaseServicePerson,
        createBeneficiary,
        ...rest
    } = caseEntry;

    return {
        ...rest,
        items: createCaseItem.map(({ tempCaseId: _t1, tempCaseItemId: _t2, ...item }) => item),
        registrations: createCaseRegistration.map(({ tempCaseId: _t, ...r }) => r),
        assessments: createCaseAssessment.map(({ tempCaseId: _t, ...a }) => a),
        deaths: createCaseDeath.map(({ tempCaseId: _t, ...d }) => d),
        disabilities: createCaseDisability.map(({ tempCaseId: _t, ...d }) => d),
        documents: createCaseDocument.map(({ tempCaseId: _t, tempCaseDocumentId: _t2, ...doc }) => doc),
        ...(createCaseContact ? { contacts: createCaseContact.map(({ tempCaseId: _t, ...c }) => c) } : {}),
        servicePersons: createCaseServicePerson.map(({ tempCaseId: _t, ...s }) => s),
        beneficiaries: createBeneficiary.map(({ tempClaimId: _t1, tempCaseId: _t2, ...b }) => ({
            ...b,
            firstName: b.firstName ?? "",
            lastName: b.lastName ?? "",
            payables: payableCategoryId != null ? [{ payableCategoryId }] : [],
        })),
    };
};

const mapClaimEntryToV2 = (claimEntry: LocalClaimEntry): ClaimV2Request => {
    const { tempClaimId, createCase, ...rest } = claimEntry;
    return {
        ...rest,
        cases: (createCase ?? []).map(mapCaseEntryToV2),
    };
};

export const mapLocalCoreClaimToV2Request = (
    local: LocalCoreClaim,
    requestId: string
): CreateCoreClaimV2DtoRequest => ({
    requestId,
    claimSourceId: local.claimSourceId,
    productTypeId: local.productTypeId,
    createdByUserCode: local.createdByUserCode,
    createdByUserName: local.createdByUserName,
    claims: (local.createClaim ?? []).map(mapClaimEntryToV2),
});

export const useCreateClaimPA = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { bankAccounts, contacts, tmpCoreClaim } = useAppSelector(claimPASelector);
    const selectedContact = contacts.find((c) => c.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const { confirmPayment: confirmPaymentShared } = useConfirmClaimPayment(onError);

    const buildLocalCoreClaim = (beneficiaryList: BeneficiaryForm[]): LocalCoreClaim => ({
        ...tmpCoreClaim,
        createClaim: (tmpCoreClaim.createClaim ?? []).map((claim) => ({
            ...claim,
            createCase: (claim.createCase ?? []).map((c) => ({
                ...c,
                createCaseContact:
                    c.coverageTypeId === CoverageType.Death || c.coverageTypeId === CoverageType.Disability
                        ? undefined
                        : [
                              {
                                  tempCaseId: c.tempCaseId,
                                  contactPersonTypeId: selectedContact?.contactPersonTypeId,
                                  contactPersonName: selectedContact?.contactName,
                                  contactPhoneNo: selectedContact?.contactPhoneNo,
                              },
                          ],
                createBeneficiary:
                    beneficiaryList.length > 0
                        ? mapBeneficiariesToRequest(beneficiaryList, claim.tempClaimId, c.tempCaseId)
                        : mapBankAccountToBeneficiary(
                              selectedAccount,
                              selectedContact,
                              c.caseAmount ?? 0,
                              claim.tempClaimId,
                              c.tempCaseId
                          ),
            })),
        })),
    });

    const buildPayload = (beneficiaryList: BeneficiaryForm[]): CreateCoreClaimV2DtoRequest =>
        mapLocalCoreClaimToV2Request(buildLocalCoreClaim(beneficiaryList), generateRequestId());

    // ── ขั้นที่ 1: บันทึกเคลม ──
    const createClaimPA = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const beneficiaryList = overrideBeneficiaries ?? [];
        const payload = buildPayload(beneficiaryList);
        const claimResponse = await mutation.mutateAsync(payload as any);
        if (!claimResponse?.data?.isResult) {
            onError?.(claimResponse?.data?.msg || "สร้างเคลมไม่สำเร็จ");
        }
        return { claimResponse, beneficiaryList };
    };

    const confirmPayment = async (
        claimResponse: CreateCoreClaimDtoResponseServiceResponse,
        beneficiaryList: BeneficiaryForm[]
    ) => {
        const responseList = claimResponse?.data?.responseList ?? [];
        const paymentResponses = await confirmPaymentShared(responseList, beneficiaryList, onSuccess);
        return { ...claimResponse, paymentResponses };
    };

    return {
        createClaimPA,
        confirmPayment,
        isLoading: mutation.isLoading,
    };
};

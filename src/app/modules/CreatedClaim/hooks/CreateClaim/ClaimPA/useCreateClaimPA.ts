import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import {
    BeneficiaryCreateRequest,
    CaseDisabilityCreateRequest,
    CaseItemCreateRequest,
    CreateCoreClaimDtoResponseServiceResponse,
    GetCustomerBenefitDetailHalfDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import { claimPASelector } from "../../../store/claimPASlice";
import { BeneficiaryForm, ClaimBankAccount, ContactInfo } from "../../../store/claimPHSlice";
import { FingerKey, OrganLossItem } from "../organLoss.types";
import { getEncryptText, useCreatePayment } from "../../../../../api/claimFundApi";

const TEMP_ID_KEYS = new Set([
    "tempClaimId",
    "tempCaseId",
    "tempCaseItemId",
    "tempCaseRegistrationId",
    "tempCaseDocumentId",
]);

const sanitizePayload = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map(sanitizePayload) as unknown as T;
    }
    if (value !== null && typeof value === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            result[key] = TEMP_ID_KEYS.has(key) ? undefined : sanitizePayload(val);
        }
        return result as T;
    }
    return value;
};

export const mapBenefitToCaseItems = (
    benefits: GetCustomerBenefitDetailHalfDtoResponse[],
    caseAmount: number
): CaseItemCreateRequest[] =>
    benefits.map((b) => ({
        tempCaseItemId: undefined,
        tempCaseId: undefined,
        inputToStandardMappingId: b.inputToStandardMappingId,
        standardMedicalExpenseId: b.standardMedicalExpenseId,
        quantity: 1,
        perUnit: b.pricePerUnit,
        originalAmount: caseAmount,
        discountAmount: 0,
        netCaseAmount: caseAmount,
        medicalTypeId: b.medicalTypeId,
        nonCoveredAmount: 0,
        nonCoveredReasonId: undefined,
    }));

export const mapOrganLossToDisabilityRequests = (organLossItems: OrganLossItem[]): CaseDisabilityCreateRequest[] => {
    const requests: CaseDisabilityCreateRequest[] = [];
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
): BeneficiaryCreateRequest[] =>
    beneficiaries.map((b) => ({
        tempClaimId,
        tempCaseId,
        policyBeneficiaryId: undefined,
        titleId: b.titleId?.toString(),
        firstName: b.firstName,
        lastName: b.lastName,
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
): BeneficiaryCreateRequest[] =>
    selectedAccount
        ? [
              {
                  tempClaimId,
                  tempCaseId,
                  policyBeneficiaryId: undefined,
                  phoneNo: selectedContact?.contactPhoneNo,
                  bankAccountRelationTypeId: selectedAccount.bankAccountRelationTypeId,
                  bankId: selectedAccount.bankId,
                  bankAccountNo: selectedAccount.bankAccountNo,
                  bankAccountName: selectedAccount.bankAccountName,
                  payoutAmount: caseAmount,
              },
          ]
        : [];

export const useCreateClaimPA = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { bankAccounts, contacts, tmpCoreClaim } = useAppSelector(claimPASelector);
    const selectedContact = contacts.find((c) => c.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const { mutateAsync: createPaymentAsync } = useCreatePayment(
        () => {},
        (message) => onError?.(message)
    );

    const buildPayload = (beneficiaryList: BeneficiaryForm[]) => ({
        ...tmpCoreClaim,
        createClaim: (tmpCoreClaim.createClaim ?? []).map((claim) => ({
            ...claim,
            createCase: (claim.createCase ?? []).map((c) => ({
                ...c,
                createCaseContact: [
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

    const buildPaymentPayload = async (claimResponse: CreateCoreClaimDtoResponseServiceResponse): Promise<any[]> => {
        const responseList = claimResponse?.data?.responseList ?? [];
        const allBeneficiaries = (tmpCoreClaim.createClaim ?? []).flatMap((claim) =>
            (claim.createCase ?? []).flatMap((c) => c.createBeneficiary ?? [])
        );

        const payloads = await Promise.all(
            allBeneficiaries.map(async (beneficiary, index) => {
                const item = responseList[index];
                const encryptResult = await getEncryptText(
                    beneficiary.bankAccountNo ?? "",
                    beneficiary.phoneNo?.replace(/-/g, "").trim() ?? "",
                    beneficiary.bankAccountName ?? ""
                );

                const matchedBank = bankAccounts.find((b) => b.bankId === beneficiary.bankId);

                return {
                    casePayableId: item?.casePayableId,
                    grossPaidAmount: 0,
                    withHoldingTaxAmount: 0,
                    netPaidAmount: beneficiary.payoutAmount ?? 0,
                    receivingBankId: beneficiary.bankId,
                    receivingBankAccountNo: encryptResult.accountNoResult,
                    receivingBankName: matchedBank?.bankName,
                    receivingAccountName: encryptResult.bankAccountNameResult,
                    phoneNumber: encryptResult.phoneNumberResult,
                    claimCase: item?.caseNo,
                    claimNo: item?.claimNo,
                };
            })
        );
        return payloads;
    };

    // ── ขั้นที่ 1: บันทึกเคลม ──
    const createClaimPA = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const payload = sanitizePayload(buildPayload(overrideBeneficiaries ?? []));
        const claimResponse = await mutation.mutateAsync(payload as any);
        if (!claimResponse?.data?.isResult) {
            onError?.(claimResponse?.data?.msg || "สร้างเคลมไม่สำเร็จ");
        }
        return claimResponse;
    };

    // ── ขั้นที่ 2: โอนเงิน
    const confirmPayment = async (claimResponse: CreateCoreClaimDtoResponseServiceResponse) => {
        try {
            const paymentPayloadList = await buildPaymentPayload(claimResponse);
            const paymentResponses = paymentPayloadList.length > 0 ? await createPaymentAsync(paymentPayloadList) : [];
            onSuccess?.();
            return { ...claimResponse, paymentResponses };
        } catch (err: any) {
            onError?.(err?.message || "สร้างเคลมสำเร็จ แต่โอนเงินไม่สำเร็จ");
            return claimResponse;
        }
    };

    return {
        createClaimPA,
        confirmPayment,
        isLoading: mutation.isLoading,
    };
};

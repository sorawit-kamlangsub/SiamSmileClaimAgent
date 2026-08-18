import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import {
    BeneficiaryV2Request,
    CaseAssessmentV2Request,
    CaseContactV2Request,
    CaseDeathV2Request,
    CaseDisabilityV2Request,
    CaseDocumentDetailV2Request,
    CaseItemV2Request,
    CasePayableV2Request,
    CaseRegistrationV2Request,
    CaseServicePersonV2Request,
    CaseV2Request,
    ClaimV2Request,
    CreateCoreClaimDtoResponseServiceResponse,
    CreateCoreClaimV2DtoRequest,
    GetCustomerBenefitDetailHalfDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import { claimPASelector } from "../../../store/claimPASlice";
import { BeneficiaryForm, ClaimBankAccount, ContactInfo } from "../../../store/claimPHSlice";
import { FingerKey, OrganLossItem } from "../organLoss.types";
import { getEncryptText, useCreatePayment } from "../../../../../api/claimFundApi";

/**
 * ── Local (internal) types ──
 * API V2 (CreateCoreClaimV2DtoRequest) ตัด temp id ทุกตัวออกหมดแล้ว เพราะโครงสร้างเป็น
 * nested claims → cases → items/registrations/... อยู่แล้ว ไม่ต้องมี id ผูกคู่กันเหมือนโครงสร้างเดิม
 * ที่เป็น flat array + tempClaimId/tempCaseId
 *
 * แต่ฝั่ง Redux (multi-insured stacking, editingItemId, AddInsuredModal ฯลฯ) ยังต้องใช้ temp id
 * ผูกคู่ claim/case กันอยู่ภายใน จึงคง temp id ไว้เป็น "Local*" type สำหรับ state ภายใน
 * แล้วค่อย strip ทิ้ง + rename field ตอนแปลงเป็น payload จริงใน mapLocalCoreClaimToV2Request
 */
export type LocalCaseItem = CaseItemV2Request & { tempCaseId?: string; tempCaseItemId?: string };
export type LocalCaseRegistration = CaseRegistrationV2Request & { tempCaseId?: string };
export type LocalCaseAssessment = CaseAssessmentV2Request & { tempCaseId?: string };
export type LocalCaseDeath = CaseDeathV2Request & { tempCaseId?: string };
export type LocalCaseDisability = CaseDisabilityV2Request & { tempCaseId?: string };
// NOTE: documentSubTypeId ยังคงชื่อเดิม, caseDocumentDetail เก็บ any[] ไว้ก่อน (ดู mapCaseEntryToV2)
// ต้องเทียบ shape จริงของ ocr.ocrDocumentPayload() กับ CaseDocumentDetailV2Request ก่อนขึ้นโปรดักชัน
export type LocalCaseDocument = {
    tempCaseId?: string;
    tempCaseDocumentId?: string;
    documentSubTypeId?: number;
    caseDocumentDetail?: any[];
};
export type LocalCaseContact = CaseContactV2Request & { tempCaseId?: string };
export type LocalCaseServicePerson = CaseServicePersonV2Request & { tempCaseId?: string };
export type LocalBeneficiary = Omit<BeneficiaryV2Request, "payables"> & { tempClaimId?: string; tempCaseId?: string };

export type LocalCaseEntry = Omit<
    CaseV2Request,
    | "items"
    | "registrations"
    | "assessments"
    | "deaths"
    | "disabilities"
    | "documents"
    | "contacts"
    | "servicePersons"
    | "beneficiaries"
> & {
    tempCaseId: string;
    tempClaimId: string;
    // แทนที่ createCasePayable เดิม เพราะ V2 ย้าย payable ไปแนบใต้ beneficiary.payables แล้ว
    // (ไม่มีที่เก็บ payableCategoryId ระดับ case ตรง ๆ อีกต่อไป)
    payableCategoryId?: number;
    createCaseItem: LocalCaseItem[];
    createCaseRegistration: LocalCaseRegistration[];
    createCaseAssessment: LocalCaseAssessment[];
    createCaseDeath: LocalCaseDeath[];
    createCaseDisability: LocalCaseDisability[];
    createCaseDocument: LocalCaseDocument[];
    createCaseContact: LocalCaseContact[];
    createCaseServicePerson: LocalCaseServicePerson[];
    createBeneficiary: LocalBeneficiary[];
};

export type LocalClaimEntry = Omit<ClaimV2Request, "cases"> & {
    tempClaimId: string;
    createCase?: LocalCaseEntry[];
};

export type LocalCoreClaim = Omit<CreateCoreClaimV2DtoRequest, "claims" | "requestId"> & {
    createClaim?: LocalClaimEntry[];
};

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
        // BeneficiaryV2Request.firstName/lastName เป็น required แล้ว (เดิม optional) จึง fallback เป็น "" กันพัง
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

// ── แปลง Local (มี temp id) → CaseV2Request จริงที่จะส่ง API ──
const mapCaseEntryToV2 = (caseEntry: LocalCaseEntry): CaseV2Request => {
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

    const payables: CasePayableV2Request[] = payableCategoryId != null ? [{ payableCategoryId }] : [];

    return {
        ...rest,
        items: createCaseItem.map(({ tempCaseId: _t1, tempCaseItemId: _t2, ...item }) => item),
        registrations: createCaseRegistration.map(({ tempCaseId: _t, ...r }) => r),
        assessments: createCaseAssessment.map(({ tempCaseId: _t, ...a }) => a),
        deaths: createCaseDeath.map(({ tempCaseId: _t, ...d }) => d),
        disabilities: createCaseDisability.map(({ tempCaseId: _t, ...d }) => d),
        // TODO: ตรวจ shape จริงของ ocr.ocrDocumentPayload() ให้ตรงกับ CaseDocumentDetailV2Request ก่อนใช้งานจริง
        documents: createCaseDocument.map(({ documentSubTypeId, caseDocumentDetail }) => ({
            documentSubTypeId,
            details: (caseDocumentDetail ?? []) as unknown as CaseDocumentDetailV2Request[],
        })),
        contacts: createCaseContact.map(({ tempCaseId: _t, ...c }) => c),
        servicePersons: createCaseServicePerson.map(({ tempCaseId: _t, ...s }) => s),
        beneficiaries: createBeneficiary.map(({ tempClaimId: _t1, tempCaseId: _t2, ...b }) => ({
            ...b,
            firstName: b.firstName ?? "",
            lastName: b.lastName ?? "",
            payables,
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
    // createdByUserId ของเดิม (userProfile?.userId) ไม่มี field รองรับใน V2 แล้ว — ถ้า BE ยังต้องใช้ค่านี้
    // ต้องเช็คกับทีม BE ว่าย้ายไปอยู่ field ไหน (ตอนนี้ตัดทิ้งไปตามสเปกใหม่)
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

    const { mutateAsync: createPaymentAsync } = useCreatePayment(
        () => {},
        (message) => onError?.(message)
    );

    const buildLocalCoreClaim = (beneficiaryList: BeneficiaryForm[]): LocalCoreClaim => ({
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

    const buildPaymentPayload = async (
        claimResponse: CreateCoreClaimDtoResponseServiceResponse,
        beneficiaryList: BeneficiaryForm[]
    ): Promise<any[]> => {
        const responseList = claimResponse?.data?.responseList ?? [];

        const allBeneficiaries = (tmpCoreClaim.createClaim ?? []).flatMap((claim: LocalClaimEntry) => {
            const c = claim.createCase?.[0];

            return beneficiaryList.length > 0
                ? mapBeneficiariesToRequest(beneficiaryList, claim.tempClaimId, c?.tempCaseId).map((beneficiary) => ({
                      beneficiary,
                      payeeTypeId: 4, // Beneficiary
                  }))
                : mapBankAccountToBeneficiary(
                      selectedAccount,
                      selectedContact,
                      c?.caseAmount ?? 0,
                      claim.tempClaimId,
                      c?.tempCaseId
                  ).map((beneficiary) => ({
                      beneficiary,
                      payeeTypeId: 2, // Customer
                  }));
        });

        const payloads = await Promise.all(
            allBeneficiaries.map(async ({ beneficiary, payeeTypeId }, index) => {
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

                    payeeTypeId,

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

    // ── ขั้นที่ 2: โอนเงิน ──
    const confirmPayment = async (
        claimResponse: CreateCoreClaimDtoResponseServiceResponse,
        beneficiaryList: BeneficiaryForm[]
    ) => {
        try {
            const paymentPayloadList = await buildPaymentPayload(claimResponse, beneficiaryList);
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

import dayjs from "dayjs";
import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import {
    CaseDisabilityCreateRequest,
    CreateCoreClaimDtoRequest,
    CreateCoreClaimDtoResponseServiceResponse,
} from "../../../../../api/coreClaimApi.client";
import { useAuth } from "../../../../_auth";
import { BeneficiaryForm, claimPHSelector } from "./../../../store/claimPHSlice";
import { CoverageType } from "../../../../../functionHelpers";
import { FingerKey, OrganLossItem } from "../organLoss.types";
import { getEncryptText, useCreatePayment } from "../../../../../api/claimFundApi";
export const useCreateClaimPH = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { userProfile } = useAuth();
    const { form, bankAccounts, contacts, insured, organLossItems, caseItems, documentScanList } =
        useAppSelector(claimPHSelector);
    const isMedicalAll =
        form.coverageTypeId === CoverageType.Medical || form.coverageTypeId === CoverageType.Compensate;
    const isMedical = form.coverageTypeId === CoverageType.Medical;
    const isCompensate = form.coverageTypeId === CoverageType.Compensate;
    const isDisability = form.coverageTypeId === CoverageType.Disability;
    const isDeath = form.coverageTypeId === CoverageType.Death;
    const selectedContact = contacts.find((contact) => contact.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((account) => account.isDefault) ?? bankAccounts[0];
    const mapOrganLossToDisabilityRequests = (organLossItems: OrganLossItem[]): CaseDisabilityCreateRequest[] => {
        const requests: CaseDisabilityCreateRequest[] = [];

        for (const organ of organLossItems) {
            if (organ.fingers) {
                // ── กลุ่มนิ้ว: flatten ทุกนิ้วที่ selected เป็น record แยก ──
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
                    disabilityTypeId: organ.bodyPartId === 67 ? 3 : organ.bodyPartId === 68 ? 2 : undefined, // 2=ถาวร 3=ชั่วคราว
                    disabilityLevel: undefined,
                    disabilityPercent: undefined,
                });
            }
        }

        return requests;
    };
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const { mutateAsync: createPaymentAsync } = useCreatePayment(
        () => {},
        (message) => onError?.(message)
    );
    const buildPayload = (beneficiaryList: BeneficiaryForm[]): CreateCoreClaimDtoRequest => {
        return {
            claimSourceId: 2, // ClaimAgent
            productTypeId: 6,
            createdByUserId: userProfile?.userId,
            createdByUserCode: userProfile?.employeeCode,
            createdByUserName: userProfile?.fullName,

            createClaim: [
                {
                    tempClaimId: undefined,
                    applicationId: insured?.policyCode,
                    policyNo: insured?.policyNo ?? undefined,
                    certificateNo: insured?.certificateNo ?? undefined,

                    customerId: insured?.customerId,
                    customerName: insured?.customerName,

                    incidentTypeId: form.incidentTypeId,
                    incidentDate: form.incidentDate,

                    accidentPlace: form.accidentPlace,
                    accidentDescription: undefined,

                    createCase: [
                        {
                            coverageTypeId: form.coverageTypeId,
                            occurrenceDate: form.incidentDate,
                            admissionDate: form.admissionDate,
                            dischargeDate: form.dischargeDate,

                            caseAmount: form.transferAmount,
                            latestApprovedAmount: 0,
                            latestNonCoveredAmount: 0,
                            latestPatientPayAmount: 0,

                            isCaseDisability: isDisability,
                            hospitalId: form.hospitalId,

                            hn: undefined,
                            an: undefined,
                            vn: undefined,

                            chiefComplaintId: form.chiefComplaintId,
                            chiefComplaintCustom: form.remark,

                            productId: insured?.productId ?? undefined,
                            icD10_1stId: form.diagnoses[0]?.icd10Id,
                            icD10_2ndId: form.diagnoses[1]?.icd10Id,
                            icD10_3rdId: form.diagnoses[2]?.icd10Id,

                            medicalTypeId: form.medicalTypeId,

                            createCaseItem: caseItems,

                            createCaseRegistration: [
                                {
                                    notificationDate: form.notificationDate,
                                    notifyBy: userProfile?.fullName,
                                    initialCoverageTypeId: form.coverageTypeId,
                                    initialCaseAmount: form.transferAmount,
                                    initialCaseSourceId: 2, // Reimbursement
                                    preAuthId: undefined,
                                    initialMedicalTypeId: form.medicalTypeId,
                                },
                            ],

                            createCaseAssessment: [
                                {
                                    isDocumentComplete: isDeath || isDisability ? true : false,
                                    documentReceivedDate: dayjs(),
                                    documentCompleteDate: form.documentCompleteDate,
                                    isFraudSuspect: false,
                                    documentReceivedByUserId: form.documentRecipientTypeId,
                                    documentReceivedByUserCode: undefined,
                                    documentReceivedByUserName: form.documentRecipientTypeName,
                                },
                            ],

                            createCaseDeath: isDeath
                                ? [
                                      {
                                          causeOfIncidentId: form.causeOfIncidentId,
                                          deathDate: form.deathDate,
                                      },
                                  ]
                                : [],

                            createCaseDisability: isDisability ? mapOrganLossToDisabilityRequests(organLossItems) : [],
                            createCaseDocument: [
                                {
                                    documentSubTypeId: 220,
                                    caseDocumentDetail: isMedicalAll
                                        ? form.ocrDocument
                                        : documentScanList.map((d) => ({
                                              documentId: d.documentId,
                                              documentNo: d.documentCode,
                                              receiptAdmissionDate: dayjs(), //mock
                                              receiptAmount: 0, //mock
                                          })),
                                },
                            ],

                            createCaseContact: [
                                {
                                    contactPersonTypeId: selectedContact?.contactPersonTypeId,
                                    contactPersonName: selectedContact?.contactName,
                                    contactPhoneNo: selectedContact?.contactPhoneNo,
                                },
                            ],

                            createCaseServicePerson: [
                                {
                                    servicePersonByUserId: form.serviceProviderId,
                                    servicePersonByUserCode: form.serviceProviderCode,
                                    servicePersonByUserName: form.serviceProviderName,
                                    zebraId: form.zebraId,
                                    zebraCode: form.zebraCode ?? undefined,
                                    zebraNo: form.zebraNo ?? undefined,
                                    employeeCode: form.employeeCode ?? undefined,
                                    employeeName: form.employeeName ?? undefined,
                                },
                            ],

                            createBeneficiary:
                                beneficiaryList.length > 0
                                    ? beneficiaryList.map((beneficiary) => ({
                                          policyBeneficiaryId: undefined,
                                          titleId: beneficiary.titleId?.toString(),
                                          firstName: beneficiary.firstName,
                                          lastName: beneficiary.lastName,
                                          idCard: beneficiary.citizenId,
                                          phoneNo: beneficiary.phoneNumber,
                                          relationId: beneficiary.relationTypeId,
                                          bankAccountRelationTypeId: undefined,
                                          bankId: beneficiary.bankId,
                                          bankAccountNo: beneficiary.bankAccountNo,
                                          bankAccountName: beneficiary.bankAccountName,
                                          payoutAmount: beneficiary.amount,
                                      }))
                                    : selectedAccount
                                    ? [
                                          {
                                              policyBeneficiaryId: undefined,
                                              titleId: undefined,
                                              firstName: undefined,
                                              lastName: undefined,
                                              idCard: undefined,
                                              phoneNo: selectedContact?.contactPhoneNo,
                                              relationId: undefined,
                                              bankAccountRelationTypeId: selectedAccount.bankAccountRelationTypeId,
                                              bankId: selectedAccount.bankId,
                                              bankAccountNo: selectedAccount.bankAccountNo,
                                              bankAccountName: selectedAccount.bankAccountName,
                                              payoutAmount: form.transferAmount,
                                          },
                                      ]
                                    : [],

                            createCasePayable: [
                                {
                                    payableCategoryId: isMedical ? 2 : isCompensate ? 3 : isDisability ? 5 : 6,
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    };
    const buildPaymentPayload = async (
        claimResponse: CreateCoreClaimDtoResponseServiceResponse,
        beneficiaryList: BeneficiaryForm[]
    ): Promise<any[]> => {
        const responseList = claimResponse?.data?.responseList ?? [];

        if (beneficiaryList.length > 0) {
            const payloads = await Promise.all(
                beneficiaryList.map(async (beneficiary, index) => {
                    const item = responseList[index];
                    const encryptResult = await getEncryptText(
                        beneficiary.bankAccountNo ?? "",
                        beneficiary.phoneNumber?.replace(/-/g, "").trim() ?? "",
                        beneficiary.bankAccountName ?? ""
                    );

                    return {
                        casePayableId: item?.casePayableId,
                        grossPaidAmount: 0,
                        withHoldingTaxAmount: 0,
                        netPaidAmount: beneficiary.amount ?? 0,
                        receivingBankId: beneficiary.bankId,
                        receivingBankAccountNo: encryptResult.accountNoResult,
                        receivingBankName: beneficiary.bankId_selectedText,
                        receivingAccountName: encryptResult.bankAccountNameResult,
                        phoneNumber: encryptResult.phoneNumberResult,
                        claimCase: item?.caseNo,
                        claimNo: item?.claimNo,
                    };
                })
            );
            return payloads;
        }

        const firstItem = responseList[0];

        if (selectedAccount) {
            const encryptResult = await getEncryptText(
                selectedAccount.bankAccountNo ?? "",
                selectedContact?.contactPhoneNo?.replace(/-/g, "").trim() ?? "",
                selectedAccount.bankAccountName ?? ""
            );

            return [
                {
                    casePayableId: firstItem?.casePayableId,
                    grossPaidAmount: 0,
                    withHoldingTaxAmount: 0,
                    netPaidAmount: form.transferAmount ?? 0,
                    receivingBankId: selectedAccount.bankId,
                    receivingBankAccountNo: encryptResult.accountNoResult,
                    receivingBankName: selectedAccount.bankName,
                    receivingAccountName: encryptResult.bankAccountNameResult,
                    phoneNumber: encryptResult.phoneNumberResult,
                    claimCase: firstItem?.caseNo,
                    claimNo: firstItem?.claimNo,
                },
            ];
        }

        return [];
    };
    const createClaimPH = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const list = overrideBeneficiaries ?? [];
        const payload = buildPayload(list);
        const claimResponse = await mutation.mutateAsync(payload);
        if (!claimResponse?.data?.isResult) {
            onError?.(claimResponse?.data?.msg || "สร้างเคลมไม่สำเร็จ");
        }
        return { claimResponse, beneficiaryList: list };
    };

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
        createClaimPH,
        confirmPayment,
        isLoading: mutation.isLoading,
    };
};

import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../../../../redux";
import { createContinuedClaim } from "../../../../../api/coreClaimApi";
import { CaseDisabilityV2Request, CreateContinuedClaimDtoRequest } from "../../../../../api/coreClaimApi.client";
import { useAuth } from "../../../../_auth";
import { BeneficiaryForm, claimPHSelector } from "../../../store/claimPHSlice";
import { CoverageType, MedicalType } from "../../../../../functionHelpers";
import { FingerKey, OrganLossItem } from "../organLoss.types";
import { getEncryptText, useCreatePayment } from "../../../../../api/claimFundApi";

const generateRequestId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useCreateContinuedClaimPH = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { oldClaimId: oldClaimIdParam } = useParams();
    const oldClaimId = oldClaimIdParam ? atob(oldClaimIdParam) : "";

    const { userProfile } = useAuth();
    const { form, bankAccounts, contacts, organLossItems, caseItems, documentScanList } =
        useAppSelector(claimPHSelector);

    const isMedicalAll =
        form.coverageTypeId === CoverageType.Medical || form.coverageTypeId === CoverageType.Compensate;
    const isMedical = form.coverageTypeId === CoverageType.Medical;
    const isIPD = form.medicalTypeId === MedicalType.IPD || form.medicalTypeId === MedicalType.DayCaseSurgery;
    const isCompensate = form.coverageTypeId === CoverageType.Compensate;
    const isDisability = form.coverageTypeId === CoverageType.Disability;
    const isDeath = form.coverageTypeId === CoverageType.Death;
    const selectedContact = contacts.find((contact) => contact.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((account) => account.isDefault) ?? bankAccounts[0];

    const mapOrganLossToDisabilityRequests = (organLossItems: OrganLossItem[]): CaseDisabilityV2Request[] => {
        const requests: CaseDisabilityV2Request[] = [];

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
                            causeOfIncidentId: form.causeOfIncidentId,
                        });
                    }
                }
            } else if (organ.bodyPartId) {
                requests.push({
                    bodyPartId: organ.bodyPartId,
                    disabilityTypeId: organ.bodyPartId === 67 ? 3 : organ.bodyPartId === 68 ? 2 : undefined, // 2=ถาวร 3=ชั่วคราว
                    disabilityLevel: undefined,
                    disabilityPercent: undefined,
                    causeOfIncidentId: form.causeOfIncidentId,
                });
            }
        }

        return requests;
    };

    const mutation = createContinuedClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const { mutateAsync: createPaymentAsync } = useCreatePayment(
        () => {},
        (message) => onError?.(message)
    );

    const buildPayload = (beneficiaryList: BeneficiaryForm[]): CreateContinuedClaimDtoRequest => {
        const payableCategoryId = isMedical ? 2 : isCompensate ? 3 : isDisability ? 5 : 6;

        return {
            requestId: generateRequestId(),
            claimId: oldClaimId,
            createdByUserCode: userProfile?.employeeCode,
            createdByUserName: userProfile?.fullName,

            cases: [
                {
                    coverageTypeId: form.coverageTypeId,
                    occurrenceDate: form.incidentDate,
                    admissionDate: isMedicalAll ? form.admissionDate : undefined,
                    dischargeDate: isIPD ? form.dischargeDate : undefined,

                    caseAmount: form.transferAmount,
                    nplAmount: form.nplAmount,

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

                    icD10_1stId: form.diagnoses[0]?.icd10Id,
                    icD10_2ndId: form.diagnoses[1]?.icd10Id,
                    icD10_3rdId: form.diagnoses[2]?.icd10Id,

                    medicalTypeId: form.medicalTypeId,

                    items: caseItems,

                    registrations: [
                        {
                            notificationDate: isDeath || isDisability ? form.notificationDate : dayjs(),
                            notifyBy: userProfile?.fullName,
                            initialCoverageTypeId: form.coverageTypeId,
                            initialCaseAmount: form.transferAmount,
                            initialCaseSourceId: 2,
                            preAuthId: undefined,
                            initialMedicalTypeId: form.medicalTypeId,
                        },
                    ],

                    assessments: [
                        {
                            isDocumentComplete: isDeath || isDisability ? true : false,
                            documentReceivedDate: dayjs(),
                            documentCompleteDate: isDeath || isDisability ? form.documentCompleteDate : undefined,
                            isFraudSuspect: false,
                            documentReceivedByUserId: form.documentRecipientTypeId,
                            documentReceivedByUserCode: undefined,
                            documentReceivedByUserName: form.documentRecipientTypeName,
                        },
                    ],

                    deaths: isDeath
                        ? [
                              {
                                  causeOfIncidentId: form.causeOfIncidentId,
                                  deathDate: form.deathDate,
                                  placeOfDeathId: form.deathPlaceType,
                                  placeOfDeathDetail: form.accidentPlace,
                              },
                          ]
                        : [],

                    disabilities: isDisability ? mapOrganLossToDisabilityRequests(organLossItems) : [],

                    documents: isMedicalAll
                        ? form.ocrDocument ?? []
                        : documentScanList.map((d) => ({
                              documentId: d.documentId,
                              documentNo: d.documentCode,
                              documentSubTypeId: d.documentSubTypeId,
                              claimDocumentTypeId: d.documentTypeId,
                          })),

                    contacts:
                        isDeath || isDisability
                            ? []
                            : [
                                  {
                                      contactPersonTypeId: selectedContact?.contactPersonTypeId,
                                      contactPersonName: selectedContact?.contactName,
                                      contactPhoneNo: selectedContact?.contactPhoneNo,
                                  },
                              ],

                    servicePersons: [
                        {
                            servicePersonByUserId: form.serviceProviderId ?? 0,
                            servicePersonByUserCode: form.serviceProviderCode,
                            servicePersonByUserName: form.serviceProviderName,
                            zebraId: form.zebraId ?? 0,
                            zebraCode: form.zebraCode ?? undefined,
                            zebraNo: form.zebraNo ?? undefined,
                            employeeCode: form.employeeCode ?? undefined,
                            employeeName: form.employeeName ?? undefined,
                        },
                    ],

                    beneficiaries:
                        beneficiaryList.length > 0
                            ? beneficiaryList.map((beneficiary) => ({
                                  policyBeneficiaryId: undefined,
                                  titleId: beneficiary.titleId?.toString(),
                                  firstName: beneficiary.firstName ?? "-",
                                  lastName: beneficiary.lastName ?? "-",
                                  idCard: beneficiary.citizenId,
                                  phoneNo: beneficiary.phoneNumber,
                                  relationId: beneficiary.relationTypeId,
                                  bankAccountRelationTypeId: undefined,
                                  bankId: beneficiary.bankId ?? 0,
                                  bankAccountNo: beneficiary.bankAccountNo,
                                  bankAccountName: beneficiary.bankAccountName,
                                  payoutAmount: beneficiary.amount,
                                  payables: [{ payableCategoryId }],
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
                                      bankId: selectedAccount.bankId ?? 0,
                                      bankAccountNo: selectedAccount.bankAccountNo,
                                      bankAccountName: selectedAccount.bankAccountName,
                                      payoutAmount: form.transferAmount,
                                      payables: [{ payableCategoryId }],
                                  },
                              ]
                            : [],
                },
            ],
        };
    };

    const buildPaymentPayload = async (claimResponse: any, beneficiaryList: BeneficiaryForm[]): Promise<any[]> => {
        const responseList = claimResponse?.data?.responseList ?? [];
        const item = responseList[0];

        if (beneficiaryList.length > 0) {
            return Promise.all(
                beneficiaryList.map(async (beneficiary, index) => {
                    const encryptResult = await getEncryptText(
                        beneficiary.bankAccountNo ?? "",
                        beneficiary.phoneNumber?.replace(/-/g, "").trim() ?? "",
                        beneficiary.bankAccountName ?? ""
                    );

                    return {
                        casePayableId: item?.casePayableId?.[index],
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
                        payeeTypeId: 4, //beneficiary
                    };
                })
            );
        }

        if (selectedAccount) {
            const encryptResult = await getEncryptText(
                selectedAccount.bankAccountNo ?? "",
                selectedContact?.contactPhoneNo?.replace(/-/g, "").trim() ?? "",
                selectedAccount.bankAccountName ?? ""
            );

            return [
                {
                    casePayableId: item?.casePayableId?.[0],
                    grossPaidAmount: 0,
                    withHoldingTaxAmount: 0,
                    netPaidAmount: form.transferAmount ?? 0,
                    receivingBankId: selectedAccount.bankId,
                    receivingBankAccountNo: encryptResult.accountNoResult,
                    receivingBankName: selectedAccount.bankName,
                    receivingAccountName: encryptResult.bankAccountNameResult,
                    phoneNumber: encryptResult.phoneNumberResult,
                    claimCase: item?.caseNo,
                    claimNo: item?.claimNo,
                    payeeTypeId: 2, //Customer
                },
            ];
        }

        return [];
    };

    const createClaimPH = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const list = overrideBeneficiaries ?? [];
        const payload = buildPayload(list);
        const claimResponse = await mutation.mutateAsync(payload as any);
        if (!claimResponse?.data?.isResult) {
            onError?.(claimResponse?.data?.msg || "สร้างเคลมไม่สำเร็จ");
        }
        return { claimResponse, beneficiaryList: list };
    };

    const confirmPayment = async (claimResponse: any, beneficiaryList: BeneficiaryForm[]) => {
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

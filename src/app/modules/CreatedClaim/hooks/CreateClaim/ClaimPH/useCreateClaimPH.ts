import dayjs from "dayjs";
import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import { CreateCoreClaimDtoRequest } from "../../../../../api/coreClaimApi.client";
import { useAuth } from "../../../../_auth";
import { BeneficiaryForm, claimPHSelector } from "./../../../store/claimPHSlice";
import { CoverageType } from "../../../../../functionHelpers";
export const useCreateClaimPH = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { userProfile } = useAuth();
    const { form, bankAccounts, contacts, insured, organLossItems } = useAppSelector(claimPHSelector);
    const isMedicalAll =
        form.coverageTypeId === CoverageType.Medical || form.coverageTypeId === CoverageType.Compensate;
    const isMedical = form.coverageTypeId === CoverageType.Medical;
    const isCompensate = form.coverageTypeId === CoverageType.Compensate;
    const isDisability = form.coverageTypeId === CoverageType.Disability;
    const isDeath = form.coverageTypeId === CoverageType.Death;
    const selectedContact = contacts.find((contact) => contact.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((account) => account.isDefault) ?? bankAccounts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
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
                    tempClaimId: undefined, // gen guid ถ้า backend ต้องการ map กับ case
                    applicationId: insured?.policyCode,
                    policyNo: undefined,
                    certificateNo: undefined,

                    customerId: insured?.customerId,
                    customerName: insured?.customerName,

                    incidentTypeId: form.incidentTypeId,
                    incidentDate: form.incidentDate,

                    accidentPlace: form.accidentPlace,
                    accidentDescription: undefined,

                    createCase: [
                        {
                            tempCaseId: undefined,
                            tempClaimId: undefined, // ต้องตรงกับ tempClaimId ด้านบนถ้าใช้ mapping

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

                            createCaseItem: [],

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
                                    isDocumentComplete: false,
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

                            createCaseDisability: isDisability
                                ? organLossItems.length > 0
                                    ? organLossItems.map((organ) => ({
                                          bodyPartId: organ.bodyPartId,
                                          disabilityTypeId:
                                              organ.bodyPartId === 67 ? 3 : organ.bodyPartId === 67 ? 2 : undefined,
                                          disabilityLevel: undefined,
                                          disabilityPercent: undefined,
                                      }))
                                    : []
                                : [],
                            createCaseDocument: isMedicalAll
                                ? [
                                      {
                                          documentSubTypeId: 220,
                                          caseDocumentDetail: form.ocrDocument,
                                      },
                                  ]
                                : [],

                            createCaseAdjudication: [
                                {
                                    decisionId: 3,
                                    decisionDate: dayjs(),
                                    approvedAdmissionDate: dayjs(),
                                    approvedDischargeDate: dayjs(),
                                    coveredAmount: 0,
                                    nonCoveredAmount: 0,
                                    compensateAmount: 0,
                                    approvedMedicalAmount: 0,
                                    approvedCompensateAmount: 0,
                                    patientPayAmount: 0,
                                    isExgratia: false,
                                    exgratiaAmount: 0,
                                    deductibleAmount: 0,
                                    coPayAmount: 0,
                                    coInsuranceAmount: 0,
                                    rejectReasonId: undefined,
                                    rejectDate: undefined,
                                    isLatest: true,
                                    approvedIPDDayCount: 0,
                                    approvedICUDayCount: 0,
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
    const createClaimPH = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const list = overrideBeneficiaries ?? [];
        const payload = buildPayload(list);
        return await mutation.mutateAsync(payload);
    };
    return {
        createClaimPH,
        isLoading: mutation.isLoading,
    };
};

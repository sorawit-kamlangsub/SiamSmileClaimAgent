import dayjs from "dayjs";
import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import { CreateCoreClaimDtoRequest } from "../../../../../api/coreClaimApi.client";
import { useAuth } from "../../../../_auth";
import { claimPASelector } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
export const useCreateClaimPA = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { userProfile } = useAuth();
    const { form, bankAccounts, contacts, insured } = useAppSelector(claimPASelector);
    const isMedicalAll = form.coverageTypeId === 2 || form.coverageTypeId === 3;
    const isMedical = form.coverageTypeId === 2;
    const isCompensate = form.coverageTypeId === 3;
    const isDisability = form.coverageTypeId === 4;
    const isDeath = form.coverageTypeId === 5;
    const selectedContact = contacts.find((contact) => contact.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((account) => account.isDefault) ?? bankAccounts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );
    const buildPayload = (beneficiaryList: BeneficiaryForm[]): CreateCoreClaimDtoRequest => {
        return {
            createClaim: {
                createdByUserId: userProfile?.userId,
                createdByUserCode: userProfile?.employeeCode,
                createdByUserName: userProfile?.fullName,

                applicationId: insured?.policyCode,
                policyNo: undefined,
                certificateNo: undefined,

                customerId: insured?.customerId,
                customerName: insured?.customerName,

                incidentTypeId: form.incidentTypeId,
                incidentDate: form.incidentDate,

                accidentPlace: form.accidentPlace,
                accidentDescription: undefined,

                productTypeId: 26,
                claimSourceId: 2, //ClaimAgent
            },
            createCase: {
                coverageTypeId: form.coverageTypeId,
                occurrenceDate: form.incidentDate,
                admissionDate: form.admissionDate,
                dischargeDate: form.dischargeDate,

                caseAmount: form.transferAmount,

                latestApprovedAmount: 0,
                latestNonCoveredAmount: 0,
                latestPatientPayAmount: 0,

                hospitalId: form.hospitalId,

                hn: undefined,
                an: undefined,
                vn: undefined,

                chiefComplaintId: form.chiefComplaintId,
                chiefComplaintCustom: form.remark,

                productId: insured?.productId ?? undefined,
                icd10_1stId: form.diagnoses[0]?.icd10Id,
                icd10_2ndId: form.diagnoses[1]?.icd10Id,
                icd10_3rdId: form.diagnoses[2]?.icd10Id,

                medicalTypeId: form.medicalTypeId,
                isCaseDisability: isDisability,
            },
            createCaseItemList: [],
            createCaseRegistration: {
                notificationDate: form.notificationDate,
                notifyBy: userProfile?.fullName,
                initialCoverageTypeId: form.coverageTypeId,
                initialCaseAmount: form.transferAmount,
                initialCaseSourceId: 2, //Reimbursement
                preAuthId: undefined,
                initialMedicalTypeId: form.medicalTypeId,
            },
            createCaseAssessment: {
                isDocumentComplete: false,
                documentReceivedDate: dayjs(),
                documentCompleteDate: form.documentCompleteDate,
                isFraudSuspect: false,
                documentReceivedByUserId: form.documentRecipientTypeId,
                documentReceivedByUserCode: undefined,
                documentReceivedByUserName: form.documentRecipientTypeName,
            },

            createCaseDeath: {
                causeOfIncidentId: form.causeOfIncidentId,
                deathDate: isDeath ? form.deathDate : undefined,
            },

            createCaseDisability: {
                bodyPartId: undefined,
                disabilityTypeId: undefined,
                disabilityLevel: undefined,
                disabilityPercent: undefined,
            },

            createCaseDocument: {
                caseDocumentId: undefined,
                documentSubTypeId: 220,
                caseDocumentDetailList: isMedicalAll ? form.ocrDocument : undefined,
            },

            createCaseAdjudication: {
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
                rejectDate: dayjs(),
                isLatest: true,
                approvedIPDDayCount: 0,
                approvedICUDayCount: 0,
            },

            createCaseContact: {
                contactPersonTypeId: selectedContact?.contactPersonTypeId,
                contactPersonName: selectedContact?.contactName,
                contactPhoneNo: selectedContact?.contactPhoneNo,
            },

            createCaseServicePerson: {
                servicePersonByUserId: form.serviceProviderId,
                servicePersonByUserCode: form.serviceProviderCode,
                servicePersonByUserName: form.serviceProviderName,

                zebraId: form.zebraId,
                zebraCode: form.zebraCode ?? undefined,
                zebraNo: form.zebraNo ?? undefined,
                employeeCode: form.employeeCode ?? undefined,
                employeeName: form.employeeName ?? undefined,
            },
            createBeneficiaryList:
                beneficiaryList.map((beneficiary) => ({
                    beneficiaryId: undefined,
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
                })) ?? [],
            createCasePayable: {
                payableCategoryId: isMedical ? 2 : isCompensate ? 3 : isDisability ? 5 : 6,
                payableStatusId: 2, //open
                payableAmount: form.transferAmount,
                totalPaidAmount: undefined,
                outstandingAmount: undefined,
                payeeTypeId: isMedicalAll ? 2 : 4, // 2 = Medical, 4 = Beneficiary
                fromBankId: undefined,
                fromBankName: undefined,
                fromBankAccountNo: undefined,
                toBankId: selectedAccount.bankId,
                toBankName: selectedAccount.bankAccountName,
                toBankAccountNo: selectedAccount.bankAccountNo,
                bankAccountRelationTypeId: selectedAccount.bankAccountRelationTypeId,
            },
        };
    };

    const createClaimPA = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const list = overrideBeneficiaries ?? [];
        const payload = buildPayload(list);
        return await mutation.mutateAsync(payload);
    };
    return {
        createClaimPA,
        isLoading: mutation.isLoading,
    };
};

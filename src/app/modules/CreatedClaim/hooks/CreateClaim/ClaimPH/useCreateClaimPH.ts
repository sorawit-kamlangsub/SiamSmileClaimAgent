import dayjs from "dayjs";
import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import { CreateCoreClaimDtoRequest } from "../../../../../api/coreClaimApi.client";
import { useAuth } from "../../../../_auth";
import { claimPHSelector } from "./../../../store/claimPHSlice";
import { useOcrDocumentScan } from "../useOcrDocumentScan";
export const useCreateClaimPH = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { userProfile } = useAuth();
    const { form, bankAccounts, contacts, insured } = useAppSelector(claimPHSelector);
    const ocr = useOcrDocumentScan();
    const isMedical = form.coverageTypeId === 2 || form.coverageTypeId === 3;
    const selectedContact = contacts.find((contact) => contact.isDefault) ?? contacts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );
    const buildPayload = (): CreateCoreClaimDtoRequest => {
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

                productTypeId: 6,
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

                productId: insured?.productId,
                icd10_1stId: form.diagnoses[0]?.icd10Id,
                icd10_2ndId: form.diagnoses[1]?.icd10Id,
                icd10_3rdId: form.diagnoses[2]?.icd10Id,

                medicalTypeId: form.medicalTypeId,
                isCaseDisability: form.coverageTypeId === 4 ? true : false,
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
                documentCompleteDate: dayjs(),
                isFraudSuspect: false,
                documentReceivedByUserId: form.documentRecipientTypeId,
                documentReceivedByUserCode: undefined,
                documentReceivedByUserName: form.documentRecipientTypeName,
            },

            createCaseDeath: {
                causeOfIncidentId: form.causeOfIncidentId,
                deathDate: form.deathDate,
            },

            createCaseDisability: {
                bodyPartId: 0,
                disabilityTypeId: 0,
                disabilityLevel: 0,
                disabilityPercent: 0,
            },

            createCaseDocument: isMedical ? ocr.ocrDocumentPayload(ocr.ocrResult, ocr.ocrDocumentIds)[0] : undefined,

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
                zebraCode: form.zebraCode ?? "",
                zebraNo: form.zebraNo ?? "",
                employeeCode: form.employeeCode ?? "",
                employeeName: form.employeeName ?? "",
            },
        };
    };

    const createClaimPH = async () => {
        const payload = buildPayload();
        return await mutation.mutateAsync(payload);
    };
    return {
        createClaimPH,
        isLoading: mutation.isLoading,
    };
};

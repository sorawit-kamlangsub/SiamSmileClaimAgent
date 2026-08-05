import dayjs, { Dayjs } from "dayjs";
import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import { useAuth } from "../../../../_auth";
import { claimPASelector, ClaimInsuredItem } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { CoverageType } from "../../../../../functionHelpers";

interface CreateCoreClaimBatchDtoRequest {
    createClaim: CreateClaimEntryDto[];
}

interface CreateClaimEntryDto {
    tempClaimId?: string;
    createdByUserId?: number;
    createdByUserCode?: string;
    createdByUserName?: string;
    applicationId?: string;
    policyNo?: string;
    certificateNo?: string;
    customerId?: number;
    customerName?: string;
    incidentTypeId?: number;
    incidentDate?: Dayjs;
    accidentPlace?: string;
    accidentDescription?: string;
    productTypeId?: number;
    claimSourceId?: number;
    createCase: CreateCaseEntryDto[];
}

interface CreateCaseEntryDto {
    tempCaseId?: string;
    tempClaimId?: string;
    coverageTypeId?: number;
    occurrenceDate?: Dayjs;
    admissionDate?: Dayjs;
    dischargeDate?: Dayjs;
    caseAmount?: number;
    latestApprovedAmount?: number;
    latestNonCoveredAmount?: number;
    latestPatientPayAmount?: number;
    isCaseDisability?: boolean;
    hospitalId?: number;
    hn?: string;
    an?: string;
    vn?: string;
    chiefComplaintId?: number;
    chiefComplaintCustom?: string;
    productId?: number;
    icD10_1stId?: number;
    icD10_2ndId?: number;
    icD10_3rdId?: number;
    medicalTypeId?: number;
    createCaseItem: any[];
    createCaseRegistration: CreateCaseRegistrationEntryDto[];
    createCaseAssessment: CreateCaseAssessmentEntryDto[];
    createCaseDeath: CreateCaseDeathEntryDto[];
    createCaseDisability: CreateCaseDisabilityEntryDto[];
    createCaseDocument: CreateCaseDocumentEntryDto[];
    createCaseAdjudication: CreateCaseAdjudicationEntryDto[];
    createCaseContact: CreateCaseContactEntryDto[];
    createCaseServicePerson: CreateCaseServicePersonEntryDto[];
    createBeneficiary: CreateBeneficiaryEntryDto[];
    createCasePayable: CreateCasePayableEntryDto[];
}

interface CreateCaseRegistrationEntryDto {
    tempCaseId?: string;
    notificationDate?: Dayjs;
    notifyBy?: string;
    initialCoverageTypeId?: number;
    initialCaseAmount?: number;
    initialCaseSourceId?: number;
    preAuthId?: string;
    initialMedicalTypeId?: number;
}

interface CreateCaseAssessmentEntryDto {
    tempCaseId?: string;
    isDocumentComplete?: boolean;
    documentReceivedDate?: Dayjs;
    documentCompleteDate?: Dayjs;
    isFraudSuspect?: boolean;
    documentReceivedByUserId?: number;
    documentReceivedByUserCode?: string;
    documentReceivedByUserName?: string;
}

interface CreateCaseDeathEntryDto {
    tempCaseId?: string;
    causeOfIncidentId?: number;
    deathDate?: Dayjs;
}

interface CreateCaseDisabilityEntryDto {
    tempCaseId?: string;
    bodyPartId?: number;
    disabilityTypeId?: number;
    disabilityLevel?: number;
    disabilityPercent?: number;
}

interface CreateCaseDocumentEntryDto {
    tempCaseId?: string;
    tempCaseDocumentId?: string;
    documentSubTypeId?: number;
    caseDocumentDetail: any[];
}

interface CreateCaseAdjudicationEntryDto {
    tempCaseId?: string;
    decisionId?: number;
    decisionDate?: Dayjs;
    approvedAdmissionDate?: Dayjs;
    approvedDischargeDate?: Dayjs;
    coveredAmount?: number;
    nonCoveredAmount?: number;
    compensateAmount?: number;
    approvedMedicalAmount?: number;
    approvedCompensateAmount?: number;
    patientPayAmount?: number;
    isExgratia?: boolean;
    exgratiaAmount?: number;
    deductibleAmount?: number;
    coPayAmount?: number;
    coInsuranceAmount?: number;
    rejectReasonId?: number;
    rejectDate?: Dayjs;
    isLatest?: boolean;
    approvedIPDDayCount?: number;
    approvedICUDayCount?: number;
}

interface CreateCaseContactEntryDto {
    tempCaseId?: string;
    contactPersonTypeId?: number;
    contactPersonName?: string;
    contactPhoneNo?: string;
}

interface CreateCaseServicePersonEntryDto {
    tempCaseId?: string;
    servicePersonByUserId?: number;
    servicePersonByUserCode?: string;
    servicePersonByUserName?: string;
    zebraId?: number;
    zebraCode?: string;
    zebraNo?: string;
    employeeCode?: string;
    employeeName?: string;
}

interface CreateBeneficiaryEntryDto {
    tempClaimId?: string;
    tempCaseId: string;
    policyBeneficiaryId?: number;
    titleId?: string;
    firstName?: string;
    lastName?: string;
    idCard?: string;
    phoneNo?: string;
    relationId?: number;
    bankAccountRelationTypeId?: number;
    bankId?: number;
    bankAccountNo?: string;
    bankAccountName?: string;
    payoutAmount?: number;
}

interface CreateCasePayableEntryDto {
    tempCaseId?: string;
    payableCategoryId?: number;
}

// const generateTempId = () =>
//     typeof crypto !== "undefined" && crypto.randomUUID
//         ? crypto.randomUUID()
//         : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useCreateClaimPA = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { userProfile } = useAuth();
    const { bankAccounts, contacts, claimItems } = useAppSelector(claimPASelector);
    const selectedContact = contacts.find((contact) => contact.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((account) => account.isDefault) ?? bankAccounts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const buildClaimEntry = (item: ClaimInsuredItem, beneficiaryList: BeneficiaryForm[]): CreateClaimEntryDto => {
        const values = item.formValues;
        const isMedicalAll =
            values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
        const isMedical = values.coverageTypeId === CoverageType.Medical;
        const isCompensate = values.coverageTypeId === CoverageType.Compensate;
        const isDisability = values.coverageTypeId === CoverageType.Disability;
        const isDeath = values.coverageTypeId === CoverageType.Death;

        // const tempClaimId = generateTempId();
        // const tempCaseId = generateTempId();
        // const tempCaseDocumentId = generateTempId();

        const tempClaimId = undefined; // ใช้ undefined เพื่อให้ backend สร้าง claimId ใหม่ให้เอง
        const tempCaseId = undefined;
        const tempCaseDocumentId = undefined;

        const createCaseRegistration: CreateCaseRegistrationEntryDto[] = [
            {
                tempCaseId,
                notificationDate: values.notificationDate,
                notifyBy: userProfile?.fullName,
                initialCoverageTypeId: values.coverageTypeId,
                initialCaseAmount: item.claimAmount,
                initialCaseSourceId: 2, //Reimbursement
                preAuthId: undefined,
                initialMedicalTypeId: values.medicalTypeId,
            },
        ];

        const createCaseAssessment: CreateCaseAssessmentEntryDto[] = [
            {
                tempCaseId,
                isDocumentComplete: false,
                documentReceivedDate: dayjs(),
                documentCompleteDate: values.documentCompleteDate,
                isFraudSuspect: false,
                documentReceivedByUserId: values.documentRecipientTypeId,
                documentReceivedByUserCode: undefined,
                documentReceivedByUserName: values.documentRecipientTypeName,
            },
        ];

        const createCaseDeath: CreateCaseDeathEntryDto[] = [
            {
                tempCaseId,
                causeOfIncidentId: values.causeOfIncidentId,
                deathDate: isDeath ? values.deathDate : undefined,
            },
        ];

        const createCaseDisability: CreateCaseDisabilityEntryDto[] = [
            {
                tempCaseId,
                bodyPartId: undefined,
                disabilityTypeId: undefined,
                disabilityLevel: undefined,
                disabilityPercent: undefined,
            },
        ];

        const createCaseDocument: CreateCaseDocumentEntryDto[] = [
            {
                tempCaseId,
                tempCaseDocumentId,
                documentSubTypeId: 220,
                caseDocumentDetail: isMedicalAll ? (values.ocrDocument as any[]) ?? [] : [],
            },
        ];

        const createCaseAdjudication: CreateCaseAdjudicationEntryDto[] = [
            {
                tempCaseId,
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
        ];

        const createCaseContact: CreateCaseContactEntryDto[] = [
            {
                tempCaseId,
                contactPersonTypeId: selectedContact?.contactPersonTypeId,
                contactPersonName: selectedContact?.contactName,
                contactPhoneNo: selectedContact?.contactPhoneNo,
            },
        ];

        const createCaseServicePerson: CreateCaseServicePersonEntryDto[] = [
            {
                tempCaseId,
                servicePersonByUserId: values.serviceProviderId,
                servicePersonByUserCode: values.serviceProviderCode,
                servicePersonByUserName: values.serviceProviderName,
                zebraId: values.zebraId,
                zebraCode: values.zebraCode ?? undefined,
                zebraNo: values.zebraNo ?? undefined,
                employeeCode: values.employeeCode ?? undefined,
                employeeName: values.employeeName ?? undefined,
            },
        ];

        const createBeneficiary: CreateBeneficiaryEntryDto[] =
            beneficiaryList.length > 0
                ? beneficiaryList.map((beneficiary) => ({
                      tempClaimId,
                      tempCaseId,
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
                          tempClaimId,
                          tempCaseId,
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
                          payoutAmount: item.claimAmount,
                      },
                  ]
                : [];

        const createCasePayable: CreateCasePayableEntryDto[] = [
            {
                tempCaseId,
                payableCategoryId: isMedical ? 2 : isCompensate ? 3 : isDisability ? 5 : 6,
            },
        ];

        const createCase: CreateCaseEntryDto[] = [
            {
                tempCaseId,
                tempClaimId,
                coverageTypeId: values.coverageTypeId,
                occurrenceDate: item.incidentDate,
                admissionDate: item.admissionDate,
                dischargeDate: item.dischargeDate,
                caseAmount: item.claimAmount,
                latestApprovedAmount: 0,
                latestNonCoveredAmount: 0,
                latestPatientPayAmount: 0,
                isCaseDisability: isDisability,
                hospitalId: values.hospitalId,
                hn: undefined,
                an: undefined,
                vn: undefined,
                chiefComplaintId: values.chiefComplaintId,
                chiefComplaintCustom: values.remark,
                productId: item.productId,
                icD10_1stId: values.diagnoses[0]?.icd10Id,
                icD10_2ndId: values.diagnoses[1]?.icd10Id,
                icD10_3rdId: values.diagnoses[2]?.icd10Id,
                medicalTypeId: values.medicalTypeId,
                createCaseItem: [],
                createCaseRegistration,
                createCaseAssessment,
                createCaseDeath,
                createCaseDisability,
                createCaseDocument,
                createCaseAdjudication,
                createCaseContact,
                createCaseServicePerson,
                createBeneficiary,
                createCasePayable,
            },
        ];

        return {
            tempClaimId,
            createdByUserId: userProfile?.userId,
            createdByUserCode: userProfile?.employeeCode,
            createdByUserName: userProfile?.fullName,
            applicationId: item.applicationId,
            policyNo: undefined,
            certificateNo: undefined,
            customerId: item.customerId,
            customerName: item.customerName,
            incidentTypeId: values.incidentTypeId,
            incidentDate: values.incidentDate,
            accidentPlace: values.accidentPlace,
            accidentDescription: undefined,
            productTypeId: 26,
            claimSourceId: 2, //ClaimAgent
            createCase,
        };
    };

    const buildPayload = (beneficiaryList: BeneficiaryForm[]): CreateCoreClaimBatchDtoRequest => ({
        createClaim: claimItems.map((item) => buildClaimEntry(item, beneficiaryList)),
    });

    const createClaimPA = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const list = overrideBeneficiaries ?? [];
        const payload = buildPayload(list);
        return await mutation.mutateAsync(payload as any);
    };
    return {
        createClaimPA,
        isLoading: mutation.isLoading,
    };
};

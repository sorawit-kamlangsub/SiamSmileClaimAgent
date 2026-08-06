import { useEffect, useMemo, useRef } from "react";
import { useFormik, FormikErrors } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { useAuth } from "../../../../_auth";
import { ChipOption } from "../../../components/CreateClaim/ChipSelector";
import { useGetIncidentType, useGetIncidentTypeMapping } from "../../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../components/CreateClaim/ClaimTypeSelector";
import { claimPHSelector, DeathPlaceType, setEnabled, SymptomType } from "../../../store/claimPHSlice";
import { useOcrDocumentScan } from "../useOcrDocumentScan";
import dayjs from "dayjs";
import { useGetCustomerBenefitDetailSearch } from "../../../../../api/coreClaimApi";
import { swalWarning } from "../../../../_common";
import { amountNumber } from "../organLoss.types";
import { CoverageType, MedicalType } from "../../../../../functionHelpers";
import {
    addClaimItem,
    ClaimInsuredItem,
    ClaimPAFormValues,
    claimPASelector,
    setClaimForm,
    setPendingInsured,
    setTmpCaseItem,
    setTmpClaimItem,
    setTmpCoreClaimHeader,
    updateClaimItem,
} from "../../../store/claimPASlice";
import {
    ClaimCreateRequest,
    CaseCreateRequest,
    CaseRegistrationCreateRequest,
    CaseAssessmentCreateRequest,
    CaseDeathCreateRequest,
    CaseDisabilityCreateRequest,
    CaseDocumentCreateRequest,
    // CaseAdjudicationCreateRequest,
    CaseContactCreateRequest,
    CaseServicePersonCreateRequest,
    CasePayableCreateRequest,
} from "../../../../../api/coreClaimApi.client";

interface Options {
    onNext: () => void;
}

const generateTempId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useClaimPAForm = ({ onNext }: Options) => {
    const dispatch = useAppDispatch();
    const { userProfile } = useAuth();
    const {
        form,
        isContinuous,
        oldClaim,
        insured,
        pendingInsured,
        organLossItems,
        claimItems,
        editingItemId,
        tmpCoreClaim,
    } = useAppSelector(claimPASelector);

    const effectiveInsured = pendingInsured ?? insured;
    const { documentDetailById } = useAppSelector(claimPHSelector);
    const ocr = useOcrDocumentScan();
    const docData = Object.values(documentDetailById);
    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const formik = useFormik<ClaimPAFormValues>({
        initialValues: { ...form, serviceProviderId: userProfile?.userId },
        enableReinitialize: true,
        validate: (values) => {
            const errors: FormikErrors<ClaimPAFormValues> = {};
            const req = "โปรดระบุ";

            // ── ข้อมูลผู้ให้บริการ ──
            if (!values.documentRecipientTypeId) errors.documentRecipientTypeId = req;
            if (!values.serviceProviderId) errors.serviceProviderId = req;
            if (!values.zebraId) errors.zebraId = req;

            // ── ประเภทการเคลม ──
            if (!values.incidentTypeId) errors.incidentTypeId = req;
            if (!values.coverageTypeId) errors.coverageTypeId = req;

            const isMedical =
                values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
            const isCause =
                values.coverageTypeId === CoverageType.Death || values.coverageTypeId === CoverageType.Disability;
            const isIPD =
                values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery;
            const isDisability = values.coverageTypeId === CoverageType.Disability;
            const isDeath = values.coverageTypeId === CoverageType.Death;

            if (isMedical && !values.medicalTypeId) errors.medicalTypeId = req;
            if (isCause && !values.causeOfIncidentId) errors.causeOfIncidentId = req;

            // ── วันที่ ──
            if (!values.incidentDate) errors.incidentDate = req;

            if (isMedical) {
                if (!values.admissionDate) {
                    errors.admissionDate = req;
                } else if (values.admissionDate.isBefore(values.incidentDate, "day")) {
                    errors.admissionDate = "ไม่สามารถเลือกวันที่เข้า รพ. ก่อนวันที่เกิดเหตุได้";
                }

                if (isIPD) {
                    if (!values.dischargeDate) {
                        errors.dischargeDate = req;
                    } else if (
                        values.dischargeDate.isBefore(values.admissionDate, "day") ||
                        values.dischargeDate.isBefore(values.incidentDate, "day")
                    ) {
                        errors.dischargeDate = "รบกวนตรวจสอบวันที่ออก รพ.";
                    }
                }
            }

            // ── อาการ ──
            if (!values.symptomType) errors.symptomType = req;
            if (values.symptomType === SymptomType.ChiefComplaint && !values.chiefComplaintId)
                errors.chiefComplaintId = req;
            if (values.symptomType === SymptomType.Other && !values.remark) errors.remark = req;
            if (isDeath || isDisability) {
                if (!values.notificationDate) errors.notificationDate = req;
                if (!values.documentCompleteDate) errors.documentCompleteDate = req;
                if (!values.chiefComplaintId) errors.chiefComplaintId = req;
                if (isDeath) {
                    if (!values.deathDate) errors.deathDate = req;
                    if (values.deathPlaceType === DeathPlaceType.Hospital && !values.hospitalId)
                        errors.hospitalId = req;
                    if (values.deathPlaceType === DeathPlaceType.Other && !values.accidentPlace)
                        errors.accidentPlace = req;
                } else {
                    if (!values.hospitalId) errors.hospitalId = req;
                }
            }
            // ── จำนวนเงิน ──
            if (!values.transferAmount || values.transferAmount <= 0) errors.transferAmount = req;
            return errors;
        },

        onSubmit: (values, { setSubmitting }) => {
            const isDisability = values.coverageTypeId === CoverageType.Disability;
            const isDeath = values.coverageTypeId === CoverageType.Death;
            const isMedical =
                values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
            const isMedicalOnly = values.coverageTypeId === CoverageType.Medical;
            const isCompensate = values.coverageTypeId === CoverageType.Compensate;

            const hasError = docData.some((docById) => {
                if (docById.documentId && documentDetailById[docById.documentId] && (isDeath || isDisability)) {
                    const doc = documentDetailById[docById.documentId];
                    if (!doc.docDetail || doc.docDetail.fileCount === undefined || doc.docDetail.fileCount < 1) {
                        swalWarning("แจ้งเตือน", "กรุณาแนบเอกสารเพิ่มเติม");
                        return true;
                    }
                    return false;
                }
                return false;
            });
            if (hasError) {
                setSubmitting(false);
                return;
            }

            const ocrDocument = !isMedical ? undefined : ocr.ocrDocumentPayload(ocr.ocrResult, ocr.ocrDocumentIds);

            // ── โหมดแก้ไข: มี editingItemId และหาเจอใน claimItems ──
            const editingItem = editingItemId ? claimItems.find((c) => c.id === editingItemId) : undefined;
            const isEditing = !!editingItem;

            const tempClaimId = editingItem?.tempClaimId ?? generateTempId();
            const tempCaseId = editingItem?.tempCaseId ?? generateTempId();

            const applicationId = isEditing ? editingItem!.applicationId : effectiveInsured?.policyCode;
            const customerId = isEditing ? editingItem!.customerId : effectiveInsured?.customerId;
            const customerName = isEditing ? editingItem!.customerName : effectiveInsured?.customerName;
            const productId = isEditing ? editingItem!.productId : effectiveInsured?.productId;

            const claimItem: ClaimInsuredItem = {
                id: editingItem?.id ?? `${Date.now()}`,
                seq: editingItem?.seq ?? claimItems.length + 1,
                customerName: customerName ?? "",
                claimStyle: values.medicalTypeId
                    ? `${values.medicalTypeName ?? ""} (${values.coverageTypeName ?? ""})`
                    : `${values.causeOfIncidentName ?? ""} (${values.coverageTypeName ?? ""})`,
                incidentDate: values.incidentDate ?? undefined,
                admissionDate: values.admissionDate ?? undefined,
                dischargeDate: values.dischargeDate ?? undefined,
                idCard: isEditing
                    ? editingItem!.idCard
                    : effectiveInsured?.cardTypeId === 2
                    ? effectiveInsured?.cardDetail ?? ""
                    : "",
                claimAmount: values.transferAmount ?? 0,
                applicationId,
                customerId,
                productId,
                tempClaimId,
                tempCaseId,
                formValues: { ...values, ocrDocument },
            };

            dispatch(setClaimForm({ ...values, ocrDocument }));

            if (isEditing) {
                dispatch(updateClaimItem(claimItem));
            } else {
                dispatch(addClaimItem(claimItem));
                dispatch(setPendingInsured(undefined));
            }

            // ── claim entry ──
            const claimEntry: ClaimCreateRequest = {
                tempClaimId,
                applicationId: effectiveInsured?.policyCode,
                policyNo: undefined,
                certificateNo: undefined,
                customerId: effectiveInsured?.customerId,
                customerName: effectiveInsured?.customerName,
                incidentTypeId: values.incidentTypeId,
                incidentDate: values.incidentDate,
                accidentPlace: values.accidentPlace,
                accidentDescription: undefined,
            };

            // ── case entry ──
            const createCaseRegistration: CaseRegistrationCreateRequest[] = [
                {
                    tempCaseId,
                    notificationDate: values.notificationDate,
                    notifyBy: userProfile?.fullName,
                    initialCoverageTypeId: values.coverageTypeId,
                    initialCaseAmount: values.transferAmount ?? 0,
                    initialCaseSourceId: 2,
                    preAuthId: undefined,
                    initialMedicalTypeId: values.medicalTypeId,
                },
            ];

            const createCaseAssessment: CaseAssessmentCreateRequest[] = [
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

            const createCaseDeath: CaseDeathCreateRequest[] = [
                {
                    tempCaseId,
                    causeOfIncidentId: values.causeOfIncidentId,
                    deathDate: isDeath ? values.deathDate : undefined,
                },
            ];

            const createCaseDisability: CaseDisabilityCreateRequest[] = [
                {
                    tempCaseId,
                    bodyPartId: undefined,
                    disabilityTypeId: undefined,
                    disabilityLevel: undefined,
                    disabilityPercent: undefined,
                },
            ];

            // TODO: caseDocumentDetail ยังต้อง map field ให้ตรงกับ type จริงของ createCaseDocument
            const createCaseDocument: CaseDocumentCreateRequest[] = [
                {
                    tempCaseId,
                    tempCaseDocumentId: generateTempId(),
                    documentSubTypeId: 220,
                    caseDocumentDetail: isMedical ? (ocrDocument as any[]) ?? [] : [],
                },
            ];

            // const createCaseAdjudication: CaseAdjudicationCreateRequest[] = [
            //     {
            //         tempCaseId,
            //         decisionId: 3,
            //         decisionDate: dayjs(),
            //         approvedAdmissionDate: dayjs(),
            //         approvedDischargeDate: dayjs(),
            //         coveredAmount: 0,
            //         nonCoveredAmount: 0,
            //         compensateAmount: 0,
            //         approvedMedicalAmount: 0,
            //         approvedCompensateAmount: 0,
            //         patientPayAmount: 0,
            //         isExgratia: false,
            //         exgratiaAmount: 0,
            //         deductibleAmount: 0,
            //         coPayAmount: 0,
            //         coInsuranceAmount: 0,
            //         rejectReasonId: undefined,
            //         rejectDate: dayjs(),
            //         isLatest: true,
            //         approvedIPDDayCount: 0,
            //         approvedICUDayCount: 0,
            //     },
            // ];

            const createCaseServicePerson: CaseServicePersonCreateRequest[] = [
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

            const createCasePayable: CasePayableCreateRequest[] = [
                {
                    tempCaseId,
                    payableCategoryId: isMedicalOnly ? 2 : isCompensate ? 3 : isDisability ? 5 : 6,
                },
            ];

            const caseEntry: CaseCreateRequest = {
                tempCaseId,
                tempClaimId,
                coverageTypeId: values.coverageTypeId,
                occurrenceDate: values.incidentDate,
                admissionDate: values.admissionDate,
                dischargeDate: values.dischargeDate,
                caseAmount: values.transferAmount ?? 0,
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
                productId: effectiveInsured?.productId,
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
                // createCaseAdjudication,
                createCaseContact: [], // เติมตอน submit จริงใน useCreateClaimPA (ต้องรอ selectedContact)
                createCaseServicePerson,
                createBeneficiary: [], // ยังไม่มีตอนนี้ รอ step beneficiary แล้วค่อย merge ตอนยิง API จริง
                createCasePayable,
            };

            dispatch(setTmpClaimItem([claimEntry]));
            console.log("🚀 ~ useClaimPAForm ~ claimEntry:", claimEntry);
            dispatch(setTmpCaseItem({ tempClaimId, cases: [caseEntry] }));
            console.log("🚀 ~ useClaimPAForm ~ caseEntry:", caseEntry);

            onNext();
        },
    });

    const incidentType: ClaimTypeOption[] =
        incidentTypeRaw?.data?.map((item) => ({
            id: item.incidentTypeId ?? 0,
            name: item.incidentTypeNameTH ?? "",
            icon: INCIDENT_ICON_MAP[item.incidentTypeId ?? 0],
        })) ?? [];

    const { data: incidentTypeMapping, isLoading: incidentTypeMappingLoading } = useGetIncidentTypeMapping(
        formik.values.incidentTypeId ?? undefined,
        2, // ClaimAgent
        26, // PA
        effectiveInsured?.productCategoryCode ?? undefined,
        undefined,
        undefined,
        undefined
    );

    const coverageType: ClaimTypeOption[] = [
        ...new Map(
            (incidentTypeMapping?.data ?? []).map((item) => [
                item.coverageTypeId,
                {
                    id: item.coverageTypeId ?? 0,
                    name: item.coverageTypeNameTH ?? "",
                    icon: COVERAGE_ICON_MAP[item.coverageTypeId ?? 0],
                },
            ])
        ).values(),
    ];

    const medicalType: ChipOption[] = [
        ...new Map(
            (incidentTypeMapping?.data ?? [])
                .filter((item) => item.coverageTypeId === formik.values.coverageTypeId)
                .map((item) => [
                    item.medicalTypeId,
                    {
                        id: item.medicalTypeId ?? 0,
                        name: item.medicalTypeCode ?? "",
                    },
                ])
        ).values(),
    ];

    const causeOfIncident: ChipOption[] = [
        ...new Map(
            (incidentTypeMapping?.data ?? [])
                .filter((item) => item.coverageTypeId === formik.values.coverageTypeId)
                .map((item) => [
                    item.causeOfIncidentId,
                    {
                        id: item.causeOfIncidentId ?? 0,
                        name: item.causeOfIncidentName ?? "",
                    },
                ])
        ).values(),
    ];
    const { data: customerBenefit, isLoading: customerBenefitLoading } = useGetCustomerBenefitDetailSearch(
        effectiveInsured?.policyCode,
        0,
        formik.values.incidentDate,
        false,
        formik.values.incidentTypeId,
        formik.values.coverageTypeId,
        formik.values.medicalTypeId,
        formik.values.causeOfIncidentId
    );
    const isFirstRenderIncident = useRef(true);
    const isFirstRenderCoverage = useRef(true);

    useEffect(() => {
        if (!editingItemId) return;
        const target = claimItems.find((c) => c.id === editingItemId);
        if (!target) return;
        formik.setValues(target.formValues, false);
    }, [editingItemId]);

    useEffect(() => {
        if (isFirstRenderIncident.current) {
            isFirstRenderIncident.current = false;
            return;
        }
        if (!formik.values.incidentTypeId) return;
        formik.setValues(
            {
                ...formik.values,
                coverageTypeId: undefined,
                coverageTypeName: undefined,
                medicalTypeId: undefined,
                medicalTypeName: undefined,
                causeOfIncidentId: undefined,
                causeOfIncidentName: undefined,
                incidentDate: dayjs(),
                admissionDate: dayjs(),
                dischargeDate: dayjs(),
                deathDate: dayjs(),
                documentCompleteDate: dayjs(),
                notificationDate: dayjs(),
                transferAmount: 0,
                symptomType: 1,
                deathPlaceType: 1,
                hospitalId: undefined,
                hospitalName: undefined,
                diagnoses: [
                    {
                        icd10Id: undefined,
                        icd10Detail: undefined,
                    },
                ],
                accidentPlace: undefined,
                chiefComplaintId: undefined,
                chiefComplaintId_selectedText: undefined,
                remark: undefined,
            },
            false
        );
    }, [formik.values.incidentTypeId]);

    useEffect(() => {
        if (isFirstRenderCoverage.current) {
            isFirstRenderCoverage.current = false;
            return;
        }
        if (!formik.values.coverageTypeId) return;
        formik.setValues(
            {
                ...formik.values,
                medicalTypeId: undefined,
                medicalTypeName: undefined,
                causeOfIncidentId: undefined,
                causeOfIncidentName: undefined,
                incidentDate: dayjs(),
                admissionDate: dayjs(),
                dischargeDate: dayjs(),
                deathDate: dayjs(),
                documentCompleteDate: dayjs(),
                notificationDate: dayjs(),
                transferAmount: 0,
                symptomType: 1,
                deathPlaceType: 1,
                hospitalId: undefined,
                hospitalName: undefined,
                diagnoses: [
                    {
                        icd10Id: undefined,
                        icd10Detail: undefined,
                    },
                ],
                accidentPlace: undefined,
                chiefComplaintId: undefined,
                chiefComplaintId_selectedText: undefined,
                remark: undefined,
            },
            false
        );

        // ถ้า coverageType นี้ไม่ต้องบังคับเอกสารเลย ให้ valid ทันที
        if (!ocr.shouldShowOcrDocumentScan(formik.values.coverageTypeId)) {
            ocr.setIsOcrDocsValid(true);
        }
        if (
            formik.values.coverageTypeId === CoverageType.Disability ||
            formik.values.coverageTypeId === CoverageType.Death
        ) {
            dispatch(setEnabled(true));
        }
    }, [formik.values.coverageTypeId]);

    const totalOrganLossAmount = useMemo(
        () => organLossItems.reduce((sum, i) => sum + amountNumber(i.totalAmount), 0),
        [organLossItems]
    );

    useEffect(() => {
        formik.setFieldValue("transferAmount", totalOrganLossAmount);
    }, [totalOrganLossAmount]);

    useEffect(() => {
        if (isContinuous && oldClaim?.incidentDate) {
            formik.setFieldValue("incidentDate", dayjs(oldClaim.incidentDate));
        }
    }, [isContinuous, oldClaim?.incidentDate]);

    const isIncidentDateDisabled = isContinuous;
    return {
        formik,
        isContinuous,
        isIncidentDateDisabled,
        incidentType,
        coverageType,
        medicalType,
        causeOfIncident,
        incidentTypeMapping,
        customerBenefit,
        incidentTypeLoading,
        incidentTypeMappingLoading,
        customerBenefitLoading,
        insured: effectiveInsured,
        ...ocr,
    };
};

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
import { useGetCustomerBenefitDetailHalf } from "../../../../../api/coreClaimApi";
import { swalWarning } from "../../../../_common";
import { amountNumber } from "../organLoss.types";
import { CoverageType, MedicalType } from "../../../../../functionHelpers";
import {
    addClaimItem,
    ClaimInsuredItem,
    ClaimPAFormValues,
    claimPASelector,
    LocalCaseAssessment,
    LocalCaseDeath,
    LocalCaseDisability,
    LocalCaseDocument,
    LocalCaseEntry,
    LocalCaseRegistration,
    LocalCaseServicePerson,
    LocalClaimEntry,
    setClaimForm,
    setPendingInsured,
    setTmpCaseItem,
    setTmpClaimItem,
    setTmpCoreClaimHeader,
    updateClaimItem,
    updateTmpClaimItem,
} from "../../../store/claimPASlice";
import {
    buildUniformBenefitAmountMap,
    mapBankAccountToBeneficiary,
    mapBenefitToCaseItems,
    mapOrganLossToDisabilityRequests,
} from "./useCreateClaimPA";
import { filterSelectedDeathBenefits } from "../../../../../deathBenefitHelpers";

interface Options {
    onNext: () => void;
}

export const generateTempId = () =>
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
        bankAccounts,
        contacts,
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
            const isMedical =
                values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
            const isMedicalOnly = values.coverageTypeId === CoverageType.Medical;
            const isCompensate = values.coverageTypeId === CoverageType.Compensate;
            const isDisability = values.coverageTypeId === CoverageType.Disability;
            const isDeath = values.coverageTypeId === CoverageType.Death;
            const isIPD =
                values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery;

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

            const ocrDocument = isMedical
                ? ocr.ocrDocumentPayload(ocr.ocrResult, ocr.ocrDocumentIds)
                : values.ocrDocument;

            const editingItem = editingItemId ? claimItems.find((c) => c.id === editingItemId) : undefined;
            const isEditing = !!editingItem;

            const applicationId = isEditing ? editingItem!.applicationId : effectiveInsured?.policyCode;
            const customerId = isEditing ? editingItem!.customerId : effectiveInsured?.customerId;
            const customerName = isEditing ? editingItem!.customerName : effectiveInsured?.customerName;
            const productId = isEditing ? editingItem!.productId : effectiveInsured?.productId;

            const stubClaim = !isEditing
                ? tmpCoreClaim.createClaim?.find(
                      (c) => c.applicationId === applicationId && c.customerId === customerId
                  )
                : undefined;

            const tempClaimId = editingItem?.tempClaimId ?? stubClaim?.tempClaimId ?? generateTempId();
            const tempCaseId = editingItem?.tempCaseId ?? generateTempId();

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

            // ── header ของ tmpCoreClaim เซ็ตครั้งเดียว (กันทับ createClaim เดิม) ──
            if (!tmpCoreClaim.claimSourceId) {
                dispatch(
                    setTmpCoreClaimHeader({
                        claimSourceId: 2,
                        productTypeId: 26,
                        createdByUserCode: userProfile?.employeeCode,
                        createdByUserName: userProfile?.fullName,
                        createClaim: tmpCoreClaim.createClaim ?? [],
                    })
                );
            }

            const claimEntry: LocalClaimEntry = {
                tempClaimId,
                applicationId: applicationId ?? "",
                policyNo: undefined,
                certificateNo: undefined,
                customerId,
                customerName: customerName ?? "",
                incidentTypeId: values.incidentTypeId,
                incidentDate: values.incidentDate,
                accidentPlace:
                    isDeath && values.deathPlaceType === DeathPlaceType.Other ? values.accidentPlace : undefined,
                accidentDescription: undefined,
            };

            const createCaseRegistration: LocalCaseRegistration[] = [
                {
                    tempCaseId,
                    notificationDate: isDeath || isDisability ? values.notificationDate : undefined,
                    notifyBy: userProfile?.fullName,
                    initialCoverageTypeId: values.coverageTypeId,
                    initialCaseAmount: values.transferAmount ?? 0,
                    initialCaseSourceId: 2,
                    preAuthId: undefined,
                    initialMedicalTypeId: isMedical ? values.medicalTypeId : undefined,
                },
            ];

            const createCaseAssessment: LocalCaseAssessment[] = [
                {
                    tempCaseId,
                    isDocumentComplete: isDeath || isDisability, // เหมือน PH: true เฉพาะ Death/Disability
                    documentReceivedDate: dayjs(),
                    documentCompleteDate: isDeath || isDisability ? values.documentCompleteDate : undefined,
                    isFraudSuspect: false,
                    documentReceivedByUserId: values.documentRecipientTypeId,
                    documentReceivedByUserCode: undefined,
                    documentReceivedByUserName: values.documentRecipientTypeName,
                },
            ];

            const createCaseDeath: LocalCaseDeath[] = isDeath
                ? [{ tempCaseId, causeOfIncidentId: values.causeOfIncidentId, deathDate: values.deathDate }]
                : [];

            const createCaseDisability: LocalCaseDisability[] = isDisability
                ? mapOrganLossToDisabilityRequests(organLossItems).map((item) => ({ ...item, tempCaseId }))
                : [];

            const createCaseDocument: LocalCaseDocument[] = [
                {
                    tempCaseId,
                    tempCaseDocumentId: generateTempId(),
                    documentSubTypeId: 220,
                    caseDocumentDetail: (ocrDocument as any[]) ?? [],
                },
            ];

            const createCaseServicePerson: LocalCaseServicePerson[] = [
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

            const payableCategoryId = isMedicalOnly ? 2 : isCompensate ? 3 : isDisability ? 5 : 6;

            const selectedContact = contacts.find((c) => c.isDefault) ?? contacts[0];
            const selectedAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];
            const createBeneficiary =
                !isDeath && !isDisability
                    ? mapBankAccountToBeneficiary(
                          selectedAccount,
                          selectedContact,
                          values.transferAmount ?? 0,
                          tempClaimId,
                          tempCaseId
                      )
                    : [];

            const filteredBenefits = isDeath
                ? filterSelectedDeathBenefits(customerBenefit?.data, values.extraCoverageIds)
                : customerBenefit?.data ?? [];

            const amountByStandardMedicalExpenseId = isDeath
                ? Object.fromEntries(
                      Object.entries(values.deathBenefitAmounts ?? {}).map(([standardMedicalExpenseId, amount]) => [
                          Number(standardMedicalExpenseId),
                          Number(amount) || 0,
                      ])
                  )
                : buildUniformBenefitAmountMap(filteredBenefits, values.transferAmount ?? 0);

            const createCaseItem = mapBenefitToCaseItems(filteredBenefits, amountByStandardMedicalExpenseId);

            const caseEntry: LocalCaseEntry = {
                tempCaseId,
                tempClaimId,
                coverageTypeId: values.coverageTypeId,
                occurrenceDate: values.incidentDate,
                admissionDate: isMedical ? values.admissionDate : undefined,
                dischargeDate: isIPD ? values.dischargeDate : undefined,
                caseAmount: values.transferAmount ?? 0,
                latestApprovedAmount: 0,
                latestNonCoveredAmount: 0,
                latestPatientPayAmount: 0,
                isCaseDisability: isDisability,
                hospitalId:
                    (isDeath && values.deathPlaceType === DeathPlaceType.Hospital) || isDisability
                        ? values.hospitalId
                        : undefined,
                hn: undefined,
                an: undefined,
                vn: undefined,
                chiefComplaintId:
                    values.symptomType === SymptomType.ChiefComplaint || isDeath || isDisability
                        ? values.chiefComplaintId
                        : undefined,
                chiefComplaintCustom:
                    values.symptomType === SymptomType.Other || isDeath || isDisability ? values.remark : undefined,
                productId,
                icD10_1stId: isDeath || isDisability ? values.diagnoses[0]?.icd10Id : undefined,
                icD10_2ndId: isDeath || isDisability ? values.diagnoses[1]?.icd10Id : undefined,
                icD10_3rdId: isDeath || isDisability ? values.diagnoses[2]?.icd10Id : undefined,
                medicalTypeId: isMedical ? values.medicalTypeId : undefined,
                createCaseItem,
                createCaseRegistration,
                createCaseAssessment,
                createCaseDeath,
                createCaseDisability,
                createCaseDocument,
                createCaseContact: [],
                createCaseServicePerson,
                createBeneficiary,
                payableCategoryId,
            };

            if (isEditing || stubClaim) {
                dispatch(updateTmpClaimItem(claimEntry));
            } else {
                dispatch(setTmpClaimItem([claimEntry]));
            }
            dispatch(setTmpCaseItem({ tempClaimId, cases: [caseEntry] }));

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

    const isDisability = formik.values.coverageTypeId === CoverageType.Disability;
    const isDeath = formik.values.coverageTypeId === CoverageType.Death;
    const formattype = isDisability ? 3 : isDeath ? 4 : 7;

    const { data: customerBenefit, isLoading: customerBenefitLoading } = useGetCustomerBenefitDetailHalf(
        effectiveInsured?.policyCode,
        undefined,
        formik.values.incidentDate,
        false,
        formik.values.incidentTypeId,
        formik.values.coverageTypeId,
        formik.values.medicalTypeId ?? 0,
        formik.values.causeOfIncidentId,
        formattype,
        "8901",
        effectiveInsured?.customerCode
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
                deathBenefitAmounts: {},
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
                deathBenefitAmounts: {},
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

import { useEffect, useRef } from "react";
import { useFormik, FormikErrors } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { useAuth } from "../../../../_auth";
import { ChipOption } from "../../../components/CreateClaim/ChipSelector";
import { useGetIncidentType, useGetIncidentTypeMapping } from "../../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../components/CreateClaim/ClaimTypeSelector";
import {
    ClaimInsuredItem,
    ClaimPAFormValues,
    claimPASelector,
    setClaimForm,
    setClaimItems,
} from "../../../store/claimPASlice";
import { claimPHSelector, setEnabled, SpecifyHospital, SymptomType } from "../../../store/claimPHSlice";
import { useOcrDocumentScan } from "../useOcrDocumentScan";
import dayjs from "dayjs";
import { useGetCustomerBenefitDetailSearch } from "../../../../../api/coreClaimApi";
import { swalWarning } from "../../../../_common";

interface Options {
    onNext: () => void;
}

export const useClaimPAForm = ({ onNext }: Options) => {
    const dispatch = useAppDispatch();
    const { userProfile } = useAuth();
    const { form, isContinuous, insured } = useAppSelector(claimPASelector);
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

            const isMedical = values.coverageTypeId === 2 || values.coverageTypeId === 3;
            const isCause = values.coverageTypeId === 4 || values.coverageTypeId === 5;
            const isIPD = values.medicalTypeId === 2 || values.medicalTypeId === 6;
            const isDisability = values.coverageTypeId === 4;
            const isDeath = values.coverageTypeId === 5;

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
                if (values.specifyHospital === SpecifyHospital.Specify && !values.hospitalId) errors.hospitalId = req;
                if (!values.notificationDate) errors.notificationDate = req;
                if (!values.documentCompleteDate) errors.documentCompleteDate = req;
                if (isDeath) {
                    if (!values.deathDate) errors.deathDate = req;
                    if (!values.accidentPlace) errors.accidentPlace = req;
                    if (!values.chiefComplaintId) errors.chiefComplaintId = req;
                    if (!values.diagnoses[0]?.icd10Id) {
                        errors.diagnoses = [
                            {
                                icd10Id: req,
                            },
                        ];
                    }
                }
            }
            // ── จำนวนเงิน ──
            if (!values.transferAmount || values.transferAmount <= 0) errors.transferAmount = req;
            return errors;
        },

        onSubmit: (values, { setSubmitting }) => {
            const isDisability = values.coverageTypeId === 4;
            const isDeath = values.coverageTypeId === 5;
            const isMedical = values.coverageTypeId === 2 || values.coverageTypeId === 3;
            //เช็คจำนวนเอกสาร
            const hasError = docData.some((docById) => {
                if (docById.documentId && documentDetailById[docById.documentId] && (isDeath || isDisability)) {
                    const doc = documentDetailById[docById.documentId];
                    if (!doc.docDetail || doc.docDetail.fileCount === undefined || doc.docDetail.fileCount < 1) {
                        swalWarning("แจ้งเตือน", "กรุณาแนบเอกสารเพิ่มเติม");
                        return true; // หยุด loop ทันที
                    }
                    return false;
                }
                return false;
            });

            if (hasError) {
                setSubmitting(false);
                return;
            }
            const claimItem: ClaimInsuredItem = {
                id: `${Date.now()}`,
                seq: 1,
                customerName: insured?.customerName ?? "",
                claimStyle: values.medicalTypeId
                    ? `${values.medicalTypeName ?? ""} (${values.coverageTypeName ?? ""})`
                    : `${values.causeOfIncidentName ?? ""} (${values.coverageTypeName ?? ""})`,
                incidentDate: values.incidentDate ?? dayjs(),
                claimAmount: values.transferAmount ?? 0,
            };

            dispatch(
                setClaimForm({
                    ...values,
                    ocrDocument: !isMedical ? undefined : ocr.ocrDocumentPayload(ocr.ocrResult, ocr.ocrDocumentIds),
                })
            );
            dispatch(setClaimItems([claimItem]));
            onNext();
        },
    });
    const incidentType: ClaimTypeOption[] =
        incidentTypeRaw?.data
            ?.filter((item) => item.incidentTypeId !== 4)
            .map((item) => ({
                id: item.incidentTypeId ?? 0,
                name: item.incidentTypeNameTH ?? "",
                icon: INCIDENT_ICON_MAP[item.incidentTypeId ?? 0],
            })) ?? [];
    const { data: incidentTypeMapping, isLoading: incidentTypeMappingLoading } = useGetIncidentTypeMapping(
        formik.values.incidentTypeId ?? undefined,
        2, // ClaimAgent
        26, // PA
        insured?.productCategoryCode ?? undefined,
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
        insured?.policyCode,
        0,
        formik.values.incidentDate,
        false,
        formik.values.incidentTypeId,
        formik.values.coverageTypeId,
        formik.values.medicalTypeId
    );
    const isFirstRenderIncident = useRef(true);
    const isFirstRenderCoverage = useRef(true);

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
                specifyHospital: 1,
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
                specifyHospital: 1,
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
        if (formik.values.coverageTypeId === 4 || formik.values.coverageTypeId === 5) {
            dispatch(setEnabled(true));
        }
    }, [formik.values.coverageTypeId]);

    // useEffect(() => {
    //     if (isContinuous && oldClaim?.incidentDate) {
    //         formik.setFieldValue("incidentDate", dayjs(oldClaim.incidentDate));
    //     }
    // }, [isContinuous, oldClaim?.incidentDate]);
    // const isIncidentDateDisabled = isContinuous;
    return {
        formik,
        isContinuous,
        //isIncidentDateDisabled,
        incidentType,
        coverageType,
        medicalType,
        causeOfIncident,
        incidentTypeMapping,
        customerBenefit,
        incidentTypeLoading,
        incidentTypeMappingLoading,
        customerBenefitLoading,
        insured,
        ...ocr,
    };
};

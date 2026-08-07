import { useGetCustomerBenefitDetailHalf } from "./../../../../../api/coreClaimApi";
import { useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import { useFormik, FormikErrors } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    ClaimFormValues,
    claimPHSelector,
    DeathPlaceType,
    setCaseItems,
    setClaimForm,
    setEnabled,
    SymptomType,
} from "../../../store/claimPHSlice";
import { useAuth } from "../../../../_auth";
import { ChipOption } from "../../../components/CreateClaim/ChipSelector";
import { useGetIncidentType, useGetIncidentTypeMapping } from "../../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../components/CreateClaim/ClaimTypeSelector";
import { useOcrDocumentScan } from "../useOcrDocumentScan";
import { swalWarning } from "../../../../_common";
import { amountNumber, FingerKey } from "../organLoss.types";
import { CoverageType, MedicalType } from "../../../../../functionHelpers";
import { CaseItemCreateRequest } from "../../../../../api/coreClaimApi.client";
interface Options {
    onNext: () => void;
}

export const useClaimPHForm = ({ onNext }: Options) => {
    const dispatch = useAppDispatch();
    const { userProfile } = useAuth();
    const { form, isContinuous, oldClaim, insured, documentDetailById, organLossItems } =
        useAppSelector(claimPHSelector);
    const ocr = useOcrDocumentScan();
    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const docData = Object.values(documentDetailById);

    const formik = useFormik<ClaimFormValues>({
        initialValues: { ...form, serviceProviderId: userProfile?.userId },
        enableReinitialize: true,
        validate: (values) => {
            const errors: FormikErrors<ClaimFormValues> = {};
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
            const isManualIPD =
                values.coverageTypeId === CoverageType.Medical &&
                (values.medicalTypeId === MedicalType.IPD || values.medicalTypeId === MedicalType.DayCaseSurgery);
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

            const items = customerBenefit?.data ?? [];
            let caseItems: CaseItemCreateRequest[] = [];

            if (isDisability) {
                const benefitItem = customerBenefit?.data?.[0];

                for (const organ of organLossItems) {
                    if (organ.fingers) {
                        const sides: ("left" | "right")[] = ["left", "right"];
                        let totalAmount = 0;
                        let firstStandardMedicalExpenseId: number | undefined;

                        for (const side of sides) {
                            for (const fingerKey of Object.keys(organ.fingers[side]) as FingerKey[]) {
                                const finger = organ.fingers[side][fingerKey];
                                if (!finger.selected || !finger.bodyPartId) continue;

                                totalAmount += amountNumber(finger.amount);
                                if (firstStandardMedicalExpenseId === undefined) {
                                    firstStandardMedicalExpenseId = finger.standardMedicalExpenseId;
                                }
                            }
                        }

                        if (firstStandardMedicalExpenseId !== undefined) {
                            caseItems.push({
                                tempCaseItemId: undefined,
                                tempCaseId: undefined,
                                inputToStandardMappingId: benefitItem?.inputToStandardMappingId ?? 0,
                                standardMedicalExpenseId: firstStandardMedicalExpenseId ?? 0,
                                quantity: benefitItem?.maxQuantity ?? 1,
                                perUnit: benefitItem?.pricePerUnit ?? 0,
                                originalAmount: totalAmount,
                                discountAmount: 0,
                                netCaseAmount: organ.totalAmount,
                                medicalTypeId: benefitItem?.medicalTypeId,
                                nonCoveredAmount: amountNumber(organ.uncoveredAmount),
                                nonCoveredReasonId: organ.uncoveredReason ?? 0,
                            });
                        }
                    } else if (organ.bodyPartId) {
                        caseItems.push({
                            tempCaseItemId: undefined,
                            tempCaseId: undefined,
                            inputToStandardMappingId: benefitItem?.inputToStandardMappingId ?? 0,
                            standardMedicalExpenseId: organ.standardMedicalExpenseId ?? 0,
                            quantity: benefitItem?.maxQuantity ?? 1,
                            perUnit: benefitItem?.pricePerUnit ?? 0,
                            originalAmount: amountNumber(organ.amount),
                            discountAmount: 0,
                            netCaseAmount: organ.totalAmount,
                            medicalTypeId: benefitItem?.medicalTypeId ?? undefined,
                            nonCoveredAmount: amountNumber(organ.uncoveredAmount),
                            nonCoveredReasonId: organ.uncoveredReason ?? 0,
                        });
                    }
                }
            } else if (isManualIPD) {
                caseItems = items
                    .filter((item) => item.benefitId != null)
                    .map((item) => {
                        const originalAmount = Number(values.benefitAmounts[item.benefitId!] ?? 0);
                        return {
                            tempCaseItemId: undefined,
                            tempCaseId: undefined,
                            inputToStandardMappingId: item.inputToStandardMappingId ?? undefined,
                            standardMedicalExpenseId: item.standardMedicalExpenseId ?? undefined,
                            quantity: item.maxQuantity ?? undefined,
                            perUnit: item.pricePerUnit ?? undefined,
                            originalAmount: originalAmount,
                            discountAmount: undefined,
                            netCaseAmount: undefined,
                            medicalTypeId: item.medicalTypeId,
                            nonCoveredAmount: undefined,
                            nonCoveredReasonId: undefined,
                        };
                    })
                    .filter((d) => d.originalAmount > 0);
            } else {
                const matched = items[items.length - 1];
                if (matched) {
                    caseItems = [
                        {
                            tempCaseItemId: undefined,
                            tempCaseId: undefined,
                            inputToStandardMappingId: matched.inputToStandardMappingId ?? undefined,
                            standardMedicalExpenseId: matched.standardMedicalExpenseId ?? undefined,
                            quantity: matched.maxQuantity ?? undefined,
                            perUnit: matched.pricePerUnit ?? undefined,
                            originalAmount: values.transferAmount ?? undefined,
                            discountAmount: undefined,
                            netCaseAmount: undefined,
                            medicalTypeId: matched.medicalTypeId ?? undefined,
                            nonCoveredAmount: undefined,
                            nonCoveredReasonId: undefined,
                        },
                    ];
                }
            }
            dispatch(setCaseItems(caseItems));
            console.log("caseItems", caseItems);

            dispatch(
                setClaimForm({
                    ...values,
                    ocrDocument: !isMedical ? undefined : ocr.ocrDocumentPayload(ocr.ocrResult, ocr.ocrDocumentIds),
                })
            );
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
        6, // PH
        undefined,
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
    // const { data: customerBenefit, isLoading: customerBenefitLoading } = useGetCustomerBenefitDetailSearch(
    //     insured?.policyCode,
    //     0,
    //     formik.values.incidentDate,
    //     false,
    //     formik.values.incidentTypeId,
    //     formik.values.coverageTypeId,
    //     formik.values.medicalTypeId,
    //     formik.values.causeOfIncidentId
    // );
    const FORMAT_TYPE_MAP: Record<string, number> = {
        "2-1": 7,
        "2-2": 8,
        "2-6": 12,
        "3-2": 9,
    };
    const formatType = FORMAT_TYPE_MAP[`${formik.values.coverageTypeId}-${formik.values.medicalTypeId}`] ?? undefined;

    const { data: customerBenefit, isLoading: customerBenefitLoading } = useGetCustomerBenefitDetailHalf(
        insured?.policyCode,
        0,
        formik.values.incidentDate,
        isContinuous,
        formik.values.incidentTypeId,
        formik.values.coverageTypeId,
        formik.values.medicalTypeId,
        formik.values.causeOfIncidentId,
        formatType
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

        // เช็คว่า combo นี้ต้อง auto-select อะไรไหม
        const isMedicalAuto =
            formik.values.coverageTypeId === 3 &&
            (formik.values.incidentTypeId === 2 || formik.values.incidentTypeId === 3);
        const isCauseAuto = formik.values.coverageTypeId === 5 && formik.values.incidentTypeId === 2;

        const autoMedical = isMedicalAuto
            ? incidentTypeMapping?.data?.find(
                  (i) =>
                      i.coverageTypeId === 3 &&
                      (formik.values.incidentTypeId === 2 || formik.values.incidentTypeId === 3)
              )
            : undefined;
        const autoCause = isCauseAuto
            ? incidentTypeMapping?.data?.find((i) => i.coverageTypeId === 5 && i.incidentTypeId === 2)
            : undefined;

        // ➕ reset + auto-select ในรอบเดียว ไม่แยกกัน ไม่มี race
        formik.setValues(
            {
                ...formik.values,
                medicalTypeId: autoMedical?.medicalTypeId ?? undefined,
                medicalTypeName: autoMedical?.medicalTypeCode ?? undefined,
                causeOfIncidentId: autoCause?.causeOfIncidentId ?? undefined,
                causeOfIncidentName: autoCause?.causeOfIncidentName ?? undefined,
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
                diagnoses: [{ icd10Id: undefined, icd10Detail: undefined }],
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
    }, [formik.values.coverageTypeId, formik.values.incidentTypeId, incidentTypeMapping]);

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
        insured,
        customerBenefit,
        incidentTypeLoading,
        incidentTypeMappingLoading,
        customerBenefitLoading,
        ...ocr,
    };
};

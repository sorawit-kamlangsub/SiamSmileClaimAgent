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
import { CauseOfIncident, CoverageType, IncidentType, MedicalType } from "../../../../../functionHelpers";
import { CaseItemV2Request } from "../../../../../api/coreClaimApi.client";
import { useParams } from "react-router-dom";
interface Options {
    onNext: () => void;
}

export const useClaimPHForm = ({ onNext }: Options) => {
    const dispatch = useAppDispatch();
    const { userProfile } = useAuth();
    const { isContinuous: isContinuousParam } = useParams();
    const isContinuous = isContinuousParam ? atob(isContinuousParam) === "true" : false;
    const { form, oldClaim, insured, documentDetailById, organLossItems } = useAppSelector(claimPHSelector);
    const ocr = useOcrDocumentScan();
    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const docData = Object.values(documentDetailById);

    const formik = useFormik<ClaimFormValues>({
        initialValues: { ...form, serviceProviderId: userProfile?.userId },
        enableReinitialize: true,
        validate: (values) => {
            const errors: FormikErrors<ClaimFormValues> = {};
            const req = "โปรดระบุ";
            const today = dayjs().endOf("day");

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
            if (!values.incidentDate) {
                errors.incidentDate = "กรุณาระบุวันที่เกิดเหตุ";
            } else if (dayjs(values.incidentDate).isAfter(today)) {
                errors.incidentDate = "วันที่เกิดเหตุต้องไม่เป็นวันที่อนาคต";
            } else if (insured?.coverageFrom) {
                const incidentDate = dayjs(values.incidentDate);
                const coverageFrom = dayjs(insured.coverageFrom);

                if (incidentDate.isBefore(coverageFrom, "day")) {
                    errors.incidentDate = "วันที่เกิดเหตุต้องไม่ก่อนวันเริ่มความคุ้มครอง";
                } else if (insured?.coverageTo) {
                    const coverageTo = dayjs(insured.coverageTo);
                    if (incidentDate.isAfter(coverageTo, "day")) {
                        errors.incidentDate = "วันที่เกิดเหตุต้องไม่เกินวันสิ้นสุดความคุ้มครอง";
                    }
                }
            }

            if (isMedical) {
                if (!values.admissionDate) {
                    errors.admissionDate = "กรุณาระบุวันที่เข้าโรงพยาบาล";
                } else if (dayjs(values.admissionDate).isAfter(today)) {
                    errors.admissionDate = "วันที่เข้าโรงพยาบาลต้องไม่เป็นวันที่อนาคต";
                } else if (values.incidentDate && dayjs(values.admissionDate).isBefore(values.incidentDate, "day")) {
                    errors.admissionDate = "วันที่เข้าโรงพยาบาลต้องไม่น้อยกว่าวันที่เกิดเหตุ";
                }

                if (isIPD) {
                    if (!values.dischargeDate) {
                        errors.dischargeDate = "กรุณาระบุวันที่ออกโรงพยาบาล";
                    } else if (dayjs(values.dischargeDate).isAfter(today)) {
                        errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องไม่เป็นวันที่อนาคต";
                    } else if (
                        values.incidentDate &&
                        dayjs(values.dischargeDate).isBefore(values.incidentDate, "day")
                    ) {
                        errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องไม่ก่อนวันที่เกิดเหตุ";
                    } else if (
                        values.admissionDate &&
                        dayjs(values.dischargeDate).isBefore(values.admissionDate, "day")
                    ) {
                        errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องหลังวันที่เข้าโรงพยาบาล";
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

            // ── ตรวจความคุ้มครองตามวันที่เกิดเหตุ ──
            const hasBenefitQueryParams = Boolean(
                values.incidentTypeId &&
                    values.coverageTypeId &&
                    values.incidentDate &&
                    (isMedical ? values.medicalTypeId : isCause ? values.causeOfIncidentId : true)
            );
            if (hasBenefitQueryParams && !customerBenefitLoading && (customerBenefit?.data?.length ?? 0) === 0) {
                errors.incidentDate = "ไม่มีความคุ้มครองในวันที่เกิดเหตุ";
            }

            // ── จำนวนเงิน ──
            if (!values.transferAmount || values.transferAmount <= 0) errors.transferAmount = req;
            else if ((isDeath || isDisability || isIPD) && Number(values.transferAmount) > maxTransferAmount) {
                errors.transferAmount = `ไม่เกินวงเงิน${
                    isContinuous ? "คงเหลือ" : "สูงสุด"
                } ${maxTransferAmount.toLocaleString("th-TH")} บาท`;
            }
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
            let caseItems: CaseItemV2Request[] = [];

            if (isDisability) {
                const benefitItem = customerBenefit?.data?.[0];

                for (const organ of organLossItems) {
                    let totalAmount = 0;
                    if (organ.fingers) {
                        const sides: ("left" | "right")[] = ["left", "right"];

                        for (const side of sides) {
                            for (const fingerKey of Object.keys(organ.fingers[side]) as FingerKey[]) {
                                const finger = organ.fingers[side][fingerKey];
                                if (!finger.selected || !finger.bodyPartId) continue;

                                totalAmount += amountNumber(finger.amount);
                            }
                        }
                    } else if (organ.bodyPartId) {
                        totalAmount = amountNumber(organ.amount);
                    }
                    caseItems.push({
                        inputToStandardMappingId: benefitItem?.inputToStandardMappingId ?? 0,
                        standardMedicalExpenseId: benefitItem?.standardMedicalExpenseId ?? 0,
                        quantity: 1,
                        perUnit: benefitItem?.pricePerUnit ?? 0,
                        originalAmount: totalAmount,
                        discountAmount: 0,
                        netCaseAmount: organ.totalAmount,
                        medicalTypeId: benefitItem?.medicalTypeId ?? undefined,
                        nonCoveredAmount: amountNumber(organ.uncoveredAmount),
                        nonCoveredReasonId: organ.uncoveredReason ?? 0,
                    });
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
                            quantity: 1,
                            perUnit: item.pricePerUnit ?? undefined,
                            originalAmount: originalAmount,
                            discountAmount: 0,
                            netCaseAmount: originalAmount,
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
                            inputToStandardMappingId: matched.inputToStandardMappingId ?? undefined,
                            standardMedicalExpenseId: matched.standardMedicalExpenseId ?? undefined,
                            quantity: 1,
                            perUnit: matched.pricePerUnit ?? undefined,
                            originalAmount: values.transferAmount ?? 0,
                            discountAmount: 0,
                            netCaseAmount: values.transferAmount ?? 0,
                            medicalTypeId: matched.medicalTypeId ?? undefined,
                            nonCoveredAmount: undefined,
                            nonCoveredReasonId: undefined,
                        },
                    ];
                }
            }
            dispatch(setCaseItems(caseItems));

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
        undefined,
        isContinuous === false ? undefined : true
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
    const getFormatType = (
        incidentTypeId?: number,
        coverageTypeId?: number,
        medicalTypeId?: number,
        causeOfIncidentId?: number
    ): number | undefined => {
        // ค่ารักษา (OPD / IPD / DayCase) - ทั้งเจ็บป่วยและอุบัติเหตุ
        if (
            coverageTypeId === CoverageType.Medical &&
            [MedicalType.OPD, MedicalType.IPD, MedicalType.DayCaseSurgery].includes(medicalTypeId ?? 0)
        ) {
            return 7;
        }

        // ชดเชย (Compensate Half) - ทั้งเจ็บป่วยและอุบัติเหตุ
        if (coverageTypeId === CoverageType.Compensate) {
            return 7;
        }

        // Death
        if (coverageTypeId === CoverageType.Death) {
            // เจ็บป่วย -> โรคทั่วไป
            if (incidentTypeId === IncidentType.Illness && causeOfIncidentId === CauseOfIncident.Illness) {
                return 4;
            }
            // อุบัติเหตุ -> อุบัติเหตุทั่วไป / ขับขี่-โดยสาร จยย. / ฆาตกรรม
            if (
                incidentTypeId === IncidentType.Accident &&
                [CauseOfIncident.Accident, CauseOfIncident.Motorcycle, CauseOfIncident.Murder].includes(
                    causeOfIncidentId ?? 0
                )
            ) {
                return 4;
            }
        }

        if (coverageTypeId === CoverageType.Disability) {
            return 3;
        }

        return undefined;
    };

    const formatType = getFormatType(
        formik.values.incidentTypeId,
        formik.values.coverageTypeId,
        formik.values.medicalTypeId,
        formik.values.causeOfIncidentId
    );

    const { data: customerBenefit, isLoading: customerBenefitLoading } = useGetCustomerBenefitDetailHalf(
        insured?.policyCode,
        formik.values.incidentDate,
        isContinuous,
        formik.values.incidentTypeId,
        formik.values.coverageTypeId,
        formik.values.medicalTypeId ?? 0,
        formik.values.causeOfIncidentId,
        formatType,
        undefined,
        undefined,
        isContinuous ? oldClaim?.claimNo : undefined
    );

    const isFirstRenderIncident = useRef(true);
    const isFirstRenderCoverage = useRef(true);

    useEffect(() => {
        if (isFirstRenderIncident.current) {
            isFirstRenderIncident.current = false;
            return;
        }
        // เคลมต่อเนื่อง: prefill ค่าจากเคลมตั้งต้น ไม่ต้องรีเซ็ต cascade
        if (isContinuous) return;
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
                nplAmount: undefined,
                symptomType: 1,
                deathPlaceType: 2,
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

    const prevIncidentTypeId = useRef(formik.values.incidentTypeId);

    useEffect(() => {
        if (isFirstRenderCoverage.current) {
            isFirstRenderCoverage.current = false;
            return;
        }
        if (prevIncidentTypeId.current !== formik.values.incidentTypeId) {
            prevIncidentTypeId.current = formik.values.incidentTypeId;
            return;
        }
        // เคลมต่อเนื่อง: prefill ค่าจากเคลมตั้งต้น ไม่ต้องรีเซ็ต cascade
        if (isContinuous) return;
        if (!formik.values.coverageTypeId) return;

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
                nplAmount: undefined,
                symptomType: 1,
                deathPlaceType: 2,
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
    // เคลมต่อเนื่องปกติ: default ค่าจากเคลมตั้งต้น (ครั้งเดียว)
    const didPrefillContinuous = useRef(false);
    useEffect(() => {
        if (!isContinuous || !oldClaim || didPrefillContinuous.current) return;
        didPrefillContinuous.current = true;
        formik.setValues(
            {
                ...formik.values,
                incidentTypeId: oldClaim.incidentTypeId ?? formik.values.incidentTypeId,
                coverageTypeId: oldClaim.coverageTypeId ?? formik.values.coverageTypeId,
                medicalTypeId: oldClaim.medicalTypeId ?? formik.values.medicalTypeId,
                incidentDate: oldClaim.incidentDate ? dayjs(oldClaim.incidentDate) : formik.values.incidentDate,
                chiefComplaintId: oldClaim.chiefComplaintId ?? formik.values.chiefComplaintId,
                remark: oldClaim.chiefComplaintCustom ?? formik.values.remark,
            },
            false
        );
    }, [isContinuous, oldClaim]);

    const maxTransferAmount = useMemo(() => {
        const data = customerBenefit?.data ?? [];
        if (data.length === 0) return 0;
        // เคลมต่อเนื่อง: จำกัดด้วย benefit คงเหลือ (remainAmount) แทนวงเงินสูงสุด (maxPrice)
        const last = data[data.length - 1];
        return (isContinuous ? last.remainAmount : last.maxPrice) ?? 0;
    }, [customerBenefit?.data, isContinuous]);

    const isIncidentDateDisabled = isContinuous;
    // เคลมต่อเนื่อง: ยังรอข้อมูลเคลมตั้งต้นมา prefill (icD10Id ฯลฯ)
    const isOldClaimLoading = isContinuous && !oldClaim;
    return {
        formik,
        isContinuous,
        isIncidentDateDisabled,
        isOldClaimLoading,
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
        maxTransferAmount,
        ...ocr,
    };
};

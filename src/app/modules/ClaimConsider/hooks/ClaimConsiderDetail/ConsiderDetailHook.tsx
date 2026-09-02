import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../api/coreClaimApi";
import {
    useGetDecisionReason,
    useGetIncidentType,
    useGetIncidentTypeMapping,
} from "../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { claimConsiderSelector, ClaimConsiderValues, setClaimForm } from "../../store/claimConsiderSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { FormikErrors, useFormik } from "formik";
import { ChipOption } from "../../../CreatedClaim/components/CreateClaim/ChipSelector";
import dayjs from "dayjs";
import { setEnabled } from "../../../CreatedClaim/store/claimPHSlice";
import { CoverageType } from "../../../../functionHelpers";
import { CaseDocumentV2Request } from "../../../../api/coreClaimApi.client";
const calculateStayDays = (
    admissionDate: dayjs.Dayjs | null | undefined,
    admissionTime: dayjs.Dayjs | null | undefined,
    dischargeDate: dayjs.Dayjs | null | undefined,
    dischargeTime: dayjs.Dayjs | null | undefined
): number => {
    if (!admissionDate || !admissionTime || !dischargeDate || !dischargeTime) {
        return 0;
    }

    const admission = admissionDate.hour(admissionTime.hour()).minute(admissionTime.minute()).second(0).millisecond(0);

    const discharge = dischargeDate.hour(dischargeTime.hour()).minute(dischargeTime.minute()).second(0).millisecond(0);

    const diffMinutes = discharge.diff(admission, "minute");

    if (diffMinutes <= 0) {
        return 0;
    }

    const SIX_HOURS = 6 * 60;
    const FULL_DAY = 24 * 60;

    const fullDays = Math.floor(diffMinutes / FULL_DAY);

    const remainingMinutes = diffMinutes % FULL_DAY;

    return fullDays + (remainingMinutes >= SIX_HOURS ? 1 : 0);
};
const useConsiderDetailHook = () => {
    const { id } = useParams();
    const claimId = id ? atob(id) : undefined;
    const dispatch = useAppDispatch();
    const { form } = useAppSelector(claimConsiderSelector);
    const [attachedDocuments, setAttachedDocuments] = useState<CaseDocumentV2Request[]>([]);
    const { data: detailData, isLoading: detailDataLoading } = useGetClaimDetailConsider(claimId ?? "");
    const detail = detailData?.data;
    const { data: customerDetailData, isLoading: customerDetailLoading } = useGetCustomerDetailById(
        detail?.customerId ?? 0
    );
    const customerDetail = customerDetailData?.data;
    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const incidentType: ClaimTypeOption[] =
        incidentTypeRaw?.data?.map((item) => ({
            id: item.incidentTypeId ?? 0,
            name: item.incidentTypeNameTH ?? "",
            icon: INCIDENT_ICON_MAP[item.incidentTypeId ?? 0],
        })) ?? [];

    const formik = useFormik<ClaimConsiderValues>({
        initialValues: { ...form },
        validate: (values) => {
            const errors: FormikErrors<ClaimConsiderValues> = {};
            const req = "โปรดระบุ";
            const today = dayjs().endOf("day");

            if (!values.incidentTypeId) errors.incidentTypeId = req;
            if (!values.coverageTypeId) errors.coverageTypeId = req;
            if (!values.medicalTypeId) errors.medicalTypeId = req;
            if (!values.notificationDate) errors.notificationDate = req;
            if (!values.documentCompleteDate) errors.documentCompleteDate = req;
            if (!values.incidentDate) {
                errors.incidentDate = "กรุณาระบุวันที่เกิดเหตุ";
            } else if (dayjs(values.incidentDate).isAfter(today)) {
                errors.incidentDate = "วันที่เกิดเหตุต้องไม่เป็นวันที่อนาคต";
            }

            if (!values.admissionDate) {
                errors.admissionDate = "กรุณาระบุวันที่เข้าโรงพยาบาล";
            } else if (dayjs(values.admissionDate).isAfter(today)) {
                errors.admissionDate = "วันที่เข้าโรงพยาบาลต้องไม่เป็นวันที่อนาคต";
            } else if (values.incidentDate && dayjs(values.admissionDate).isBefore(values.incidentDate, "day")) {
                errors.admissionDate = "วันที่เข้าโรงพยาบาลต้องไม่น้อยกว่าวันที่เกิดเหตุ";
            }

            if (!values.dischargeDate) {
                errors.dischargeDate = "กรุณาระบุวันที่ออกโรงพยาบาล";
            } else if (dayjs(values.dischargeDate).isAfter(today)) {
                errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องไม่เป็นวันที่อนาคต";
            } else if (values.incidentDate && dayjs(values.dischargeDate).isBefore(values.incidentDate, "day")) {
                errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องไม่ก่อนวันที่เกิดเหตุ";
            } else if (values.admissionDate && dayjs(values.dischargeDate).isBefore(values.admissionDate, "day")) {
                errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องหลังวันที่เข้าโรงพยาบาล";
            }
            if (!values.chiefComplaintId) errors.chiefComplaintId = req;
            if (!values.hospitalId) errors.hospitalId = req;
            if (!values.diagnoses[0]?.icd10Id) {
                errors.diagnoses = [
                    {
                        icd10Id: req,
                    },
                ];
            }
            return errors;
        },
        onSubmit: () => {},
    });

    const activeIncidentTypeId = formik.values.incidentTypeId || detail?.incidentTypeId || undefined;

    const { data: incidentTypeMapping, isLoading: incidentTypeMappingLoading } = useGetIncidentTypeMapping(
        activeIncidentTypeId,
        2,
        customerDetail?.productTypeId,
        undefined,
        undefined,
        undefined,
        undefined
    );

    const DEATH_DISABILITY = [CoverageType.Death, CoverageType.Disability];

    const coverageType: ClaimTypeOption[] = useMemo(
        () => [
            ...new Map(
                (incidentTypeMapping?.data ?? [])
                    .filter((item) => !DEATH_DISABILITY.includes(item.coverageTypeId ?? 0))
                    .map((item) => [
                        item.coverageTypeId,
                        {
                            id: item.coverageTypeId ?? 0,
                            name: item.coverageTypeNameTH ?? "",
                            icon: COVERAGE_ICON_MAP[item.coverageTypeId ?? 0],
                        },
                    ])
            ).values(),
        ],
        [incidentTypeMapping]
    );

    const medicalType: ChipOption[] = useMemo(
        () => [
            ...new Map(
                (incidentTypeMapping?.data ?? [])
                    .filter((item) => item.coverageTypeId === formik.values.coverageTypeId)
                    .map((item) => [
                        item.medicalTypeId,
                        { id: item.medicalTypeId ?? 0, name: item.medicalTypeCode ?? "" },
                    ])
            ).values(),
        ],
        [incidentTypeMapping, formik.values.coverageTypeId]
    );

    const causeOfIncident: ChipOption[] = useMemo(
        () => [
            ...new Map(
                (incidentTypeMapping?.data ?? [])
                    .filter((item) => item.coverageTypeId === formik.values.coverageTypeId)
                    .map((item) => [
                        item.causeOfIncidentId,
                        { id: item.causeOfIncidentId ?? 0, name: item.causeOfIncidentName ?? "" },
                    ])
            ).values(),
        ],
        [incidentTypeMapping, formik.values.coverageTypeId]
    );

    const hasSyncedMainRef = useRef(false); // incidentType, coverageType, time, diagnoses, remark
    const hasSyncedMedicalRef = useRef(false); // medicalType, causeOfIncident (ต้องรอ coverageTypeId sync ก่อน)
    const prevIncidentTypeIdRef = useRef(formik.values.incidentTypeId);
    const prevCoverageTypeIdRef = useRef(formik.values.coverageTypeId);

    // ---- phase 1: sync incidentType, coverageType, date/time, diagnoses, remark ----
    useEffect(() => {
        if (!detail || hasSyncedMainRef.current) return;
        if (incidentType.length === 0 || coverageType.length === 0) return;

        const matchedIncident = incidentType.find((item) => item.id === detail.incidentTypeId);
        if (matchedIncident) {
            formik.setFieldValue("incidentTypeId", matchedIncident.id, false);
            formik.setFieldValue("incidentTypeName", matchedIncident.name, false);
            prevIncidentTypeIdRef.current = matchedIncident.id;
        }

        const matchedCoverage = coverageType.find((item) => item.id === detail.coverageTypeId);
        if (matchedCoverage) {
            formik.setFieldValue("coverageTypeId", matchedCoverage.id, false);
            formik.setFieldValue("coverageTypeName", matchedCoverage.name, false);
            prevCoverageTypeIdRef.current = matchedCoverage.id;
        }

        if (detail.admissionDate) {
            formik.setFieldValue("admissionDate", dayjs(detail.admissionDate), false);
            formik.setFieldValue("admissionTime", dayjs(detail.admissionDate), false);
        }
        if (detail.incidentDate) {
            formik.setFieldValue("incidentDate", dayjs(detail.incidentDate), false);
            formik.setFieldValue("incidentTime", dayjs(detail.incidentDate), false);
        }
        if (detail.dischargeDate) {
            formik.setFieldValue("dischargeDate", dayjs(detail.dischargeDate), false);
            formik.setFieldValue("dischargeTime", dayjs(detail.dischargeDate), false);
        }

        formik.setFieldValue(
            "diagnoses",
            [
                { icd10Id: detail.icD10_1stId ?? undefined, icd10Detail: undefined },
                { icd10Id: detail.icD10_2ndId ?? undefined, icd10Detail: undefined },
                { icd10Id: detail.icD10_3rdId ?? undefined, icd10Detail: undefined },
            ],
            false
        );

        formik.setFieldValue("detail", detail.remark, false);

        hasSyncedMainRef.current = true;
    }, [detail, incidentType, coverageType]);

    // ---- phase 2: sync medicalType/causeOfIncident (ต้องรอ coverageTypeId ถูก set ไปแล้วจาก phase 1 ก่อน) ----
    useEffect(() => {
        if (!detail || !hasSyncedMainRef.current || hasSyncedMedicalRef.current) return;
        if (medicalType.length === 0 && causeOfIncident.length === 0) return;

        const matchedMedical = medicalType.find((item) => item.id === detail.medicalTypeId);
        if (matchedMedical) {
            formik.setFieldValue("medicalTypeId", matchedMedical.id, false);
            formik.setFieldValue("medicalTypeName", matchedMedical.name, false);
        }

        const matchedCause = causeOfIncident.find((item) => item.id === detail.causeOfIncidentId);
        if (matchedCause) {
            formik.setFieldValue("causeOfIncidentId", matchedCause.id, false);
            formik.setFieldValue("causeOfIncidentName", matchedCause.name, false);
        }

        hasSyncedMedicalRef.current = true;
    }, [detail, medicalType, causeOfIncident]);

    // ---- reset cascade: user เปลี่ยน incidentTypeId เอง ----
    useEffect(() => {
        if (!hasSyncedMainRef.current) return;
        if (prevIncidentTypeIdRef.current === formik.values.incidentTypeId) return;

        formik.setFieldValue("coverageTypeId", undefined, false);
        formik.setFieldValue("coverageTypeName", undefined, false);
        formik.setFieldValue("medicalTypeId", undefined, false);
        formik.setFieldValue("causeOfIncidentId", undefined, false);
        prevIncidentTypeIdRef.current = formik.values.incidentTypeId;
        prevCoverageTypeIdRef.current = undefined;
    }, [formik.values.incidentTypeId]);

    // ---- reset cascade: user เปลี่ยน coverageTypeId เอง ----
    useEffect(() => {
        if (!hasSyncedMainRef.current) return;
        if (prevCoverageTypeIdRef.current === formik.values.coverageTypeId) return;

        formik.setFieldValue("medicalTypeId", undefined, false);
        formik.setFieldValue("causeOfIncidentId", undefined, false);
        prevCoverageTypeIdRef.current = formik.values.coverageTypeId;
    }, [formik.values.coverageTypeId]);

    useEffect(() => {
        const totalDays = calculateStayDays(
            formik.values.admissionDate,
            formik.values.admissionTime,
            formik.values.dischargeDate,
            formik.values.dischargeTime
        );

        if (formik.values.totalDays !== totalDays) {
            formik.setFieldValue("totalDays", totalDays, false);
        }
    }, [
        formik.values.admissionDate,
        formik.values.admissionTime,
        formik.values.dischargeDate,
        formik.values.dischargeTime,
    ]);
    useEffect(() => {
        if (!detail) return;
        dispatch(setEnabled(true));

        return () => {
            dispatch(setEnabled(false));
        };
    }, [detail]);

    useEffect(() => {
        dispatch(setClaimForm(formik.values));
        console.log("sync to redux →", formik.values);
    }, [formik.values]);

    const { data: decisionReason, isLoading: decisionReasonLoading } = useGetDecisionReason(
        undefined,
        formik.values.considerResult
    );

    return {
        formik,
        detailData,
        customerDetailData,
        incidentTypeMapping,
        coverageType,
        medicalType,
        causeOfIncident,
        detailDataLoading,
        customerDetailLoading,
        incidentTypeMappingLoading,
        incidentType,
        incidentTypeLoading,
        decisionReason,
        decisionReasonLoading,
        attachedDocuments,
        setAttachedDocuments,
    };
};

export default useConsiderDetailHook;

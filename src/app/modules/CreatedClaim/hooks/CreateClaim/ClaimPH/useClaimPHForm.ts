import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useFormik, FormikErrors } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { ClaimFormValues, claimPHSelector, setClaimForm } from "../../../store/claimPHSlice";
import { useAuth } from "../../../../_auth";
import { ChipOption } from "../../../components/CreateClaim/ChipSelector";
import {
    useGetCauseOfAccident,
    useGetCoverageType,
    useGetIncidentType,
    useGetMedicaltype,
    useGetZebraCarOwner,
} from "../../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../components/CreateClaim/ClaimTypeSelector";

interface Options {
    onNext: () => void;
}

export const useClaimPHForm = ({ onNext }: Options) => {
    const dispatch = useAppDispatch();
    const { userProfile } = useAuth();
    const { form, isContinuous, oldClaim } = useAppSelector(claimPHSelector);
    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const { data: coverageTypeRaw, isLoading: coverageTypeLoading } = useGetCoverageType();
    const { data: medicalTypeRaw, isLoading: medicalTypeLoading } = useGetMedicaltype(2);
    const { data: causeOfAccidentRaw, isLoading: causeOfAccidentLoading } = useGetCauseOfAccident();
    const { data: zebraCarOwner, isLoading: zebraCarOwnerLoading } = useGetZebraCarOwner();

    const ALLOWED_INCIDENT_IDS = [2, 3];
    const ALLOWED_COVERAGE_BY_INCIDENT: Record<number, number[]> = {
        2: [2, 3, 5], // เจ็บป่วย → ค่ารักษา, ค่าชดเชย, เสียชีวิต
        3: [2, 3, 4, 5], // อุบัติเหตุ → ทุกอัน
    };
    const MEDICAL_TYPE_BY_COVERAGE: Record<number, Record<number, number[]>> = {
        2: {
            // เจ็บป่วย > ค่ารักษา/ค่าชดเชย
            2: [1, 2, 6],
            3: [2],
        },
        3: {
            // อุบัติเหตุ > ค่ารักษา/ค่าชดเชย
            2: [1, 2],
            3: [2],
        },
    };

    const CAUSE_OF_ACCIDENT_BY_COVERAGE: Record<number, Record<number, number[]>> = {
        2: {
            // เจ็บป่วย > เสียชีวิต > โรคทัวไป
            5: [2],
        },
        3: {
            // อุบัติเหตุ > เสียชีวิต/ทุพพลภาพ > อุบัติเหตุ/ขับขี่รถ/ฆาตกรรม
            4: [3, 4],
            5: [3, 4, 5],
        },
    };

    //     incidentTypeId: number | undefined,
    //     coverageTypeId: number | undefined
    // ): MedicalOption[] => {
    //     if (!incidentTypeId || !coverageTypeId) return [];

    //     // ค่ารักษา (2) หรือ ค่าชดเชย (3) → ใช้ medicalType
    //     if (coverageTypeId === 2 || coverageTypeId === 3) {
    //         return (
    //             medicalType?.data?.map((item) => ({
    //                 medicalTypeId: item.medicalTypeId ?? 0,
    //                 medicalTypeName: item.medicalTypeCode ?? "",
    //             })) ?? []
    //         );
    //     }

    //     // ทุพพลภาพ (4) หรือ เสียชีวิต (5) → ใช้ causeOfAccident
    //     if (coverageTypeId === 4 || coverageTypeId === 5) {
    //         // เจ็บป่วย + เสียชีวิต → disabled
    //         if (incidentTypeId === 2 && coverageTypeId === 5) {
    //             return (
    //                 causeOfAccidentRaw?.data
    //                     ?.filter((item) => item.causeOfIncidentId === 2) //โรคทั่วไป
    //                     .map((item) => ({
    //                         medicalTypeId: item.causeOfIncidentId ?? 0,
    //                         medicalTypeName: item.causeOfIncidentName ?? "",
    //                         disabled: true,
    //                     })) ?? []
    //             );
    //         }
    //         if (incidentTypeId === 3 && coverageTypeId === 4) {
    //             return (
    //                 causeOfAccident?.data
    //                     ?.filter(
    //                         (item) =>
    //                             ALLOWED_CAUSEOFACCIDENT_IDS.includes(item.causeOfIncidentId ?? 0) &&
    //                             item.causeOfIncidentId !== 5
    //                     )
    //                     .map((item) => ({
    //                         medicalTypeId: item.causeOfIncidentId ?? 0,
    //                         medicalTypeName: item.causeOfIncidentName ?? "",
    //                         disabled: true,
    //                     })) ?? []
    //             );
    //         }
    //         return (
    //             causeOfAccident?.data
    //                 ?.filter((item) => ALLOWED_CAUSEOFACCIDENT_IDS.includes(item.causeOfIncidentId ?? 0))
    //                 .map((item) => ({
    //                     medicalTypeId: item.causeOfIncidentId ?? 0,
    //                     medicalTypeName: item.causeOfIncidentName ?? "",
    //                 })) ?? []
    //         );
    //     }

    //     return [];
    // };
    const formik = useFormik<ClaimFormValues>({
        initialValues: { ...form, serviceProvider: userProfile?.userId },
        enableReinitialize: true,
        validate: (values) => {
            const errors: FormikErrors<ClaimFormValues> = {};
            const req = "โปรดระบุ";

            // ── ข้อมูลผู้ให้บริการ ──
            if (!values.documentReceiver) errors.documentReceiver = req;
            if (!values.serviceProvider) errors.serviceProvider = req;
            if (!values.carOwner) errors.carOwner = req;

            // ── ประเภทการเคลม ──
            if (!values.incidentTypeId) errors.incidentTypeId = req;
            if (!values.coverageTypeId) errors.coverageTypeId = req;

            const isMedical = values.coverageTypeId === 2 || values.coverageTypeId === 3;
            const isCause = values.coverageTypeId === 4 || values.coverageTypeId === 5;
            const isIPD = values.medicalTypeId === 2 || values.medicalTypeId === 6;

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
            if (values.symptomType === "ระบุอาการ" && !values.chiefComplain) errors.chiefComplain = req;
            if (values.symptomType === "อื่นๆ" && !values.remark) errors.remark = req;

            // ── จำนวนเงิน ──
            if (!values.claimAmount || values.claimAmount <= 0) errors.claimAmount = req;

            return errors;
        },
        onSubmit: (values) => {
            dispatch(setClaimForm(values));
            onNext();
        },
    });
    const incidentType: ClaimTypeOption[] =
        incidentTypeRaw?.data
            ?.filter((item) => ALLOWED_INCIDENT_IDS.includes(item.incidentTypeId ?? 0))
            .map((item) => ({
                id: item.incidentTypeId ?? 0,
                name: item.incidentTypeNameTH ?? "",
                icon: INCIDENT_ICON_MAP[item.incidentTypeId ?? 0],
            })) ?? [];

    const coverageType: ClaimTypeOption[] =
        coverageTypeRaw?.data
            ?.filter(
                (item) =>
                    ALLOWED_COVERAGE_BY_INCIDENT[formik.values.incidentTypeId ?? 0]?.includes(item.coverageTypeId ?? 0)
            )
            .map((item) => ({
                id: item.coverageTypeId ?? 0,
                name: item.coverageTypeNameTH ?? "",
                icon: COVERAGE_ICON_MAP[item.coverageTypeId ?? 0],
            })) ?? [];

    const medicalType: ChipOption[] =
        medicalTypeRaw?.data
            ?.filter(
                (item) =>
                    MEDICAL_TYPE_BY_COVERAGE[formik.values.incidentTypeId ?? 0]?.[
                        formik.values.coverageTypeId ?? 0
                    ]?.includes(item.medicalTypeId ?? 0)
            )
            .map((item) => ({
                id: item.medicalTypeId ?? 0,
                name: item.medicalTypeCode ?? "",
            })) ?? [];

    const causeOfAccident: ChipOption[] =
        causeOfAccidentRaw?.data
            ?.filter(
                (item) =>
                    CAUSE_OF_ACCIDENT_BY_COVERAGE[formik.values.incidentTypeId ?? 0]?.[
                        formik.values.coverageTypeId ?? 0
                    ]?.includes(item.causeOfIncidentId ?? 0)
            )
            .map((item) => ({
                id: item.causeOfIncidentId ?? 0,
                name: item.causeOfIncidentName ?? "",
                disabled: item.causeOfIncidentId === 2,
            })) ?? [];
    const isFirstRenderIncident = useRef(true);
    const isFirstRenderCoverage = useRef(true);

    useEffect(() => {
        if (isFirstRenderIncident.current) {
            isFirstRenderIncident.current = false;
            return;
        }
        if (!formik.values.incidentTypeId) return;
        formik.setFieldValue("coverageTypeId", undefined, false);
        formik.setFieldValue("coverageTypeName", undefined, false);
        formik.setFieldValue("medicalTypeId", undefined, false);
        formik.setFieldValue("medicalTypeName", undefined, false);
        formik.setFieldValue("causeOfIncidentId", undefined, false);
        formik.setFieldValue("causeOfIncidentName", undefined, false);
        formik.setFieldValue("admissionDate", dayjs(), false);
        formik.setFieldValue("receiveDocDate", dayjs(), false);
        formik.setFieldValue("deathDate", dayjs(), false);
    }, [formik.values.incidentTypeId]);

    useEffect(() => {
        if (isFirstRenderCoverage.current) {
            isFirstRenderCoverage.current = false;
            return;
        }
        if (!formik.values.coverageTypeId) return;
        formik.setFieldValue("medicalTypeId", undefined, false);
        formik.setFieldValue("medicalTypeName", undefined, false);
        formik.setFieldValue("causeOfIncidentId", undefined, false);
        formik.setFieldValue("causeOfIncidentName", undefined, false);
        formik.setFieldValue("admissionDate", dayjs(), false);
        formik.setFieldValue("receiveDocDate", dayjs(), false);
        formik.setFieldValue("deathDate", dayjs(), false);
    }, [formik.values.coverageTypeId]);

    useEffect(() => {
        if (isContinuous && oldClaim?.incidentDate) {
            formik.setFieldValue("incidentDate", dayjs(oldClaim.incidentDate));
        }
    }, [isContinuous, oldClaim?.incidentDate]);
    useEffect(() => {
        if (causeOfAccident.length === 1) {
            formik.setFieldValue("causeOfIncidentId", causeOfAccident[0].id, false);
            formik.setFieldValue("causeOfIncidentName", causeOfAccident[0].name, false);
        }
    }, [formik.values.incidentTypeId, formik.values.coverageTypeId]);
    const isIncidentDateDisabled = isContinuous;

    return {
        formik,
        isContinuous,
        isIncidentDateDisabled,
        incidentType,
        coverageType,
        medicalType,
        causeOfAccident,
        zebraCarOwner,
        incidentTypeLoading,
        coverageTypeLoading,
        medicalTypeLoading,
        causeOfAccidentLoading,
        zebraCarOwnerLoading,
    };
};

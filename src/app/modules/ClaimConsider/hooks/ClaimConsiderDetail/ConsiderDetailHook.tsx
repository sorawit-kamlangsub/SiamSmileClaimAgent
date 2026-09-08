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
import { claimConsiderSelector, ClaimConsiderValues, resetState } from "../../store/claimConsiderSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { FormikErrors, useFormik } from "formik";
import { ChipOption } from "../../../CreatedClaim/components/CreateClaim/ChipSelector";
import dayjs from "dayjs";
import { setEnabled } from "../../../CreatedClaim/store/claimPHSlice";
import { CoverageType } from "../../../../functionHelpers";
import { CaseDocumentV2Request, TimeSpan } from "../../../../api/coreClaimApi.client";

/** รวมวันที่+เวลาที่กรอกแยกกันเป็น dayjs เดียว — วันที่มาจาก date picker เวลามาจาก time picker คนละ field */
const combineDateTime = (
    date: dayjs.Dayjs | null | undefined,
    time: dayjs.Dayjs | null | undefined
): dayjs.Dayjs | undefined => {
    if (!date || !time) return undefined;
    return date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0);
};

/**
 * detail.incidentTime/admissionTime/dischargeTime พิมพ์เป็น TimeSpan (object) แต่ backend ส่งจริงเป็น
 * string "HH:mm:ss" (ดู asTimeSpan ฝั่งส่งใน ClaimDetailActionHook.tsx ที่ cast กลับด้าน — สรุป TimeSpan
 * ของ NSwag ตัวนี้เป็น string เสมอ ไม่ใช่ object ที่มี .hours/.minutes) จึง parse เป็น dayjs ตรงๆ แทนการอ่าน field
 */
const parseTimeSpan = (time: TimeSpan | undefined): dayjs.Dayjs | undefined => {
    if (!time) return undefined;
    const parsed = dayjs(time as unknown as string, "HH:mm:ss");
    return parsed.isValid() ? parsed : undefined;
};

const calculateStayDays = (
    admissionDate: dayjs.Dayjs | null | undefined,
    admissionTime: dayjs.Dayjs | null | undefined,
    dischargeDate: dayjs.Dayjs | null | undefined,
    dischargeTime: dayjs.Dayjs | null | undefined
): number => {
    const admission = combineDateTime(admissionDate, admissionTime);
    const discharge = combineDateTime(dischargeDate, dischargeTime);

    if (!admission || !discharge) {
        return 0;
    }

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
            if (!values.createdDate) {
                errors.createdDate = req;
            } else if (dayjs(values.createdDate).isAfter(today)) {
                errors.createdDate = "วันที่แจ้งต้องไม่เป็นวันที่อนาคต";
            }
            if (!values.documentCompleteDate) {
                errors.documentCompleteDate = req;
            } else if (dayjs(values.documentCompleteDate).isAfter(today)) {
                errors.documentCompleteDate = "วันที่เอกสารครบต้องไม่เป็นวันที่อนาคต";
            }
            if (!values.incidentDate) {
                errors.incidentDate = "กรุณาระบุวันที่เกิดเหตุ";
            } else if (dayjs(values.incidentDate).isAfter(today)) {
                errors.incidentDate = "วันที่เกิดเหตุต้องไม่เป็นวันที่อนาคต";
            }
            if (!values.incidentTime) errors.incidentTime = req;

            if (!values.admissionDate) {
                errors.admissionDate = "กรุณาระบุวันที่เข้าโรงพยาบาล";
            } else if (dayjs(values.admissionDate).isAfter(today)) {
                errors.admissionDate = "วันที่เข้าโรงพยาบาลต้องไม่เป็นวันที่อนาคต";
            } else if (values.incidentDate && dayjs(values.admissionDate).isBefore(values.incidentDate, "day")) {
                errors.admissionDate = "วันที่เข้าโรงพยาบาลต้องไม่น้อยกว่าวันที่เกิดเหตุ";
            }
            if (!values.admissionTime) errors.admissionTime = req;

            if (!values.dischargeDate) {
                errors.dischargeDate = "กรุณาระบุวันที่ออกโรงพยาบาล";
            } else if (dayjs(values.dischargeDate).isAfter(today)) {
                errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องไม่เป็นวันที่อนาคต";
            } else if (values.incidentDate && dayjs(values.dischargeDate).isBefore(values.incidentDate, "day")) {
                errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องไม่ก่อนวันที่เกิดเหตุ";
            } else if (values.admissionDate && dayjs(values.dischargeDate).isBefore(values.admissionDate, "day")) {
                errors.dischargeDate = "วันที่ออกโรงพยาบาลต้องหลังวันที่เข้าโรงพยาบาล";
            }
            if (!values.dischargeTime) errors.dischargeTime = req;

            // ── ลำดับเวลาตามหลักความเป็นจริง: เกิดเหตุ ≤ เข้า รพ < ออก รพ ──
            // เทียบเป็น datetime เดียวกัน (วันที่+เวลารวมกัน) ไม่ใช่เทียบแยกวันกับเวลา เพราะเกิดเหตุกับ
            // เข้า รพ อาจเป็นวันเดียวกันแต่เวลาเข้า รพ ก่อนเวลาเกิดเหตุก็ได้ ซึ่ง validate ระดับวันด้านบนจับไม่ได้
            const incidentDateTime = combineDateTime(values.incidentDate, values.incidentTime);
            const admissionDateTime = combineDateTime(values.admissionDate, values.admissionTime);
            const dischargeDateTime = combineDateTime(values.dischargeDate, values.dischargeTime);

            // ── ห้ามเลือกเวลาที่ยังไม่ถึง ──
            // เช็ควันที่ด้านบน (isAfter(today)) เทียบแค่ระดับวัน ไม่พอสำหรับ "วันนี้แต่เวลาในอนาคต"
            // เช่น ตอนนี้ 10:00 แต่เลือกเวลาที่เกิดเหตุเป็น 23:00 วันนี้ — ผ่าน check วันที่แต่เป็นเวลาที่ยังไม่ถึงจริง
            const now = dayjs();
            if (!errors.incidentDate && !errors.incidentTime && incidentDateTime && incidentDateTime.isAfter(now)) {
                errors.incidentTime = "เวลาที่เกิดเหตุต้องไม่เป็นเวลาในอนาคต";
            }
            if (!errors.admissionDate && !errors.admissionTime && admissionDateTime && admissionDateTime.isAfter(now)) {
                errors.admissionTime = "เวลาที่เข้าโรงพยาบาลต้องไม่เป็นเวลาในอนาคต";
            }
            if (!errors.dischargeDate && !errors.dischargeTime && dischargeDateTime && dischargeDateTime.isAfter(now)) {
                errors.dischargeTime = "เวลาที่ออกโรงพยาบาลต้องไม่เป็นเวลาในอนาคต";
            }

            // เช็คเฉพาะตอน field วันที่/เวลาที่เกี่ยวข้องยังไม่มี error อื่นอยู่ก่อน กัน error ซ้อนทับกัน
            if (!errors.admissionDate && !errors.admissionTime && incidentDateTime && admissionDateTime) {
                if (admissionDateTime.isBefore(incidentDateTime)) {
                    errors.admissionTime = "เวลาที่เข้าโรงพยาบาลต้องไม่ก่อนเวลาที่เกิดเหตุ";
                }
            }
            if (!errors.dischargeDate && !errors.dischargeTime && admissionDateTime && dischargeDateTime) {
                if (!dischargeDateTime.isAfter(admissionDateTime)) {
                    errors.dischargeTime = "เวลาที่ออกโรงพยาบาลต้องหลังเวลาที่เข้าโรงพยาบาล";
                }
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

    const hasSyncedMainRef = useRef(false);
    const prevIncidentTypeIdRef = useRef(formik.values.incidentTypeId);
    const prevCoverageTypeIdRef = useRef(formik.values.coverageTypeId);

    // ---- เปลี่ยนเคลม (claimId เปลี่ยน) : ล้างสถานะของเคลมก่อนหน้าทิ้งทั้งหมด ----
    // ClaimDetailsTab ไม่ถูก unmount ตอนสลับไปดูอีกเคลม (คนละ path param บน route เดียวกัน) จึง
    // ต้องเคลียร์เองที่นี่ ไม่งั้น filledItems ใน Redux ค้างจากเคลมก่อนหน้า ทำให้ effect เติม
    // "รายการค่ารักษา(เบื้องต้น)" ใน ClaimExpenseDetailHook เห็น items.length > 0 อยู่แล้วและข้ามการโหลด
    // รายการของเคลมใหม่ไปเลย — และ hasSyncedMainRef ที่เป็น true ค้างจะทำให้ formik ไม่ sync ค่าจาก detail ใหม่ด้วย
    const prevClaimIdRef = useRef(claimId);
    useEffect(() => {
        if (prevClaimIdRef.current === claimId) return;
        prevClaimIdRef.current = claimId;
        dispatch(resetState());
        hasSyncedMainRef.current = false;
        prevIncidentTypeIdRef.current = undefined;
        prevCoverageTypeIdRef.current = undefined;
        formik.resetForm();
    }, [claimId]);

    // ---- phase 1: sync initial values from detail (ใช้ setValues ครั้งเดียว) ----
    useEffect(() => {
        if (!detail || hasSyncedMainRef.current) return;
        if (incidentType.length === 0 || coverageType.length === 0) return;
        if (!incidentTypeMapping?.data) return;

        const matchedIncident = incidentType.find((item) => item.id === detail.incidentTypeId);
        const matchedCoverage = coverageType.find((item) => item.id === detail.coverageTypeId);

        const newValues: Partial<ClaimConsiderValues> = {};

        if (matchedIncident) {
            newValues.incidentTypeId = matchedIncident.id;
            newValues.incidentTypeName = matchedIncident.name;
            prevIncidentTypeIdRef.current = matchedIncident.id;
        }
        if (matchedCoverage) {
            newValues.coverageTypeId = matchedCoverage.id;
            newValues.coverageTypeName = matchedCoverage.name;
            prevCoverageTypeIdRef.current = matchedCoverage.id;
        }

        // ---- คำนวณ medicalTypeId จาก incidentTypeMapping โดยตรง ----
        const mappingData = incidentTypeMapping.data;
        let medicalTypeId: number | undefined;
        let medicalTypeName: string | undefined;

        // 1. ถ้า detail มี medicalTypeId ให้ใช้ค่าจาก mapping ที่ตรงกับ incident+coverage+medical
        if (detail.medicalTypeId) {
            const found = mappingData.find(
                (item) =>
                    item.medicalTypeId === detail.medicalTypeId &&
                    item.incidentTypeId === detail.incidentTypeId &&
                    item.coverageTypeId === detail.coverageTypeId
            );
            if (found) {
                medicalTypeId = found.medicalTypeId;
                medicalTypeName = found.medicalTypeCode;
            }
        }

        // 2. ถ้ายังไม่มี และเข้าเงื่อนไขพิเศษ (incidentType 2/3 + coverageType 3) ให้ใช้ medicalTypeId = 2
        if (!medicalTypeId && matchedIncident && matchedCoverage) {
            const isTargetIncident = [2, 3].includes(matchedIncident.id);
            const isTargetCoverage = matchedCoverage.id === 3;
            if (isTargetIncident && isTargetCoverage) {
                const found = mappingData.find(
                    (item) =>
                        item.medicalTypeId === 2 &&
                        item.incidentTypeId === matchedIncident.id &&
                        item.coverageTypeId === matchedCoverage.id
                );
                if (found) {
                    medicalTypeId = 2;
                    medicalTypeName = found.medicalTypeCode;
                }
            }
        }

        if (medicalTypeId) {
            newValues.medicalTypeId = medicalTypeId;
            newValues.medicalTypeName = medicalTypeName ?? "";
        }

        // ---- วันที่และข้อมูลอื่นๆ ----
        // เวลาต้องอ่านจาก field .xTime (TimeSpan) โดยเฉพาะ ไม่ใช่ derive จาก .xDate เพราะ field วันที่กับ
        // เวลาแยกกันจาก backend — .xDate อาจไม่มีเวลาจริงติดมาด้วย (fallback ไป .xDate ไว้เผื่อ backend เก่าที่
        // ยังไม่ส่ง .xTime มา)
        if (detail.admissionDate) {
            newValues.admissionDate = dayjs(detail.admissionDate);
            newValues.admissionTime = parseTimeSpan(detail.admissionTime) ?? dayjs(detail.admissionDate);
        }
        if (detail.incidentDate) {
            newValues.incidentDate = dayjs(detail.incidentDate);
            newValues.incidentTime = parseTimeSpan(detail.incidentTime) ?? dayjs(detail.incidentDate);
        }
        if (detail.dischargeDate) {
            newValues.dischargeDate = dayjs(detail.dischargeDate);
            newValues.dischargeTime = parseTimeSpan(detail.dischargeTime) ?? dayjs(detail.dischargeDate);
        }
        if (detail.createdDate) {
            newValues.createdDate = dayjs(detail.createdDate);
        }
        if (detail.documentCompleteDate) {
            newValues.documentCompleteDate = dayjs(detail.documentCompleteDate);
        }
        newValues.hospitalId = detail.hospitalId;
        newValues.chiefComplaintId = detail.chiefComplaintId;
        newValues.diagnoses = [
            { icd10Id: detail.icD10_1stId ?? undefined, icd10Detail: undefined },
            { icd10Id: detail.icD10_2ndId ?? undefined, icd10Detail: undefined },
            { icd10Id: detail.icD10_3rdId ?? undefined, icd10Detail: undefined },
        ];
        newValues.detail = detail.remark;

        // ตั้งค่าทั้งหมดพร้อมกัน
        formik.setValues((prev) => ({ ...prev, ...newValues }), false);
        hasSyncedMainRef.current = true;
        dispatch(setEnabled(true));
    }, [detail, incidentType, coverageType, incidentTypeMapping]);

    // ---- cascade reset: จัดการเมื่อ incidentTypeId หรือ coverageTypeId เปลี่ยน ----
    useEffect(() => {
        if (!hasSyncedMainRef.current) return;

        const currentIncident = formik.values.incidentTypeId;
        const currentCoverage = formik.values.coverageTypeId;
        const prevIncident = prevIncidentTypeIdRef.current;
        const prevCoverage = prevCoverageTypeIdRef.current;

        // กรณี incidentTypeId เปลี่ยน (และไม่ใช่ undefined)
        if (currentIncident !== prevIncident && currentIncident !== undefined) {
            formik.setFieldValue("coverageTypeId", undefined, false);
            formik.setFieldValue("coverageTypeName", undefined, false);
            formik.setFieldValue("medicalTypeId", undefined, false);
            formik.setFieldValue("causeOfIncidentId", undefined, false);
            prevIncidentTypeIdRef.current = currentIncident;
            prevCoverageTypeIdRef.current = undefined;
            return; // coverage ถูก reset แล้ว ยังไม่ต้องตั้ง medical
        }

        // กรณี coverageTypeId เปลี่ยน (และมีค่า)
        if (currentCoverage !== prevCoverage && currentCoverage !== undefined) {
            const isTargetIncidentType = [2, 3].includes(currentIncident ?? 0);
            const isTargetCoverageType = currentCoverage === 3;
            let medicalId: number | undefined;
            let medicalName: string = "";
            if (isTargetIncidentType && isTargetCoverageType) {
                const matchedMedical = medicalType.find((item) => item.id === 2);
                medicalId = 2;
                medicalName = matchedMedical?.name ?? "";
            } else {
                // ใช้ค่าเดิมจาก detail ถ้ามี หรือหา medicalType ตัวแรกที่มี
                const matchedMedicalOther = medicalType.find((item) => detail?.medicalTypeId === item.id);
                medicalId = matchedMedicalOther?.id;
                medicalName = matchedMedicalOther?.name ?? "";
                // ถ้าไม่มี ให้เลือกตัวแรก (ป้องกันกรณีไม่มี)
                if (!medicalId && medicalType.length > 0) {
                    medicalId = medicalType[0].id;
                    medicalName = medicalType[0].name;
                }
            }
            formik.setFieldValue("medicalTypeId", medicalId, false);
            formik.setFieldValue("medicalTypeName", medicalName, false);
            prevCoverageTypeIdRef.current = currentCoverage;
        }
    }, [formik.values.incidentTypeId, formik.values.coverageTypeId]);

    // ---- คำนวณ totalDays ----
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

import { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { FormikErrors, useFormik } from "formik";
import { useGetCancelReason, useGetDecisionReason, useGetRejectReason } from "../../../../api/coreClaimMastersApi";
import { DECISION_ID } from "../../store/claimConsider.constants";

/** decisionId ของปุ่ม "กำลังพิจารณา" — ตรงกับสถานะ "อยู่ระหว่างดำเนินการ" (7) ใน master ClaimTransactionType */
export const DEATH_DISABILITY_IN_PROGRESS_DECISION_ID = 7;

export type DeathDisabilityConsiderValues = {
    /** ผลการพิจารณา (decisionId) — ยังไม่เลือกจนกว่าผู้ใช้จะกดปุ่มสถานะ */
    considerResult: number | undefined;
    documentCompleteDate: Dayjs | null;
    /** สาเหตุ — ใช้กับ รอแก้ไข/ปฏิเสธ/ยกเลิก */
    decisionReasonId: number | undefined;
    decisionReasonDetail: string;
    /** หมายเหตุ — ใช้กับ กำลังพิจารณา (บังคับ) / อนุมัติ (ไม่บังคับ) */
    remark: string;
};

const REASON_REQUIRED_DECISION_IDS: number[] = [DECISION_ID.REVISION, DECISION_ID.REJECTED, DECISION_ID.CANCELLED];

const validate = (values: DeathDisabilityConsiderValues) => {
    const errors: FormikErrors<DeathDisabilityConsiderValues> = {};
    if (values.considerResult === undefined) {
        errors.considerResult = "กรุณาเลือกผลการพิจารณา";
    }
    if (!values.documentCompleteDate) {
        errors.documentCompleteDate = "กรุณาระบุวันที่เอกสารครบ";
    }
    if (REASON_REQUIRED_DECISION_IDS.includes(values.considerResult ?? -1) && !values.decisionReasonId) {
        errors.decisionReasonId = "กรุณาเลือกสาเหตุ";
    }
    if (values.considerResult === DEATH_DISABILITY_IN_PROGRESS_DECISION_ID && !values.remark.trim()) {
        errors.remark = "กรุณาระบุหมายเหตุ";
    }
    return errors;
};

type UseDeathDisabilityConsiderHookParams = {
    /** วันที่เอกสารครบของเคส (GetClaimDetailConsider) — ใช้เป็นค่าเริ่มต้น ไม่มีค่าจึง default วันนี้ */
    documentCompleteDate?: Dayjs;
};

/**
 * Form ผลการพิจารณาของเคลม Death & Disability
 * TODO(death-disability-api): onSubmit ยังไม่ยิง API — รอ BE มี endpoint บันทึกผลพิจารณาของเคลมประเภทนี้
 */
const useDeathDisabilityConsiderHook = ({ documentCompleteDate }: UseDeathDisabilityConsiderHookParams = {}) => {
    const formik = useFormik<DeathDisabilityConsiderValues>({
        initialValues: {
            considerResult: undefined,
            documentCompleteDate: dayjs(),
            decisionReasonId: undefined,
            decisionReasonDetail: "",
            remark: "",
        },
        validate,
        onSubmit: () => undefined,
    });

    // detail โหลดทีหลัง form — เติมวันที่เอกสารครบจากเคสเมื่อมาถึง ถ้าผู้ใช้ยังไม่ได้แก้ช่องนี้เอง
    const { setFieldValue, getFieldMeta } = formik;
    const documentCompleteDateKey = documentCompleteDate?.toString();
    useEffect(() => {
        if (!documentCompleteDate || getFieldMeta("documentCompleteDate").touched) return;
        setFieldValue("documentCompleteDate", dayjs(documentCompleteDate), false);
    }, [documentCompleteDateKey]);

    // โหลด master สาเหตุเฉพาะตอนเลือกสถานะที่ใช้ — ยังไม่เลือก / เลือก กำลังพิจารณา หรือ อนุมัติ จะไม่ยิงเลย
    // (เลือกแล้วครั้งหนึ่ง react-query cache ไว้ สลับกลับมาไม่ยิงซ้ำ)
    const { considerResult } = formik.values;
    const { data: decisionReason, isLoading: decisionReasonLoading } = useGetDecisionReason(
        undefined,
        considerResult === DECISION_ID.REVISION ? DECISION_ID.REVISION : undefined
    );
    const { data: rejectReason, isLoading: rejectReasonLoading } = useGetRejectReason(
        undefined,
        considerResult === DECISION_ID.REJECTED
    );
    const { data: cancelReason, isLoading: cancelReasonLoading } = useGetCancelReason(
        undefined,
        considerResult === DECISION_ID.CANCELLED
    );

    return {
        formik,
        revisionReasonOptions: (decisionReason?.data ?? []).map((item) => ({
            id: item.decisionReasonId,
            name: item.decisionReasonName,
        })),
        revisionReasonLoading: decisionReasonLoading,
        rejectReasonOptions: (rejectReason?.data ?? []).map((item) => ({
            id: item.rejectReasonId,
            name: item.rejectReasonName,
        })),
        rejectReasonLoading,
        cancelReasonOptions: (cancelReason?.data ?? []).map((item) => ({
            id: item.cancelReasonId,
            name: item.cancelReasonName,
        })),
        cancelReasonLoading,
    };
};

export default useDeathDisabilityConsiderHook;

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import {
    useGetHospitalBillingDetail,
    useSubmitHospitalBilling,
    normalizeSubmitError,
} from "../../../../api/hospitalBillingApi";
import { useGetDecisionReason } from "../../../../api/coreClaimMastersApi";
import { SubmitHospitalBillingDto } from "../../../../api/coreClaimApi.client";
import { swalConfirm, swalError, swalSuccess, swalToast, swalWarning } from "../../../_common";
import { round2, toFormValues, toReviewDataDto } from "../../store/billingMappers";
import {
    BILLING_DECISION_ID,
    BILLING_STATUS,
    BillingReviewFormValues,
    BillingStatusId,
} from "../../store/billingClaim.types";
import useBillingDocumentHook from "./BillingDocumentHook";

const EMPTY_FORM_VALUES: BillingReviewFormValues = {
    incidentTypeId: undefined,
    incidentTypeName: undefined,
    coverageTypeId: undefined,
    coverageTypeName: undefined,
    medicalTypeId: undefined,
    medicalTypeName: undefined,
    chiefComplaintId: undefined,
    chiefComplaintId_selectedText: undefined,
    diagnosis1Id: undefined,
    diagnosis2Id: undefined,
    diagnosis3Id: undefined,
    incidentDate: undefined,
    incidentTime: undefined,
    symptomOnsetDate: undefined,
    occurrenceDate: undefined,
    occurrenceTime: undefined,
    admissionDate: undefined,
    admissionTime: undefined,
    dischargeDate: undefined,
    dischargeTime: undefined,
    hn: "",
    vn: "",
    an: "",
    note: "",
    underlyingDiseaseDetail: "",
    illnessDetail: "",
    investigationResults: "",
    isProcedurePerformed: undefined,
    medicalLicenseNo: "",
    physicianName: "",
    expenses: [],
    documents: [],
    ssEndDiscountAmount: 0,
    reviewStatusId: undefined,
    reviewReasonId: undefined,
    reviewRemark: "",
    rejectionDocuments: [],
    isContinuousClaim: false,
    continuousClaim: undefined,
    documentCompleteDate: undefined,
    admitIndication: "",
    ipdDays: 0,
    icuDays: 0,
    simBCategory: "SimB2",
    mergeCompensation: true,
};

/**
 * หน้า "ตรวจสอบรายการวางบิล - เคลมโรงพยาบาล" — ต่อ GET/POST /billing/hospital/* จริง
 *
 * `:id` route param = `btoa(billingDetailId)` (ไม่ใช่ caseId — caseId ซ้ำกันข้ามรอบวางบิลได้,
 * hospital-billing-fe.md ข้อ 1)
 *
 * มี submit endpoint เดียว (`useSubmitHospitalBilling`) — ผลต่างของแต่ละปุ่มบนจอคือค่า `reviewStatusId`
 * ที่ส่งไปเท่านั้น จึงรวมเป็น `submitReview(statusId)` ตัวเดียว แล้วให้แต่ละปุ่มเรียกพร้อม status ของตัวเอง:
 * - "ยืนยันบันทึกผลพิจารณา" (Step 1, 2) → `submitReview(values.reviewStatusId)` (รอแก้ไข หรือ ปฏิเสธ)
 * - "อนุมัติ" (Step 3) → `validateApprove()` ผ่านแล้วค่อย `submitReview(BILLING_STATUS.passed)`
 */
const useBillingReviewDetailHook = (readOnlyProp: boolean) => {
    const { id } = useParams();
    const billingDetailId = id ? atob(id) : "";

    const {
        data: detailData,
        isLoading: detailLoading,
        refetch: refetchDetail,
    } = useGetHospitalBillingDetail(billingDetailId);
    const detail = detailData?.data;

    const formik = useFormik<BillingReviewFormValues>({
        initialValues: EMPTY_FORM_VALUES,
        enableReinitialize: false,
        onSubmit: () => undefined,
    });

    /** sync ค่าจาก Detail ลงฟอร์มครั้งเดียวตอนโหลดเสร็จ (enableReinitialize จะล้างค่าที่ผู้ใช้แก้ทุกครั้งที่ refetch) */
    const hasSyncedRef = useRef(false);
    useEffect(() => {
        if (!detail?.data || hasSyncedRef.current) return;
        formik.setValues(toFormValues(detail.data), false);
        hasSyncedRef.current = true;
    }, [detail]);

    /** เปิด sync ใหม่หลัง refetch จาก 409 (ข้อมูลเปลี่ยนไป ต้องโหลดค่าล่าสุดมาแทนของเดิม) */
    const resyncAfterConflict = () => {
        hasSyncedRef.current = false;
    };

    /** แก้ไขได้เฉพาะ statusId = 1 (รอตรวจสอบ) — สถานะอื่นเป็นการดูย้อนหลังอย่างเดียว (handoff ข้อ 1) */
    const isReadOnly = readOnlyProp || detail?.statusId !== BILLING_STATUS.pendingReview;

    /** requestId : 1 ค่าต่อ 1 ความตั้งใจบันทึก — retry คำขอเดิมต้องใช้ค่าเดิมซ้ำ (handoff ข้อ 7) */
    const requestIdRef = useRef<string>();
    const submitMutation = useSubmitHospitalBilling();
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * ผู้ใช้เปลี่ยนใจ (สถานะ/สาเหตุ/รายละเอียดที่จะบันทึก) หลัง submit ครั้งก่อนไม่สำเร็จ = ความตั้งใจบันทึก
     * ใหม่ ต้องขึ้น requestId ใหม่เสมอ ไม่ให้ retry คำขอเดิมด้วย payload ที่เปลี่ยนไปแล้ว
     */
    useEffect(() => {
        requestIdRef.current = undefined;
    }, [formik.values.reviewStatusId, formik.values.reviewReasonId, formik.values.reviewRemark]);

    /**
     * สถานะ 2/4/5 ต้องระบุสาเหตุ — 2/5 ใช้ decisionId+decisionReasonId (Decision master), 4 ใช้
     * rejectReasonId (ไม่มี master แยก ใช้ตัวเลือกชุดเดียวกับ decisionId ของสถานะ "ปฏิเสธ")
     */
    const reasonDecisionId = formik.values.reviewStatusId
        ? BILLING_DECISION_ID[formik.values.reviewStatusId]
        : undefined;
    const { data: reviewReason, isLoading: reviewReasonLoading } = useGetDecisionReason(undefined, reasonDecisionId);
    const needsReason = reasonDecisionId !== undefined;
    /** *Enable ปุ่ม "ยืนยันบันทึกผลพิจารณา" เมื่อมีการเลือกผลการพิจารณา (+ สาเหตุถ้าจำเป็น) */
    const canSubmitReview = !!formik.values.reviewStatusId && (!needsReason || !!formik.values.reviewReasonId);

    const documentHook = useBillingDocumentHook(formik.values.documents);

    /** required document subtype ทุกตัวต้องมีแถวและมีผลตรวจครบ — สัญญา BE จริง (handoff ข้อ 6) บังคับทุกครั้งที่ submit */
    const isDocumentSubTypeCoverageComplete = () => {
        const required = detail?.requiredDocumentSubTypeIds ?? [];
        return required.every((subTypeId) => {
            const rowsOfSubType = formik.values.documents.filter((d) => d.documentSubTypeId === subTypeId);
            return (
                rowsOfSubType.length > 0 &&
                rowsOfSubType.every((d) => d.reviewStatusId !== undefined && d.reviewStatusId !== null)
            );
        });
    };

    /** gate ปุ่ม "ถัดไป" ของ Step 1 — สเปค : "กรุณาเลือกผลการตรวจให้ครบทุกรายการที่มีเอกสารก่อนดำเนินการถัดไป" */
    const validateStep1Documents = (): boolean => {
        if (documentHook.hasAnyMissingResult()) {
            swalError("ไม่สามารถดำเนินการต่อได้", "กรุณาเลือกผลการตรวจให้ครบทุกรายการที่มีเอกสารก่อนดำเนินการถัดไป");
            return false;
        }
        return true;
    };

    /**
     * gate ปุ่ม "ถัดไป" ของ Step 2 — เทียบผลรวมยอดรายการค่ารักษากับยอดสุทธิที่โรงพยาบาลส่งมา
     * (`detail.originalBilledAmount` — ยืนยันกับ BA ตามข้อ 7.4 ว่าใช่ฟิลด์นี้จริง) เท่ากันไปต่อได้เงียบ ๆ
     * ไม่เท่ากันแจ้งเตือนแต่ยังกดยืนยันไปต่อได้ (ไม่ block)
     */
    const confirmStep2Amount = async (totalReceiptAmount: number): Promise<boolean> => {
        const billed = round2(detail?.originalBilledAmount);
        const diff = round2(totalReceiptAmount) - billed;
        if (diff === 0) return true;

        const wording =
            diff < 0
                ? "ตรวจสอบพบว่ายอดรายการค่ารักษา น้อยกว่า ยอดสุทธิจากโรงพยาบาล ยืนยันการทำรายการ ?"
                : "ตรวจสอบพบว่ายอดรายการค่ารักษา มากกว่า ยอดสุทธิจากโรงพยาบาล ยืนยันการทำรายการ ?";
        const result = await swalConfirm("ตรวจสอบยอดเงิน", wording, "ยืนยันการทำรายการ", "ยกเลิก");
        return !!result.isConfirmed;
    };

    /** gate ปุ่ม "อนุมัติ" ของ Step 3 — ทุกแถวที่มีเอกสาร (Document Count > 0) ต้องมีผลเป็น "ผ่าน" */
    const validateApprove = (): boolean => {
        if (documentHook.hasAnyNotPassed()) {
            swalToast("warning", "กรุณาเลือกผลการตรวจเป็น “ผ่าน” ให้ครบทุกรายการที่มีเอกสารก่อนอนุมัติ");
            return false;
        }
        return true;
    };

    /**
     * ยิง POST /billing/hospital/{id}/submit ด้วย `statusId` ที่ระบุ — ใช้ร่วมกันทั้ง "ยืนยันบันทึกผลพิจารณา"
     * (รอแก้ไข/ปฏิเสธ, อ่านสาเหตุ/หมายเหตุจาก `formik.values.reviewReasonId`/`reviewRemark`) และ "อนุมัติ"
     * (ไม่มีสาเหตุ — `BILLING_DECISION_ID` ไม่มี entry ของ passed) คืน true เมื่อสำเร็จ (caller navigate เอง)
     */
    const submitReview = async (statusId: BillingStatusId): Promise<boolean> => {
        if (!detail?.billingDetailId) {
            swalError("บันทึกไม่สำเร็จ", "ไม่พบรายการวางบิลนี้ กรุณาโหลดหน้าใหม่");
            return false;
        }

        const statusNeedsReason = BILLING_DECISION_ID[statusId] !== undefined;
        if (statusNeedsReason && !formik.values.reviewReasonId) {
            swalError("บันทึกไม่สำเร็จ", "กรุณาระบุสาเหตุของผลการตรวจสอบ");
            return false;
        }
        if (statusId === BILLING_STATUS.needsCorrection && !formik.values.reviewRemark) {
            swalError("บันทึกไม่สำเร็จ", "กรุณาระบุรายละเอียดการรอแก้ไข");
            return false;
        }
        if (!isDocumentSubTypeCoverageComplete()) {
            swalError("บันทึกไม่สำเร็จ", "เอกสารที่จำเป็นต้องมีครบและมีผลการตรวจทุกแถว");
            return false;
        }

        if (!requestIdRef.current) requestIdRef.current = crypto.randomUUID();

        /**
         * matrix สาเหตุตาม hospital-billing-frontend-structure-handoff ("สถานะและเหตุผล"):
         * 2/5 ส่ง decisionId+decisionReasonId, 4 ส่ง rejectReasonId เท่านั้น, 3 ไม่ส่งทั้งสามตัว
         */
        const isRejected = statusId === BILLING_STATUS.rejected;
        const usesDecisionReason = statusNeedsReason && !isRejected; // 2, 5

        const body: SubmitHospitalBillingDto = {
            requestId: requestIdRef.current,
            expectedVersion: detail.version,
            expectedCaseVersion: detail.caseVersion,
            expectedClaimVersion: detail.claimVersion,
            rowVersion: detail.rowVersion ?? "",
            caseRowVersion: detail.caseRowVersion ?? "",
            claimRowVersion: detail.claimRowVersion ?? "",
            reviewStatusId: statusId,
            rejectReasonId: isRejected ? formik.values.reviewReasonId : undefined,
            decisionId: usesDecisionReason ? reasonDecisionId : undefined,
            decisionReasonId: usesDecisionReason ? formik.values.reviewReasonId : undefined,
            reviewRemark: formik.values.reviewRemark || undefined,
            data: toReviewDataDto(formik.values),
        };

        setIsSubmitting(true);
        try {
            const response = await submitMutation.mutateAsync({ billingDetailId: detail.billingDetailId, body });
            if (!response.isSuccess) {
                swalError("บันทึกไม่สำเร็จ", response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
                return false;
            }

            requestIdRef.current = undefined; // สำเร็จแล้ว — ความตั้งใจบันทึกครั้งถัดไปต้องใช้ requestId ใหม่

            if (statusId === BILLING_STATUS.passed) {
                await swalToast("success", "อนุมัติรายการสำเร็จ — ระบบสร้างรายการวางบิลใหม่ให้อัตโนมัติ");
            } else {
                await swalSuccess(
                    "บันทึกคำขอส่งกลับสำเร็จ",
                    "ระบบบันทึกคำขอไว้แล้ว (สถานะ Pending) — ยังไม่ยืนยันการส่ง/รับที่ SmileConnect"
                );
            }
            return true;
        } catch (rawError) {
            const normalized = normalizeSubmitError(rawError);
            if (normalized.isConflict) {
                swalWarning(
                    "ข้อมูลเปลี่ยนไป",
                    "มีการเปลี่ยนแปลงรายการนี้จากที่อื่นแล้ว ระบบจะโหลดข้อมูลล่าสุดให้ตรวจทานก่อนส่งอีกครั้ง"
                );
                resyncAfterConflict();
                requestIdRef.current = undefined; // แก้ payload หลังโหลดใหม่ = ความตั้งใจบันทึกใหม่ ต้องใช้ requestId ใหม่
                await refetchDetail();
            } else {
                swalError("บันทึกไม่สำเร็จ", normalized.message);
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    /** ปุ่ม "ยืนยันบันทึกผลพิจารณา" (Step 1, 2) — ส่งสถานะที่เลือกไว้ในบล็อก "แจ้งผลการพิจารณาโรงพยาบาล" */
    const handleSubmitReviewResult = async (): Promise<boolean> => {
        if (!formik.values.reviewStatusId) {
            swalError("บันทึกไม่สำเร็จ", "กรุณาเลือกผลการพิจารณาก่อนยืนยัน");
            return false;
        }
        return submitReview(formik.values.reviewStatusId);
    };

    /** ปุ่ม "อนุมัติ" (Step 3) */
    const handleApprove = async (): Promise<boolean> => {
        if (!validateApprove()) return false;
        return submitReview(BILLING_STATUS.passed);
    };

    return {
        formik,
        detail,
        detailLoading,
        isReadOnly,
        isSubmitting,
        reviewReason,
        reviewReasonLoading,
        canSubmitReview,
        documentHook,
        validateStep1Documents,
        confirmStep2Amount,
        handleSubmitReviewResult,
        handleApprove,
    };
};

export default useBillingReviewDetailHook;

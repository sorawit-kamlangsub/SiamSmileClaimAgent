import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import {
    useGetHospitalBillingDetail,
    useSubmitHospitalBilling,
    normalizeSubmitError,
} from "../../../../api/hospitalBillingApi";
import { useGetDecisionReason, useGetRejectReason } from "../../../../api/coreClaimMastersApi";
import { ReviewReasonOption } from "../../components/BillingHospitalReview/SubDetailsTab/BillingReviewResultSection";
import { SubmitHospitalBillingDto } from "../../../../api/coreClaimApi.client";
import { swalConfirm, swalError, swalSuccess, swalToast, swalWarning } from "../../../_common";
import { round2, toFormValues, toReviewDataDto } from "../../store/billingMappers";
import { billingReturnStatusLabel } from "../../store/billingStatusHelpers";
import {
    BILLING_DECISION_ID,
    BILLING_STATUS,
    BillingReviewFormValues,
    BillingStatusId,
} from "../../store/billingClaim.types";
import { setEnabled } from "../../../CreatedClaim/store/claimPHSlice";
import useBillingDocumentHook from "./BillingDocumentHook";
import { safeAtob } from "../../../../functionHelpers";

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
    reviewStatusId: undefined,
    reviewReasonId: undefined,
    reviewRemark: "",
    isContinuousClaim: false,
    continuousClaim: undefined,
    documentCompleteDate: undefined,
    admitIndication: "",
    ipdDays: 0,
    icuDays: 0,
    simBCategory: "SimB2",
    mergeCompensation: true,
    trafficVehicleType: undefined,
    trafficVehicleOther: "",
    trafficCasualtyStatus: undefined,
    trafficIsPoroboExcess: undefined,
    trafficNoPoroboReason: "",
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
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const navigate = useNavigate();
    const billingDetailId = safeAtob(id) ?? "";

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
        // จำนวนวันนอนอยู่ที่ root ของ BillingDetailDto (ไม่ใช่ใน data.claim) จึง sync แยกจาก toFormValues
        formik.setValues(
            { ...toFormValues(detail.data), ipdDays: detail.ipdDayCount ?? 0, icuDays: detail.icuDayCount ?? 0 },
            false
        );
        hasSyncedRef.current = true;
        // ปลดล็อก useGetDocumentType (DocumentScanTable "เอกสารประกอบการปฏิเสธ") — gate ด้วย
        // claimPHSlice.isEnabled ซึ่ง default false และไม่มีใครใน flow นี้ set ให้เดิม ทำให้ query โดน
        // disable ค้างตลอดไป (react-query v4 ทำให้ isLoading ค้าง true ตลอดกาล ไม่เคยยิง GET เลยสักครั้ง)
        // เคลมลูกค้า/เคลมโรงพยาบาล (ConsiderDetailHook/HospitalConsiderDetailHook) set ค่านี้ตรงจุดเดียวกัน
        dispatch(setEnabled(true));
    }, [detail]);

    /** เปิด sync ใหม่หลัง refetch จาก 409 (ข้อมูลเปลี่ยนไป ต้องโหลดค่าล่าสุดมาแทนของเดิม) */
    const resyncAfterConflict = () => {
        hasSyncedRef.current = false;
    };

    /** แก้ไขได้เฉพาะ statusId = BILLING_STATUS.pendingReview (รอตรวจสอบ) — สถานะอื่นเป็นการดูย้อนหลังอย่างเดียว (handoff ข้อ 1) */
    const isReadOnly = readOnlyProp || detail?.statusId !== BILLING_STATUS.pendingReview;

    /**
     * requestId : 1 ค่าต่อ 1 ความตั้งใจบันทึก — retry คำขอเดิมต้องใช้ค่าเดิมซ้ำ (handoff ข้อ 7)
     *
     * `lastBodyKeyRef` เก็บ body ครั้งก่อน (ไม่รวม requestId เอง) ไว้เทียบตอน submit ครั้งถัดไป: ถ้า body
     * เหมือนเดิมทุกค่า = retry คำขอเดิม (ใช้ requestId เดิมซ้ำ) ถ้าต่างกัน = ความตั้งใจบันทึกใหม่ (สร้าง
     * requestId ใหม่) — ครอบคลุมทุก field ที่แก้ได้ ไม่ผูกกับ field ใด field หนึ่งเป็นการเฉพาะ
     */
    const requestIdRef = useRef<string>();
    const lastBodyKeyRef = useRef<string>();
    const submitMutation = useSubmitHospitalBilling();
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * สถานะ 2/4/5 ต้องระบุสาเหตุ — 2/5 ใช้ decisionId+decisionReasonId (Decision master), 4 ใช้
     * rejectReasonId (ตัวเลือกจาก Master สาเหตุการปฏิเสธ — useGetRejectReason)
     */
    const reasonDecisionId = formik.values.reviewStatusId
        ? BILLING_DECISION_ID[formik.values.reviewStatusId]
        : undefined;
    const isRejectedSelected = formik.values.reviewStatusId === BILLING_STATUS.rejected;
    // ปฏิเสธ (4) ใช้ Master สาเหตุการปฏิเสธของตัวเอง (useGetRejectReason) — สถานะอื่นยังใช้ Decision master
    const { data: decisionReason, isLoading: decisionReasonLoading } = useGetDecisionReason(
        undefined,
        isRejectedSelected ? undefined : reasonDecisionId
    );
    const { data: rejectReason, isLoading: rejectReasonLoading } = useGetRejectReason(undefined, isRejectedSelected);
    /** ตัวเลือก dropdown สาเหตุ (normalize เป็น id/name ให้ BillingReviewResultSection) */
    const reviewReason: ReviewReasonOption[] = isRejectedSelected
        ? (rejectReason?.data ?? []).map((item) => ({ id: item.rejectReasonId, name: item.rejectReasonName }))
        : (decisionReason?.data ?? []).map((item) => ({ id: item.decisionReasonId, name: item.decisionReasonName }));
    const reviewReasonLoading = isRejectedSelected ? rejectReasonLoading : decisionReasonLoading;
    const needsReason = reasonDecisionId !== undefined;
    /** *Enable ปุ่ม "ยืนยันบันทึกผลพิจารณา" เมื่อมีการเลือกผลการพิจารณา (+ สาเหตุถ้าจำเป็น) */
    const canSubmitReview = !!formik.values.reviewStatusId && (!needsReason || !!formik.values.reviewReasonId);

    const documentHook = useBillingDocumentHook(formik.values.documents);

    /**
     * required document subtype ทุกตัวต้องมีแถวครบ — สัญญา BE จริง (handoff ข้อ 6) บังคับทุกครั้งที่ submit
     *
     * CR "Traffic Accident and Hospital Document Review" ข้อ CR-05 : ตัดคอลัมน์ "ผลการตรวจ" ออกจากตาราง
     * ตรวจสอบเอกสารแล้ว จึงตัดเงื่อนไข "ต้องมีผลตรวจครบ" ออกจากเกทนี้ด้วย (คอลัมน์ที่ผูก validation ถูกตัด
     * ไปแล้ว) เหลือแค่เช็คว่ามีแถวเอกสารของ subtype ที่จำเป็นครบหรือไม่
     */
    const isDocumentSubTypeCoverageComplete = () => {
        const required = detail?.requiredDocumentSubTypeIds ?? [];
        return required.every((subTypeId) => formik.values.documents.some((d) => d.documentSubTypeId === subTypeId));
    };

    /**
     * gate ปุ่ม "ถัดไป" ของ Step 2 — เทียบผลรวมยอดรายการค่ารักษากับยอดเบิกจากโรงพยาบาล
     * (`detail.totals.totalClaimedAmount` — ยอด `sum(expenses.claimAmount)` ของ source snapshot ตอนรับงาน,
     * hospital-billing-fe.md ข้อ 5/6; `originalBilledAmount` ถูกถอดออกจาก contract แล้ว ห้ามใช้)
     * เท่ากันไปต่อได้เงียบ ๆ ไม่เท่ากันแจ้งเตือนแต่ยังกดยืนยันไปต่อได้ (ไม่ block)
     */
    const confirmStep2Amount = async (totalReceiptAmount: number): Promise<boolean> => {
        const billed = round2(detail?.totals?.totalClaimedAmount);
        const diff = round2(totalReceiptAmount) - billed;
        if (diff === 0) return true;

        const wording =
            diff < 0
                ? "ตรวจสอบพบว่ายอดรายการค่ารักษา น้อยกว่า ยอดสุทธิจากโรงพยาบาล ยืนยันการทำรายการ ?"
                : "ตรวจสอบพบว่ายอดรายการค่ารักษา มากกว่า ยอดสุทธิจากโรงพยาบาล ยืนยันการทำรายการ ?";
        const result = await swalConfirm("ตรวจสอบยอดเงิน", wording, "ยืนยันการทำรายการ", "ยกเลิก");
        return !!result.isConfirmed;
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
            swalError("บันทึกไม่สำเร็จ", "กรุณาระบุรายละเอียดการแจ้งแก้ไข");
            return false;
        }
        if (!isDocumentSubTypeCoverageComplete()) {
            swalError("บันทึกไม่สำเร็จ", "เอกสารที่จำเป็นต้องมีครบทุกรายการ");
            return false;
        }

        /**
         * matrix สาเหตุตาม hospital-billing-frontend-structure-handoff ("สถานะและเหตุผล"):
         * 2/5 ส่ง decisionId+decisionReasonId, 4 ส่ง rejectReasonId เท่านั้น, 3 ไม่ส่งทั้งสามตัว
         */
        const isRejected = statusId === BILLING_STATUS.rejected;
        const usesDecisionReason = statusNeedsReason && !isRejected; // 2, 5

        const bodyFields: Omit<SubmitHospitalBillingDto, "requestId"> = {
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
        const bodyKey = JSON.stringify(bodyFields);

        // retry คำขอเดิม (body เหมือนทุกค่ากับครั้งก่อน) ใช้ requestId เดิมซ้ำ — ค่าใดก็ตามเปลี่ยนไปถือเป็น
        // ความตั้งใจบันทึกใหม่ ต้องขึ้น requestId ใหม่ (handoff ข้อ 7)
        if (!requestIdRef.current || bodyKey !== lastBodyKeyRef.current) {
            requestIdRef.current = crypto.randomUUID();
        }
        lastBodyKeyRef.current = bodyKey;

        const body: SubmitHospitalBillingDto = { requestId: requestIdRef.current, ...bodyFields };

        setIsSubmitting(true);
        try {
            const response = await submitMutation.mutateAsync({ billingDetailId: detail.billingDetailId, body });
            if (!response.isSuccess) {
                swalError("บันทึกไม่สำเร็จ", response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
                return false;
            }

            // สำเร็จแล้ว — ความตั้งใจบันทึกครั้งถัดไปต้องใช้ requestId ใหม่เสมอ
            requestIdRef.current = undefined;
            lastBodyKeyRef.current = undefined;

            if (statusId === BILLING_STATUS.passed) {
                // rule 7 (handoff "Business Rule: อนุมัติรายการวางบิลโรงพยาบาล") : แจ้งผู้ใช้ว่ารายการ
                // ถูกส่งไปที่ "ตั้งเบิกกองทุน > เคลมโรงพยาบาล" แล้ว — caller (BillingClaimDetailsTab) เป็นคน
                // navigate ไปหน้านั้นต่อ
                await swalToast(
                    "success",
                    "อนุมัติรายการวางบิลเรียบร้อย ระบบส่งรายการไปที่ตั้งเบิกกองทุน > เคลมโรงพยาบาล แล้ว"
                );
            } else {
                // `returnStatus = "Published"` หมายถึง RabbitMQ รับ event แล้วเท่านั้น ไม่ใช่ SmileConnect
                // ประมวลผลสำเร็จ (handoff ข้อ 7) ห้ามอ้างว่า "ส่งกลับสำเร็จ" หรือ "SmileConnect รับแล้ว"
                await swalSuccess(
                    "บันทึกผลตรวจสำเร็จ",
                    `สถานะคำขอส่งกลับ: ${billingReturnStatusLabel(response.data?.returnStatus)}`
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
                // แก้ payload หลังโหลดใหม่ = ความตั้งใจบันทึกใหม่ ต้องใช้ requestId ใหม่เสมอ (handoff ข้อ 7)
                requestIdRef.current = undefined;
                lastBodyKeyRef.current = undefined;
                await refetchDetail();
            } else if (normalized.isNotFound) {
                await swalError(
                    "บันทึกไม่สำเร็จ",
                    "ไม่พบรายการวางบิลนี้ หรือข้อมูลที่จำเป็นไม่พร้อม กรุณากลับไปที่รายการแล้วลองใหม่"
                );
                navigate("/billing/hospital");
            } else if (normalized.isRetryable) {
                // 500 / network / timeout — ผลบันทึกอาจสำเร็จแล้ว คง requestId + body เดิมไว้ (ไม่แตะ ref
                // ทั้งสองตัว) ให้กด "ยืนยัน" ซ้ำเพื่อ retry คำขอเดิมได้ (handoff ข้อ 7/10)
                swalError(
                    "บันทึกไม่สำเร็จ",
                    "เกิดข้อผิดพลาดที่ระบบ ผลบันทึกอาจสำเร็จแล้วหรือยังไม่สำเร็จ กรุณากดยืนยันอีกครั้งเพื่อลองส่งคำขอเดิม"
                );
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
    const handleApprove = async (): Promise<boolean> => submitReview(BILLING_STATUS.passed);

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
        confirmStep2Amount,
        handleSubmitReviewResult,
        handleApprove,
    };
};

export default useBillingReviewDetailHook;

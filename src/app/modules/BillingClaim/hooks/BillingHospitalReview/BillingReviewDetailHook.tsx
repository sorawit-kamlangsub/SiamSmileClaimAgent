import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { Dayjs } from "dayjs";
import {
    useGetHospitalBillingDetail,
    useSubmitHospitalBilling,
    normalizeSubmitError,
} from "../../../../api/hospitalBillingApi";
import { SubmitHospitalBillingDto } from "../../../../api/coreClaimApi.client";
import { swalError, swalSuccess, swalWarning } from "../../../_common";
import { toFormValues, toReviewDataDto } from "../../store/billingMappers";
import { BILLING_STATUS, BillingReviewFormValues } from "../../store/billingClaim.types";

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
    reviewRemark: "",
};

const combineDateTime = (date: Dayjs | undefined, time: Dayjs | undefined): Dayjs | undefined => {
    if (!date) return undefined;
    if (!time) return date;
    return date.hour(time.hour()).minute(time.minute()).second(time.second());
};

/**
 * หน้า "ตรวจสอบรายการวางบิล - เคลมโรงพยาบาล" — ต่อ GET/POST /billing/hospital/* จริง
 *
 * `:id` route param = `btoa(billingDetailId)` (ไม่ใช่ caseId — caseId ซ้ำกันข้ามรอบวางบิลได้,
 * hospital-billing-fe.md ข้อ 1)
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

    const isDischargeBeforeAdmission = () => {
        const admission = combineDateTime(formik.values.admissionDate, formik.values.admissionTime);
        const discharge = combineDateTime(formik.values.dischargeDate, formik.values.dischargeTime);
        return !!admission && !!discharge && discharge.isBefore(admission);
    };

    /**
     * ยืนยันผลตรวจสอบ (Step 3) — ตรวจตาม hospital-billing-fe.md ข้อ 5-7 ก่อน submit เสมอ
     * คืน true เมื่อสำเร็จ (caller navigate กลับ list เอง)
     */
    const handleConfirmReview = async (params: {
        totalClaimedAmount: number;
        hasUncoveredWithoutReason: boolean;
        hasDiscountExceedsClaim: boolean;
    }): Promise<boolean> => {
        if (!detail?.billingDetailId) {
            swalError("ยืนยันไม่สำเร็จ", "ไม่พบรายการวางบิลนี้ กรุณาโหลดหน้าใหม่");
            return false;
        }
        if (!formik.values.reviewStatusId) {
            swalError("ยืนยันไม่สำเร็จ", "กรุณาเลือกผลการตรวจสอบก่อนยืนยัน");
            return false;
        }
        if (!isDocumentSubTypeCoverageComplete()) {
            swalError("ยืนยันไม่สำเร็จ", "เอกสารที่จำเป็นต้องมีครบและมีผลการตรวจทุกแถว");
            return false;
        }
        if (isDischargeBeforeAdmission()) {
            swalError("ยืนยันไม่สำเร็จ", "วันเวลาออก รพ. ต้องไม่ก่อนวันเวลาเข้า รพ.");
            return false;
        }
        if (params.hasDiscountExceedsClaim) {
            swalError("ยืนยันไม่สำเร็จ", "ส่วนลดรายการต้องไม่เกินยอดเบิกของรายการนั้น");
            return false;
        }
        if (params.hasUncoveredWithoutReason) {
            swalError("ยืนยันไม่สำเร็จ", "กรุณาระบุสาเหตุไม่คุ้มครองของทุกรายการที่มียอดไม่คุ้มครอง");
            return false;
        }
        if (formik.values.ssEndDiscountAmount < 0 || formik.values.ssEndDiscountAmount > params.totalClaimedAmount) {
            swalError("ยืนยันไม่สำเร็จ", "ส่วนลด SS ท้ายบิล ต้องไม่ต่ำกว่า 0 และไม่เกินยอดเบิกรวม");
            return false;
        }

        if (!requestIdRef.current) requestIdRef.current = crypto.randomUUID();

        const body: SubmitHospitalBillingDto = {
            requestId: requestIdRef.current,
            expectedVersion: detail.version,
            expectedCaseVersion: detail.caseVersion,
            expectedClaimVersion: detail.claimVersion,
            rowVersion: detail.rowVersion ?? "",
            caseRowVersion: detail.caseRowVersion ?? "",
            claimRowVersion: detail.claimRowVersion ?? "",
            reviewStatusId: formik.values.reviewStatusId,
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

            if (formik.values.reviewStatusId === BILLING_STATUS.passed) {
                await swalSuccess(
                    "ยืนยันผลตรวจสอบสำเร็จ",
                    "ผลตรวจสอบเป็น “ผ่าน” — รายการนี้จะไม่แสดงในตัวกรองทั้ง 4 สถานะอีกต่อไป (เปิดดูย้อนหลังได้จากประวัติทำรายการ)"
                );
            } else if (
                formik.values.reviewStatusId === BILLING_STATUS.needsCorrection ||
                formik.values.reviewStatusId === BILLING_STATUS.cancelled
            ) {
                await swalSuccess(
                    "บันทึกคำขอส่งกลับสำเร็จ",
                    "ระบบบันทึกคำขอไว้แล้ว (สถานะ Pending) — ยังไม่ยืนยันการส่ง/รับที่ SmileConnect"
                );
            } else {
                await swalSuccess("ยืนยันผลตรวจสอบสำเร็จ", "บันทึกผลตรวจสอบเรียบร้อย");
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

    return {
        formik,
        detail,
        detailLoading,
        isReadOnly,
        isSubmitting,
        handleConfirmReview,
    };
};

export default useBillingReviewDetailHook;
export { combineDateTime };

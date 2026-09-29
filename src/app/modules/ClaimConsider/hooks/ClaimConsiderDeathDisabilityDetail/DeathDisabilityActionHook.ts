import dayjs from "dayjs";
import { FormikProps } from "formik";
import { useGetDocumentByCaseId, useUpsertDeathAndDisabilityClaimDecision } from "../../../../api/coreClaimApi";
import {
    CaseDocumentV2Request,
    GetCaseDisabilityBenefitByCaseIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
    GetStandardMedicalExpenseByCaseDtoResponse,
    UpsertDeathAndDisabilityCaseAdjudicationRequest,
    UpsertDeathAndDisabilityCaseDocumentRequest,
    UpsertDeathAndDisabilityCaseItemAdjudicationRequest,
    UpsertDeathAndDisabilityClaimDecisionDtoRequest,
    UpsertDeathAndDisabilityClaimDecisionDtoResponseServiceResponse,
} from "../../../../api/coreClaimApi.client";
import { swalError, swalSuccess } from "../../../_common";
import { DECISION_ID } from "../../store/claimConsider.constants";
import { DEATH_DISABILITY_IN_PROGRESS_DECISION_ID, DeathDisabilityConsiderValues } from "./DeathDisabilityConsiderHook";

type UseDeathDisabilityActionHookParams = {
    formik: FormikProps<DeathDisabilityConsiderValues>;
    detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined;
    /** ใช้ดึงเอกสารที่บันทึกไว้แล้วของเคส (GetDocumentByCaseId) — ส่งค่าเดียวกับ DocumentScanTable ให้ใช้ cache ร่วมกัน */
    productTypeId: number | undefined;
    /** เอกสารที่แนบตอนแก้ไขรายการเปลี่ยนบัญชีที่บันทึกแล้ว — ส่งผูกกับเคสใน caseDocument */
    savedTransferAccountDocuments: CaseDocumentV2Request[];
    /** เอกสารที่แนบไฟล์แล้วในตาราง "สแกนเอกสาร" */
    scanDocuments: CaseDocumentV2Request[];
    /** เอกสารที่แนบไฟล์แล้วในตาราง "เอกสารประกอบการปฏิเสธ" — ส่งเฉพาะเมื่อผลเป็นปฏิเสธ */
    rejectDocuments: CaseDocumentV2Request[];
    /** รายการทุพพลภาพของเคส (GetCaseDisabilityBenefitByCaseId) — เคลมอื่นเป็น [] */
    disabilityBenefits: GetCaseDisabilityBenefitByCaseIdDtoResponse[];
    /** รายการค่าใช้จ่ายของเคส (GetStandardMedicalExpenseByCase) — เคลมทุพพลภาพเป็น [] */
    standardExpenses: GetStandardMedicalExpenseByCaseDtoResponse[];
    onSuccess?: (response: UpsertDeathAndDisabilityClaimDecisionDtoResponseServiceResponse) => void;
};

/**
 * ยิงบันทึกผลพิจารณาของเคลม Death & Disability ผ่าน POST /claim/death-disability/decision
 * (UpsertDeathAndDisabilityClaimDecision) endpoint เดียวรองรับทุกสถานะ
 * — กำลังพิจารณา (7) / รอแก้ไข (4) / ปฏิเสธ (5) / ยกเลิก (6) / อนุมัติ (9)
 *
 * ไม่ส่ง beneficiary — เปลี่ยนบัญชี (เงินสดมอบหน้างาน) บันทึกทันทีผ่าน InsertBeneficiaryForRecordOnSiteCashPayment
 * และแก้ไข/ลบผ่าน UpdateBeneficiary
 */
const useDeathDisabilityActionHook = ({
    formik,
    detail,
    productTypeId,
    savedTransferAccountDocuments,
    scanDocuments,
    rejectDocuments,
    disabilityBenefits,
    standardExpenses,
    onSuccess,
}: UseDeathDisabilityActionHookParams) => {
    const upsertDecision = useUpsertDeathAndDisabilityClaimDecision(
        (response) =>
            onSuccess
                ? onSuccess(response)
                : swalSuccess("บันทึกผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว"),
        (error) => swalError("ไม่สำเร็จ", error)
    );

    // เอกสารที่ผูกกับเคสแล้ว — argument ชุดเดียวกับใน DocumentScanTable (query key ตรงกัน ไม่ยิงซ้ำ)
    const { data: caseDocumentData } = useGetDocumentByCaseId(
        productTypeId ? detail?.caseId ?? "" : "",
        productTypeId,
        detail?.claimSourceId,
        undefined,
        undefined,
        undefined,
        1,
        100
    );

    /**
     * ผลพิจารณารายการค่าใช้จ่ายเดิมของเคส (หน้านี้แก้ไม่ได้ ไม่มีการคำนวณ) — ยอดที่อนุมัติ = ยอดสุทธิหักยอดไม่คุ้มครอง
     * - เคลมทุพพลภาพ: GetCaseDisabilityBenefitByCaseId (หนึ่งรายการต่ออวัยวะ)
     * - เคลมอื่น: GetStandardMedicalExpenseByCase เฉพาะแถวที่เป็น caseItem จริงของเคส (มี caseItemId)
     */
    const mapCaseItemAdjudications = (): UpsertDeathAndDisabilityCaseItemAdjudicationRequest[] =>
        [...disabilityBenefits, ...standardExpenses.filter((item) => !!item.caseItemId)].map(
            (item): UpsertDeathAndDisabilityCaseItemAdjudicationRequest => {
                const netCaseAmount = item.netCaseAmount ?? 0;
                const nonCoveredAmount = item.nonCoveredAmount ?? 0;
                const eligibleAmount = netCaseAmount - nonCoveredAmount;
                return {
                    caseItemId: item.caseItemId ?? undefined,
                    standardMedicalExpenseId: item.standardMedicalExpenseId,
                    netCaseAmount,
                    eligibleAmount,
                    approvedAmount: eligibleAmount,
                    nonCoveredAmount,
                    excessAmount: 0,
                };
            }
        );

    const mapCaseAdjudication = (): UpsertDeathAndDisabilityCaseAdjudicationRequest => {
        const { considerResult, decisionReasonId, decisionReasonDetail, remark } = formik.values;
        // กำลังพิจารณา/อนุมัติ กรอกเป็น "หมายเหตุ" ส่วน รอแก้ไข/ปฏิเสธ/ยกเลิก กรอกเป็น "รายละเอียด"
        const usesRemark =
            considerResult === DEATH_DISABILITY_IN_PROGRESS_DECISION_ID || considerResult === DECISION_ID.APPROVED;
        return {
            decisionId: considerResult,
            decisionDate: dayjs(),
            // ปฏิเสธ เลือกจาก master RejectReason — ยกเลิก (CancelReason) ส่งที่ cancelReasonId ระดับ request
            decisionReasonId: considerResult === DECISION_ID.REVISION ? decisionReasonId : undefined,
            decisionRemark: (usesRemark ? remark : decisionReasonDetail).trim() || undefined,
            rejectReasonId: considerResult === DECISION_ID.REJECTED ? decisionReasonId : undefined,
            rejectDate: considerResult === DECISION_ID.REJECTED ? dayjs() : undefined,
            isLatest: true,
            caseItemAdjudications: mapCaseItemAdjudications(),
        };
    };

    /**
     * เอกสารที่แนบไฟล์แล้วในหน้านี้ — สแกนเอกสาร + เอกสารประกอบการปฏิเสธ (เฉพาะผลปฏิเสธ)
     * + เอกสารประกอบการเปลี่ยนบัญชีที่แนบตอนแก้ไขรายการ (/beneficiary/update ไม่รับเอกสาร)
     * เอกสารที่ผูกกับ caseId + claimDocumentTypeId เดียวกันอยู่แล้ว (GetDocumentByCaseId) ไม่ส่งซ้ำ
     * ไม่อ่าน documentScanList ของ redux claimPH เพราะเป็น list กลางที่มีเอกสารของหน้า/เคสอื่นปนอยู่
     */
    const mapCaseDocuments = (): UpsertDeathAndDisabilityCaseDocumentRequest[] => {
        const docs = [
            ...scanDocuments,
            ...(formik.values.considerResult === DECISION_ID.REJECTED ? rejectDocuments : []),
            ...savedTransferAccountDocuments,
        ];
        const savedCaseDocuments = caseDocumentData?.data ?? [];
        const isSavedToCase = (doc: CaseDocumentV2Request) =>
            savedCaseDocuments.some(
                (saved) => saved.documentId === doc.documentId && saved.claimDocumentTypeId === doc.claimDocumentTypeId
            );
        return docs
            .filter((doc, index) => docs.findIndex((d) => d.documentId === doc.documentId) === index)
            .filter((doc) => !isSavedToCase(doc))
            .map(
                (doc): UpsertDeathAndDisabilityCaseDocumentRequest => ({
                    documentId: doc.documentId,
                    documentNo: doc.documentNo,
                    documentSubTypeId: doc.documentSubTypeId ?? 0,
                    claimDocumentTypeId: doc.claimDocumentTypeId,
                    ocr: [],
                })
            );
    };

    const mapPayload = (): UpsertDeathAndDisabilityClaimDecisionDtoRequest => {
        const { considerResult, decisionReasonId, documentCompleteDate } = formik.values;
        return {
            claimId: detail?.claimId,
            caseId: detail?.caseId,
            caseAssessment: documentCompleteDate
                ? { isDocumentComplete: true, documentCompleteDate: dayjs(documentCompleteDate) }
                : undefined,
            caseAdjudication: mapCaseAdjudication(),
            caseDocument: mapCaseDocuments(),
            cancelReasonId: considerResult === DECISION_ID.CANCELLED ? decisionReasonId : undefined,
            cancelDate: considerResult === DECISION_ID.CANCELLED ? dayjs() : undefined,
        };
    };

    /** เรียกหลัง formik validate ผ่านแล้ว */
    const handleSubmitDecision = async () => {
        await upsertDecision.mutateAsync(mapPayload());
    };

    return {
        handleSubmitDecision,
        isSubmitting: upsertDecision.isLoading,
    };
};

export default useDeathDisabilityActionHook;

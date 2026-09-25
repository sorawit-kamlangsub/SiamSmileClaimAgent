import dayjs from "dayjs";
import { FormikProps } from "formik";
import { useGetDocumentByCaseId, useUpsertDeathAndDisabilityClaimDecision } from "../../../../api/coreClaimApi";
import {
    CaseDocumentV2Request,
    GetCaseDisabilityBenefitByCaseIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
    GetStandardMedicalExpenseByCaseDtoResponse,
    UpsertDeathAndDisabilityBeneficiaryRequest,
    UpsertDeathAndDisabilityCaseAdjudicationRequest,
    UpsertDeathAndDisabilityCaseDocumentRequest,
    UpsertDeathAndDisabilityCaseItemAdjudicationRequest,
    UpsertDeathAndDisabilityCaseItemRequest,
    UpsertDeathAndDisabilityClaimDecisionDtoRequest,
    UpsertDeathAndDisabilityClaimDecisionDtoResponseServiceResponse,
} from "../../../../api/coreClaimApi.client";
import { swalError, swalSuccess } from "../../../_common";
import { DECISION_ID } from "../../store/claimConsider.constants";
import { DEATH_DISABILITY_IN_PROGRESS_DECISION_ID, DeathDisabilityConsiderValues } from "./DeathDisabilityConsiderHook";
import { TransferAccountChange } from "./ChangeTransferAccountHook";

type UseDeathDisabilityActionHookParams = {
    formik: FormikProps<DeathDisabilityConsiderValues>;
    detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined;
    /** ใช้ดึงเอกสารที่บันทึกไว้แล้วของเคส (GetDocumentByCaseId) — ส่งค่าเดียวกับ DocumentScanTable ให้ใช้ cache ร่วมกัน */
    productTypeId: number | undefined;
    /** บัญชีปลายทางที่เปลี่ยนจาก dialog เงินสดมอบหน้างาน — มีค่าจึงส่ง beneficiary + เอกสารประกอบการเปลี่ยนบัญชี */
    transferAccountChange: TransferAccountChange | undefined;
    /** เอกสารที่แนบตอนแก้ไขรายการเปลี่ยนบัญชีที่บันทึกแล้ว — ส่งผูกกับเคสใน caseDocument */
    savedTransferAccountDocuments: CaseDocumentV2Request[];
    /** จำนวนเงินโอนรวม — payoutAmount ของผู้รับเงินตามบัญชีที่เปลี่ยน */
    totalPayoutAmount: number;
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
 * beneficiary ส่งเฉพาะเมื่อบันทึก dialog เปลี่ยนบัญชีปลายทางการโอนเงินแล้ว (ผู้รับเงินตามบัญชีใหม่)
 * — การแก้ข้อมูลผู้รับผลประโยชน์เดิมบันทึกผ่าน UpdateBeneficiary ทันทีจาก dialog แก้ไขแล้ว
 */
const useDeathDisabilityActionHook = ({
    formik,
    detail,
    productTypeId,
    transferAccountChange,
    savedTransferAccountDocuments,
    totalPayoutAmount,
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
     * รายการค่าใช้จ่ายเดิมของเคส (หน้านี้แก้ไม่ได้) — ส่งกลับไปตามเดิมไม่ให้ caseItem ของเคสหาย
     * - เคลมทุพพลภาพ: GetCaseDisabilityBenefitByCaseId (หนึ่งรายการต่ออวัยวะ)
     * - เคลมอื่น: GetStandardMedicalExpenseByCase เฉพาะแถวที่เป็น caseItem จริงของเคส (มี caseItemId)
     */
    const mapCaseItems = (): UpsertDeathAndDisabilityCaseItemRequest[] => [
        ...disabilityBenefits.map(
            (item): UpsertDeathAndDisabilityCaseItemRequest => ({
                inputToStandardMappingId: item.inputToStandardMappingId,
                standardMedicalExpenseId: item.standardMedicalExpenseId,
                quantity: item.quantity ?? 1,
                perUnit: item.perUnit ?? 0,
                originalAmount: item.originalAmount ?? item.netCaseAmount ?? 0,
                discountAmount: item.discountAmount ?? 0,
                netCaseAmount: item.netCaseAmount ?? 0,
                nonCoveredAmount: item.nonCoveredAmount ?? 0,
                nonCoveredReasonId: item.nonCoveredReasonId || undefined,
                bodyPartId: item.bodyPartId,
            })
        ),
        ...standardExpenses
            .filter((item) => !!item.caseItemId)
            .map(
                (item): UpsertDeathAndDisabilityCaseItemRequest => ({
                    inputToStandardMappingId: item.inputToStandardMappingId,
                    standardMedicalExpenseId: item.standardMedicalExpenseId,
                    quantity: item.quantity ?? 1,
                    perUnit: item.perUnit ?? 0,
                    originalAmount: item.originalAmount ?? 0,
                    discountAmount: item.discountAmount ?? 0,
                    netCaseAmount: item.netCaseAmount ?? 0,
                    medicalTypeId: item.medicalTypeId,
                    nonCoveredAmount: item.nonCoveredAmount ?? 0,
                    nonCoveredReasonId: item.nonCoveredReasonId || undefined,
                    bodyPartId: item.bodyPartId,
                })
            ),
    ];

    const mapCaseAdjudication = (
        caseItems: UpsertDeathAndDisabilityCaseItemRequest[]
    ): UpsertDeathAndDisabilityCaseAdjudicationRequest => {
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
            // หนึ่งรายการต่อ caseItem ลำดับเดียวกัน — หน้านี้ไม่มีการคำนวณ ใช้ยอดสุทธิหักยอดไม่คุ้มครอง
            caseItemAdjudications: caseItems.map((item): UpsertDeathAndDisabilityCaseItemAdjudicationRequest => {
                const eligibleAmount = (item.netCaseAmount ?? 0) - (item.nonCoveredAmount ?? 0);
                return {
                    standardMedicalExpenseId: item.standardMedicalExpenseId,
                    netCaseAmount: item.netCaseAmount,
                    eligibleAmount,
                    approvedAmount: eligibleAmount,
                    nonCoveredAmount: item.nonCoveredAmount,
                    excessAmount: 0,
                };
            }),
        };
    };

    /**
     * เอกสารที่แนบไฟล์แล้วในหน้านี้ — สแกนเอกสาร + เอกสารประกอบการปฏิเสธ (เฉพาะผลปฏิเสธ)
     * + เอกสารประกอบการเปลี่ยนบัญชี (มีเฉพาะเมื่อกดบันทึก dialog แล้ว)
     * เอกสารที่ผูกกับ caseId + claimDocumentTypeId เดียวกันอยู่แล้ว (GetDocumentByCaseId) ไม่ส่งซ้ำ
     * ไม่อ่าน documentScanList ของ redux claimPH เพราะเป็น list กลางที่มีเอกสารของหน้า/เคสอื่นปนอยู่
     */
    const mapCaseDocuments = (): UpsertDeathAndDisabilityCaseDocumentRequest[] => {
        const docs = [
            ...scanDocuments,
            ...(formik.values.considerResult === DECISION_ID.REJECTED ? rejectDocuments : []),
            ...(transferAccountChange?.attachedDocuments ?? []),
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
                    caseDocumentDetail: [],
                })
            );
    };

    /** ผู้รับเงินตามบัญชีที่เปลี่ยนใน dialog เงินสดมอบหน้างาน — ไม่ได้บันทึก dialog = ไม่ส่ง */
    const mapBeneficiaries = (): UpsertDeathAndDisabilityBeneficiaryRequest[] | undefined =>
        transferAccountChange
            ? [
                  {
                      // TODO(death-disability-api): bankAccountRelationTypeId หน้านี้ไม่มีข้อมูล — รอ BE ยืนยันค่าที่ต้องส่ง
                      titleId: transferAccountChange.payeeTitleId?.toString(),
                      firstName: transferAccountChange.payeeFirstName || undefined,
                      lastName: transferAccountChange.payeeLastName || undefined,
                      bankId: transferAccountChange.bankId,
                      bankAccountNo: transferAccountChange.accountNo,
                      bankAccountName: transferAccountChange.accountName,
                      payoutAmount: totalPayoutAmount,
                      // เหตุผลการเปลี่ยนแปลงที่กรอกใน dialog
                      changeReasonRemark: transferAccountChange.reason,
                      beneficiaryTypeId: 3,
                      policyBeneficiaryId: 0,
                  },
              ]
            : undefined;

    const mapPayload = (): UpsertDeathAndDisabilityClaimDecisionDtoRequest => {
        const { considerResult, decisionReasonId, documentCompleteDate } = formik.values;
        const caseItems = mapCaseItems();
        return {
            claimId: detail?.claimId,
            caseId: detail?.caseId,
            caseItem: caseItems,
            caseAssessment: documentCompleteDate
                ? { isDocumentComplete: true, documentCompleteDate: dayjs(documentCompleteDate) }
                : undefined,
            caseAdjudication: mapCaseAdjudication(caseItems),
            beneficiary: mapBeneficiaries(),
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

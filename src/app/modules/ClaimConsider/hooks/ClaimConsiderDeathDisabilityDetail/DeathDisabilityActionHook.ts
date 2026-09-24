import dayjs from "dayjs";
import { FormikProps } from "formik";
import { useApproveClaimDecision, useUpsertClaimDecision } from "../../../../api/coreClaimApi";
import {
    ApproveClaimDecisionDtoRequest,
    CaseDocumentV2Request,
    GetCaseDisabilityBenefitByCaseIdDtoResponse,
    GetDeathAndDisabilityBeneficiaryDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
    GetStandardMedicalExpenseByCaseDtoResponse,
    UpsertClaimDecisionBeneficiaryRequest,
    UpsertClaimDecisionCaseAdjudicationRequest,
    UpsertClaimDecisionCaseDeathRequest,
    UpsertClaimDecisionCaseDisabilityRequest,
    UpsertClaimDecisionCaseDocumentRequest,
    UpsertClaimDecisionCaseItemAdjudicationRequest,
    UpsertClaimDecisionCaseItemRequest,
    UpsertClaimDecisionDtoRequest,
    UpsertClaimDecisionDtoResponseServiceResponse,
} from "../../../../api/coreClaimApi.client";
import { swalError, swalSuccess } from "../../../_common";
import { DECISION_ID } from "../../store/claimConsider.constants";
import { DEATH_DISABILITY_IN_PROGRESS_DECISION_ID, DeathDisabilityConsiderValues } from "./DeathDisabilityConsiderHook";
import { TransferAccountChange } from "./ChangeTransferAccountHook";
import { DISABILITY_COVERAGE_TYPE_ID } from "./DeathDisabilityExpenseHook";

/** coverageTypeId ของ "เสียชีวิต" */
const DEATH_COVERAGE_TYPE_ID = 5;

type UseDeathDisabilityActionHookParams = {
    formik: FormikProps<DeathDisabilityConsiderValues>;
    detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined;
    /** ผู้รับผลประโยชน์ของเคส (ค่าล่าสุดจาก API — การแก้ไขบันทึกผ่าน UpdateBeneficiary แล้ว) */
    beneficiaries: GetDeathAndDisabilityBeneficiaryDtoResponse[];
    /** ยอดโอนรวมของผู้รับผลประโยชน์ (รวมยอดที่แก้แล้ว) — ใช้เป็น payableAmount ตอนอนุมัติ */
    totalPayoutAmount: number;
    /** บัญชีปลายทางที่เปลี่ยนจาก dialog เงินสดมอบหน้างาน — ไม่มี = ไม่ส่งบัญชีปลายทาง */
    transferAccountChange: TransferAccountChange | undefined;
    /** เอกสารที่แนบไฟล์แล้วในตาราง "สแกนเอกสาร" */
    scanDocuments: CaseDocumentV2Request[];
    /** เอกสารที่แนบไฟล์แล้วในตาราง "เอกสารประกอบการปฏิเสธ" — ส่งเฉพาะเมื่อผลเป็นปฏิเสธ */
    rejectDocuments: CaseDocumentV2Request[];
    /** รายการทุพพลภาพของเคส (GetCaseDisabilityBenefitByCaseId) — เคลมอื่นเป็น [] */
    disabilityBenefits: GetCaseDisabilityBenefitByCaseIdDtoResponse[];
    /** รายการค่าใช้จ่ายของเคส (GetStandardMedicalExpenseByCase) — เคลมทุพพลภาพเป็น [] */
    standardExpenses: GetStandardMedicalExpenseByCaseDtoResponse[];
    onSuccess?: (response: UpsertClaimDecisionDtoResponseServiceResponse) => void;
};

/**
 * ยิงบันทึกผลพิจารณาของเคลม Death & Disability
 * - อนุมัติ (9) → POST approve (useApproveClaimDecision)
 * - กำลังพิจารณา (7) / รอแก้ไข (4) / ปฏิเสธ (5) / ยกเลิก (6) → POST upsert (useUpsertClaimDecision)
 *
 * ต่างจาก useClaimDetailActionHook ของเคลมลูกค้า/โรงพยาบาล: ส่งเฉพาะฟิลด์ที่ผู้ใช้แก้ได้ในหน้าจอนี้
 * (ผลพิจารณา, วันที่เอกสารครบ, สาเหตุ/รายละเอียด/หมายเหตุ, ผู้รับผลประโยชน์ที่แก้, เอกสารที่สแกน, บัญชีปลายทาง)
 * ยกเว้นฟิลด์ที่ BE validate บังคับ (incidentTypeId, incidentDate, chiefComplaint, array ต่าง ๆ)
 * ส่งค่าเดิมจากรายละเอียดเคลม หรือ [] ถ้าหน้านี้ไม่มีข้อมูล
 */
const useDeathDisabilityActionHook = ({
    formik,
    detail,
    beneficiaries,
    totalPayoutAmount,
    transferAccountChange,
    scanDocuments,
    rejectDocuments,
    disabilityBenefits,
    standardExpenses,
    onSuccess,
}: UseDeathDisabilityActionHookParams) => {
    const handleSuccess = (title: string) => (response: UpsertClaimDecisionDtoResponseServiceResponse) =>
        onSuccess ? onSuccess(response) : swalSuccess(title, "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว");
    const upsertClaimDecision = useUpsertClaimDecision(handleSuccess("บันทึกผลพิจารณาสำเร็จ"), (error) =>
        swalError("ไม่สำเร็จ", error)
    );
    const approveClaimDecision = useApproveClaimDecision(handleSuccess("อนุมัติผลพิจารณาสำเร็จ"), (error) =>
        swalError("ไม่สำเร็จ", error)
    );

    const mapCaseAdjudication = (): UpsertClaimDecisionCaseAdjudicationRequest => {
        const { considerResult, decisionReasonId, decisionReasonDetail, remark } = formik.values;
        // กำลังพิจารณา/อนุมัติ กรอกเป็น "หมายเหตุ" ส่วน รอแก้ไข/ปฏิเสธ/ยกเลิก กรอกเป็น "รายละเอียด"
        const usesRemark =
            considerResult === DEATH_DISABILITY_IN_PROGRESS_DECISION_ID || considerResult === DECISION_ID.APPROVED;
        return {
            decisionId: considerResult,
            decisionDate: dayjs(),
            // ปฏิเสธ/ยกเลิก เลือกจาก master RejectReason/CancelReason ไม่ใช่ DecisionReason
            decisionReasonId: considerResult === DECISION_ID.REVISION ? decisionReasonId : undefined,
            decisionRemark: (usesRemark ? remark : decisionReasonDetail).trim() || undefined,
            rejectReasonId: considerResult === DECISION_ID.REJECTED ? decisionReasonId : undefined,
            rejectDate: considerResult === DECISION_ID.REJECTED ? dayjs() : undefined,
            isLatest: true,
            // BE บังคับจำนวนเท่ากับ caseItem — หนึ่งรายการต่อ caseItem ลำดับเดียวกัน
            caseItemAdjudications: mapCaseItems().map((item): UpsertClaimDecisionCaseItemAdjudicationRequest => {
                // หน้านี้ไม่มีการคำนวณยอดอนุมัติ — ใช้ยอดสุทธิหักยอดไม่คุ้มครองแบบเดียวกับเคลมลูกค้า
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

    /** ข้อมูลการเสียชีวิตจากรายละเอียดเคลม — ส่งเฉพาะเคลมเสียชีวิตที่มีวันที่เสียชีวิต */
    const mapCaseDeath = (): UpsertClaimDecisionCaseDeathRequest[] =>
        detail?.coverageTypeId === DEATH_COVERAGE_TYPE_ID && detail.deathDate
            ? [
                  {
                      // TODO(death-disability-api): BE บังคับ caseDeathId แต่ GetDeathAndDisabilityClaimDetailConsider
                      // ไม่คืนมา — สร้างใหม่ไปก่อน ต้องให้ BE เพิ่ม caseDeathId ใน response ไม่งั้นอาจได้แถวซ้ำ
                      caseDeathId: crypto.randomUUID(),
                      causeOfIncidentId: detail.causeOfIncidentId,
                      deathDate: detail.deathDate,
                  },
              ]
            : [];

    /** อวัยวะที่ทุพพลภาพ/สูญเสียจาก GetCaseDisabilityBenefitByCaseId — ส่งค่าเดิมของเคส (หน้านี้แก้ไม่ได้) */
    const mapCaseDisability = (): UpsertClaimDecisionCaseDisabilityRequest[] =>
        disabilityBenefits
            .filter((item) => item.bodyPartId !== undefined && item.bodyPartId !== null)
            .map(
                (item): UpsertClaimDecisionCaseDisabilityRequest => ({
                    caseDisabilityId: item.caseDisabilityId,
                    bodyPartId: item.bodyPartId,
                })
            );

    /**
     * รายการค่าใช้จ่ายเดิมของเคส (หน้านี้แก้ไม่ได้) — ส่งกลับไปตามเดิมไม่ให้ caseItem ของเคสหาย
     * - เคลมทุพพลภาพ: GetCaseDisabilityBenefitByCaseId (หนึ่งรายการต่ออวัยวะ)
     * - เคลมอื่น: GetStandardMedicalExpenseByCase เฉพาะแถวที่เป็น caseItem จริงของเคส (มี caseItemId)
     */
    const mapCaseItems = (): UpsertClaimDecisionCaseItemRequest[] => [
        ...disabilityBenefits.map(
            (item): UpsertClaimDecisionCaseItemRequest => ({
                inputToStandardMappingId: item.inputToStandardMappingId,
                standardMedicalExpenseId: item.standardMedicalExpenseId,
                quantity: 1,
                perUnit: 0,
                originalAmount: item.netCaseAmount ?? 0,
                discountAmount: 0,
                netCaseAmount: item.netCaseAmount ?? 0,
                nonCoveredAmount: 0,
                nonCoveredReasonId: undefined,
                bodyPartId: item.bodyPartId,
            })
        ),
        ...standardExpenses
            .filter((item) => !!item.caseItemId)
            .map(
                (item): UpsertClaimDecisionCaseItemRequest => ({
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

    const mapBeneficiaries = (): UpsertClaimDecisionBeneficiaryRequest[] =>
        beneficiaries.map(
            (item): UpsertClaimDecisionBeneficiaryRequest => ({
                beneficiaryId: item.beneficiaryId,
                titleId: item.titleId,
                firstName: item.firstName,
                lastName: item.lastName,
                idCard: item.idCard,
                phoneNo: item.phoneNo,
                relationId: item.relationId,
                bankId: item.bankId,
                bankAccountNo: item.bankAccountNo,
                bankAccountName: item.bankAccountName,
                payoutAmount: item.payoutAmount,
            })
        );

    /**
     * เอกสารที่แนบไฟล์แล้วในหน้านี้ — สแกนเอกสาร + เอกสารประกอบการปฏิเสธ (เฉพาะผลปฏิเสธ)
     * + เอกสารประกอบการเปลี่ยนบัญชี (มีเฉพาะเมื่อกดบันทึก dialog แล้ว)
     * ไม่อ่าน documentScanList ของ redux claimPH เพราะเป็น list กลางที่มีเอกสารของหน้า/เคสอื่นปนอยู่
     */
    const mapCaseDocuments = (): UpsertClaimDecisionCaseDocumentRequest[] => {
        const docs = [
            ...scanDocuments,
            ...(formik.values.considerResult === DECISION_ID.REJECTED ? rejectDocuments : []),
            ...(transferAccountChange?.attachedDocuments ?? []),
        ];
        return docs
            .filter((doc, index) => docs.findIndex((d) => d.documentId === doc.documentId) === index)
            .map(
                (doc): UpsertClaimDecisionCaseDocumentRequest => ({
                    documentId: doc.documentId,
                    documentNo: doc.documentNo,
                    documentSubTypeId: doc.documentSubTypeId ?? 0,
                    caseDocumentDetail: [],
                })
            );
    };

    const mapClaimDecisionPayload = (): UpsertClaimDecisionDtoRequest => {
        const { considerResult, decisionReasonId, documentCompleteDate } = formik.values;
        return {
            claimId: detail?.claimId,
            caseId: detail?.caseId,
            // ค่าที่ BE validate บังคับ — ผู้ใช้แก้ไม่ได้ในหน้านี้ ส่งค่าเดิมจากรายละเอียดเคลม (GetDeathAndDisabilityClaimDetailConsider)
            incidentTypeId: detail?.incidentTypeId,
            incidentDate: detail?.incidentDate,
            case: {
                coverageTypeId: detail?.coverageTypeId,
                occurrenceDate: detail?.incidentDate,
                hospitalId: detail?.hospitalId,
                chiefComplaintId: detail?.chiefComplaintId,
                // BE บังคับ chiefComplaintCustom เมื่อไม่มี chiefComplaintId
                chiefComplaintCustom: detail?.chiefComplaintId ? undefined : detail?.chiefComplaint,
                icD10_1stId: detail?.icD10_1stId,
                icD10_2ndId: detail?.icD10_2ndId,
                icD10_3rdId: detail?.icD10_3rdId,
                isCaseDisability: detail?.coverageTypeId === DISABILITY_COVERAGE_TYPE_ID,
                caseItem: mapCaseItems(),
                caseDeath: mapCaseDeath(),
                caseDisability: mapCaseDisability(),
                caseAssessment: documentCompleteDate
                    ? { isDocumentComplete: true, documentCompleteDate: dayjs(documentCompleteDate) }
                    : undefined,
                caseAdjudication: mapCaseAdjudication(),
                beneficiary: mapBeneficiaries(),
                caseDocument: mapCaseDocuments(),
                cancelReasonId: considerResult === DECISION_ID.CANCELLED ? decisionReasonId : undefined,
                cancelDate: considerResult === DECISION_ID.CANCELLED ? dayjs() : undefined,
            },
        };
    };

    const mapApprovePayload = (): ApproveClaimDecisionDtoRequest => ({
        claimDecision: mapClaimDecisionPayload(),
        // เคลม Death & Disability ไม่ผ่านการคำนวณ /calculate/caseclaim — ไม่มี calculateCaseCode
        isCombinedWithMedicalAll: false,
        casePayable: {
            payableAmount: totalPayoutAmount,
            toBankId: transferAccountChange?.bankId,
            toBankName: transferAccountChange?.bankName,
            toBankAccountNo: transferAccountChange?.accountNo,
        },
        // TODO(death-disability-api): DTO บังคับ jsonDetail แต่หน้านี้ไม่มีผลคำนวณ — ส่ง object ว่างไปก่อน รอ BE ยืนยัน
        jsonDetail: "{}",
    });

    /** เรียกหลัง formik validate ผ่านแล้ว (onSubmit) */
    const handleSubmitDecision = async () => {
        if (formik.values.considerResult === DECISION_ID.APPROVED) {
            await approveClaimDecision.mutateAsync(mapApprovePayload());
        } else {
            await upsertClaimDecision.mutateAsync(mapClaimDecisionPayload());
        }
    };

    return {
        handleSubmitDecision,
        isSubmitting: upsertClaimDecision.isLoading || approveClaimDecision.isLoading,
    };
};

export default useDeathDisabilityActionHook;

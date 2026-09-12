import dayjs, { Dayjs } from "dayjs";
import { useApproveClaimDecision, useSaveClaimEditDraft, useUpsertClaimDecision } from "../../../../api/coreClaimApi";
import {
    ApproveCasePayableRequest,
    ApproveClaimDecisionDtoRequest,
    SaveClaimEditDraftDtoRequest,
    SaveClaimEditDraftDtoResponeServiceResponse,
    CaseSaveClaimEditDraftRequest,
    CaseAssessmentSaveClaimEditDraftRequest,
    CaseAdjudicationSaveClaimEditDraftRequest,
    CaseDocumentSaveClaimEditDraftRequest,
    CaseDocumentDetailSaveClaimEditDraftRequest,
    TimeSpan,
    CaseItemAdjudicationSaveClaimEditDraftRequest,
    CaseItemSaveClaimEditDraftRequest,
    UpsertClaimDecisionDtoRequest,
    UpsertClaimDecisionCaseItemRequest,
    UpsertClaimDecisionCaseItemAdjudicationRequest,
    UpsertClaimDecisionCaseAssessmentRequest,
    UpsertClaimDecisionCaseAdjudicationRequest,
    UpsertClaimDecisionCaseDocumentRequest,
    UpsertClaimDecisionCaseDocumentDetailRequest,
    UpsertClaimDecisionCaseRequest,
    UpsertClaimDecisionDtoResponseServiceResponse,
    CalculateCaseClaimDtoResponse,
    CalculateCaseClaim,
} from "../../../../api/coreClaimApi.client";
import { FormikProps } from "formik";
import { customFormatter, swalError, swalSuccess } from "../../../_common";
import { DocumentCheckRow } from "../../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";
import useConsiderDetailHook from "./ConsiderDetailHook";
import { claimPHSelector } from "../../../CreatedClaim/store/claimPHSlice";
import { useAppSelector } from "../../../../../redux";
import {
    claimConsiderSelector,
    ClaimConsiderValues,
    ClaimExpenseItem,
    OcrReceiptRequest,
} from "../../store/claimConsiderSlice";

/**
 * รับ formik ของฟอร์มพิจารณาเคลม ค่าเป็นชนิดใดก็ได้ที่ต่อยอดจาก ClaimConsiderValues
 * (หน้าเคลมโรงพยาบาลใช้ HospitalConsiderValues ที่ extend มา)
 */
type UseClaimDetailActionHookParams<T extends ClaimConsiderValues = ClaimConsiderValues> = {
    formik: FormikProps<T>;
    isCombinedWithMedicalAll?: boolean;
    /** ฟิลด์ระดับ case ที่มีเฉพาะบางหน้า (เคลมโรงพยาบาล : HN / AN / VN) */
    caseFields?: Pick<UpsertClaimDecisionCaseRequest, "hn" | "an" | "vn">;
    /**
     * ตารางตรวจสอบเอกสาร (ค่าดิบจาก formik ของเคลมโรงพยาบาล)
     * hook เป็นคนกรอง/แปลงเป็น case.caseDocument[].documentReviewStatusId เอง
     */
    documentChecks?: DocumentCheckRow[];
    /**
     * บัญชีปลายทางรับเงิน — ส่งมาเฉพาะเคลมโรงพยาบาล
     * เคลมลูกค้าไม่ต้องส่ง casePayable จึงไม่มี toBankId / toBankName / toBankAccountNo
     */
    payoutAccount?: { bankId?: number; bankName?: string; bankAccountNo?: string };
    /**
     * ให้หน้าที่เรียกจัดการผลสำเร็จของการอนุมัติเอง (เช่น แสดง toast)
     * ไม่ส่งมาจะ fallback เป็น swalSuccess แบบเดิม
     */
    onApproveSuccess?: (response: UpsertClaimDecisionDtoResponseServiceResponse) => void;
    /**
     * ให้หน้าที่เรียกจัดการผลสำเร็จของการบันทึกผลพิจารณาเอง (เช่น redirect)
     * ไม่ส่งมาจะ fallback เป็น swalSuccess แบบเดิม
     */
    onConfirmConsiderSuccess?: (response: UpsertClaimDecisionDtoResponseServiceResponse) => void;
    /**
     * ให้หน้าที่เรียกจัดการผลสำเร็จของการบันทึกแบบร่างเอง (เช่น redirect)
     * ไม่ส่งมาจะ fallback เป็น swalSuccess แบบเดิม
     */
    onSaveDraftSuccess?: (response: SaveClaimEditDraftDtoResponeServiceResponse) => void;
    /**
     * step ของ wizard (1-based) ที่ผู้ใช้อยู่ตอนกด "บันทึกแบบร่าง" — ส่งเป็น draftStep ให้ backend
     * ไม่ส่งมา = 1 (ผู้เรียกเดิมที่ยังไม่ระบุ step)
     */
    draftStep?: number;
    /**
     * แทนที่ผลคำนวณ (calculateResult) ที่อ่านจาก Redux — ใช้กับเคลมโรงพยาบาลที่ต้องปรับยอด
     * ตามตัวเลือก "โอนค่าชดเชยรวมกับค่ารักษา" (calculateCompensationSummary) ก่อนส่ง payload อนุมัติ
     * ไม่ส่งมา = ใช้ค่าจาก Redux ตามเดิม (เคลมลูกค้า)
     */
    calculateOverride?: CalculateCaseClaimDtoResponse | null;
} & Pick<ReturnType<typeof useConsiderDetailHook>, "detailData" | "customerDetailData">;

/**
 * ค่า fallback ของ nonCoveredReasonId : BE บังคับต้องมี + > 0 ทุก caseItem แม้ไม่มียอดไม่คุ้มครอง
 * ใช้ id แรกของ Master สาเหตุไม่คุ้มครอง (BE จะ ignore เมื่อ nonCoveredAmount = 0)
 */
const DEFAULT_NON_COVERED_REASON_ID = 1;

/** BE ต้องการ documentId เป็น GUID เท่านั้น ใช้กรอง mock row ที่ยังเป็น string ธรรมดาออก */
const isGuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/**
 * casePayable ฝั่ง FE : บัญชีปลายทางเป็น optional เพราะเคลมลูกค้าไม่ส่ง
 * (DTO ที่ codegen มาประกาศทั้งสามฟิลด์เป็น required)
 */
type CasePayableDraft = Pick<ApproveCasePayableRequest, "payableAmount"> &
    Partial<Omit<ApproveCasePayableRequest, "payableAmount">>;

const useClaimDetailActionHook = <T extends ClaimConsiderValues = ClaimConsiderValues>({
    formik,
    detailData,
    customerDetailData,
    isCombinedWithMedicalAll = false,
    caseFields,
    documentChecks,
    payoutAccount,
    onApproveSuccess,
    onConfirmConsiderSuccess,
    onSaveDraftSuccess,
    calculateOverride,
    draftStep,
}: UseClaimDetailActionHookParams<T>) => {
    const { documentScanList } = useAppSelector(claimPHSelector);
    const { filledItems, calculateResult: calculateResultStore } = useAppSelector(claimConsiderSelector);
    // เคลมโรงพยาบาลส่ง calculateOverride มาปรับยอดตามตัวเลือก "โอนค่าชดเชยรวมกับค่ารักษา" ก่อนสร้าง payload
    const calculateResult = calculateOverride ?? calculateResultStore;
    const caseItemId = crypto.randomUUID();
    const totalClaim = filledItems.reduce((s, i) => s + (i.claimAmount || 0), 0);
    const totalDiscount = filledItems.reduce((s, i) => s + (i.discount || 0), 0);
    const totalNotCovered = filledItems.reduce((s, i) => s + (i.notCovered || 0), 0);
    const netClaimAmount = totalClaim - totalDiscount - totalNotCovered;
    const saveClaimEditDraft = useSaveClaimEditDraft(
        (response) =>
            onSaveDraftSuccess
                ? onSaveDraftSuccess(response)
                : swalSuccess("บันทึกแบบร่างสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว"),
        (error) => swalError("ไม่สำเร็จ", error)
    );
    const saveClaimDecision = useUpsertClaimDecision(
        (response) =>
            onConfirmConsiderSuccess
                ? onConfirmConsiderSuccess(response)
                : swalSuccess("บันทึกผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว"),
        (error) => swalError("ไม่สำเร็จ", error)
    );
    const approveClaimDecision = useApproveClaimDecision(
        (response) =>
            onApproveSuccess
                ? onApproveSuccess(response)
                : swalSuccess("อนุมัติผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว"),
        (error) => swalError("ไม่สำเร็จ", error)
    );

    // ---------- Date/Time helpers ----------
    // formik เก็บ date+time แยกกันเป็น Dayjs คนละ field
    // backend ต้องการ date (YYYY-MM-DD) และ time (HH:mm:ss) แยกกันเช่นกัน

    const asDate = (date: Dayjs | undefined): Dayjs | undefined => (date?.isValid() ? date : undefined);

    const asTimeSpan = (time: Dayjs | undefined): TimeSpan | undefined => {
        if (!time?.isValid()) return undefined;
        return time.format("HH:mm:ss") as unknown as TimeSpan;
    };

    const getNetAmount = (item: ClaimExpenseItem) => (item.claimAmount ?? 0) - (item.discount ?? 0);
    const mapCaseItemForDraft = (): CaseItemSaveClaimEditDraftRequest[] => {
        return filledItems.map((item): CaseItemSaveClaimEditDraftRequest => {
            const nonCovered = Number(item.notCovered ?? 0);
            const reasonId = Number(item.reason ?? 0);

            return {
                caseItemId: caseItemId,
                inputToStandardMappingId: item.inputToStandardMappingId,
                standardMedicalExpenseId: item.standardMedicalExpenseId ?? 0,
                quantity: 1,
                perUnit: 0,
                originalAmount: item.claimAmount ?? 0,
                discountAmount: item.discount ?? 0,
                netCaseAmount: getNetAmount(item),
                medicalTypeId: formik.values.medicalTypeId ?? 0,
                nonCoveredAmount: nonCovered,
                nonCoveredReasonId: reasonId > 0 ? reasonId : DEFAULT_NON_COVERED_REASON_ID,
            };
        });
    };

    const mapCaseItemAdjudicationForDraft = (): CaseItemAdjudicationSaveClaimEditDraftRequest[] => {
        return filledItems.map(
            (item): CaseItemAdjudicationSaveClaimEditDraftRequest => ({
                caseItemAdjusication: crypto.randomUUID(),
                standardMedicalExpenseId: item.standardMedicalExpenseId,
                caseItemId: caseItemId,
                netCaseAmount: getNetAmount(item),
                eligibleAmount: getNetAmount(item) - (item.notCovered ?? 0),
                approvedAmount: getNetAmount(item) - (item.notCovered ?? 0),
                nonCoveredAmount: item.notCovered ?? 0,
                excessAmount: 0,
            })
        );
    };
    /** CaseAssessment: สถานะเอกสารเคลม */
    const mapCaseAssessmentForDraft = (): CaseAssessmentSaveClaimEditDraftRequest | undefined => {
        const { documentCompleteDate } = formik.values;
        if (!documentCompleteDate) return undefined;

        return {
            isDocumentComplete: documentCompleteDate !== undefined,
            documentReceivedDate: dayjs(),
            documentCompleteDate: asDate(documentCompleteDate),
            isFraudSuspect: false,
            documentReceivedByUserId: detailData?.data?.documentReceivedByUserId,
            documentReceivedByUserCode: undefined,
            documentReceivedByUserName: detailData?.data?.documentReceivedByUserName,
        };
    };

    /** CaseAdjudication: ผลการพิจารณา (อนุมัติ/ปฏิเสธ) */
    const mapCaseAdjudicationForDraft = (): CaseAdjudicationSaveClaimEditDraftRequest | undefined => {
        const {
            considerResult,
            decisionReasonId,
            decisionReasonDetail,
            admissionDate,
            admissionTime,
            dischargeDate,
            dischargeTime,
            ipdDays,
            icuDays,
        } = formik.values;
        // ฉบับร่างต้องเก็บ ipdDays/icuDays (กรอกใน Step 1 ไม่ใช่ผลอนุมัติ) ได้แม้ยังไม่ได้เลือก "ผลการ
        // พิจารณา" — เดิม return undefined ทั้งก้อนทันทีที่ considerResult ยังไม่ถูกเลือก ทำให้กด
        // "บันทึกแบบร่าง" กลางคันแล้วค่าที่กรอกไว้หายไป (decisionId เป็น optional field ใน DTO อยู่แล้ว)
        if (considerResult === undefined && !ipdDays && !icuDays) return undefined;

        return {
            decisionId: considerResult,
            decisionDate: considerResult !== undefined ? dayjs() : undefined,
            decisionReasonId: decisionReasonId,
            decisionRemark: decisionReasonDetail,
            approvedAdmissionDate: considerResult === 2 ? asDate(admissionDate) : undefined,
            approvedAdmissionTime: considerResult === 2 ? asTimeSpan(admissionTime) : undefined,
            approvedDischargeDate: considerResult === 2 ? asDate(dischargeDate) : undefined,
            approvedDischargeTime: considerResult === 2 ? asTimeSpan(dischargeTime) : undefined,
            approvedIPDDayCount: ipdDays,
            approvedICUDayCount: icuDays,
            coveredAmount: netClaimAmount, //รายการค่าใช้จ่าย
            nonCoveredAmount: totalNotCovered, //รายการค่าใช้จ่าย
            compensateAmount: 0, //ไม่มี
            approvedMedicalAmount: 0, //ต้องอนุมัติ
            approvedCompensateAmount: 0, //ต้องอนุมัติ
            patientPayAmount: 0, //เคลมโรงพยาบาลถึงจะมี
            isExgratia: false, //ไม่มี
            exgratiaAmount: 0, //ไม่มี
            deductibleAmount: 0, //ไม่มี
            coPayAmount: netClaimAmount, //ยอดเบิก
            coInsuranceAmount: 0, //ไม่มี
            rejectReasonId: considerResult === 6 ? decisionReasonId : undefined,
            rejectDate: considerResult === 6 ? dayjs() : undefined,
            isLatest: true,
            caseItemAdjudications: mapCaseItemAdjudicationForDraft(), // TODO: ไม่มีใน formik/detailData ตอนนี้
        };
    };
    const mapConsiderDocumentForDraft = (): CaseDocumentSaveClaimEditDraftRequest[] => {
        const { considerDocument } = formik.values;
        if (!considerDocument?.length) return [];

        return considerDocument.map(
            (doc): CaseDocumentSaveClaimEditDraftRequest => ({
                caseDocumentId: doc.caseDocumentId,
                documentId: doc.documentId,
                documentNo: doc.documentNo,
                documentSubTypeId: doc.documentSubTypeId,
                caseDocumentDetail: mapOcrReceiptDetailForDraft(doc.caseDocumentDetail),
            })
        );
    };

    /** จาก documentScanList (redux claimPH) — เอกสาร scan เฉย ๆ ไม่มี OCR detail */
    const mapDocumentScanListForDraft = (): CaseDocumentSaveClaimEditDraftRequest[] => {
        return documentScanList.map(
            (d): CaseDocumentSaveClaimEditDraftRequest => ({
                documentId: d.documentId,
                documentNo: d.documentCode,
                documentSubTypeId: d.documentSubTypeId,
                caseDocumentDetail: [],
            })
        );
    };

    const mapOcrReceiptDetailForDraft = (
        details: OcrReceiptRequest[] | undefined
    ): CaseDocumentDetailSaveClaimEditDraftRequest[] => {
        if (!details?.length) return [];

        return details.map(
            (doc): CaseDocumentDetailSaveClaimEditDraftRequest => ({
                caseDocumentDetailId: doc.caseDocumentDetailId,
                firstName: doc.firstName,
                lastName: doc.lastName,
                fullName: doc.fullName,
                hospitalName: doc.hospitalName,
                receiptAdmissionDate: asDate(doc.receiptAdmissionDate),
                receiptNumber: doc.receiptNumber,
                receiptAmount: doc.receiptAmount,
                ocrDocumentTypeId: doc.ocrDocumentTypeId,
                ocrResult: doc.ocrResult,
            })
        );
    };

    /** รวมทั้ง 2 แหล่งเป็น array เดียวสำหรับ payload */
    const mapCaseDocumentForDraft = (): CaseDocumentSaveClaimEditDraftRequest[] => [
        ...mapConsiderDocumentForDraft(),
        ...mapDocumentScanListForDraft(),
    ];
    /** Case: ก้อนกลางของ DTO */
    const mapCaseForDraft = (): CaseSaveClaimEditDraftRequest => {
        const { values } = formik;

        return {
            coverageTypeId: values.coverageTypeId,
            occurrenceDate: asDate(values.incidentDate),
            occurrenceTime: asTimeSpan(values.incidentTime),
            admissionDate: asDate(values.admissionDate),
            admissionTime: asTimeSpan(values.admissionTime),
            dischargeDate: asDate(values.dischargeDate),
            dischargeTime: asTimeSpan(values.dischargeTime),
            hospitalId: values.hospitalId,
            chiefComplaintId: values.chiefComplaintId,
            medicalTypeId: values.medicalTypeId,
            productId: customerDetailData?.data?.productId ?? undefined,
            icD10_1stId: values.diagnoses?.[0]?.icd10Id,
            icD10_2ndId: values.diagnoses?.[1]?.icd10Id,
            icD10_3rdId: values.diagnoses?.[2]?.icd10Id,
            icD10_4thId: values.diagnoses?.[3]?.icd10Id,
            icD10_5thId: values.diagnoses?.[4]?.icd10Id,
            icD10_6thId: values.diagnoses?.[5]?.icd10Id,
            caseAmount: netClaimAmount, //ยอดเบิก
            latestApprovedAmount: 0, //ต้องอนุมัติ
            latestNonCoveredAmount: totalNotCovered,
            latestPatientPayAmount: 0, //โรงพยาบาล
            isCaseDisability: false, //ไม่มี
            hn: caseFields?.hn,
            an: caseFields?.an,
            vn: caseFields?.vn,
            caseItem: mapCaseItemForDraft(), // TODO: ไม่มี array นี้ใน ClaimConsiderValues
            caseAssessment: mapCaseAssessmentForDraft(),
            caseAdjudication: mapCaseAdjudicationForDraft(),
            caseDeath: [], //ไม่มี
            caseDisability: [], //ไม่มี
            beneficiary: [], //ไม่มี
            caseDocument: mapCaseDocumentForDraft(),
        };
    };

    // ---------- Main payload ----------
    const mapSaveDraftPayload: SaveClaimEditDraftDtoRequest = {
        claimId: detailData?.data?.claimId,
        caseId: detailData?.data?.caseId,
        incidentTypeId: formik.values.incidentTypeId,
        incidentDate: asDate(formik.values.incidentDate),
        incidentTime: asTimeSpan(formik.values.incidentTime),
        accidentPlace: formik.values.accidentPlace,
        accidentDescription: formik.values.detail,
        case: mapCaseForDraft(),
        draftStep: draftStep ?? 1,
        claimEditDraft: {
            baseClaimVersion: detailData?.data?.claimVersion ?? 0,
            baseCaseVersion: detailData?.data?.caseVersion ?? 0,
            claimEditDraftStatusId: formik.values.considerResult === 5 ? 3 : 1, // แบบร่าง
        },
    };

    const handleSaveDraft = async () => {
        const payload = mapSaveDraftPayload;
        await saveClaimEditDraft.mutateAsync(payload);
    };

    const mapCaseItemForDecision = (): UpsertClaimDecisionCaseItemRequest[] => {
        return filledItems.map((item): UpsertClaimDecisionCaseItemRequest => {
            const nonCovered = Number(item.notCovered ?? 0);
            const reasonId = Number(item.reason ?? 0);

            return {
                inputToStandardMappingId: item.inputToStandardMappingId,
                standardMedicalExpenseId: item.standardMedicalExpenseId ?? 0,
                quantity: 1,
                perUnit: 0,
                originalAmount: item.claimAmount ?? 0,
                discountAmount: item.discount ?? 0,
                netCaseAmount: getNetAmount(item),
                medicalTypeId: formik.values.medicalTypeId ?? 0,
                nonCoveredAmount: nonCovered,
                // BE บังคับต้องมี + > 0 ทุกแถว : ใช้สาเหตุจริงถ้ามี ไม่งั้น fallback 1 (BE ignore เมื่อ nonCoveredAmount = 0)
                nonCoveredReasonId: reasonId > 0 ? reasonId : DEFAULT_NON_COVERED_REASON_ID,
            };
        });
    };

    const mapCaseItemAdjudicationForDecision = (): UpsertClaimDecisionCaseItemAdjudicationRequest[] => {
        return filledItems.map(
            (item): UpsertClaimDecisionCaseItemAdjudicationRequest => ({
                standardMedicalExpenseId: item.standardMedicalExpenseId,
                netCaseAmount: getNetAmount(item),
                eligibleAmount: getNetAmount(item) - (item.notCovered ?? 0),
                approvedAmount: getNetAmount(item) - (item.notCovered ?? 0),
                nonCoveredAmount: item.notCovered ?? 0,
                excessAmount: 0,
            })
        );
    };
    /** CaseAssessment: สถานะเอกสารเคลม */
    const mapCaseAssessmentForDecision = (): UpsertClaimDecisionCaseAssessmentRequest | undefined => {
        const { documentCompleteDate } = formik.values;
        if (!documentCompleteDate) return undefined;

        return {
            isDocumentComplete: documentCompleteDate !== undefined,
            documentReceivedDate: dayjs(),
            documentCompleteDate: asDate(documentCompleteDate),
            isFraudSuspect: false,
            documentReceivedByUserId: detailData?.data?.documentReceivedByUserId,
            documentReceivedByUserCode: undefined,
            documentReceivedByUserName: detailData?.data?.documentReceivedByUserName,
        };
    };

    /** CaseAdjudication: ผลการพิจารณา (อนุมัติ/ปฏิเสธ) — ปุ่มอนุมัติส่ง decisionId = 2 ผ่าน override */
    const mapCaseAdjudicationForDecision = (
        overrideDecisionId?: number
    ): UpsertClaimDecisionCaseAdjudicationRequest | undefined => {
        const {
            considerResult,
            decisionReasonId,
            decisionReasonDetail,
            admissionDate,
            admissionTime,
            dischargeDate,
            dischargeTime,
        } = formik.values;
        const decisionId = overrideDecisionId ?? considerResult;
        if (decisionId === undefined) return undefined;

        return {
            decisionId: decisionId,
            decisionDate: dayjs(),
            decisionReasonId: decisionReasonId,
            decisionRemark: decisionReasonDetail,
            approvedAdmissionDate: decisionId === 9 ? asDate(admissionDate) : undefined,
            approvedAdmissionTime: decisionId === 9 ? asTimeSpan(admissionTime) : undefined,
            approvedDischargeDate: decisionId === 9 ? asDate(dischargeDate) : undefined,
            approvedDischargeTime: decisionId === 9 ? asTimeSpan(dischargeTime) : undefined,
            approvedIPDDayCount: decisionId === 9 ? formik.values.ipdDays : 0,
            approvedICUDayCount: decisionId === 9 ? formik.values.icuDays : 0,
            coveredAmount: netClaimAmount, //รายการค่าใช้จ่าย
            nonCoveredAmount: totalNotCovered, //รายการค่าใช้จ่าย
            compensateAmount: decisionId === 9 ? calculateResult?.compensateInclude : undefined, //ไม่มี
            approvedMedicalAmount: decisionId === 9 ? calculateResult?.medicalPay : undefined, //ต้องอนุมัติ
            approvedCompensateAmount: decisionId === 9 ? calculateResult?.compensateRemain : undefined, //ต้องอนุมัติ
            patientPayAmount: decisionId === 9 ? calculateResult?.medicalUnpay : undefined, //เคลมโรงพยาบาลถึงจะมี
            isExgratia: false, //ไม่มี
            exgratiaAmount: 0, //ไม่มี
            deductibleAmount: 0, //ไม่มี
            coPayAmount: netClaimAmount, //ยอดเบิก
            coInsuranceAmount: 0, //ไม่มี
            rejectReasonId: decisionId === 5 ? decisionReasonId : undefined,
            rejectDate: decisionId === 5 ? dayjs() : undefined,
            isLatest: true,
            caseItemAdjudications: mapCaseItemAdjudicationForDecision(), // TODO: ไม่มีใน formik/detailData ตอนนี้
        };
    };
    const mapConsiderDocumentForDecision = (): UpsertClaimDecisionCaseDocumentRequest[] => {
        const { considerDocument } = formik.values;
        if (!considerDocument?.length) return [];

        return considerDocument.map(
            (doc): UpsertClaimDecisionCaseDocumentRequest => ({
                documentId: doc.documentId,
                documentNo: doc.documentNo,
                documentSubTypeId: doc.documentSubTypeId ?? 0,
                caseDocumentDetail: mapOcrReceiptDetailForDecision(doc.caseDocumentDetail),
            })
        );
    };

    /** จาก documentScanList (redux claimPH) — เอกสาร scan เฉย ๆ ไม่มี OCR detail */
    const mapDocumentScanListForDecision = (): UpsertClaimDecisionCaseDocumentRequest[] => {
        return documentScanList.map(
            (d): UpsertClaimDecisionCaseDocumentRequest => ({
                documentId: d.documentId,
                documentNo: d.documentCode,
                documentSubTypeId: d.documentSubTypeId ?? 0,
                caseDocumentDetail: [],
            })
        );
    };

    const mapOcrReceiptDetailForDecision = (
        details: OcrReceiptRequest[] | undefined
    ): UpsertClaimDecisionCaseDocumentDetailRequest[] => {
        if (!details?.length) return [];

        return details.map(
            (doc): UpsertClaimDecisionCaseDocumentDetailRequest => ({
                firstName: doc.firstName,
                lastName: doc.lastName,
                fullName: doc.fullName,
                hospitalName: doc.hospitalName,
                receiptAdmissionDate: asDate(doc.receiptAdmissionDate),
                receiptNumber: doc.receiptNumber,
                receiptAmount: doc.receiptAmount,
                ocrDocumentTypeId: doc.ocrDocumentTypeId,
                ocrResult: doc.ocrResult,
            })
        );
    };

    /** ตารางตรวจสอบเอกสารของเคลมโรงพยาบาล -> caseDocument[].documentReviewStatusId */
    const mapDocumentReviewsForDecision = (): UpsertClaimDecisionCaseDocumentRequest[] =>
        (documentChecks ?? [])
            .filter((doc) => doc.checkResult !== "" && isGuid(doc.documentId))
            .map(
                (doc): UpsertClaimDecisionCaseDocumentRequest => ({
                    documentId: doc.documentId,
                    // documentNo = documentCode (รูปแบบ DOC.....) จาก GET /document/case/filter ไม่ใช่ชื่อเอกสาร
                    documentNo: doc.documentCode,
                    // documentSubTypeId มาจาก GET /document/case/filter (ผ่าน mapDocumentChecks) — BE บังคับ > 0
                    documentSubTypeId: doc.documentSubTypeId,
                    documentReviewStatusId: doc.checkResult || undefined,
                    documentReviewRemark: doc.remark || undefined,
                    caseDocumentDetail: [],
                })
            );

    /** รวมทุกแหล่งเป็น array เดียวสำหรับ payload (รวมผลการตรวจเอกสารของเคลมโรงพยาบาล) */
    const mapCaseDocumentForDecision = (): UpsertClaimDecisionCaseDocumentRequest[] => [
        ...mapConsiderDocumentForDecision(),
        ...mapDocumentScanListForDecision(),
        ...mapDocumentReviewsForDecision(),
    ];
    /** Case: ก้อนกลางของ DTO */
    const mapCaseForDecision = (overrideDecisionId?: number): UpsertClaimDecisionCaseRequest => {
        const { values } = formik;

        return {
            coverageTypeId: values.coverageTypeId,
            occurrenceDate: asDate(values.incidentDate),
            occurrenceTime: asTimeSpan(values.incidentTime),
            admissionDate: asDate(values.admissionDate),
            admissionTime: asTimeSpan(values.admissionTime),
            dischargeDate: asDate(values.dischargeDate),
            dischargeTime: asTimeSpan(values.dischargeTime),
            hospitalId: values.hospitalId,
            chiefComplaintId: values.chiefComplaintId,
            medicalTypeId: values.medicalTypeId,
            productId: customerDetailData?.data?.productId ?? undefined,
            icD10_1stId: values.diagnoses?.[0]?.icd10Id,
            icD10_2ndId: values.diagnoses?.[1]?.icd10Id,
            icD10_3rdId: values.diagnoses?.[2]?.icd10Id,
            icD10_4thId: values.diagnoses?.[3]?.icd10Id,
            icD10_5thId: values.diagnoses?.[4]?.icd10Id,
            icD10_6thId: values.diagnoses?.[5]?.icd10Id,
            caseAmount: netClaimAmount, //ยอดเบิก
            latestApprovedAmount: calculateResult?.medicalPay, //ต้องอนุมัติ
            latestNonCoveredAmount: totalNotCovered,
            latestPatientPayAmount: calculateResult?.medicalUnpay, //โรงพยาบาล
            isCaseDisability: false, //ไม่มี
            hn: caseFields?.hn,
            an: caseFields?.an,
            vn: caseFields?.vn,
            caseItem: mapCaseItemForDecision(), // TODO: ไม่มี array นี้ใน ClaimConsiderValues
            caseAssessment: mapCaseAssessmentForDecision(),
            caseAdjudication: mapCaseAdjudicationForDecision(overrideDecisionId),
            caseDeath: [], //ไม่มี
            caseDisability: [], //ไม่มี
            beneficiary: [], //ไม่มี
            caseDocument: mapCaseDocumentForDecision(),
        };
    };

    // ---------- Main payload ----------
    const mapClaimDecisionPayload = (overrideDecisionId?: number): UpsertClaimDecisionDtoRequest => ({
        claimId: detailData?.data?.claimId,
        caseId: detailData?.data?.caseId,
        incidentTypeId: formik.values.incidentTypeId,
        incidentDate: asDate(formik.values.incidentDate),
        incidentTime: asTimeSpan(formik.values.incidentTime),
        accidentPlace: formik.values.accidentPlace,
        accidentDescription: formik.values.detail,
        case: mapCaseForDecision(overrideDecisionId),
    });

    /** overrideDecisionId : ปุ่ม "อนุมัติ" ส่ง 2 (ผลพิจารณาปกติอ่านจาก formik.values.considerResult) */
    const handleConfirmConsider = async (overrideDecisionId?: number) => {
        const payload = mapClaimDecisionPayload(overrideDecisionId);
        await saveClaimDecision.mutateAsync(payload);
    };

    const mapCasePayableForApprove = (): CasePayableDraft => {
        const payable = { payableAmount: calculateResult?.medicalPay ?? 0 };
        // ส่งบัญชีปลายทางเฉพาะเมื่อ caller ให้มาครบทั้งสามค่า (เคลมโรงพยาบาล)
        // เคลมลูกค้าไม่ส่ง payoutAccount มาเลย จึงได้แต่ payableAmount
        if (payoutAccount?.bankId && payoutAccount.bankName && payoutAccount.bankAccountNo) {
            return {
                ...payable,
                toBankId: payoutAccount.bankId,
                toBankName: payoutAccount.bankName,
                toBankAccountNo: payoutAccount.bankAccountNo,
            };
        } else {
            return {
                ...payable,
                toBankId: undefined,
                toBankName: undefined,
                toBankAccountNo: undefined,
            };
        }
        return payable;
    };

    /**
     * jsonDetail ชุดเดียวกับที่ยิง POST /api/calculate/caseclaim ตอนกด "ถัดไป" step 2
     * สร้างสด ณ ตอน build payload เพื่อให้ได้ค่า formik / filledItems ล่าสุดที่สุด
     * DTO ใหม่รับ jsonDetail เป็น "JSON string" → stringify ด้วย customFormatter (Dayjs → "YYYY-MM-DD HH:mm:ss")
     * ให้ตรงกับรูปแบบที่ /api/calculate/caseclaim ส่ง
     */
    const buildApproveJsonDetail = (): CalculateCaseClaim => ({
        productId: customerDetailData?.data?.productId,
        coverageTypeId: formik.values.coverageTypeId,
        medicalTypeId: formik.values.medicalTypeId,
        incidentTypeId: formik.values.incidentTypeId,
        occurrenceDate: formik.values.incidentDate,
        ipdCount: formik.values.ipdDays,
        icuCount: formik.values.icuDays,
        continueClaimNo: undefined,
        expenseList: filledItems.map((item) => ({
            standardMedicalExpenseId: item.standardMedicalExpenseId,
            description: item.description,
            originalAmount: item.claimAmount,
            discountAmount: item.discount,
            nonCoverAmount: item.notCovered,
            reasonId: item.reason,
            remark: item.remark,
        })),
        disabilityList: [],
    });

    const mapApproveClaimDecisionPayload = (): ApproveClaimDecisionDtoRequest => ({
        claimDecision: mapClaimDecisionPayload(9),
        calculateCaseCode: calculateResult?.calculateCaseCode,
        isCombinedWithMedicalAll,
        // DTO ประกาศบัญชีปลายทางเป็น required แต่เคลมลูกค้าไม่ต้องส่ง
        casePayable: mapCasePayableForApprove() as ApproveCasePayableRequest,
        // jsonDetail ชุดเดียวกับ /api/calculate/caseclaim (สร้างสด = ข้อมูลล่าสุด) — DTO ใหม่เป็น JSON string
        jsonDetail: JSON.stringify(buildApproveJsonDetail(), customFormatter),
    });

    const handleApprove = async () => {
        const payload = mapApproveClaimDecisionPayload();
        await approveClaimDecision.mutateAsync(payload);
    };

    return { handleSaveDraft, handleConfirmConsider, handleApprove, isApproving: approveClaimDecision.isLoading };
};

export default useClaimDetailActionHook;

import { useEffect, useMemo, useRef } from "react";
import { FormikProps } from "formik";
import { useGetCaseReviewOverview, useGetDocumentByCaseId } from "../../../../api/coreClaimApi";
import { GetDocumentByCaseIdDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetDocumentListByIds } from "../../../../api/docstorageApi";
import { useGetDocumentReviewStatus } from "../../../../api/coreClaimMastersApi";
import {
    DOCUMENT_CHECK_RESULT_COLORS,
    DOCUMENT_CHECK_RESULT_FALLBACK_COLOR,
    DocumentCheckResultOption,
    DocumentCheckRow,
} from "../../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";
import { HospitalConsiderValues } from "./HospitalConsiderDetailHook";

/** claimSourceId ของเคลมโรงพยาบาล (ใช้ดึงรายการเอกสารของเคส — GET /document/case/filter) */
const CLAIM_SOURCE_HOSPITAL = 3;

/** ข้อมูลเอกสารจาก DocStorage (GET /document/documentid/list) ที่ตาราง "ตรวจสอบเอกสาร" ใช้แสดง */
export type DocStorageDocInfo = {
    /** ชื่อเอกสาร = documentTypeName */
    documentName: string;
    /** จำนวนไฟล์ที่แนบจริงใน DocStorage */
    fileCount: number;
    /** ข้อมูลสำหรับประกอบลิงก์ไปแนบเอกสารที่หน้า DocStorage (ปุ่ม "สแกนเอกสาร") */
    documentCode: string;
    mainIndex: string;
    searchIndex: string;
};

/** ผลการตรวจ/หมายเหตุที่เคยบันทึกไว้ (จาก overview) ต่อ documentId */
type DocumentReviewInfo = { checkResult: DocumentCheckRow["checkResult"]; remark: string };

/**
 * map รายการเอกสารของเคส (GET /document/case/filter — useGetDocumentByCaseId, claimSourceId 3)
 * -> แถวตาราง "ตรวจสอบเอกสาร"
 *
 * - documentId / documentSubTypeId / ชื่อเอกสาร (claimDocumentTypeName) มาจาก endpoint นี้
 * - ผลการตรวจ + หมายเหตุที่เคยบันทึก merge จาก overview ด้วย documentId
 * - `files` ปล่อยว่างไว้เสมอ — จำนวนไฟล์มาจาก GET /document/documentid/list, รายการไฟล์มาจาก
 *   GET /document/{documentId}/documentFile (ตอนเปิด modal)
 */
const mapDocumentChecks = (
    documents: GetDocumentByCaseIdDtoResponse[],
    reviewByDocId: Record<string, DocumentReviewInfo>
): DocumentCheckRow[] =>
    documents.map((doc) => {
        const documentId = doc.documentId ?? doc.caseDocumentId ?? "";
        const review = reviewByDocId[documentId];
        return {
            documentId,
            documentSubTypeId: doc.documentSubTypeId,
            documentCode: doc.documentCode ?? "",
            documentName: doc.claimDocumentTypeName || "-",
            files: [],
            checkResult: review?.checkResult ?? "",
            remark: review?.remark ?? "",
        };
    });

/**
 * ตาราง "ตรวจสอบเอกสาร" ของหน้าพิจารณาเคลมโรงพยาบาล — แยกออกมาจาก useHospitalConsiderDetailHook
 * เพราะเป็นคนละความรับผิดชอบ (fetch รายการเอกสารของเคส + prefill ผลตรวจเดิม + handler แก้ผลตรวจ)
 *
 * รับ formik ของ Step 1 มาแก้ field "documentChecks" โดยตรง, และรับ caseKey มาเองเพื่อรีเซ็ต flag
 * sync ตอนเปลี่ยนเคส (เหมือน useHospitalConsiderDetailHook — route ใช้ element เดิม ไม่ remount)
 */
const useHospitalDocumentVerifyHook = (
    formik: FormikProps<HospitalConsiderValues>,
    caseKey: string | undefined,
    detailCaseId: string | undefined,
    productTypeId: number | undefined
) => {
    /**
     * รายการเอกสารของเคส (ป้อนตาราง "ตรวจสอบเอกสาร") — GET /document/case/filter (claimSourceId 3)
     * ชื่อเอกสาร (claimDocumentTypeName) + documentId มาจาก endpoint นี้
     * รอ productTypeId ให้พร้อมก่อนค่อยยิง (กัน query ยิงซ้ำเพราะ productTypeId เปลี่ยนใน key)
     */
    const { data: caseDocumentData, isLoading: caseDocumentLoading } = useGetDocumentByCaseId(
        productTypeId && detailCaseId ? detailCaseId : "",
        productTypeId,
        CLAIM_SOURCE_HOSPITAL,
        undefined,
        undefined,
        undefined,
        1,
        100
    );
    const caseDocuments = useMemo(() => caseDocumentData?.data ?? [], [caseDocumentData]);

    /** ผลการตรวจ/หมายเหตุที่เคยบันทึกไว้ — GET /document/case/{caseId}/overview (merge ด้วย documentId) */
    const { data: caseReviewOverviewData, isLoading: caseReviewOverviewLoading } =
        useGetCaseReviewOverview(detailCaseId);
    const reviewByDocId = useMemo<Record<string, DocumentReviewInfo>>(() => {
        const map: Record<string, DocumentReviewInfo> = {};
        (caseReviewOverviewData?.data?.documentReview?.documents ?? []).forEach((doc) => {
            if (doc.documentId) {
                map[doc.documentId] = {
                    checkResult: doc.documentReviewStatusId || "",
                    remark: doc.documentReviewRemark || doc.documentRemark || "",
                };
            }
        });
        return map;
    }, [caseReviewOverviewData]);

    /**
     * เอกสารจริงใน DocStorage ของทุก documentId ในเคสนี้ (GET /document/documentid/list)
     * ตาราง "ตรวจสอบเอกสาร" ใช้ fileCount จาก endpoint นี้ + ข้อมูลประกอบลิงก์แนบเอกสาร
     * และใช้ fileCount เป็นเงื่อนไขเปิด modal ดูรายละเอียด (0 = ไม่มีเอกสารแนบ เปิดไม่ได้)
     */
    const documentIds = useMemo(
        () => caseDocuments.map((doc) => doc.documentId).filter((id): id is string => !!id),
        [caseDocuments]
    );
    const { data: documentStorageListData, isLoading: documentStorageListLoading } =
        useGetDocumentListByIds(documentIds);
    const documentInfoByDocId = useMemo<Record<string, DocStorageDocInfo>>(() => {
        const map: Record<string, DocStorageDocInfo> = {};
        (documentStorageListData?.data ?? []).forEach((doc) => {
            if (doc.documentId) {
                map[doc.documentId] = {
                    documentName: doc.documentTypeName || "-",
                    fileCount: doc.fileCount ?? 0,
                    documentCode: doc.documentCode ?? "",
                    mainIndex: doc.mainIndex ?? "",
                    searchIndex: doc.searchIndex ?? "",
                };
            }
        });
        return map;
    }, [documentStorageListData]);

    /**
     * เปลี่ยนเคส : รีเซ็ต flag sync ระหว่าง render ทันที (เหมือน useHospitalConsiderDetailHook)
     * ไม่ต้องเคลียร์ formik.values.documentChecks เอง — ฝั่ง useHospitalConsiderDetailHook
     * เรียก formik.resetForm() ทับทั้งฟอร์มไปแล้วก่อนหน้านี้ในเรนเดอร์เดียวกัน
     */
    const hasSyncedDocumentsRef = useRef(false);
    const syncedCaseKeyRef = useRef(caseKey);
    if (syncedCaseKeyRef.current !== caseKey) {
        syncedCaseKeyRef.current = caseKey;
        hasSyncedDocumentsRef.current = false;
    }

    // ---- sync: ตาราง "ตรวจสอบเอกสาร" จากรายการเอกสารของเคส (ครั้งเดียว ไม่ทับค่าที่ผู้ใช้แก้) ----
    // รอ overview resolve ก่อน เพื่อ prefill ผลการตรวจ/หมายเหตุที่เคยบันทึกไว้ (merge ด้วย documentId)
    useEffect(() => {
        if (hasSyncedDocumentsRef.current) return;
        if (!caseDocumentData?.data) return;
        if (caseReviewOverviewLoading) return;

        formik.setFieldValue("documentChecks", mapDocumentChecks(caseDocuments, reviewByDocId), false);
        hasSyncedDocumentsRef.current = true;
    }, [caseDocumentData, caseDocuments, caseReviewOverviewLoading, reviewByDocId]);

    /** อัปเดตผลการตรวจ / หมายเหตุ ของเอกสารแต่ละรายการ */
    const handleDocumentCheckChange = <TField extends keyof DocumentCheckRow>(
        rowIndex: number,
        field: TField,
        value: DocumentCheckRow[TField]
    ) => {
        const nextRows = formik.values.documentChecks.map((row, index) =>
            index === rowIndex ? { ...row, [field]: value } : row
        );

        formik.setFieldValue("documentChecks", nextRows);
    };

    /**
     * สแกน/ค้นหาเอกสารแถวนั้นใหม่ : ล้างผลตรวจเดิมเฉพาะแถวนั้น เพื่อบังคับให้ตรวจซ้ำ (CR Ver2 ข้อ 4)
     * ไม่ล้างหมายเหตุ — คงค่าเดิมไว้ตาม behavior เดิมของระบบ
     */
    const handleDocumentScan = (rowIndex: number) => {
        handleDocumentCheckChange(rowIndex, "checkResult", "");
    };

    /** ตัวเลือกผลการตรวจเอกสาร (ผ่าน / ไม่ผ่าน / รอเอกสารเพิ่มเติม) จาก Master API */
    const { data: documentReviewStatusRaw, isLoading: documentCheckResultOptionsLoading } =
        useGetDocumentReviewStatus();
    const documentCheckResultOptions: DocumentCheckResultOption[] = useMemo(
        () =>
            [...(documentReviewStatusRaw?.data ?? [])]
                .sort((a, b) => (a.indexId ?? 0) - (b.indexId ?? 0))
                .map((item) => ({
                    value: item.documentReviewStatusId ?? 0,
                    label: item.documentReviewStatusName ?? "",
                    color:
                        DOCUMENT_CHECK_RESULT_COLORS[item.documentReviewStatusId ?? 0] ??
                        DOCUMENT_CHECK_RESULT_FALLBACK_COLOR,
                })),
        [documentReviewStatusRaw]
    );

    return {
        caseDocumentLoading,
        caseReviewOverviewLoading,
        documentInfoByDocId,
        documentStorageListLoading,
        handleDocumentCheckChange,
        handleDocumentScan,
        documentCheckResultOptions,
        documentCheckResultOptionsLoading,
    };
};

export default useHospitalDocumentVerifyHook;

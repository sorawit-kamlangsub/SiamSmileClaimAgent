import { useMemo } from "react";
import { useGetDocumentListByIds } from "../../../../api/docstorageApi";
import { BILLING_DOCUMENT_REVIEW_STATUS, BillingDocumentFormItem } from "../../store/billingClaim.types";

/** ข้อมูลเอกสารจริงใน DocStorage ของ documentId หนึ่งรายการ — ใช้ประกอบลิงก์ "สแกนเอกสาร" + จำนวนไฟล์จริง */
export type DocStorageDocInfo = {
    documentName: string;
    fileCount: number;
    documentCode: string;
    mainIndex: string;
    searchIndex: string;
};

const EMPTY_DOC_INFO: DocStorageDocInfo = {
    documentName: "-",
    fileCount: 0,
    documentCode: "",
    mainIndex: "",
    searchIndex: "",
};

/**
 * เติมข้อมูลจริงจาก DocStorage (GET /document/documentid/list) ให้ตาราง "ตรวจสอบเอกสาร"
 *
 * `BillingDocumentDto` มี `documentId` + `fileCount` อยู่แล้ว แต่ `fileCount` ของ DocStorage เป็นค่าล่าสุด
 * กว่า (billing DTO อาจไม่ sync ทันทีหลัง รพ. แนบเอกสารเพิ่ม) จึงใช้ DocStorage เป็นหลัก fallback ไปที่
 * DTO เมื่อยังไม่มีข้อมูล (`fileCount == null` ของ DTO เดิม = "ไม่ทราบจำนวน" ไม่ใช่ 0 — แต่สเปคใหม่ให้แสดง 0
 * เมื่อไม่มีไฟล์ จึง normalize เป็น 0 ที่นี่)
 */
const useBillingDocumentHook = (documents: BillingDocumentFormItem[]) => {
    const documentIds = useMemo(
        () => documents.map((doc) => doc.documentId).filter((id): id is string => !!id),
        [documents]
    );

    const { data: documentStorageListData, isLoading: documentInfoLoading } = useGetDocumentListByIds(documentIds);

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

    const getDocInfo = (documentId: string | undefined): DocStorageDocInfo =>
        (documentId && documentInfoByDocId[documentId]) || EMPTY_DOC_INFO;

    const getFileCount = (row: BillingDocumentFormItem): number => {
        const fromStorage = row.documentId ? documentInfoByDocId[row.documentId]?.fileCount : undefined;
        return fromStorage ?? row.fileCount ?? 0;
    };

    /** ทุกแถวที่มีไฟล์ (fileCount > 0) ต้องมีผลการตรวจแล้ว — gate ปุ่ม "ถัดไป" ของ Step 1 */
    const hasAnyMissingResult = () =>
        documents.some(
            (doc) => getFileCount(doc) > 0 && (doc.reviewStatusId === undefined || doc.reviewStatusId === null)
        );

    /** ทุกแถวที่มีไฟล์ต้องมีผลเป็น "ผ่าน" — gate ปุ่ม "อนุมัติ" ของ Step 3 */
    const hasAnyNotPassed = () =>
        documents.some((doc) => getFileCount(doc) > 0 && doc.reviewStatusId !== BILLING_DOCUMENT_REVIEW_STATUS.passed);

    const hasMissingRequiredNote = () =>
        documents.some(
            (doc) =>
                (doc.reviewStatusId === BILLING_DOCUMENT_REVIEW_STATUS.failed ||
                    doc.reviewStatusId === BILLING_DOCUMENT_REVIEW_STATUS.waiting) &&
                !doc.note
        );

    return {
        documentInfoByDocId,
        documentInfoLoading,
        getDocInfo,
        getFileCount,
        hasAnyMissingResult,
        hasAnyNotPassed,
        hasMissingRequiredNote,
    };
};

export default useBillingDocumentHook;

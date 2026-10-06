import { useEffect, useMemo, useRef } from "react";
import { FormikProps } from "formik";
import { useGetDocumentByCaseId } from "../../../../api/coreClaimApi";
import { GetDocumentByCaseIdDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetDocumentListByIds } from "../../../../api/docstorageApi";
import { documentTypeId } from "../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import { DocumentCheckRow } from "../../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";
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

/**
 * map รายการเอกสารของเคส (GET /document/case/filter — useGetDocumentByCaseId, claimSourceId 3)
 * -> แถวตาราง "ตรวจสอบเอกสาร"
 *
 * - documentId / documentSubTypeId / ชื่อเอกสาร (claimDocumentTypeName) มาจาก endpoint นี้
 * - RC-005 5.7/5.8 ตัดผลการตรวจ + หมายเหตุออกจากตารางแล้ว — checkResult/remark ว่างเสมอ
 *   (ClaimDetailActionHook กรองแถวที่ไม่มี checkResult ออก จึงไม่ส่ง documentReviewStatusId ขึ้น BE)
 * - `files` ปล่อยว่างไว้เสมอ — จำนวนไฟล์มาจาก GET /document/documentid/list, รายการไฟล์มาจาก
 *   GET /document/{documentId}/documentFile (ตอนเปิด modal)
 */
const mapDocumentChecks = (documents: GetDocumentByCaseIdDtoResponse[]): DocumentCheckRow[] =>
    documents.map((doc) => ({
        documentId: doc.documentId ?? doc.caseDocumentId ?? "",
        documentSubTypeId: doc.documentSubTypeId,
        documentCode: doc.documentCode ?? "",
        documentName: doc.claimDocumentTypeName || "-",
        files: [],
        checkResult: "",
        remark: "",
    }));

/**
 * ตาราง "ตรวจสอบเอกสาร" ของหน้าพิจารณาเคลมโรงพยาบาล — แยกออกมาจาก useHospitalConsiderDetailHook
 * เพราะเป็นคนละความรับผิดชอบ (fetch รายการเอกสารของเคส + ข้อมูลไฟล์จาก DocStorage)
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
    /** RC-005 5.9 : แสดงเฉพาะประเภทเอกสาร "ชุดรวมเอกสาร" (claimDocumentTypeId 7) */
    const caseDocuments = useMemo(
        () => (caseDocumentData?.data ?? []).filter((doc) => doc.claimDocumentTypeId === documentTypeId.ชุดรวมเอกสาร),
        [caseDocumentData]
    );

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

    // ---- sync: ตาราง "ตรวจสอบเอกสาร" จากรายการเอกสารของเคส (ครั้งเดียวต่อเคส) ----
    useEffect(() => {
        if (hasSyncedDocumentsRef.current) return;
        if (!caseDocumentData?.data) return;

        formik.setFieldValue("documentChecks", mapDocumentChecks(caseDocuments), false);
        hasSyncedDocumentsRef.current = true;
    }, [caseDocumentData, caseDocuments]);

    return {
        caseDocumentLoading,
        documentInfoByDocId,
        documentStorageListLoading,
    };
};

export default useHospitalDocumentVerifyHook;

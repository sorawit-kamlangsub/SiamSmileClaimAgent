import React, { createContext, useContext, useMemo, useRef } from "react";
import { Outlet } from "react-router-dom";
import type { DocStorageDocumentIds, IdentityDocType, OcrDocumentScanResult } from "./OcrDocumentScanSection";

/**
 * draft ของหน้าแจ้งเคลม เก็บไว้ระดับ route (claim/ph|pa/...) ที่ mount ค้างระหว่างหน้าบันทึกข้อมูลเคลม ↔ หน้าสรุป
 * - กดย้อนกลับจากหน้าสรุป: draft ยังอยู่
 * - ออกจาก route (กลับ monitor / แจ้งเคลมสำเร็จ) แล้วเข้าเคลมใหม่: provider ถูกสร้างใหม่ draft ว่างเสมอ
 * ใช้ Map ใน ref แทน redux เพราะ File ไม่ serializable และ store ของ claimph/claimpa ไม่ถูกล้างตอนเข้าเคลมใหม่
 */
export type OcrSectionDraft = {
    identityDocType: IdentityDocType;
    files: {
        idCard: File | null;
        passport: File | null;
        alienCard: File | null;
        receipt: File | null;
        medCert: File | null;
    };
    results: OcrDocumentScanResult;
    documentIds: DocStorageDocumentIds;
};

export type ClaimDraft = {
    /** ไฟล์ที่แนบ + ผล OCR + documentId ใน doc storage ของ OcrDocumentScanSection */
    ocr?: OcrSectionDraft;
    /** เคลมต่อเนื่อง: prefill ค่าจากเคลมตั้งต้นไปแล้ว — กดย้อนกลับมาไม่ต้อง prefill ทับค่าที่แก้ไว้ */
    isContinuousPrefilled?: boolean;
};

type ClaimDraftStore = {
    get: (key: string) => ClaimDraft | undefined;
    update: (key: string, patch: Partial<ClaimDraft>) => void;
    /** ย้าย draft ไปอีก key (PA: บันทึกผู้เอาประกันใหม่ "new" → id ของรายการที่เพิ่งสร้าง) */
    move: (fromKey: string, toKey: string) => void;
    remove: (key: string) => void;
};

/** key ของ draft ตอนกรอกเคลมรายการใหม่ (PH ใช้ key นี้เสมอ, PA ใช้ตอนยังไม่มี editingItemId) */
export const NEW_CLAIM_DRAFT_KEY = "new";

const ClaimDraftContext = createContext<ClaimDraftStore | undefined>(undefined);

export const ClaimDraftProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const draftsRef = useRef(new Map<string, ClaimDraft>());

    const store = useMemo<ClaimDraftStore>(
        () => ({
            get: (key) => draftsRef.current.get(key),
            update: (key, patch) => {
                draftsRef.current.set(key, { ...draftsRef.current.get(key), ...patch });
            },
            move: (fromKey, toKey) => {
                const draft = draftsRef.current.get(fromKey);
                draftsRef.current.delete(fromKey);
                if (draft) draftsRef.current.set(toKey, draft);
            },
            remove: (key) => {
                draftsRef.current.delete(key);
            },
        }),
        []
    );

    return <ClaimDraftContext.Provider value={store}>{children ?? <Outlet />}</ClaimDraftContext.Provider>;
};

/** คืน undefined ถ้าไม่ได้อยู่ใต้ ClaimDraftProvider — ผู้เรียกต้องทำงานแบบเดิม (ไม่เก็บ draft) */
export const useClaimDraftStore = () => useContext(ClaimDraftContext);

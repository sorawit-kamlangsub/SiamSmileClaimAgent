import { useState } from "react";
import {
    DocStorageDocumentIds,
    OCR_DOCUMENT_TYPE_ID,
    OcrDocumentScanResult,
    RequiredDocsConfig,
} from "../../components/CreateClaim/OcrDocumentScanSection";
import { CaseDocumentDetailCreateRequest } from "../../../../api/coreClaimApi.client";
import dayjs from "dayjs";

const COVERAGE_TYPE_DOCS_MAP: Record<number, RequiredDocsConfig> = {
    2: { idCard: false, receipt: true, medCert: false },
    3: { idCard: false, receipt: false, medCert: true },
};

const NO_REQUIRED_DOCS: RequiredDocsConfig = { idCard: false, receipt: false, medCert: false };

const ocrDocumentPayload = (
    ocrResult: OcrDocumentScanResult,
    documentIds: DocStorageDocumentIds
): CaseDocumentDetailCreateRequest[] => {
    const list: CaseDocumentDetailCreateRequest[] = [];
    if (ocrResult.idCard) {
        list.push({
            documentId: documentIds[OCR_DOCUMENT_TYPE_ID.idCard],
            firstName: ocrResult.idCard.firstName,
            lastName: ocrResult.idCard.lastName,
            fullName: ocrResult.idCard.fullName,
            ocrDocumentTypeId: OCR_DOCUMENT_TYPE_ID.idCard,
            ocrResult: JSON.stringify(ocrResult.idCard.result),
        });
    }

    if (ocrResult.passport) {
        list.push({
            documentId: documentIds[OCR_DOCUMENT_TYPE_ID.passport],
            fullName: ocrResult.passport.fullName,
            ocrDocumentTypeId: OCR_DOCUMENT_TYPE_ID.passport,
            ocrResult: JSON.stringify(ocrResult.passport.result),
        });
    }

    if (ocrResult.alienCard) {
        list.push({
            documentId: documentIds[OCR_DOCUMENT_TYPE_ID.alienCard],
            fullName: ocrResult.alienCard.fullName,
            ocrDocumentTypeId: OCR_DOCUMENT_TYPE_ID.alienCard,
            ocrResult: JSON.stringify(ocrResult.alienCard.result),
        });
    }

    if (ocrResult.receipt) {
        list.push({
            documentId: documentIds[OCR_DOCUMENT_TYPE_ID.receipt],
            fullName: ocrResult.receipt.patientName,
            hospitalName: ocrResult.receipt.hospitalName,
            receiptNumber: ocrResult.receipt.receiptNo,
            receiptAdmissionDate: ocrResult.receipt.receiptDate ? dayjs(ocrResult.receipt.receiptDate) : undefined, //รอปรับ database ใหม่ ชื่อฟิลด์ยังไม่ถูก
            receiptAmount: ocrResult.receipt.netAmount,
            ocrDocumentTypeId: OCR_DOCUMENT_TYPE_ID.receipt,
            ocrResult: JSON.stringify(ocrResult.receipt.result),
        });
    }

    if (ocrResult.medCert) {
        list.push({
            documentId: documentIds[OCR_DOCUMENT_TYPE_ID.medCert],
            fullName: ocrResult.medCert.patientName,
            hospitalName: ocrResult.medCert.hospitalName,
            //receiptAdmissionDate: ocrResult.medCert.admitDate ? dayjs(ocrResult.medCert.admitDate) : undefined,
            ocrDocumentTypeId: OCR_DOCUMENT_TYPE_ID.medCert,
            ocrResult: JSON.stringify(ocrResult.medCert.result),
        });
    }
    return list;
};
export const useOcrDocumentScan = () => {
    const [isOcrDocsValid, setIsOcrDocsValid] = useState(true);
    const [ocrResult, setOcrResult] = useState<OcrDocumentScanResult>({});
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [ocrDocumentIds, setOcrDocumentIds] = useState<DocStorageDocumentIds>({});
    const getRequiredDocsByCoverageType = (coverageTypeId?: number): RequiredDocsConfig => {
        if (!coverageTypeId) return NO_REQUIRED_DOCS;
        return COVERAGE_TYPE_DOCS_MAP[coverageTypeId] ?? NO_REQUIRED_DOCS;
    };

    const shouldShowOcrDocumentScan = (coverageTypeId?: number): boolean => {
        const docs = getRequiredDocsByCoverageType(coverageTypeId);
        return docs.idCard || docs.receipt || docs.medCert;
    };

    return {
        isOcrDocsValid,
        ocrResult,
        isOcrLoading,
        ocrDocumentIds,
        setIsOcrDocsValid,
        setOcrResult,
        setIsOcrLoading,
        setOcrDocumentIds,
        getRequiredDocsByCoverageType,
        shouldShowOcrDocumentScan,
        ocrDocumentPayload,
    };
};

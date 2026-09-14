import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box, Typography, Button, LinearProgress, Chip, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import Public from "@mui/icons-material/Public";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import CameraIcon from "@mui/icons-material/Camera";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useMutation } from "@tanstack/react-query";

import dayjs, { Dayjs } from "dayjs";
import { FormikProps } from "formik";
import Webcam from "react-webcam";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { swalError } from "../../../_common";
import {
    compareOcrAmount,
    compareOcrDate,
    compareOcrIdCardNo,
    compareOcrName,
    focusToFirstError,
} from "../../../../ocrCompareHelpers";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { documentCreatedRequest, useCreateDocumentToDocStorage } from "../../../../api/docstorageApi";
import {
    uploadAlienCard,
    uploadIDCard,
    uploadMedicalCertificate,
    uploadPassport,
    uploadReceipt,
} from "../../../../api/ocrApi";

export type OcrStatus = "pending" | "matched" | "mismatched" | "amountMatched" | "amountMismatched";

export type IdentityDocType = "idCard" | "passport" | "alienCard";

export type IdCardOcrResult = {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    idCardNo?: string;
    fullNameStatus: OcrStatus;
    idCardNoStatus: OcrStatus;
    result?: any;
};

export type PassportOcrResult = {
    fullName?: string;
    passportNo?: string;
    fullNameStatus: OcrStatus;
    passportNoStatus: OcrStatus;
    result?: any;
};

export type AlienCardOcrResult = {
    fullName?: string;
    idCardNo?: string;
    fullNameStatus: OcrStatus;
    idCardNoStatus: OcrStatus;
    result?: any;
};

export type ReceiptOcrResult = {
    hospitalName?: string;
    receiptNo?: string;
    receiptDate?: string;
    patientName?: string;
    netAmount?: number;
    patientNameStatus: OcrStatus;
    netAmountStatus: OcrStatus;
    isDocTypeMatched?: boolean;
    result?: any;
};

export type MedCertOcrResult = {
    hospitalName?: string;
    admitDate?: string;
    patientName?: string;
    admitDateStatus: OcrStatus;
    patientNameStatus: OcrStatus;
    isDocTypeMatched?: boolean;
    result?: any;
};
export type OcrDocumentScanResult = {
    idCard?: IdCardOcrResult;
    passport?: PassportOcrResult;
    alienCard?: AlienCardOcrResult;
    receipt?: ReceiptOcrResult;
    medCert?: MedCertOcrResult;
    result?: any;
};

export type RequiredDocsConfig = {
    idCard: boolean;
    receipt: boolean;
    medCert: boolean;
};

// 1 = n/a, 2 = บัตรประชาชน, 3 = บัตรต่างด้าว, 4 = Passport, 5 = ใบเสร็จรับเงิน, 6 = ใบรับรองแพทย์
export const OCR_DOCUMENT_TYPE_ID = {
    idCard: 2,
    alienCard: 3,
    passport: 4,
    receipt: 5,
    medCert: 6,
} as const;

export type OcrDocKey = keyof typeof OCR_DOCUMENT_TYPE_ID;

export type DocStorageDocumentIds = Partial<Record<number, string | undefined>>;
type OcrRequiredFields = {
    transferAmount?: number;
    admissionDate?: Dayjs | null;
};
export type OcrDocumentScanSectionProps<T extends OcrRequiredFields> = {
    onOcrChange?: (result: OcrDocumentScanResult) => void;
    requiredDocs: RequiredDocsConfig;
    onFilesValidChange?: (isValid: boolean) => void;
    systemFullName?: string;
    systemIdCardNo?: string;
    systemAmount?: number;
    systemDateIn?: Dayjs | null;
    formik: FormikProps<T>;
    applicationCode?: string;
    onDocumentIdsChange?: (documentIds: DocStorageDocumentIds) => void;
    onOcrLoadingChange?: (isLoading: boolean) => void;
};

const PROJECT_ID = 1;

const DOC_STORAGE_SUB_TYPE_ID_FALLBACK = 530;

const ACCEPT_IMAGE_PDF = "image/png,image/jpeg,.jpg,.jpeg,.png,.pdf";

const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const OCR_STATUS_LABEL: Record<OcrStatus, string> = {
    pending: "รอ OCR",
    matched: "ข้อมูลตรงกัน",
    mismatched: "ข้อมูลไม่ตรงกัน",
    amountMatched: "ยอดเงินตรงกัน",
    amountMismatched: "ยอดเงินไม่ตรงกัน",
};

const OCR_STATUS_STYLE: Record<OcrStatus, { bg: string; color: string; border: string }> = {
    pending: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
    matched: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
    mismatched: { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" },
    amountMatched: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
    amountMismatched: { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" },
};

const DocTypeCheckRow: React.FC<{ label: string; isMatched?: boolean }> = ({ label, isMatched }) => {
    if (isMatched === undefined) return null;

    const matched = isMatched;
    const bg = matched ? "#e8f5e9" : "#ffebee";
    const border = matched ? "#a5d6a7" : "#ef9a9a";
    const color = matched ? "#2e7d32" : "#c62828";
    const Icon = matched ? CheckCircleIcon : CancelIcon;

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            sx={{
                bgcolor: bg,
                border: `1px solid ${border}`,
                borderRadius: 1.5,
                px: 1.5,
                py: 0.75,
                mb: 1,
            }}
        >
            <Typography variant="body2" fontWeight={600} color={color}>
                {label}
            </Typography>
            <Icon sx={{ fontSize: 20, color }} />
        </Box>
    );
};

const OcrStatusBadge: React.FC<{ status: OcrStatus }> = ({ status }) => {
    const style = OCR_STATUS_STYLE[status];
    return (
        <Chip
            style={{
                padding: "2px 10px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
            }}
            label={OCR_STATUS_LABEL[status]}
        ></Chip>
    );
};

// ── Chip "บังคับสแกน" ที่ใช้แสดงทั้งข้าง header และมุมขวาบนของ dropzone ──
const RequiredScanChip: React.FC<{ label?: string }> = ({ label = "แนบเอกสาร" }) => (
    <Chip
        icon={
            <Box
                component="span"
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "#e53935",
                    fontSize: 11,
                    fontWeight: 900,
                    lineHeight: 1,
                    ml: "6px !important",
                }}
            >
                !
            </Box>
        }
        label={label}
        sx={{
            height: 26,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            bgcolor: "#e53935",
            "& .MuiChip-icon": { order: -1, ml: "8px", mr: "-4px" },
            "& .MuiChip-label": { px: 1 },
        }}
    />
);

const CheckRow: React.FC<{
    label: string;
    value?: string;
    status?: OcrStatus;
}> = ({ label, value, status }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} py={0.5}>
        <Box display="flex" alignItems="baseline" gap={0.5} minWidth={0}>
            <Typography variant="body2" color="text.secondary" noWrap>
                {label} :
            </Typography>
            {value && (
                <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary"
                    sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                    {value}
                </Typography>
            )}
        </Box>
        {status && <OcrStatusBadge status={status} />}
    </Box>
);

type DocumentBlockProps = {
    title: string;
    dropzoneCaption: string;
    accept?: string;
    file: File | null;
    isProcessing: boolean;
    isRequired: boolean;
    requiredMessage?: string;
    onFileChosen: (file: File) => void;
    onRemove: () => void;
    children: React.ReactNode;
    hideTitle?: boolean;
};

const DocumentBlock: React.FC<DocumentBlockProps> = ({
    title,
    dropzoneCaption,
    accept,
    file,
    isProcessing,
    isRequired,
    requiredMessage,
    onFileChosen,
    onRemove,
    children,
    hideTitle,
}) => {
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) onFileChosen(selected);
        e.target.value = "";
    };

    const handleOpenCamera = () => {
        setIsCameraOpen(true);
    };

    const handleCloseCamera = () => {
        setIsCameraOpen(false);
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            swalError("เกิดข้อผิดพลาด", "ไม่สามารถถ่ายภาพได้ กรุณาลองใหม่อีกครั้ง");
            return;
        }

        const capturedFile = dataURLtoFile(imageSrc, `capture-${Date.now()}.jpg`);
        onFileChosen(capturedFile);
        setIsCameraOpen(false);
    }, [onFileChosen]);

    // ── เงื่อนไข: บังคับสแกน + ยังไม่มีไฟล์ + ไม่ได้เปิดกล้องอยู่ ──
    const showRequiredState = isRequired && !file && !isCameraOpen;

    return (
        <Box>
            {!hideTitle && (
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1a5da8">
                        {title}
                    </Typography>
                    {isRequired && <RequiredScanChip />}
                </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        {dropzoneCaption}
                    </Typography>

                    <Box
                        sx={{
                            border: "1px dashed",
                            borderColor: showRequiredState ? "#f5b5b5" : "#c0d4f0",
                            borderRadius: 2,
                            p: isCameraOpen ? 1.5 : 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            bgcolor: showRequiredState ? "#fff5f5" : "#fff",
                            position: "relative",
                        }}
                    >
                        {isProcessing && (
                            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                                <LinearProgress />
                            </Box>
                        )}

                        {isCameraOpen ? (
                            // ── โหมดกล้อง ──────────────────────────────────────
                            <>
                                <Box
                                    sx={{
                                        width: "100%",
                                        borderRadius: 1,
                                        overflow: "hidden",
                                        bgcolor: "#000",
                                    }}
                                >
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            facingMode: "environment",
                                        }}
                                        style={{ width: "100%", display: "block" }}
                                    />
                                </Box>

                                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<CameraIcon />}
                                        onClick={handleCapture}
                                        sx={{
                                            textTransform: "none",
                                            bgcolor: "#1a5da8",
                                            "&:hover": { bgcolor: "#154a8a" },
                                        }}
                                    >
                                        ถ่ายรูป
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        startIcon={<CloseIcon />}
                                        onClick={handleCloseCamera}
                                        sx={{ textTransform: "none" }}
                                    >
                                        ปิดกล้อง
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            // ── โหมดปกติ (dropzone) ───────────────────────────
                            <>
                                {file && file.type.startsWith("image/") ? (
                                    <Box
                                        component="img"
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        sx={{
                                            maxHeight: 100,
                                            maxWidth: "100%",
                                            objectFit: "contain",
                                            borderRadius: 1,
                                            opacity: isProcessing ? 0.5 : 1,
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: "50%",
                                            bgcolor: showRequiredState ? "#fde3e3" : "#e3f2fd",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            opacity: isProcessing ? 0.5 : 1,
                                        }}
                                    >
                                        <CloudUploadIcon
                                            sx={{ fontSize: 40, color: showRequiredState ? "#e57373" : "#1a5da8" }}
                                        />
                                    </Box>
                                )}

                                {file && (
                                    <Typography variant="caption" color="text.secondary" noWrap maxWidth="100%">
                                        {isProcessing ? "กำลังตรวจสอบเอกสาร..." : file.name}
                                    </Typography>
                                )}

                                {!file && (
                                    <Typography variant="body2" color="text.secondary">
                                        อัพโหลดไฟล์ หรือเลือกวิธีสแกน
                                    </Typography>
                                )}

                                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<CameraAltIcon />}
                                        onClick={handleOpenCamera}
                                        disabled={isProcessing}
                                        sx={{
                                            textTransform: "none",
                                            borderColor: "#1a5da8",
                                            color: "#1a5da8",
                                            "&:hover": { borderColor: "#154a8a", bgcolor: "#f0f6fc" },
                                            bgcolor: "#fff",
                                        }}
                                    >
                                        เปิดกล้อง
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<UploadFileIcon />}
                                        onClick={() => uploadInputRef.current?.click()}
                                        disabled={isProcessing}
                                        sx={{
                                            textTransform: "none",
                                            borderColor: "#1a5da8",
                                            color: "#1a5da8",
                                            "&:hover": { borderColor: "#154a8a", bgcolor: "#f0f6fc" },
                                            bgcolor: "#fff",
                                        }}
                                    >
                                        อัพโหลดไฟล์
                                    </Button>
                                </Box>

                                <input
                                    ref={uploadInputRef}
                                    type="file"
                                    accept={accept}
                                    style={{ display: "none" }}
                                    onChange={handleUploadChange}
                                />
                            </>
                        )}
                    </Box>

                    {!file && isRequired && !isCameraOpen && (
                        <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                            {requiredMessage ?? "กรุณาสแกนเอกสารนี้ เนื่องจากเป็นเอกสารบังคับตามประเภทการเข้ารักษา"}
                        </Typography>
                    )}

                    {file && !isCameraOpen && (
                        <Box mt={1.5}>
                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={onRemove}
                                disabled={isProcessing}
                                sx={{ textTransform: "none" }}
                            >
                                ลบเอกสาร
                            </Button>
                        </Box>
                    )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        รายการตรวจสอบ
                    </Typography>
                    <Box
                        sx={{
                            border: "1px dashed #c0d4f0",
                            borderRadius: 2,
                            p: 2,
                            bgcolor: "#fff",
                            minHeight: 192,
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

const IDENTITY_DOC_OPTIONS: { value: IdentityDocType; label: string; icon: React.ElementType }[] = [
    { value: "idCard", label: "บัตรประชาชน", icon: CreditCardIcon },
    { value: "passport", label: "Passport", icon: FlightTakeoffIcon },
    { value: "alienCard", label: "บัตรต่างด้าว", icon: Public },
];

const OcrDocumentScanSection = <T extends OcrRequiredFields>({
    onOcrChange,
    requiredDocs,
    onFilesValidChange,
    systemFullName,
    systemIdCardNo,
    systemAmount,
    systemDateIn,
    formik,
    applicationCode,
    onDocumentIdsChange,
    onOcrLoadingChange,
}: OcrDocumentScanSectionProps<T>) => {
    const [identityDocType, setIdentityDocType] = useState<IdentityDocType>("idCard");

    // ── state ไฟล์ของแต่ละเอกสาร ──
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [alienCardFile, setAlienCardFile] = useState<File | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [medCertFile, setMedCertFile] = useState<File | null>(null);

    // ── state ผลลัพธ์ OCR ──
    const [idCardResult, setIdCardResult] = useState<IdCardOcrResult | undefined>(undefined);
    const [passportResult, setPassportResult] = useState<PassportOcrResult | undefined>(undefined);
    const [alienCardResult, setAlienCardResult] = useState<AlienCardOcrResult | undefined>(undefined);
    const [receiptResult, setReceiptResult] = useState<ReceiptOcrResult | undefined>(undefined);
    const [medCertResult, setMedCertResult] = useState<MedCertOcrResult | undefined>(undefined);

    const [_documentIds, setDocumentIds] = useState<DocStorageDocumentIds>({});

    const emitOcrChange = useCallback(
        (next: Partial<OcrDocumentScanResult>) => {
            const merged: OcrDocumentScanResult = {
                idCard: next.idCard ?? idCardResult,
                passport: next.passport ?? passportResult,
                alienCard: next.alienCard ?? alienCardResult,
                receipt: next.receipt ?? receiptResult,
                medCert: next.medCert ?? medCertResult,
            };
            onOcrChange?.(merged);
        },
        [idCardResult, passportResult, alienCardResult, receiptResult, medCertResult, onOcrChange]
    );

    const createDocumentToDocStorageMutation = useCreateDocumentToDocStorage(undefined, (error) => {
        swalError("บันทึกเอกสารไม่สำเร็จ", error);
    });

    const saveToDocStorage = useCallback(
        (file: File, ocrDocumentTypeId: number) => {
            const fileUploads = [
                {
                    data: file,
                    fileName: file.name,
                } as any,
            ];

            const body: documentCreatedRequest = {
                documentCode: "",
                documentId: "",
                documentSubTypeId: DOC_STORAGE_SUB_TYPE_ID_FALLBACK,
                mainIndex: applicationCode,
                searchIndex: applicationCode,
                documentIndexId: [],
                documentIndexValue: [],
                fileUploads,
            };

            createDocumentToDocStorageMutation.mutate(body, {
                onSuccess: (response) => {
                    const newDocumentId = response.data?.documentId;
                    setDocumentIds((prev) => {
                        const next = { ...prev, [ocrDocumentTypeId]: newDocumentId };
                        onDocumentIdsChange?.(next);
                        return next;
                    });
                },
            });
        },
        [applicationCode, createDocumentToDocStorageMutation, onDocumentIdsChange]
    );

    const activeIdentityFile =
        identityDocType === "idCard" ? idCardFile : identityDocType === "passport" ? passportFile : alienCardFile;

    useEffect(() => {
        const idCardOk = !requiredDocs.idCard || !!activeIdentityFile;
        const receiptOk = !requiredDocs.receipt || !!receiptFile;
        const medCertOk = !requiredDocs.medCert || !!medCertFile;
        onFilesValidChange?.(idCardOk && receiptOk && medCertOk);
    }, [requiredDocs.idCard, requiredDocs.receipt, requiredDocs.medCert, activeIdentityFile, receiptFile, medCertFile]);

    useEffect(() => {
        emitOcrChange({});
    }, [identityDocType]);

    useEffect(() => {
        if (!receiptResult) return;

        const nextResult: ReceiptOcrResult = {
            ...receiptResult,
            netAmountStatus: compareOcrAmount(receiptResult.netAmount, systemAmount),
        };

        setReceiptResult(nextResult);
        emitOcrChange({ receipt: nextResult });
    }, [systemAmount]);

    useEffect(() => {
        if (!medCertResult) return;

        const nextResult: MedCertOcrResult = {
            ...medCertResult,
            admitDateStatus: compareOcrDate(medCertResult.admitDate, systemDateIn),
            patientNameStatus: compareOcrName(medCertResult.patientName, systemFullName),
        };

        setMedCertResult(nextResult);
        emitOcrChange({ medCert: nextResult });
    }, [systemDateIn, systemFullName]);

    const buildFullName = (firstName?: string | null, lastName?: string | null): string | undefined => {
        const first = firstName?.trim();
        const last = lastName?.trim();

        const fullName = [first, last]
            .filter((item): item is string => !!item)
            .join(" ")
            .trim();

        return fullName || undefined;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // mutation: บัตรประชาชน
    // ─────────────────────────────────────────────────────────────────────────
    const uploadIdCardMutation = useMutation({
        mutationFn: (file: File) => uploadIDCard(PROJECT_ID, file),
        onSuccess: (res) => {
            const data = res?.data?.result?.data ?? {};

            const fullNameOcr = buildFullName(data?.first_name_th, data?.last_name_th);
            const idCardNoOcr: string | undefined = data?.id_card_number ?? undefined;

            const result: IdCardOcrResult = {
                firstName: data?.first_name_th ?? undefined,
                lastName: data?.last_name_th ?? undefined,
                fullName: fullNameOcr,
                idCardNo: idCardNoOcr,
                fullNameStatus: compareOcrName(fullNameOcr, systemFullName),
                idCardNoStatus: compareOcrIdCardNo(idCardNoOcr, systemIdCardNo),
                result: res?.data,
            };
            setIdCardResult(result);
            emitOcrChange({ idCard: result });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || String(err);
            swalError("อัปโหลดบัตรประชาชนไม่สำเร็จ", msg);
            setIdCardFile(null);
        },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // mutation: Passport
    // ─────────────────────────────────────────────────────────────────────────
    const uploadPassportMutation = useMutation({
        mutationFn: (file: File) => uploadPassport(PROJECT_ID, file),
        onSuccess: (res) => {
            const data = res?.data?.result?.data ?? {};
            const fullNameOcr = buildFullName(
                data?.first_name_th ?? data?.first_name_en,
                data?.last_name_th ?? data?.last_name_en
            );
            const passportNoOcr: string | undefined = data?.passport_number ?? undefined;

            const result: PassportOcrResult = {
                fullName: fullNameOcr,
                passportNo: passportNoOcr,
                fullNameStatus: compareOcrName(fullNameOcr, systemFullName),
                passportNoStatus: compareOcrIdCardNo(passportNoOcr, systemIdCardNo),
                result: res?.data,
            };
            setPassportResult(result);
            emitOcrChange({ passport: result });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || String(err);
            swalError("อัปโหลด Passport ไม่สำเร็จ", msg);
            setPassportFile(null);
        },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // mutation: บัตรต่างด้าว
    // ─────────────────────────────────────────────────────────────────────────
    const uploadAlienCardMutation = useMutation({
        mutationFn: (file: File) => uploadAlienCard(PROJECT_ID, file),
        onSuccess: (res) => {
            const data = res?.data?.result?.data ?? {};
            const fullNameOcr = buildFullName(
                data?.first_name_th ?? data?.first_name_en,
                data?.last_name_th ?? data?.last_name_en
            );
            const idCardNoOcr: string | undefined = data?.id_card_number ?? undefined;

            const result: AlienCardOcrResult = {
                fullName: fullNameOcr,
                idCardNo: idCardNoOcr,
                fullNameStatus: compareOcrName(fullNameOcr, systemFullName),
                idCardNoStatus: compareOcrIdCardNo(idCardNoOcr, systemIdCardNo),
                result: res?.data,
            };
            setAlienCardResult(result);
            emitOcrChange({ alienCard: result });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || String(err);
            swalError("อัปโหลดบัตรต่างด้าวไม่สำเร็จ", msg);
            setAlienCardFile(null);
        },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // mutation: ใบเสร็จ
    // ─────────────────────────────────────────────────────────────────────────
    const uploadReceiptMutation = useMutation({
        mutationFn: (file: File) => uploadReceipt(PROJECT_ID, file),
        onSuccess: (res) => {
            const receipts = res?.data?.result?.data?.receipts ?? [];
            const first = receipts[0] ?? {};

            const patientNameOcr: string | undefined = first?.patient_name ?? undefined;
            const netAmountOcr: number | undefined =
                typeof first?.total_amount === "number" ? first.total_amount : undefined;

            const result: ReceiptOcrResult = {
                hospitalName: first?.hospital_name ?? undefined,
                receiptNo: first?.receipt_number ?? undefined,
                receiptDate: first?.receipt_date ?? undefined,
                patientName: patientNameOcr,
                netAmount: netAmountOcr,
                patientNameStatus: compareOcrName(patientNameOcr, systemFullName),
                netAmountStatus: compareOcrAmount(netAmountOcr, systemAmount),
                isDocTypeMatched: res?.data?.result?.document_verification?.is_receipt ?? undefined,
                result: res?.data,
            };
            setReceiptResult(result);
            emitOcrChange({ receipt: result });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || String(err);
            swalError("อัปโหลดใบเสร็จไม่สำเร็จ", msg);
            setReceiptFile(null);
        },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // mutation: ใบรับรองแพทย์
    // ─────────────────────────────────────────────────────────────────────────
    const uploadMedCertMutation = useMutation({
        mutationFn: (file: File) => uploadMedicalCertificate(PROJECT_ID, file),
        onSuccess: (res) => {
            const data = res?.data?.result?.data ?? {};
            const patientNameOcr: string | undefined = data?.patient_name ?? undefined;
            const admitDateOcr: string | undefined = data?.certificate_date ?? undefined;

            const result: MedCertOcrResult = {
                hospitalName: data?.hospital_name ?? undefined,
                admitDate: admitDateOcr,
                patientName: patientNameOcr,
                admitDateStatus: compareOcrDate(admitDateOcr, systemDateIn),
                patientNameStatus: compareOcrName(patientNameOcr, systemFullName),
                isDocTypeMatched: data?.is_medical_certificate ?? undefined,
                result: res?.data,
            };
            setMedCertResult(result);
            emitOcrChange({ medCert: result });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || String(err);
            swalError("อัปโหลดใบรับรองแพทย์ไม่สำเร็จ", msg);
            setMedCertFile(null);
        },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // handlers: บัตรประชาชน
    // ─────────────────────────────────────────────────────────────────────────
    const handleIdCardFileChosen = (file: File) => {
        setIdCardFile(file);
        setIdCardResult(undefined);
        uploadIdCardMutation.mutate(file);
        saveToDocStorage(file, OCR_DOCUMENT_TYPE_ID.idCard);
    };
    const handleIdCardRemove = () => {
        setIdCardFile(null);
        setIdCardResult(undefined);
        emitOcrChange({ idCard: undefined });
        setDocumentIds((prev) => {
            const next = { ...prev, [OCR_DOCUMENT_TYPE_ID.idCard]: undefined };
            onDocumentIdsChange?.(next);
            return next;
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // handlers: Passport
    // ─────────────────────────────────────────────────────────────────────────
    const handlePassportFileChosen = (file: File) => {
        setPassportFile(file);
        setPassportResult(undefined);
        uploadPassportMutation.mutate(file);
        saveToDocStorage(file, OCR_DOCUMENT_TYPE_ID.passport);
    };
    const handlePassportRemove = () => {
        setPassportFile(null);
        setPassportResult(undefined);
        emitOcrChange({ passport: undefined });
        setDocumentIds((prev) => {
            const next = { ...prev, [OCR_DOCUMENT_TYPE_ID.passport]: undefined };
            onDocumentIdsChange?.(next);
            return next;
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // handlers: บัตรต่างด้าว
    // ─────────────────────────────────────────────────────────────────────────
    const handleAlienCardFileChosen = (file: File) => {
        setAlienCardFile(file);
        setAlienCardResult(undefined);
        uploadAlienCardMutation.mutate(file);
        saveToDocStorage(file, OCR_DOCUMENT_TYPE_ID.alienCard);
    };

    const handleAlienCardRemove = () => {
        setAlienCardFile(null);
        setAlienCardResult(undefined);
        emitOcrChange({ alienCard: undefined });
        setDocumentIds((prev) => {
            const next = { ...prev, [OCR_DOCUMENT_TYPE_ID.alienCard]: undefined };
            onDocumentIdsChange?.(next);
            return next;
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // handlers: ใบเสร็จ
    // ─────────────────────────────────────────────────────────────────────────
    const handleReceiptFileChosen = (file: File) => {
        if (!formik.values.transferAmount) {
            formik.setFieldTouched("transferAmount", true);
            formik.setFieldError("transferAmount", "กรุณากรอกข้อมูลให้ครบถ้วน");
            swalError("ไม่สามารถอัปโหลดได้", "กรุณากรอกจำนวนเงิน").then(() => {
                focusToFirstError(formik.errors);
            });
            return;
        }

        setReceiptFile(file);
        setReceiptResult(undefined);
        uploadReceiptMutation.mutate(file);
        saveToDocStorage(file, OCR_DOCUMENT_TYPE_ID.receipt);
    };

    const handleReceiptRemove = () => {
        setReceiptFile(null);
        setReceiptResult(undefined);
        emitOcrChange({ receipt: undefined });
        setDocumentIds((prev) => {
            const next = { ...prev, [OCR_DOCUMENT_TYPE_ID.receipt]: undefined };
            onDocumentIdsChange?.(next);
            return next;
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // handlers: ใบรับรองแพทย์
    // ─────────────────────────────────────────────────────────────────────────
    const handleMedCertFileChosen = (file: File) => {
        if (!formik.values.admissionDate) {
            formik.setFieldTouched("admissionDate", true);
            formik.setFieldError("admissionDate", "กรุณากรอกข้อมูลให้ครบถ้วน");
            swalError("เกิดข้อผิดพลาด", "กรุณากรอกวันที่เข้า รพ.");
            return;
        }

        setMedCertFile(file);
        setMedCertResult(undefined);
        uploadMedCertMutation.mutate(file);
        saveToDocStorage(file, OCR_DOCUMENT_TYPE_ID.medCert);
    };

    const handleMedCertRemove = () => {
        setMedCertFile(null);
        setMedCertResult(undefined);
        emitOcrChange({ medCert: undefined });
        setDocumentIds((prev) => {
            const next = { ...prev, [OCR_DOCUMENT_TYPE_ID.medCert]: undefined };
            onDocumentIdsChange?.(next);
            return next;
        });
    };

    const resetIdentityDocuments = () => {
        setIdCardFile(null);
        setPassportFile(null);
        setAlienCardFile(null);

        setIdCardResult(undefined);
        setPassportResult(undefined);
        setAlienCardResult(undefined);

        emitOcrChange({
            idCard: undefined,
            passport: undefined,
            alienCard: undefined,
        });

        setDocumentIds((prev) => {
            const next = {
                ...prev,
                [OCR_DOCUMENT_TYPE_ID.idCard]: undefined,
                [OCR_DOCUMENT_TYPE_ID.passport]: undefined,
                [OCR_DOCUMENT_TYPE_ID.alienCard]: undefined,
            };

            onDocumentIdsChange?.(next);
            return next;
        });
    };

    const isOcrBusy =
        uploadIdCardMutation.isLoading ||
        uploadPassportMutation.isLoading ||
        uploadAlienCardMutation.isLoading ||
        uploadReceiptMutation.isLoading ||
        uploadMedCertMutation.isLoading ||
        createDocumentToDocStorageMutation.isLoading;

    useEffect(() => {
        onOcrLoadingChange?.(isOcrBusy);
    }, [isOcrBusy, onOcrLoadingChange]);

    return (
        <Box>
            {/* 1. เอกสารยืนยันตัวตน — เลือกประเภทผ่าน radio (ทำหน้าที่เหมือน tab) */}
            <CustomPaper sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1a5da8">
                        1.เอกสารยืนยันตัวตน
                    </Typography>
                    {requiredDocs.idCard && <RequiredScanChip />}
                </Box>

                <RadioGroup
                    row
                    value={identityDocType}
                    onChange={(e) => {
                        const newType = e.target.value as IdentityDocType;

                        if (newType !== identityDocType) {
                            resetIdentityDocuments();
                            setIdentityDocType(newType);
                        }
                    }}
                    sx={{ mb: 2, gap: 1 }}
                >
                    {IDENTITY_DOC_OPTIONS.map((opt) => {
                        const OptIcon = opt.icon;
                        const selected = identityDocType === opt.value;
                        return (
                            <FormControlLabel
                                key={opt.value}
                                value={opt.value}
                                control={<Radio size="small" />}
                                label={
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <OptIcon
                                            sx={{ fontSize: 18, color: selected ? "#1a5da8" : "text.secondary" }}
                                        />
                                        <Typography
                                            variant="body2"
                                            fontWeight={selected ? 700 : 400}
                                            color={selected ? "#1a5da8" : "text.secondary"}
                                        >
                                            {opt.label}
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    border: "1px solid",
                                    borderColor: selected ? "#1a5da8" : "#e0e0e0",
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 0.25,
                                    m: 0,
                                    bgcolor: selected ? "#f0f6fc" : "#fff",
                                }}
                            />
                        );
                    })}
                </RadioGroup>

                {identityDocType === "idCard" && (
                    <DocumentBlock
                        title="บัตรประชาชน"
                        //icon={CreditCardIcon}
                        dropzoneCaption="ตรวจชื่อ / เลขบัตรประชาชน"
                        accept={ACCEPT_IMAGE_PDF}
                        file={idCardFile}
                        isProcessing={uploadIdCardMutation.isLoading}
                        isRequired={requiredDocs.idCard}
                        onFileChosen={handleIdCardFileChosen}
                        onRemove={handleIdCardRemove}
                        hideTitle
                    >
                        <CheckRow
                            label="ชื่อ-สกุล"
                            value={idCardResult?.fullName}
                            status={idCardResult?.fullNameStatus ?? "pending"}
                        />
                        <CheckRow
                            label="เลขบัตรประชาชน"
                            value={idCardResult?.idCardNo}
                            status={idCardResult?.idCardNoStatus ?? "pending"}
                        />
                    </DocumentBlock>
                )}

                {identityDocType === "passport" && (
                    <DocumentBlock
                        title="Passport"
                        //icon={FlightTakeoffIcon}
                        dropzoneCaption="ตรวจชื่อ / หมายเลขหนังสือเดินทาง"
                        accept={ACCEPT_IMAGE_PDF}
                        file={passportFile}
                        isProcessing={uploadPassportMutation.isLoading}
                        isRequired={requiredDocs.idCard}
                        onFileChosen={handlePassportFileChosen}
                        onRemove={handlePassportRemove}
                        hideTitle
                    >
                        <CheckRow
                            label="ชื่อ-สกุล"
                            value={passportResult?.fullName}
                            status={passportResult?.fullNameStatus ?? "pending"}
                        />
                        <CheckRow
                            label="หมายเลขหนังสือเดินทาง"
                            value={passportResult?.passportNo}
                            status={passportResult?.passportNoStatus ?? "pending"}
                        />
                    </DocumentBlock>
                )}

                {identityDocType === "alienCard" && (
                    <DocumentBlock
                        title="บัตรต่างด้าว"
                        //icon={Public}
                        dropzoneCaption="ตรวจชื่อ / เลขบัตรประชาชน"
                        accept={ACCEPT_IMAGE_PDF}
                        file={alienCardFile}
                        isProcessing={uploadAlienCardMutation.isLoading}
                        isRequired={requiredDocs.idCard}
                        onFileChosen={handleAlienCardFileChosen}
                        onRemove={handleAlienCardRemove}
                        hideTitle
                    >
                        <CheckRow
                            label="ชื่อ-สกุล"
                            value={alienCardResult?.fullName}
                            status={alienCardResult?.fullNameStatus ?? "pending"}
                        />
                        <CheckRow
                            label="เลขบัตรประชาชน"
                            value={alienCardResult?.idCardNo}
                            status={alienCardResult?.idCardNoStatus ?? "pending"}
                        />
                    </DocumentBlock>
                )}
            </CustomPaper>

            {/* 2. ใบเสร็จ */}
            <CustomPaper sx={{ mb: 2 }}>
                <DocumentBlock
                    title="2.ใบเสร็จ"
                    dropzoneCaption="ตรวจสอบยอดเงิน"
                    accept={ACCEPT_IMAGE_PDF}
                    file={receiptFile}
                    isProcessing={uploadReceiptMutation.isLoading}
                    isRequired={requiredDocs.receipt}
                    requiredMessage="กรุณาแนบใบเสร็จ สำหรับเบิกค่ารักษา"
                    onFileChosen={handleReceiptFileChosen}
                    onRemove={handleReceiptRemove}
                >
                    <DocTypeCheckRow label="ตรวจสอบประเภทเอกสาร: ใบเสร็จ" isMatched={receiptResult?.isDocTypeMatched} />
                    <CheckRow label="ชื่อโรงพยาบาล" value={receiptResult?.hospitalName} />
                    <CheckRow label="เลขที่ใบเสร็จ" value={receiptResult?.receiptNo} />
                    <CheckRow label="วันที่ออกใบเสร็จ" value={receiptResult?.receiptDate} />
                    <CheckRow
                        label="ชื่อผู้ป่วย"
                        value={receiptResult?.patientName}
                        status={receiptResult?.patientNameStatus ?? "pending"}
                    />
                    <CheckRow
                        label="ยอดเงินสุทธิของใบเสร็จ"
                        value={
                            receiptResult?.netAmount !== undefined
                                ? receiptResult.netAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })
                                : undefined
                        }
                        status={receiptResult?.netAmountStatus ?? "pending"}
                    />
                </DocumentBlock>
            </CustomPaper>

            {/* 3. ใบรับรองแพทย์ */}
            <CustomPaper sx={{ mb: 2 }}>
                <DocumentBlock
                    title="3.ใบรับรองแพทย์"
                    //icon={DescriptionIcon}
                    dropzoneCaption="ตรวจชื่อ / ข้อมูลการรักษา"
                    accept={ACCEPT_IMAGE_PDF}
                    file={medCertFile}
                    isProcessing={uploadMedCertMutation.isLoading}
                    isRequired={requiredDocs.medCert}
                    requiredMessage="กรุณาแนบใบรับรองแพทย์ สำหรับเบิกค่าชดเชย"
                    onFileChosen={handleMedCertFileChosen}
                    onRemove={handleMedCertRemove}
                >
                    <DocTypeCheckRow
                        label="ตรวจสอบประเภทเอกสาร: ใบรับรองแพทย์"
                        isMatched={medCertResult?.isDocTypeMatched}
                    />
                    <CheckRow label="ชื่อโรงพยาบาล" value={medCertResult?.hospitalName} />
                    <CheckRow
                        label="วันที่เข้ารักษา"
                        value={
                            medCertResult?.admitDate ? dayjs(medCertResult.admitDate).format("DD/MM/BBBB") : undefined
                        }
                        status={medCertResult?.admitDateStatus ?? "pending"}
                    />
                    <CheckRow
                        label="ชื่อผู้ป่วย"
                        value={medCertResult?.patientName}
                        status={medCertResult?.patientNameStatus ?? "pending"}
                    />
                </DocumentBlock>
            </CustomPaper>
        </Box>
    );
};

export default OcrDocumentScanSection;

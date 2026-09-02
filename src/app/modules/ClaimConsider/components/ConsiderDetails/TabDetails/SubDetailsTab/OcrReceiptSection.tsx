import React, { useRef, useState, useCallback, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    LinearProgress,
    Chip,
    IconButton,
    Alert,
    Autocomplete,
    TextField,
    Stack,
    Tooltip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BlockIcon from "@mui/icons-material/Block";
import { useMutation } from "@tanstack/react-query";

import { FormikProps } from "formik";
import { useCreateDocumentToDocStorage, documentCreatedRequest } from "../../../../../../api/docstorageApi";
import { uploadReceipt } from "../../../../../../api/ocrApi";
import { compareOcrAmount, compareOcrName } from "../../../../../../ocrCompareHelpers";
import { swalError } from "../../../../../_common";

export type OcrStatus = "pending" | "matched" | "mismatched" | "amountMatched" | "amountMismatched";

export type ReceiptLineItem = {
    id: string;
    name: string;
    amount: number;
    discount: number;
    matched: boolean;
    ignored?: boolean;
    matchedLabel?: string;
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
    lineItems?: ReceiptLineItem[];
    result?: any;
};

export type OcrDocumentScanResult = {
    receipt?: ReceiptOcrResult;
    result?: any;
};

// 5 = ใบเสร็จรับเงิน
export const OCR_DOCUMENT_TYPE_ID = {
    receipt: 5,
} as const;

export type OcrDocKey = keyof typeof OCR_DOCUMENT_TYPE_ID;

export type DocStorageDocumentIds = Partial<Record<number, string | undefined>>;

export type ClaimLineItemOption = {
    value: string;
    label: string;
};

export type OcrReceiptSectionProps = {
    onOcrChange?: (result: OcrDocumentScanResult) => void;
    onFilesValidChange?: (isValid: boolean) => void;
    systemFullName?: string;
    systemAmount?: number;
    formik: FormikProps<any>;
    applicationCode?: string;
    onDocumentIdsChange?: (documentIds: DocStorageDocumentIds) => void;
    onOcrLoadingChange?: (isLoading: boolean) => void;
    claimLineItemOptions?: ClaimLineItemOption[];
    onMatchLineItem?: (lineItem: ReceiptLineItem, selected: ClaimLineItemOption) => void;
};

const PROJECT_ID = 1;
const DOC_STORAGE_SUB_TYPE_ID_FALLBACK = 530;
const ACCEPT_IMAGE_PDF = "image/png,image/jpeg,.jpg,.jpeg,.png,.pdf";

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatAmount = (value: number): string => value.toLocaleString("th-TH", { minimumFractionDigits: 2 });

type RowState = "idle" | "processing" | "error";

const OcrReceiptSection: React.FC<OcrReceiptSectionProps> = ({
    onOcrChange,
    onFilesValidChange,
    systemFullName,
    systemAmount,
    applicationCode,
    onDocumentIdsChange,
    onOcrLoadingChange,
    claimLineItemOptions = [],
    onMatchLineItem,
}) => {
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [receiptResult, setReceiptResult] = useState<ReceiptOcrResult | undefined>(undefined);
    const [rowState, setRowState] = useState<RowState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [_documentIds, setDocumentIds] = useState<DocStorageDocumentIds>({});

    const [lineItemSelections, setLineItemSelections] = useState<Record<string, ClaimLineItemOption | null>>({});

    // revoke object URL on unmount / file change to avoid leaks
    useEffect(() => {
        if (!receiptFile || !receiptFile.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(receiptFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [receiptFile]);

    const emitOcrChange = useCallback(
        (next: Partial<OcrDocumentScanResult>) => {
            const merged: OcrDocumentScanResult = {
                receipt: next.receipt ?? receiptResult,
            };
            onOcrChange?.(merged);
        },
        [receiptResult, onOcrChange]
    );

    const createDocumentToDocStorageMutation = useCreateDocumentToDocStorage(undefined, (error) => {
        swalError("บันทึกเอกสารไม่สำเร็จ", error);
    });

    const saveToDocStorage = useCallback(
        (file: File, ocrDocumentTypeId: number) => {
            const fileUploads = [{ data: file, fileName: file.name } as any];

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

    useEffect(() => {
        onFilesValidChange?.(!!receiptFile && rowState !== "error");
    }, [receiptFile, rowState]);

    useEffect(() => {
        if (!receiptResult) return;
        const nextResult: ReceiptOcrResult = {
            ...receiptResult,
            netAmountStatus: compareOcrAmount(receiptResult.netAmount, systemAmount),
        };
        setReceiptResult(nextResult);
        emitOcrChange({ receipt: nextResult });
    }, [systemAmount]);

    const uploadReceiptMutation = useMutation({
        mutationFn: (file: File) => uploadReceipt(PROJECT_ID, file),
        onSuccess: (res) => {
            const receipts = res?.data?.result?.data?.receipts ?? [];
            const first = receipts[0] ?? {};

            const patientNameOcr: string | undefined = first?.patient_name ?? undefined;
            const netAmountOcr: number | undefined =
                typeof first?.total_amount === "number" ? first.total_amount : undefined;

            const rawLineItems: any[] = first?.line_items ?? [];
            const lineItems: ReceiptLineItem[] = rawLineItems.map((item, idx) => ({
                id: item?.id ? String(item.id) : String(idx),
                name: item?.description ?? item?.name ?? "",
                amount: typeof item?.amount === "number" ? item.amount : 0,
                discount: typeof item?.discount === "number" ? item.discount : 0,
                matched: false,
            }));

            const result: ReceiptOcrResult = {
                hospitalName: first?.hospital_name ?? undefined,
                receiptNo: first?.receipt_number ?? undefined,
                receiptDate: first?.receipt_date ?? undefined,
                patientName: patientNameOcr,
                netAmount: netAmountOcr,
                patientNameStatus: compareOcrName(patientNameOcr, systemFullName),
                netAmountStatus: compareOcrAmount(netAmountOcr, systemAmount),
                isDocTypeMatched: res?.data?.result?.document_verification?.is_receipt ?? undefined,
                lineItems: lineItems.length > 0 ? lineItems : undefined,
                result: res?.data,
            };
            setReceiptResult(result);
            setLineItemSelections({});
            setRowState("idle");
            setErrorMessage(null);
            emitOcrChange({ receipt: result });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || String(err);
            setRowState("error");
            setErrorMessage(msg);
            // keep the file attached so the user can retry without re-selecting it
        },
    });

    const runOcr = (file: File) => {
        setReceiptResult(undefined);
        setLineItemSelections({});
        setRowState("processing");
        setErrorMessage(null);
        uploadReceiptMutation.mutate(file);
        saveToDocStorage(file, OCR_DOCUMENT_TYPE_ID.receipt);
    };

    const acceptFile = (file: File) => {
        setReceiptFile(file);
        runOcr(file);
    };

    const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) acceptFile(selected);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) acceptFile(dropped);
    };

    const handleRetry = () => {
        if (receiptFile) runOcr(receiptFile);
    };

    const handleReceiptRemove = () => {
        setReceiptFile(null);
        setReceiptResult(undefined);
        setLineItemSelections({});
        setRowState("idle");
        setErrorMessage(null);
        emitOcrChange({ receipt: undefined });
        setDocumentIds((prev) => {
            const next = { ...prev, [OCR_DOCUMENT_TYPE_ID.receipt]: undefined };
            onDocumentIdsChange?.(next);
            return next;
        });
    };

    const handleViewFile = () => {
        if (!receiptFile) return;
        const url = previewUrl ?? URL.createObjectURL(receiptFile);
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleConfirmMatch = (item: ReceiptLineItem) => {
        const selected = lineItemSelections[item.id];
        if (!selected || !receiptResult?.lineItems) return;

        const nextLineItems = receiptResult.lineItems.map((li) =>
            li.id === item.id ? { ...li, matched: true, matchedLabel: selected.label } : li
        );
        const nextResult: ReceiptOcrResult = { ...receiptResult, lineItems: nextLineItems };
        setReceiptResult(nextResult);
        emitOcrChange({ receipt: nextResult });
        onMatchLineItem?.(item, selected);
    };

    const handleIgnoreLineItem = (item: ReceiptLineItem) => {
        if (!receiptResult?.lineItems) return;
        const nextLineItems = receiptResult.lineItems.map((li) => (li.id === item.id ? { ...li, ignored: true } : li));
        const nextResult: ReceiptOcrResult = { ...receiptResult, lineItems: nextLineItems };
        setReceiptResult(nextResult);
        emitOcrChange({ receipt: nextResult });
    };

    useEffect(() => {
        onOcrLoadingChange?.(rowState === "processing" || createDocumentToDocStorageMutation.isLoading);
    }, [rowState, createDocumentToDocStorageMutation.isLoading, onOcrLoadingChange]);

    const hasFile = !!receiptFile;
    const isProcessing = rowState === "processing";
    const isError = rowState === "error";
    const isDone = !!receiptResult && rowState === "idle";

    const pendingLineItems = receiptResult?.lineItems?.filter((li) => !li.matched && !li.ignored) ?? [];
    const hasUnmatchedLineItems = isDone && pendingLineItems.length > 0;
    const isFullyMatched = isDone && !hasUnmatchedLineItems;

    const rowBorderColor = isError ? "#ef9a9a" : isProcessing ? "#ffcc80" : "#e0e0e0";

    return (
        <Box>
            {/* header */}
            <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <AttachFileIcon sx={{ fontSize: 20, color: "#1a5da8" }} />
                </Box>
                <Box minWidth={0}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1a5da8" noWrap sx={{ lineHeight: 1.3 }}>
                        ใบแจ้งค่ารักษา / ใบเสร็จรับเงิน
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1.3, display: "block", mt: "2px" }}
                    >
                        รองรับ PDF, JPG, JPEG, PNG และเอกสารหลายหน้า
                    </Typography>
                </Box>
            </Stack>

            {/* dropzone / empty state (shown until a file exists) */}
            {!hasFile && (
                <Box
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => uploadInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") uploadInputRef.current?.click();
                    }}
                    sx={{
                        border: "1.5px dashed",
                        borderColor: isDragOver ? "#1a5da8" : "#c0d4f0",
                        borderRadius: 2,
                        bgcolor: isDragOver ? "#f0f6fc" : "#fafcff",
                        p: { xs: 3, sm: 4 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { borderColor: "#1a5da8", bgcolor: "#f0f6fc" },
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#1a5da8" }} />
                    <Typography variant="body2" fontWeight={600} textAlign="center">
                        ลากไฟล์มาวาง หรือคลิกเพื่ออัปโหลดใบแจ้งค่ารักษา
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<UploadFileIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            uploadInputRef.current?.click();
                        }}
                        sx={{
                            textTransform: "none",
                            bgcolor: "#1a5da8",
                            mt: 0.5,
                            "&:hover": { bgcolor: "#154a8a" },
                        }}
                    >
                        เลือกไฟล์
                    </Button>
                </Box>
            )}

            <input
                ref={uploadInputRef}
                type="file"
                accept={ACCEPT_IMAGE_PDF}
                capture="environment"
                style={{ display: "none" }}
                onChange={handleUploadInputChange}
            />

            {/* file row (once a file exists) */}
            {hasFile && receiptFile && (
                <Box
                    sx={{
                        border: "1px solid",
                        borderColor: rowBorderColor,
                        borderLeft: "4px solid",
                        borderLeftColor: rowBorderColor,
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: isError ? "#fff8f8" : "#fff",
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            gap={1.5}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                            {/* thumbnail + name — always first / on top */}
                            <Box display="flex" alignItems="center" gap={1.5} minWidth={0} sx={{ width: "100%" }}>
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 1.5,
                                        bgcolor: "#e3f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        overflow: "hidden",
                                        opacity: isProcessing ? 0.6 : 1,
                                    }}
                                >
                                    {previewUrl ? (
                                        <Box
                                            component="img"
                                            src={previewUrl}
                                            alt={receiptFile.name}
                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <InsertDriveFileIcon sx={{ color: "#1a5da8" }} />
                                    )}
                                </Box>
                                <Box minWidth={0}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                        {receiptFile.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {formatBytes(receiptFile.size)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* status + actions — second row on mobile */}
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={{
                                    width: { xs: "100%", sm: "auto" },
                                    justifyContent: { xs: "flex-end", sm: "flex-start" },
                                    flexShrink: 0,
                                }}
                            >
                                {isProcessing && (
                                    <Chip
                                        size="medium"
                                        label="กำลังอ่านข้อมูล..."
                                        sx={{ bgcolor: "#FFF1CD", color: "#a56e07", fontWeight: 600 }}
                                    />
                                )}
                                {isError && (
                                    <Chip
                                        size="medium"
                                        icon={<ErrorOutlineIcon sx={{ fontSize: 16 }} />}
                                        label="ประมวลผลไม่สำเร็จ"
                                        sx={{ bgcolor: "#FFCFC9", color: "#B32615", fontWeight: 600 }}
                                    />
                                )}
                                {isDone && (
                                    <Chip
                                        size="medium"
                                        label="OCR สำเร็จ"
                                        sx={{ bgcolor: "#D4EDBC", color: "#11734B", fontWeight: 600 }}
                                    />
                                )}

                                {isError ? (
                                    <Tooltip title="ลองอ่าน OCR อีกครั้ง">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<RefreshIcon fontSize="small" />}
                                            onClick={handleRetry}
                                            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                                        >
                                            ลองใหม่
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    !isProcessing && (
                                        <Tooltip title="อ่าน OCR ใหม่จากไฟล์นี้">
                                            <IconButton
                                                size="small"
                                                onClick={handleRetry}
                                                aria-label="อ่าน OCR ใหม่"
                                                sx={{ width: 36, height: 36 }}
                                            >
                                                <RefreshIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                )}

                                <Tooltip title="ดูเอกสาร">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={handleViewFile}
                                            disabled={isProcessing}
                                            aria-label="ดูเอกสาร"
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                "&:hover": { bgcolor: "#d4ecff" },
                                            }}
                                        >
                                            <VisibilityIcon fontSize="small" color="primary" />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="ลบเอกสาร">
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={handleReceiptRemove}
                                            disabled={isProcessing}
                                            aria-label="ลบเอกสาร"
                                            sx={{ width: 36, height: 36, "&:hover": { bgcolor: "#FFCFC9" } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        {isProcessing && <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />}
                    </Box>

                    {isError && errorMessage && (
                        <Box sx={{ px: 2, pb: 2 }}>
                            <Typography variant="caption" color="error">
                                {errorMessage}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* result: mismatch warning + pending items to reconcile */}
            {hasUnmatchedLineItems && (
                <Box mt={2}>
                    <Alert severity="warning" sx={{ mb: 1.5 }}>
                        OCR อ่านข้อมูลสำเร็จ แต่ไม่พบรายการที่จับคู่กับรายการค่ารักษา (เบื้องต้น)
                        จึงไม่กรอกยอดลงตารางอัตโนมัติ กรุณาตรวจสอบรายการด้านล่าง
                    </Alert>

                    <Box sx={{ border: "1px solid #ffe0b2", borderRadius: 2, overflow: "hidden" }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 2,
                                py: 1,
                                bgcolor: "#fff8e1",
                            }}
                        >
                            <Typography variant="body2" fontWeight={600}>
                                รายการรอตรวจสอบ
                            </Typography>
                            <Chip
                                size="small"
                                label={`${pendingLineItems.length} รายการ`}
                                sx={{ bgcolor: "#ffe0b2", color: "#e65100", fontWeight: 600 }}
                            />
                        </Box>

                        <Stack gap={1.5} sx={{ p: 2 }}>
                            {pendingLineItems.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 1.5, bgcolor: "#fff" }}
                                >
                                    <Stack direction="row" justifyContent="space-between" gap={2} mb={1}>
                                        <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                                            {item.name || "รายการจาก OCR (ไม่มีชื่อ)"}
                                        </Typography>
                                        <Stack direction="row" gap={2} sx={{ flexShrink: 0 }}>
                                            <Box textAlign="right">
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    ยอดใบเสร็จ
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {formatAmount(item.amount)}
                                                </Typography>
                                            </Box>
                                            <Box textAlign="right">
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    ส่วนลด
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {formatAmount(item.discount)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        gap={1}
                                        alignItems={{ xs: "stretch", sm: "center" }}
                                    >
                                        <Autocomplete
                                            size="small"
                                            options={claimLineItemOptions}
                                            getOptionLabel={(opt) => opt.label}
                                            noOptionsText="ไม่พบรายการค่ารักษาที่ตรงกัน"
                                            value={lineItemSelections[item.id] ?? null}
                                            onChange={(_, value) =>
                                                setLineItemSelections((prev) => ({ ...prev, [item.id]: value }))
                                            }
                                            sx={{ flex: 1 }}
                                            renderInput={(params) => (
                                                <TextField {...params} placeholder="ค้นหารายการค่ารักษา" />
                                            )}
                                        />
                                        <Stack direction="row" gap={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={!lineItemSelections[item.id]}
                                                onClick={() => handleConfirmMatch(item)}
                                                sx={{
                                                    textTransform: "none",
                                                    whiteSpace: "nowrap",
                                                    bgcolor: "#1a5da8",
                                                    flex: { xs: 1, sm: "initial" },
                                                    "&:hover": { bgcolor: "#154a8a" },
                                                }}
                                            >
                                                เลือกรายการ
                                            </Button>
                                            <Tooltip title="ไม่นำรายการนี้เข้าตาราง">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleIgnoreLineItem(item)}
                                                    aria-label="ข้ามรายการนี้"
                                                    sx={{ width: 36, height: 36, border: "1px solid #e0e0e0" }}
                                                >
                                                    <BlockIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            )}

            {isFullyMatched && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    OCR สำเร็จ ระบบกรอกยอดเงินตามใบเสร็จและส่วนลดลงในตารางแล้ว
                </Alert>
            )}
        </Box>
    );
};

export default OcrReceiptSection;

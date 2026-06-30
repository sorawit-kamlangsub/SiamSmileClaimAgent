import React, { useState } from "react";
import { Box, Typography, Button, Chip, LinearProgress } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DescriptionIcon from "@mui/icons-material/Description";
// import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
// import PublicIcon from "@mui/icons-material/Public";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

type OcrStatus = "pending" | "matched" | "mismatched";
type IdentityDocType = "idCard" | "passport" | "alienCard";

const OCR_STATUS_LABEL: Record<OcrStatus, string> = {
    pending: "รอ OCR",
    matched: "ข้อมูลตรงกัน",
    mismatched: "ข้อมูลไม่ตรงกัน",
};

const OCR_STATUS_STYLE: Record<OcrStatus, { bg: string; color: string; border: string }> = {
    pending: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
    matched: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
    mismatched: { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" },
};

const OcrStatusBadge: React.FC<{ status: OcrStatus }> = ({ status }) => {
    const style = OCR_STATUS_STYLE[status];
    return (
        <Chip
            label={OCR_STATUS_LABEL[status]}
            size="small"
            style={{
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                fontSize: 12,
                fontWeight: 600,
                height: 24,
            }}
        />
    );
};

const RequiredScanChip: React.FC = () => (
    <Chip
        label="แนบเอกสาร"
        size="small"
        sx={{
            bgcolor: "#e53935",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            height: 24,
        }}
    />
);

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
            sx={{ bgcolor: bg, border: `1px solid ${border}`, borderRadius: 1.5, px: 1.5, py: 0.75, mb: 1 }}
        >
            <Typography variant="body2" fontWeight={600} color={color}>
                {label}
            </Typography>
            <Icon sx={{ fontSize: 20, color }} />
        </Box>
    );
};

const CheckRow: React.FC<{ label: string; value?: string; status?: OcrStatus }> = ({ label, value, status }) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} py={0.5}>
        <Box display="flex" alignItems="baseline" gap={0.5} minWidth={0}>
            <Typography variant="body2" color="text.secondary" noWrap>
                {label} :
            </Typography>
            {value && (
                <Typography variant="body2" fontWeight={700} color="primary" sx={{ wordBreak: "break-word" }}>
                    {value}
                </Typography>
            )}
        </Box>
        {status && <OcrStatusBadge status={status} />}
    </Box>
);

const Dropzone: React.FC<{
    file: File | null;
    isRequired: boolean;
    isProcessing?: boolean;
    requiredMessage?: string;
    onFileChosen: (file: File) => void;
    onRemove: () => void;
}> = ({ file, isRequired, isProcessing, requiredMessage, onFileChosen, onRemove }) => {
    const showRequiredState = isRequired && !file;
    return (
        <Box>
            <Box
                sx={{
                    border: "1px dashed",
                    borderColor: showRequiredState ? "#f5b5b5" : "#c0d4f0",
                    borderRadius: 2,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
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
                {file && file.type.startsWith("image/") ? (
                    <Box
                        component="img"
                        src={URL.createObjectURL(file)}
                        sx={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain", borderRadius: 1 }}
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
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 40, color: showRequiredState ? "#e57373" : "#1a5da8" }} />
                    </Box>
                )}
                {file && (
                    <Typography variant="caption" color="text.secondary" noWrap maxWidth="100%">
                        {file.name}
                    </Typography>
                )}
                {!file && (
                    <Typography variant="body2" color="text.secondary">
                        อัปโหลดไฟล์ หรือเลือกวิธีสแกน
                    </Typography>
                )}
                <Box display="flex" gap={1.5} flexWrap="wrap" justifyContent="center">
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CameraAltIcon />}
                        sx={{ borderColor: "#1a5da8", color: "#1a5da8" }}
                    >
                        เปิดกล้อง
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadFileIcon />}
                        component="label"
                        sx={{ borderColor: "#1a5da8", color: "#1a5da8" }}
                    >
                        อัปโหลดไฟล์
                        <input
                            type="file"
                            hidden
                            accept="image/png,image/jpeg,.jpg,.jpeg,.png,.pdf"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) onFileChosen(f);
                            }}
                        />
                    </Button>
                </Box>
            </Box>
            {!file && isRequired && (
                <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                    {requiredMessage ?? "กรุณาสแกนเอกสารนี้"}
                </Typography>
            )}
            {file && (
                <Box mt={1.5}>
                    <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={onRemove}>
                        ลบเอกสาร
                    </Button>
                </Box>
            )}
        </Box>
    );
};

const Checklist: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box>
        <Box sx={{ border: "1px dashed #c0d4f0", borderRadius: 2, p: 2, bgcolor: "#fff", minHeight: 160 }}>
            {children}
        </Box>
    </Box>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; isRequired?: boolean }> = ({
    title,
    isRequired,
}) => (
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700} color="#1a5da8">
            {title}
        </Typography>
        {isRequired && <RequiredScanChip />}
    </Box>
);

const IDENTITY_OPTIONS: { value: IdentityDocType; label: string; icon: React.ElementType }[] = [
    { value: "idCard", label: "บัตรประชาชน", icon: CreditCardIcon },
    // { value: "passport", label: "Passport", icon: FlightTakeoffIcon },
    // { value: "alienCard", label: "บัตรต่างด้าว", icon: PublicIcon },
];

const OcrDocumentScanSection: React.FC = () => {
    const [identityDocType, setIdentityDocType] = useState<IdentityDocType>("idCard");
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [alienCardFile, setAlienCardFile] = useState<File | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [medCertFile, setMedCertFile] = useState<File | null>(null);

    const identityFile =
        identityDocType === "idCard" ? idCardFile : identityDocType === "passport" ? passportFile : alienCardFile;

    const setIdentityFile = (file: File | null) => {
        if (identityDocType === "idCard") setIdCardFile(file);
        else if (identityDocType === "passport") setPassportFile(file);
        else setAlienCardFile(file);
    };

    return (
        <Box>
            {/* 1. เอกสารยืนยันตัวตน */}
            <Box sx={{ border: "0.5px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}>
                <SectionHeader
                    icon={<BadgeIcon sx={{ fontSize: 22, color: "#1a5da8" }} />}
                    title="1. บัตรประชาชน"
                    isRequired
                />
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    {IDENTITY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const selected = identityDocType === opt.value;
                        return (
                            <Box
                                key={opt.value}
                                onClick={() => {
                                    setIdentityFile(null);
                                    setIdentityDocType(opt.value);
                                }}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    border: "1px solid",
                                    borderColor: selected ? "#1a5da8" : "#e0e0e0",
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 0.5,
                                    cursor: "pointer",
                                    bgcolor: selected ? "#f0f6fc" : "#fff",
                                }}
                            >
                                <Icon sx={{ fontSize: 16, color: selected ? "#1a5da8" : "text.secondary" }} />
                                <Typography
                                    variant="body2"
                                    fontWeight={selected ? 700 : 400}
                                    color={selected ? "#1a5da8" : "text.secondary"}
                                >
                                    {opt.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                    <Box flex={1} minWidth={0}>
                        <Dropzone
                            file={identityFile}
                            isRequired
                            onFileChosen={setIdentityFile}
                            onRemove={() => setIdentityFile(null)}
                        />
                    </Box>
                    <Box flex={1} minWidth={0}>
                        <Checklist>
                            <CheckRow label="ชื่อ-สกุล" status="pending" />
                            <CheckRow label="เลขที่บัตรประชาชน" status="pending" />
                        </Checklist>
                    </Box>
                </Box>
            </Box>

            {/* 2. ใบเสร็จ */}
            <Box sx={{ border: "0.5px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}>
                <SectionHeader
                    icon={<ReceiptLongIcon sx={{ fontSize: 22, color: "#1a5da8" }} />}
                    title="2. ใบเสร็จ"
                    isRequired
                />
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                    <Box flex={1} minWidth={0}>
                        <Dropzone
                            file={receiptFile}
                            isRequired
                            requiredMessage="กรุณาแนบใบเสร็จ สำหรับเบิกค่ารักษา"
                            onFileChosen={setReceiptFile}
                            onRemove={() => setReceiptFile(null)}
                        />
                    </Box>
                    <Box flex={1} minWidth={0}>
                        <Checklist>
                            <DocTypeCheckRow
                                label="ตรวจสอบประเภทเอกสาร: ใบเสร็จ"
                                isMatched={receiptFile ? true : undefined}
                            />
                            <CheckRow label="ชื่อโรงพยาบาล" status="pending" />
                            <CheckRow label="เลขที่ใบเสร็จ" status="pending" />
                            <CheckRow label="วันที่ออกเอกสาร" status="pending" />
                            <CheckRow label="ชื่อผู้ป่วย" status="pending" />
                            <CheckRow label="ยอดเงินสุทธิ" status="pending" />
                        </Checklist>
                    </Box>
                </Box>
            </Box>

            {/* 3. ใบรับรองแพทย์ */}
            <Box sx={{ border: "0.5px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                <SectionHeader
                    icon={<DescriptionIcon sx={{ fontSize: 22, color: "#1a5da8" }} />}
                    title="3. ใบรับรองแพทย์"
                />
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                    <Box flex={1} minWidth={0}>
                        <Dropzone
                            file={medCertFile}
                            isRequired={false}
                            requiredMessage="กรุณาแนบใบรับรองแพทย์ สำหรับเบิกค่าชดเชย"
                            onFileChosen={setMedCertFile}
                            onRemove={() => setMedCertFile(null)}
                        />
                    </Box>
                    <Box flex={1} minWidth={0}>
                        <Checklist>
                            <DocTypeCheckRow
                                label="ตรวจสอบประเภทเอกสาร: ใบรับรองแพทย์"
                                isMatched={medCertFile ? true : undefined}
                            />
                            <CheckRow label="ชื่อโรงพยาบาล" status="pending" />
                            <CheckRow label="วันที่เข้ารักษา" status="pending" />
                            <CheckRow label="ชื่อผู้ป่วย" status="pending" />
                        </Checklist>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default OcrDocumentScanSection;

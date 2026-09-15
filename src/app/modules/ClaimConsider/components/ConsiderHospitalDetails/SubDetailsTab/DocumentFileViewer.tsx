import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useMemo, useState } from "react";

import { formatDateString } from "../../../../../functionHelpers";
import { useGetDocumentFileByDocumentId } from "../../../../../api/docstorageApi";

type DocumentFileViewerProps = {
    /** documentId ของแถวที่กดดู — undefined เมื่อ modal ปิดอยู่ */
    documentId?: string;
};

/** view-model ของไฟล์ 1 รายการ ที่ประกอบจาก DocumentFileResponseDto */
type FileView = {
    id: string;
    fileName: string;
    fileType: string;
    isImage: boolean;
    /** URL สำหรับแสดงรูปในกรอบตัวอย่าง (เฉพาะไฟล์รูปภาพ) */
    previewUrl?: string;
    /** pathFullDoc — ไฟล์ที่ไม่ใช่รูปภาพให้กดลิงก์ไปเปิดแทน */
    openUrl?: string;
    uploadedDate: string;
    uploadedBy: string;
};

const openInNewTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const IMAGE_EXTENSIONS = ["JPG", "JPEG", "PNG", "GIF", "WEBP", "BMP", "TIF", "TIFF", "HEIC", "SVG"];

const extensionOf = (fileName: string) => {
    const dot = fileName.lastIndexOf(".");
    return dot === -1 ? "" : fileName.slice(dot + 1).toUpperCase();
};

const fileIcon = (fileType: string) => {
    if (fileType === "PDF") return <PictureAsPdfOutlinedIcon />;
    if (IMAGE_EXTENSIONS.includes(fileType)) return <ImageOutlinedIcon />;

    return <InsertDriveFileOutlinedIcon />;
};

/**
 * ตัวอ่านไฟล์เอกสาร แสดงรายการไฟล์ที่สแกนไว้และตัวอย่างของไฟล์ที่เลือก
 *
 * ดึงไฟล์จริงจาก DocStorage (GET /document/{documentId}/documentFile) ตอนเปิด modal
 * ดูได้อย่างเดียว ไม่มีการเพิ่ม ลบ หรือแก้ไขเอกสาร
 */
const DocumentFileViewer = ({ documentId }: DocumentFileViewerProps) => {
    const { data, isLoading } = useGetDocumentFileByDocumentId(documentId);

    const files = useMemo<FileView[]>(
        () =>
            (data?.data ?? []).map((file, index) => {
                const fileName = file.fileName ?? `ไฟล์ ${index + 1}`;
                const fileType = extensionOf(fileName);
                // ใช้ทั้ง flag จาก BE และนามสกุลไฟล์ — บางไฟล์ BE ไม่ได้ตั้ง isImage มา
                const isImage = !!file.isImage || IMAGE_EXTENSIONS.includes(fileType);
                return {
                    id: file.documentFileId ?? `${documentId ?? "doc"}-${index + 1}`,
                    fileName,
                    fileType,
                    isImage,
                    previewUrl: isImage
                        ? file.fileURL || file.pathFullDoc || file.pathThumbnailImg || undefined
                        : undefined,
                    // ไฟล์ที่ไม่ใช่รูปภาพ : เปิดผ่าน pathFullDoc
                    openUrl: !isImage ? file.pathFullDoc || file.fileURL || undefined : undefined,
                    uploadedDate:
                        formatDateString(
                            (file.createdDate ?? file.updatedDate)?.toString() ?? "",
                            "DD/MM/BBBB HH:mm"
                        ) || "-",
                    uploadedBy: file.createdByUserName ?? "-",
                };
            }),
        [data, documentId]
    );

    const [selectedFileId, setSelectedFileId] = useState<string>();
    const selectedFile = files.find((file) => file.id === selectedFileId) ?? files[0];

    if (isLoading) {
        return (
            <Box sx={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (files.length === 0) {
        return (
            <Box
                sx={{
                    minHeight: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    color: "text.secondary",
                }}
            >
                ยังไม่มีเอกสารในรายการนี้
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "stretch" }}>
            <Box sx={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography fontSize={13} fontWeight={600} color="text.secondary">
                    ไฟล์ที่สแกนไว้
                </Typography>

                {files.map((file) => (
                    <FileRow
                        key={file.id}
                        file={file}
                        selected={file.id === selectedFile?.id}
                        onClick={() => setSelectedFileId(file.id)}
                    />
                ))}
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography fontSize={13} fontWeight={600} color="text.secondary">
                    ตัวอย่างเอกสาร
                </Typography>

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 460,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                        bgcolor: "#F4F7FA",
                        color: "text.secondary",
                        px: 3,
                        py: 2,
                        textAlign: "center",
                        overflow: "hidden",
                    }}
                >
                    {selectedFile?.isImage && selectedFile.previewUrl ? (
                        <Box
                            component="img"
                            src={selectedFile.previewUrl}
                            alt={selectedFile.fileName}
                            sx={{ maxWidth: "100%", maxHeight: 440, objectFit: "contain", borderRadius: 1 }}
                        />
                    ) : (
                        <>
                            <Box sx={{ "& svg": { fontSize: 64, color: "#9FB3C6" } }}>
                                {fileIcon(selectedFile?.fileType ?? "")}
                            </Box>
                            <Typography fontWeight={600} color="text.primary">
                                {selectedFile?.fileName}
                            </Typography>
                            <Typography fontSize={13}>{selectedFile?.fileType || "ไฟล์เอกสาร"}</Typography>
                            <Typography fontSize={13}>
                                {`สแกนเมื่อ ${selectedFile?.uploadedDate} โดย ${selectedFile?.uploadedBy}`}
                            </Typography>
                            {selectedFile?.openUrl && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<OpenInNewOutlinedIcon />}
                                    onClick={() => selectedFile.openUrl && openInNewTab(selectedFile.openUrl)}
                                    sx={{ mt: 1 }}
                                >
                                    เปิดเอกสาร
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

type FileRowProps = {
    file: FileView;
    selected: boolean;
    onClick: () => void;
};

const FileRow = ({ file, selected, onClick }: FileRowProps) => (
    <Box
        onClick={onClick}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            cursor: "pointer",
            border: "1px solid",
            borderColor: selected ? "#1565C0" : "divider",
            bgcolor: selected ? "#EFF7FF" : "transparent",
            "&:hover": { bgcolor: selected ? "#EFF7FF" : "#F4F7FA" },
        }}
    >
        <Box sx={{ display: "flex", color: selected ? "#1565C0" : "#7D90A4" }}>{fileIcon(file.fileType)}</Box>
        <Box sx={{ lineHeight: 1.4, overflow: "hidden" }}>
            <Typography fontSize={14} fontWeight={600} noWrap>
                {file.fileName}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
                {`${file.fileType || "ไฟล์"} · ${file.uploadedDate}`}
            </Typography>
        </Box>
    </Box>
);

export default DocumentFileViewer;

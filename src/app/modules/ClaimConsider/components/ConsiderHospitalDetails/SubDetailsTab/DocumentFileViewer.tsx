import { Box, Divider, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { useState } from "react";

import { DocumentFile } from "../mock/hospitalConsiderMock";

type DocumentFileViewerProps = {
    files: DocumentFile[];
};

const fileIcon = (fileType: string) => {
    if (fileType.toUpperCase() === "PDF") return <PictureAsPdfOutlinedIcon />;
    if (["JPG", "JPEG", "PNG"].includes(fileType.toUpperCase())) return <ImageOutlinedIcon />;

    return <InsertDriveFileOutlinedIcon />;
};

/**
 * ตัวอ่านไฟล์เอกสาร แสดงรายการไฟล์ที่สแกนไว้และตัวอย่างของไฟล์ที่เลือก
 *
 * ดูได้อย่างเดียว ไม่มีการเพิ่ม ลบ หรือแก้ไขเอกสาร
 */
const DocumentFileViewer = ({ files }: DocumentFileViewerProps) => {
    const [selectedFileId, setSelectedFileId] = useState<string | undefined>(files[0]?.fileId);

    const selectedFile = files.find((file) => file.fileId === selectedFileId) ?? files[0];

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
                        key={file.fileId}
                        file={file}
                        selected={file.fileId === selectedFile?.fileId}
                        onClick={() => setSelectedFileId(file.fileId)}
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
                        textAlign: "center",
                    }}
                >
                    <Box sx={{ "& svg": { fontSize: 64, color: "#9FB3C6" } }}>
                        {fileIcon(selectedFile?.fileType ?? "")}
                    </Box>
                    <Typography fontWeight={600} color="text.primary">
                        {selectedFile?.fileName}
                    </Typography>
                    <Typography fontSize={13}>{`${selectedFile?.fileType} · ${selectedFile?.fileSize}`}</Typography>
                    <Typography fontSize={13}>
                        {`สแกนเมื่อ ${selectedFile?.uploadedDate} โดย ${selectedFile?.uploadedBy}`}
                    </Typography>
                    <Typography fontSize={12} mt={1}>
                        ตัวอย่างเอกสารจะแสดงที่นี่เมื่อเชื่อมกับ DocStorage แล้ว
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

type FileRowProps = {
    file: DocumentFile;
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
                {`${file.fileType} · ${file.fileSize}`}
            </Typography>
        </Box>
    </Box>
);

export default DocumentFileViewer;

import { Box, Button, FormHelperText, FormLabel, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { FormikProps } from "formik";
import React, { useRef, useState } from "react";

const FILE_TYPE_ERROR = "กรุณาอัปโหลดเฉพาะไฟล์รูปภาพหรือ PDF เท่านั้น";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/bmp", "application/pdf"];

const isAllowedFile = (file: File): boolean => {
    const allowedMime = ALLOWED_MIME.includes(file.type);
    const allowedExtension = /\.(jpe?g|png|gif|bmp|pdf)$/i.test(file.name);
    return allowedMime || allowedExtension;
};

type RefundSlipFileUploadProps = {
    formik: FormikProps<any>;
    name?: string;
};

const RefundSlipFileUpload = ({ formik, name = "slipFile" }: RefundSlipFileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileTypeError, setFileTypeError] = useState<string | null>(null);
    const { touched, error, value } = formik.getFieldMeta<File[] | undefined>(name);
    const file = value?.[0];

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        event.target.value = "";
        if (!selected) return;

        if (!isAllowedFile(selected)) {
            setFileTypeError(FILE_TYPE_ERROR);
            formik.setFieldValue(name, [], true);
            formik.setFieldTouched(name, true, true);
            return;
        }

        setFileTypeError(null);
        formik.setFieldValue(name, [selected], false);
        formik.setFieldError(name, undefined);
        formik.setFieldTouched(name, true, false);
    };

    return (
        <Box sx={{ position: "relative", maxWidth: "350px" }}>
            <FormLabel
                required
                sx={{
                    position: "absolute",
                    top: -10,
                    left: 12,
                    zIndex: 1,
                    backgroundColor: "#fff",
                    padding: "0 4px",
                    fontSize: "0.875rem",
                }}
            >
                Slip การโอนคืน
            </FormLabel>
<Box
                sx={{
                    maxWidth: "350px",
                    border: touched && !!error ? "none" : "1px solid #E0E0E0",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    padding: "12px 16px",
                    marginTop: "12px",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadFileIcon />}
                    onClick={() => inputRef.current?.click()}
                    sx={{
                        textTransform: "none",
                        borderColor: "#1a5da8",
                        color: "#1a5da8",
                        "&:hover": { borderColor: "#154a8a", bgcolor: "#f0f6fc" },
                        bgcolor: "#fff",
                        whiteSpace: "nowrap",
                    }}
                >
                    เลือกไฟล์
                </Button>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {file?.name ?? "ยังไม่ได้เลือกไฟล์"}
                </Typography>
            </Box>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                onChange={handleChange}
            />
            </Box>
            {fileTypeError ?? (touched && !!error ? error : null) ? (
                <FormHelperText error sx={{ marginTop: "6px", marginLeft: "4px" }}>
                    {fileTypeError ?? error}
                </FormHelperText>
            ) : null}
        </Box>
    );
};

export default RefundSlipFileUpload;
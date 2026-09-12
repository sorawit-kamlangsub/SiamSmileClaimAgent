import { Box, Button, FormHelperText, FormLabel, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { FormikProps } from "formik";
import React, { useRef } from "react";

type RefundSlipFileUploadProps = {
    formik: FormikProps<any>;
    name?: string;
};

const RefundSlipFileUpload = ({ formik, name = "slipFile" }: RefundSlipFileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { touched, error, value } = formik.getFieldMeta<File[] | undefined>(name);
    const file = value?.[0];

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        formik.setFieldValue(name, selected ? [selected] : [], true);
        formik.setFieldTouched(name, true, true);
        event.target.value = "";
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
            {touched && !!error && (
                <FormHelperText error sx={{ marginTop: "6px", marginLeft: "4px" }}>
                    {error}
                </FormHelperText>
            )}
        </Box>
    );
};

export default RefundSlipFileUpload;
import React, { useState } from "react";
import { useFormik } from "formik";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Button,
    IconButton,
    Typography,
    InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { useSearchExtraPayment } from "../hooks/useSearchExtraPayment";
import FormikTextField from "../../_common/components/CustomFormik/FormikTextField";
import SearchIcon from "@mui/icons-material/Search";

interface ExtraPaymentSearchModalProps {
    open: boolean;
    onClose: () => void;
    onFound: (result: { cpgNo: string; claimOnLineId?: number }) => void;
}

export const ExtraPaymentSearchModal: React.FC<ExtraPaymentSearchModalProps> = ({ open, onClose, onFound }) => {
    const [notFound, setNotFound] = useState(false);
    const { search, isSearching } = useSearchExtraPayment();

    const formik = useFormik({
        initialValues: { seaechDetail: "" },
        validate: (values) => {
            const errors: { seaechDetail?: string } = {};
            if (!values.seaechDetail) {
                errors.seaechDetail = "กรุณากรอกเลขที่ CPG / CL";
            } else if (!/^[a-zA-Z0-9]+$/.test(values.seaechDetail)) {
                errors.seaechDetail = "กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ";
            }
            if (notFound) errors.seaechDetail = "ไม่พบรายการที่ค้นหา";
            return errors;
        },
        onSubmit: async (values) => {
            const result = await search(values.seaechDetail);
            if (!result || !result.found) {
                setNotFound(true);
                return;
            }
            onFound({ cpgNo: result.cpgNo, claimOnLineId: result.claimOnLineId });
            handleClose();
        },
    });

    const handleClose = () => {
        setNotFound(false);
        formik.resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        setNotFound(false);
        formik.submitForm();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "24px",
                            bgcolor: "#eaf5ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <PersonSearchIcon color="primary" />
                    </Box>
                    <Typography fontWeight={700} fontSize={19}>
                        ค้นหารายการ
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <FormikTextField
                    fullWidth
                    autoFocus
                    label="กรุณากรอกเลขที่ CPG / CL"
                    required
                    name="seaechDetail"
                    formik={formik}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    variant="contained"
                    size="medium"
                    onClick={handleSubmit}
                    sx={{ fontWeight: 700 }}
                    disabled={isSearching}
                >
                    บันทึก
                </Button>
            </DialogActions>
        </Dialog>
    );
};

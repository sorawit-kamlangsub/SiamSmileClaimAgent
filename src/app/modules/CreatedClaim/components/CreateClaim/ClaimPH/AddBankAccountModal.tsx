import React from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../../redux";
import { addBankAccount } from "../../../store/claimPHSlice";
import { FormikDropdown, FormikTextField } from "../../../../_common";

interface Props {
    open: boolean;
    onClose: () => void;
}

const BANK_OPTIONS = [
    { id: 3, name: "กรุงไทย" },
    { id: 4, name: "ไทยพาณิชย์" },
    { id: 7, name: "กรุงเทพ" },
    { id: 8, name: "กสิกรไทย" },
    { id: 9, name: "กรุงศรีอยุธยา" },
    { id: 6, name: "ออมสิน" },
    { id: 5, name: "ทหารไทยธนชาต" },
    { id: 12, name: "ซีไอเอ็มบีไทย" },
];

const RELATIONSHIP_OPTIONS = [
    { name: "ผู้เอาประกัน" },
    { name: "ผู้ปกครอง" },
    { name: "สถานศึกษา" },
    { name: "ครูผู้ประสานงาน" },
    { name: "ผู้อำนวยการสถานศึกษา" },
];

const AddBankAccountModal: React.FC<Props> = ({ open, onClose }) => {
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: { relationship: "", bankId: "", accountNo: "", accountName: "" },
        validate: (v) => {
            const e: any = {};
            if (!v.relationship) e.relationship = "โปรดระบุ";
            if (!v.bankId) e.bankId = "โปรดระบุ";
            if (!/^\d{10,15}$/.test(v.accountNo)) e.accountNo = "กรอกตัวเลข 10-15 หลัก";
            if (!v.accountName.trim()) e.accountName = "โปรดระบุ";
            return e;
        },
        onSubmit: (values, { resetForm }) => {
            const bank = BANK_OPTIONS.find((b) => b.id === Number(values.bankId));
            dispatch(
                addBankAccount({
                    id: Date.now().toString(),
                    relationship: values.relationship,
                    bankId: Number(values.bankId),
                    bankName: bank?.name ?? "",
                    accountNo: values.accountNo,
                    accountName: values.accountName,
                    isDefault: false,
                    isFromMock: false,
                })
            );
            resetForm();
            onClose();
        },
    });

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <AccountBalanceIcon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight={700}>เพิ่มบัญชีรับสินไหม</Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        aria-label="close"
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "common.white",
                            width: 25,
                            height: 25,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 23 }} />
                    </IconButton>
                </Grid>
                <Divider sx={{ mt: 1.5 }} />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {/* ความสัมพันธ์ */}
                    <Grid item xs={12}>
                        <FormikDropdown
                            name="relationship"
                            label="ความสัมพันธ์ *"
                            formik={formik}
                            data={RELATIONSHIP_OPTIONS}
                            firstItemText="-- เลือก --"
                            displayFieldName="name"
                            valueFieldName="name"
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    {/* ธนาคาร */}
                    <Grid item xs={12}>
                        <FormikDropdown
                            name="bankId"
                            label="ธนาคาร *"
                            formik={formik}
                            data={BANK_OPTIONS}
                            firstItemText="-- เลือก --"
                            displayFieldName="name"
                            valueFieldName="id"
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    {/* เลขที่บัญชี */}
                    <Grid item xs={12}>
                        <FormikTextField
                            name="accountNo"
                            label="เลขที่บัญชี *"
                            formik={formik}
                            size="small"
                            inputProps={{ maxLength: 15 }}
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) formik.setFieldValue("accountNo", e.target.value);
                            }}
                        />
                    </Grid>

                    {/* ชื่อบัญชี */}
                    <Grid item xs={12}>
                        <FormikTextField
                            name="accountName"
                            label="ชื่อบัญชี *"
                            formik={formik}
                            size="small"
                            onChange={(e) => {
                                if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value))
                                    formik.setFieldValue("accountName", e.target.value);
                            }}
                        />
                    </Grid>

                    {/* Warning box */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                bgcolor: "#fdf6e3",
                                borderLeft: "4px solid #c8a415",
                                px: 2,
                                py: 1,
                                mb: 2,
                                mt: 2,
                                borderRadius: "0 4px 4px 0",
                                justifyContent: "center",
                                display: "flex",
                            }}
                        >
                            <Typography fontSize={15} fontWeight={700}>
                                กรุณาตรวจสอบข้อมูลบัญชี
                                <a href="#" style={{ color: "#f44336", textDecoration: "underline" }}>
                                    ก่อนโอนเงิน
                                </a>
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Submit button */}
                <Grid container mt={1} display="flex" justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Button variant="contained" onClick={() => formik.handleSubmit()} color="success" fullWidth>
                            บันทึก
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default AddBankAccountModal;

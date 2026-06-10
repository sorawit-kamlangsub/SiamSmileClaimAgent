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
    useMediaQuery,
    useTheme,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PersonIcon from "@mui/icons-material/Person";
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

const FieldIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Avatar
        sx={{
            width: 40,
            height: 40,
            bgcolor: "#f3fafe",
            border: "1px solid #e3f0f6",
            mt: 1,
            flexShrink: 0,
            borderRadius: 2,
        }}
        variant="square"
    >
        <Box sx={{ color: "primary.main", display: "flex" }}>{children}</Box>
    </Avatar>
);

const AddBankAccountModal: React.FC<Props> = ({ open, onClose }) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const formik = useFormik({
        initialValues: { relationship: "", bankId: "", accountNo: "", accountName: "" },
        validate: (v) => {
            const e: any = {};
            if (!v.relationship) e.relationship = "โปรดระบุ";
            if (!v.bankId) e.bankId = "โปรดระบุ";
            if (!/^\d{10,12}$/.test(v.accountNo)) e.accountNo = "กรอกตัวเลข 10-12 หลัก"; // ★ แก้จาก 15 → 12
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
        <Dialog open={open} maxWidth="sm" fullScreen={fullScreen} fullWidth>
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
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <FieldIcon>
                                <GroupIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <FormikDropdown
                                    name="relationship"
                                    label="ความสัมพันธ์ของบัญชีผู้รับสินไหม"
                                    formik={formik}
                                    data={RELATIONSHIP_OPTIONS}
                                    firstItemText="-- โปรดระบุ --"
                                    displayFieldName="name"
                                    valueFieldName="name"
                                    fullWidth
                                    size="small"
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ธนาคาร */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <FieldIcon>
                                <AccountBalanceIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <FormikDropdown
                                    name="bankId"
                                    label="ธนาคาร"
                                    formik={formik}
                                    data={BANK_OPTIONS}
                                    firstItemText="-- โปรดระบุ --"
                                    displayFieldName="name"
                                    valueFieldName="id"
                                    fullWidth
                                    size="small"
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* เลขที่บัญชี */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <FieldIcon>
                                <CreditCardIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <FormikTextField
                                    name="accountNo"
                                    label="เลขที่บัญชี"
                                    formik={formik}
                                    size="small"
                                    fullWidth
                                    inputProps={{ maxLength: 12 }}
                                    onChange={(e) => {
                                        if (/^\d*$/.test(e.target.value))
                                            formik.setFieldValue("accountNo", e.target.value);
                                    }}
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ชื่อบัญชี */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <FieldIcon>
                                <PersonIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <FormikTextField
                                    name="accountName"
                                    label="ชื่อบัญชี"
                                    formik={formik}
                                    size="small"
                                    fullWidth
                                    onChange={(e) => {
                                        if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value))
                                            formik.setFieldValue("accountName", e.target.value);
                                    }}
                                    required
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                    กรอกชื่อบัญชีตามหน้าสมุดบัญชี
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Warning box */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                bgcolor: "#fdf6e3",
                                borderLeft: "4px solid #c8a415",
                                px: 2,
                                py: 1,
                                borderRadius: "0 4px 4px 0",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Typography fontSize={15} fontWeight={700}>
                                กรุณาตรวจสอบข้อมูลบัญชี
                                <Box
                                    component="span"
                                    sx={{ color: "error.main", textDecoration: "underline", ml: 0.5 }}
                                >
                                    ก่อนโอนเงิน
                                </Box>
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Submit */}
                <Grid container mt={2} justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Button variant="contained" color="success" fullWidth onClick={() => formik.handleSubmit()}>
                            บันทึก
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default AddBankAccountModal;

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
import { useAppDispatch } from "../../../../../redux";
import { addBankAccount as addBankAccountPH } from "../../store/claimPHSlice";
import { FormikTextField } from "../../../_common";
import BankAccountRelationTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/BankAccountRelationTypeDropDown";
import BankAutocomplete from "../../../_common/components/ClaimAgent/CustomDropdown/BankAutocomplete";
import { addBankAccount as addBankAccountPA } from "../../store/claimPASlice";

interface Props {
    open: boolean;
    productTypeId: number;
    onClose: () => void;
}

// ─── Interface ตรงกับ FormikAutocomplete / FormikDropdown ที่ set ให้ ─────────
interface AddBankFormValues {
    relationship: number | undefined;
    relationship_selectedText: string; // set โดย FormikDropdown
    bankId: number | undefined;
    bankId_selectedText: string; // set โดย FormikAutocomplete
    accountNo: string;
    accountName: string;
}

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

const AddBankAccountModal: React.FC<Props> = ({ open, onClose, productTypeId }) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const formik = useFormik<AddBankFormValues>({
        initialValues: {
            relationship: undefined,
            relationship_selectedText: "",
            bankId: undefined,
            bankId_selectedText: "",
            accountNo: "",
            accountName: "",
        },
        validate: (v) => {
            const e: Partial<Record<keyof AddBankFormValues, string>> = {};
            if (!v.relationship) e.relationship = "โปรดระบุ";
            if (!v.bankId) e.bankId = "โปรดระบุ";
            if (!/^\d{10,12}$/.test(v.accountNo)) e.accountNo = "กรอกตัวเลข 10-12 หลัก";
            if (!v.accountName?.trim()) e.accountName = "โปรดระบุ";
            return e;
        },
        onSubmit: (values, { resetForm }) => {
            const bankAccountPayload = {
                id: `manual-${Date.now()}`,
                bankAccountRelationTypeId: values.relationship ?? 0,
                bankAccountRelationTypeName: values.relationship_selectedText,
                bankId: Number(values.bankId),
                bankName: values.bankId_selectedText,
                bankAccountNo: values.accountNo,
                bankAccountName: values.accountName,
                isDefault: false,
            };

            switch (productTypeId) {
                case 6:
                    dispatch(addBankAccountPH(bankAccountPayload));
                    break;

                case 26:
                    dispatch(addBankAccountPA(bankAccountPayload));
                    break;

                default:
                    return;
            }

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
                    {/* ── ความสัมพันธ์ ── */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <FieldIcon>
                                <GroupIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <BankAccountRelationTypeDropDown
                                    name="relationship"
                                    productTypeId={productTypeId}
                                    formik={formik}
                                    firstItemText="-- โปรดระบุ --"
                                    fullWidth
                                    size="small"
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── ธนาคาร ── */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <FieldIcon>
                                <AccountBalanceIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <BankAutocomplete
                                    name="bankId"
                                    formik={formik}
                                    firstItemText="-- โปรดระบุ --"
                                    fullWidth
                                    size="small"
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── เลขที่บัญชี ── */}
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
                                        // รับเฉพาะตัวเลข
                                        if (/^\d*$/.test(e.target.value))
                                            formik.setFieldValue("accountNo", e.target.value);
                                    }}
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── ชื่อบัญชี ── */}
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
                                        // รับเฉพาะ ก-ๆ และ a-z A-Z space
                                        if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value))
                                            formik.setFieldValue("accountName", e.target.value);
                                    }}
                                    required
                                />
                                {!(formik.touched.accountName && formik.errors.accountName) && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mt: 0.5, display: "block" }}
                                    >
                                        กรอกชื่อบัญชีตามหน้าสมุดบัญชี
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── Warning ── */}
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

                {/* ── Submit ── */}
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

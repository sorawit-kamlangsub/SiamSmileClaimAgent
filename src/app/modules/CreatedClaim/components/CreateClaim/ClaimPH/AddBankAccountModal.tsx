import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../../redux";
import { addBankAccount } from "../../../store/claimPHSlice";

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

const RELATIONSHIP_OPTIONS = ["ผู้เอาประกัน", "ผู้ปกครอง", "สถานศึกษา", "ครูผู้ประสานงาน", "ผู้อำนวยการสถานศึกษา"];

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
                })
            );
            resetForm();
            onClose();
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalanceIcon color="primary" />
                    <Typography fontWeight={700}>เพิ่มบัญชีรับสินไหม</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={formik.handleSubmit} pt={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="ความสัมพันธ์ *"
                                name="relationship"
                                value={formik.values.relationship}
                                onChange={formik.handleChange}
                                error={formik.touched.relationship && !!formik.errors.relationship}
                                helperText={formik.touched.relationship && formik.errors.relationship}
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                            >
                                <option value="">-- เลือก --</option>
                                {RELATIONSHIP_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="ธนาคาร *"
                                name="bankId"
                                value={formik.values.bankId}
                                onChange={formik.handleChange}
                                error={formik.touched.bankId && !!formik.errors.bankId}
                                helperText={formik.touched.bankId && formik.errors.bankId}
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                            >
                                <option value="">-- เลือก --</option>
                                {BANK_OPTIONS.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                label="เลขที่บัญชี *"
                                name="accountNo"
                                value={formik.values.accountNo}
                                onChange={(e) => {
                                    if (/^\d*$/.test(e.target.value)) formik.handleChange(e);
                                }}
                                error={formik.touched.accountNo && !!formik.errors.accountNo}
                                helperText={formik.touched.accountNo && formik.errors.accountNo}
                                inputProps={{ maxLength: 15 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                label="ชื่อบัญชี *"
                                name="accountName"
                                value={formik.values.accountName}
                                onChange={(e) => {
                                    if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value)) formik.handleChange(e);
                                }}
                                error={formik.touched.accountName && !!formik.errors.accountName}
                                helperText={formik.touched.accountName && formik.errors.accountName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                            <Typography variant="caption" color="text.secondary" mt={1} display="block">
                                | กรุณาตรวจสอบข้อมูลบัญชีก่อนโอนเงิน
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button type="submit" variant="contained">
                                    บันทึก
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddBankAccountModal;

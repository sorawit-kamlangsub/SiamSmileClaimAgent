import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Grid,
    TextField,
    Button,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import RefreshIcon from "@mui/icons-material/Refresh";
import { FormikDropdown } from "../../_common";
import { ExtraPaymentListItem, RetryTransferResult } from "../store/ExtraPayment.types";
import { useGetMasterOptions } from "../hooks/useGetMasterOptions";
import { useEditBankAccountForm } from "../hooks/useEditBankAccountForm";
import { OldBankAccountCard } from "./OldBankAccountCard";
import { ConfirmRetryTransferModal } from "./ConfirmRetryTransferModal";

interface EditBankAccountModalProps {
    open: boolean;
    item: ExtraPaymentListItem | null;
    onClose: () => void;
    onRetrySuccess: (result: RetryTransferResult) => void;
}

export const EditBankAccountModal: React.FC<EditBankAccountModalProps> = ({ open, item, onClose, onRetrySuccess }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { bankOptions, relationOptions } = useGetMasterOptions();

    if (!item) return null;

    const { formik, isSubmitting, totalAmount } = useEditBankAccountForm({
        item,
        onRetrySuccess: (result) => {
            setConfirmOpen(false);
            onRetrySuccess(result);
        },
    });

    const handleClose = () => {
        formik.resetForm();
        setConfirmOpen(false);
        onClose();
    };

    // กด "โอนอีกครั้ง" -> validate ก่อน ถ้าผ่านค่อยเปิด modal ยืนยัน
    const handleClickRetry = async () => {
        const errors = await formik.validateForm();
        formik.setTouched({
            relationshipId: true,
            bankId: true,
            accountNo: true,
            accountName: true,
        });
        if (Object.keys(errors).length === 0) {
            setConfirmOpen(true);
        }
    };

    return (
        <>
            <Dialog open={open && !confirmOpen} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AccountBalanceIcon color="primary" />
                        แก้ไขบัญชีรับสินไหม
                    </Box>
                    <IconButton size="small" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box mb={2}>
                        <OldBankAccountCard bankAccount={item.oldBankAccount} />
                    </Box>

                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                        บัญชีรับสินไหมใหม่ :
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormikDropdown
                                name="relationshipId"
                                label="ความสัมพันธ์ของบัญชีผู้รับสินไหม"
                                required
                                fullWidth
                                formik={formik}
                                data={relationOptions}
                                valueFieldName="id"
                                displayFieldName="name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormikDropdown
                                name="bankId"
                                label="ธนาคาร"
                                required
                                fullWidth
                                formik={formik}
                                data={bankOptions}
                                valueFieldName="id"
                                displayFieldName="name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="เลขที่บัญชี"
                                value={formik.values.accountNo}
                                onChange={(e) => formik.setFieldValue("accountNo", e.target.value)}
                                onBlur={formik.handleBlur}
                                name="accountNo"
                                error={formik.touched.accountNo && !!formik.errors.accountNo}
                                helperText={formik.touched.accountNo ? formik.errors.accountNo : " "}
                                inputProps={{ inputMode: "numeric" }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="ชื่อบัญชี"
                                value={formik.values.accountName}
                                onChange={(e) => formik.setFieldValue("accountName", e.target.value)}
                                onBlur={formik.handleBlur}
                                name="accountName"
                                error={formik.touched.accountName && !!formik.errors.accountName}
                                helperText={formik.touched.accountName ? formik.errors.accountName : " "}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    border: "1px solid",
                                    borderColor: "success.light",
                                    bgcolor: "success.50",
                                    borderRadius: 1,
                                    py: 1,
                                    textAlign: "center",
                                }}
                            >
                                <Typography variant="body2" color="success.dark" fontWeight={700}>
                                    จำนวนเงิน : {totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<RefreshIcon />}
                        onClick={handleClickRetry}
                    >
                        โอนอีกครั้ง
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmRetryTransferModal
                open={open && confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={() => formik.handleSubmit()}
                isSubmitting={isSubmitting}
            />
        </>
    );
};

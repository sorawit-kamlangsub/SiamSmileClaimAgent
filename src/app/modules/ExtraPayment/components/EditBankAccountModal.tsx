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
import { ExtraPaymentListItem, RetryTransferResult } from "../store/ExtraPayment.types";
import { useEditBankAccountForm } from "../hooks/useEditBankAccountForm";
import { OldBankAccountCard } from "./OldBankAccountCard";
import { ConfirmRetryTransferModal } from "./ConfirmRetryTransferModal";
import BankAccountRelationTypeDropDown from "../../_common/components/ClaimAgent/CustomDropdown/BankAccountRelationTypeDropDown";
import BankAutocomplete from "../../_common/components/ClaimAgent/CustomDropdown/BankAutocomplete";

interface EditBankAccountModalProps {
    open: boolean;
    item: ExtraPaymentListItem | null;
    onClose: () => void;
    onRetrySuccess: (result: RetryTransferResult) => void;
}

export const EditBankAccountModal: React.FC<EditBankAccountModalProps> = ({ open, item, onClose, onRetrySuccess }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { formik, isSubmitting, totalAmount } = useEditBankAccountForm({
        item,
        onRetrySuccess: (result) => {
            setConfirmOpen(false);
            onRetrySuccess(result);
        },
    });

    if (!item) return null;

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
                            <AccountBalanceIcon color="primary" />
                        </Box>
                        <Typography fontWeight={700} fontSize={19}>
                            แก้ไขบัญชีรับสินไหม
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box mb={2}>
                        <OldBankAccountCard bankAccount={item.oldBankAccount} />
                    </Box>

                    <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                        บัญชีรับสินไหมใหม่ :
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <BankAccountRelationTypeDropDown
                                name="relationshipId"
                                required
                                fullWidth
                                formik={formik}
                                bankAccountRelationGroupId={1}
                            />
                        </Grid>
                        <Grid item xs={12} mt={-0.5}>
                            <BankAutocomplete name="bankId" required fullWidth formik={formik} />
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
                <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<RefreshIcon />}
                        size="medium"
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

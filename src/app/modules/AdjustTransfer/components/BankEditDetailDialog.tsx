import React from "react";
import { Box, Button, Dialog, IconButton, TextField, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { numberWithCommas, setBankLogo } from "../../../functionHelpers";
import useAdditionalTransferAccountDetailHook from "../hooks/AdditionalTransferAccountDetailHook";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import { setOpenDialogAdjustDetail } from "../store/adjustTransferMonitorSlice";
import { FormikDropdown } from "../../_common";

export interface ExistingAccountInfo {
    logoUrl?: string;
    relationship: string;
    bankName: string;
    accountNo: string;
    accountName: string;
}

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface NewAccountFormValues {
    relationship: string | number;
    bankId: string | number;
    accountNo: string;
    accountName: string;
}

export interface EditReceivingAccountDialogProps {
    open: boolean;
    onClose: () => void;
    isSubmitting?: boolean;
    paymentId: string;
    amount: number;
}

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Typography sx={{ fontSize: "0.85rem", color: "#455A64", marginBottom: "4px" }}>
        {children}
        {required && (
            <Box component="span" sx={{ color: "#E53935" }}>
                {" "}
                *
            </Box>
        )}
    </Typography>
);

const BankEditDetailDialog = () => {
    const dispatch = useAppDispatch();
    const { selectRowForEdit, dialogEditAdjustTransferDetail } = useAppSelector((state) => state.adjust);
    const { formik, dataDetail, isAdditionalTransferAccountDetailLoading } = useAdditionalTransferAccountDetailHook({
        paymentId: selectRowForEdit.paymentId,
    });
    const avatarBank = setBankLogo(dataDetail?.toBankId);

    const handleCloseDialog = () => {
        dispatch(setOpenDialogAdjustDetail({ isOpen: false }));
    };

    return (
        <Dialog
            open={dialogEditAdjustTransferDetail.isOpen}
            onClose={handleCloseDialog}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: "16px" } }}
        >
            <Box sx={{ padding: "24px" }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AccountBalanceIcon sx={{ color: "#455A64", fontSize: 22 }} />
                        <Typography sx={{ fontWeight: 700, color: "#212121" }}>แก้ไขบัญชีรับสินไหม</Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={handleCloseDialog}
                        sx={{
                            backgroundColor: "#E53935",
                            color: "#FFFFFF",
                            "&:hover": { backgroundColor: "#C62828" },
                            width: 30,
                            height: 30,
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Existing account card */}
                <Box
                    sx={{
                        border: "1px solid #E0E0E0",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "20px",
                    }}
                >
                    <Typography sx={{ fontWeight: 700, color: "#212121", marginBottom: "10px" }}>
                        บัญชีรับสินไหมเดิม
                    </Typography>
                    <Box sx={{ display: "flex", gap: "12px" }}>
                        <Box
                            component="img"
                            src={avatarBank}
                            sx={{ width: 24, height: 24, objectFit: "contain", borderRadius: "12px", scale: "1.4" }}
                        />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Box sx={{ display: "flex", gap: "6px" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#78909C" }}>ความสัมพันธ์ :</Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#1565C0", fontWeight: 600 }}>
                                    {dataDetail?.claimantAccountRelationship}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: "6px" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#78909C" }}>ธนาคาร :</Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#1565C0", fontWeight: 600 }}>
                                    {dataDetail?.toBank}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: "6px" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#78909C" }}>เลขที่บัญชี :</Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#1565C0", fontWeight: 600 }}>
                                    {dataDetail?.toAccountNo}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: "6px" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#78909C" }}>ชื่อบัญชี :</Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#1565C0", fontWeight: 600 }}>
                                    {dataDetail?.toAccountName}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* New account form */}
                <Typography sx={{ fontWeight: 700, color: "#212121", marginBottom: "12px" }}>
                    บัญชีรับสินไหมใหม่ :
                </Typography>

                <Box sx={{ marginBottom: "16px" }}>
                    <FieldLabel required>ความสัมพันธ์ของบัญชีผู้รับสินไหม</FieldLabel>
                    <FormikDropdown
                        formik={formik}
                        label=""
                        name="relationship"
                        data={[]}
                        firstItemText="กรุณาเลือก"
                        displayFieldName=""
                        valueFieldName=""
                        fullWidth
                    />
                </Box>

                <Box sx={{ marginBottom: "16px" }}>
                    <FieldLabel required>ธนาคาร</FieldLabel>
                    <FormikDropdown
                        formik={formik}
                        label=""
                        name="bankId"
                        data={[]}
                        firstItemText="กรุณาเลือก"
                        displayFieldName=""
                        valueFieldName=""
                        fullWidth
                    />
                </Box>

                <Box sx={{ marginBottom: "16px" }}>
                    <FieldLabel required>เลขที่บัญชี</FieldLabel>
                    <TextField
                        fullWidth
                        size="small"
                        name="accountNo"
                        placeholder="เลขที่บัญชี"
                        value={formik.values.accountNo}
                        onChange={formik.handleChange}
                    />
                </Box>

                <Box sx={{ marginBottom: "20px" }}>
                    <FieldLabel required>ชื่อบัญชี</FieldLabel>
                    <TextField
                        fullWidth
                        size="small"
                        name="accountName"
                        placeholder="ชื่อบัญชี"
                        value={formik.values.accountName}
                        onChange={formik.handleChange}
                    />
                </Box>

                {/* Amount banner */}
                <Box
                    sx={{
                        backgroundColor: "#E8F5E9",
                        border: "1px solid #A5D6A7",
                        borderRadius: "8px",
                        padding: "10px",
                        textAlign: "center",
                        marginBottom: "16px",
                    }}
                >
                    <Typography sx={{ color: "#2E7D32", fontWeight: 700, fontSize: "0.9rem" }}>
                        จำนวนเงิน : {numberWithCommas(selectRowForEdit.amount ?? 0)} บาท
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    // disabled={isSubmitting}
                    onClick={() => formik.handleSubmit()}
                    sx={{
                        backgroundColor: "#1B5E20",
                        textTransform: "none",
                        paddingY: "10px",
                        "&:hover": { backgroundColor: "#154A19" },
                    }}
                >
                    โอนอีกครั้ง
                </Button>
            </Box>
        </Dialog>
    );
};

export default BankEditDetailDialog;

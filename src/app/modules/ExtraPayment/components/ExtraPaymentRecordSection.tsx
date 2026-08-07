import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { FormikProps } from "formik";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";
import { BankAccount, ExtraPaymentFormValues, ExtraPaymentReasonOption } from "../store/ExtraPayment.types";
import { BankAccountSection } from "./BankAccountSection";
import { ExtraPaymentReasonForm } from "./ExtraPaymentReasonForm";

interface ExtraPaymentRecordSectionProps {
    bankAccounts: BankAccount[];
    selectedBankAccountId: number | null;
    onSelectBank: (id: number) => void;
    formik: FormikProps<ExtraPaymentFormValues>;
    reasonOptions: ExtraPaymentReasonOption[];
}

const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#f5faff",
    line: "#dce8f4",
    lineStrong: "#c4d7ea",
    muted: "#718096",
    text: "#243447",
    success: "#15803d",
    successSoft: "#f0f8f1",
    successLine: "#d1e9d6",
};

export const ExtraPaymentRecordSection: React.FC<ExtraPaymentRecordSectionProps> = ({
    bankAccounts,
    selectedBankAccountId,
    onSelectBank,
    formik,
    reasonOptions,
}) => (
    <CustomPaper>
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={1}
            mb={2.5}
            bgcolor="background.paper"
        >
            <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        bgcolor: "#eaf5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <EditNoteIcon color="primary" sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        บันทึกรายการ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ตรวจสอบบัญชีรับสินไหมและระบุรายละเอียดการโอนเพิ่ม
                    </Typography>
                </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={0.75} color="primary.main">
                <InfoIcon fontSize="small" />
                <Typography variant="caption" color="primary" fontWeight={700}>
                    กรุณาระบุข้อมูลที่มีเครื่องหมาย *
                </Typography>
            </Box>
        </Box>
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: REF.soft,
            }}
        >
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            minHeight: { md: "265px", xs: "auto" },
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <HomeIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" color="primary" fontWeight={700}>
                                บัญชีรับสินไหม
                            </Typography>
                        </Box>
                        <BankAccountSection
                            bankAccounts={bankAccounts}
                            selectedBankAccountId={selectedBankAccountId}
                            onSelectBank={onSelectBank}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <DescriptionIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" fontWeight={700} color="primary">
                                รายละเอียดการโอนเพิ่ม
                            </Typography>
                        </Box>
                        <ExtraPaymentReasonForm formik={formik} reasonOptions={reasonOptions} />
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    </CustomPaper>
);

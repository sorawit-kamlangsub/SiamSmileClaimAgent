import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import SendIcon from "@mui/icons-material/Send";
import { useExtraPaymentForm } from "../hooks/useExtraPaymentForm";
import { setSelectedBankAccountId } from "../store/extraPaymentSlice";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";
import { CpgExtraPaymentDetail } from "../store/ExtraPayment.types";
import { RootState } from "../../../../redux";
import { useGetBankAccounts } from "../hooks/useGetBankAccounts";
import { useGetExtraPaymentReasonOptions } from "../hooks/useGetExtraPaymentReasonOptions";
import { ExtraPaymentClaimTable } from "../components/ExtraPaymentClaimTable";
import { ExtraPaymentRecordSection } from "../components/ExtraPaymentRecordSection";
import { ExtraPaymentTabs } from "../components/ExtraPaymentTabs";
import { ExtraPaymentSuccessModal } from "../components/ExtraPaymentSuccessModal";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { HeadingWithColor } from "../../_common/components/CustomComponent/HeadingWithColor";

interface ExtraPaymentPHpageProps {
    data: CpgExtraPaymentDetail;
}

export const ExtraPaymentPHpage: React.FC<ExtraPaymentPHpageProps> = ({ data }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const claimOnLineId = useSelector((state: RootState) => state.extraPayment.claimOnLineId);
    const { data: bankAccounts } = useGetBankAccounts(data.cpgNo);
    const { data: reasonOptions } = useGetExtraPaymentReasonOptions();

    const [successClaimNos, setSuccessClaimNos] = useState<string[] | null>(null);

    const {
        formik,
        claimItems,
        selectedBankAccountId,
        onSelectBankAccount,
        onChangeExtraTransferAmount,
        isSubmitting,
        finalizeSuccess,
    } = useExtraPaymentForm({
        cpgNo: data.cpgNo,
        onSuccess: (claimNos) => setSuccessClaimNos(claimNos),
        restrictToClaimOnLineId: claimOnLineId ?? undefined,
    });

    const currentItem = claimItems[0];

    useEffect(() => {
        const defaultBank = bankAccounts.find((b) => b.isDefault);
        if (defaultBank) dispatch(setSelectedBankAccountId(defaultBank.id));
    }, [bankAccounts, dispatch]);

    const handleCloseSuccessModal = () => {
        setSuccessClaimNos(null);
        finalizeSuccess();
        navigate(-1);
    };

    if (!currentItem) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    const detailPanel = (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <CustomPaper>
                <Grid container spacing={2} p="0 26px 0 26px">
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <Box component="span" color="text.secondary">
                                เลขที่ CPG :
                            </Box>{" "}
                            <Box component="span" color="primary.main" fontWeight={700}>
                                {data.cpgNo}
                            </Box>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <Box component="span" color="text.secondary">
                                บัญชีส่วนกลาง :
                            </Box>{" "}
                            <Box component="span" color="primary.main" fontWeight={700}>
                                {data.centralAccountNo} {data.centralAccountName}
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <Box component="span" color="text.secondary">
                                ชื่อผู้เอาประกัน :
                            </Box>{" "}
                            <Box component="span" color="primary.main" fontWeight={700}>
                                {data.insuredName}
                            </Box>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <Box component="span" color="text.secondary">
                                ผู้ทำรายการ :
                            </Box>{" "}
                            <Box component="span" color="primary.main" fontWeight={700}>
                                {data.staffCode} - {data.staffName}
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <Box component="span" color="text.secondary">
                                จำนวนการเคลม :
                            </Box>{" "}
                            <Box component="span" color="primary.main" fontWeight={700}>
                                1
                            </Box>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <Box component="span" color="text.secondary">
                                จำนวนเงิน :
                            </Box>{" "}
                            <Box component="span" color="primary.main" fontWeight={700}>
                                {currentItem.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </Box>
                        </Typography>
                    </Grid>
                </Grid>
            </CustomPaper>

            <Box mt={2}>
                <CustomPaper>
                    <HeadingWithColor text="รายการ" icon={<PlaylistAddIcon sx={{ fontSize: 24 }} />} />
                    <ExtraPaymentClaimTable
                        claimItems={claimItems}
                        onChangeExtraTransferAmount={onChangeExtraTransferAmount}
                    />
                </CustomPaper>
            </Box>

            <Box mt={2}>
                <ExtraPaymentRecordSection
                    bankAccounts={bankAccounts}
                    selectedBankAccountId={selectedBankAccountId}
                    onSelectBank={onSelectBankAccount}
                    formik={formik}
                    reasonOptions={reasonOptions}
                />
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    กลับ
                </Button>
                <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={isSubmitting}>
                    แจ้งโอนเงิน
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box>
            <Typography fontSize={19} color="text.secondary" mb={2}>
                {`โอนเพิ่ม >`}{" "}
                <Typography component="span" fontSize={19} sx={{ color: "primary.main", fontWeight: 700 }}>
                    {currentItem.claimNo}
                </Typography>
            </Typography>

            <ExtraPaymentTabs detailPanel={detailPanel} />

            <ExtraPaymentSuccessModal
                open={!!successClaimNos}
                claimNos={successClaimNos ?? []}
                onConfirm={handleCloseSuccessModal}
            />
        </Box>
    );
};

// components/CheckEligible/CoverageSummaryPanel.tsx
import React from "react";
import { Box, Typography, Grid, Divider } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import MedicationIcon from "@mui/icons-material/Medication";
import HotelIcon from "@mui/icons-material/Hotel";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import ContinuousClaimTable from "./ContinuousClaimTable";
import useCheckEligibleCoverage from "../../hooks/CheckEligibleDetail/useCheckEligibleCoverage";
import { formatDateString } from "../../../../functionHelpers";
import { ContinuousClaimRow, PolicyPlan } from "../../store/checkeligibleSlice";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";

type Props = {
    plan: PolicyPlan;
    continuousRows: ContinuousClaimRow[];
    isContinuous: boolean;
    selectedClaims: string[];
    onToggleClaim: (code: string) => void;
};

const AmountBlock: React.FC<{ label: string; value: number; colored?: boolean }> = ({ label, value, colored }) => (
    <Box textAlign="center">
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
        <Typography
            variant="body2"
            fontWeight={700}
            color={colored ? "#1a5da8" : "text.primary"}
            sx={{ textDecoration: colored ? "underline" : "none" }}
        >
            {value.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </Typography>
    </Box>
);

const BenefitCard: React.FC<{ benefit: ReturnType<typeof useCheckEligibleCoverage>["benefitsWithBalance"][0] }> = ({
    benefit,
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 1.5,
            mb: 1.5,
            bgcolor: "#fff",
            gap: 2,
        }}
    >
        {/* Icon */}
        <Box
            sx={{
                bgcolor: "#e8f0fb",
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 48,
                minHeight: 48,
            }}
        >
            {benefit.icon}
        </Box>

        {/* Title + Rate */}
        <Box flex={1}>
            <Typography variant="body2" fontWeight={700}>
                {benefit.title}
            </Typography>
            {benefit.ratePerUnit && (
                <Typography variant="caption" color="text.secondary">
                    {benefit.ratePerUnit}
                </Typography>
            )}
            <Typography variant="body2" color="#1a5da8" fontWeight={600}>
                {benefit.maxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Amounts */}
        <Grid container spacing={1} width="auto" minWidth={240}>
            <Grid item xs={6}>
                <AmountBlock label="จำนวนเงินสูงสุด" value={benefit.maxAmount} />
            </Grid>
            <Grid item xs={6}>
                <AmountBlock label="จำนวนคงเหลือ" value={benefit.remainingAmount} colored />
            </Grid>
            {benefit.maxDays !== undefined && (
                <>
                    <Grid item xs={6}>
                        <AmountBlock label="จำนวนสูงสุด" value={benefit.maxDays} />
                    </Grid>
                    <Grid item xs={6}>
                        <AmountBlock label="จำนวนคงเหลือ" value={benefit.remainingDays ?? 0} colored />
                    </Grid>
                </>
            )}
        </Grid>
    </Box>
);

const CoverageSummaryPanel: React.FC<Props> = ({
    plan,
    continuousRows,
    isContinuous,
    selectedClaims,
    onToggleClaim,
}) => {
    const { benefitsWithBalance } = useCheckEligibleCoverage(plan.benefits, continuousRows, isContinuous);

    return (
        <Box>
            {/* ตารางเคลมต่อเนื่อง */}
            {isContinuous && (
                <CustomPaper>
                    <ContinuousClaimTable rows={continuousRows} selected={selectedClaims} onToggle={onToggleClaim} />
                </CustomPaper>
            )}

            {/* ความคุ้มครอง Header */}
            <CustomPaper>
                {/* <Box
                    sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "#fff",
                    }}
                > */}
                    <HeadingWithColor text="ความคุ้มครอง" />

                    {/* Plan Badge */}
                    <Box
                        sx={{
                            bgcolor: "#1a5da8",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            py: 1.5,
                        }}
                    >
                        <Typography variant="body1" fontWeight={700}>
                            แผนประกัน : {plan.planCode}
                        </Typography>
                        <Typography variant="caption">
                            วันที่เริ่มต้นสัญญา : {formatDateString(plan.effectiveDate, "DD/MM/BBBB")}
                        </Typography>
                    </Box>

                    {/* Benefits */}
                    <Box p={2}>
                        {benefitsWithBalance.map((b) => (
                            <BenefitCard key={b.id} benefit={b} />
                        ))}
                    </Box>
                {/* </Box> */}
            </CustomPaper>
        </Box>
    );
};

export default CoverageSummaryPanel;

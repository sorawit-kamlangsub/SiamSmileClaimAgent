import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import ContinuousClaimTable from "./ContinuousClaimTable";
import useCheckEligibleCoverage from "../../hooks/CheckEligibleDetail/useCheckEligibleCoverage";
import { formatDateString } from "../../../../functionHelpers";
import { ContinuousClaimRow, PolicyPlan } from "../../store/checkeligibleSlice";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import { checkeligibleSelector } from "../../store/checkeligibleSlice";
import { setBenefitIcons } from "../../../../functionHelpers"; // ปรับ path ตามจริง
import { useAppSelector } from "../../../../../redux";

type Props = {
    plan: PolicyPlan;
    continuousRows: ContinuousClaimRow[];
    isContinuous: boolean;
    selectedClaims: string[];
    onToggleClaim: (code: string) => void;
};

const AmountBlock: React.FC<{
    label: string;
    value: number | string;
    colored?: boolean;
    unit?: string;
}> = ({ label, value, colored, unit }) => (
    <Box textAlign="center">
        <Typography variant="caption" color="text.secondary" display="block">
            {label}
        </Typography>
        <Typography
            variant="body2"
            fontWeight={700}
            color={colored ? (typeof value === "number" && value > 0 ? "#2e7d32" : "#1a5da8") : "text.primary"}
            sx={{ textDecoration: colored ? "underline" : "none" }}
        >
            {typeof value === "number" ? value.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : value}
            {unit && (
                <Typography component="span" variant="caption" fontWeight={700} ml={0.5}>
                    {unit}
                </Typography>
            )}
        </Typography>
    </Box>
);

const BenefitIcon: React.FC<{ benefitId?: number }> = ({ benefitId }) => {
    const src = setBenefitIcons(benefitId);
    return (
        // <Box
        //     sx={{
        //         bgcolor: "#dbeafe",
        //         borderRadius: 2,
        //         p: 0,
        //         display: "flex",
        //         alignItems: "center",
        //         justifyContent: "center",
        //         minWidth: 52,
        //         minHeight: 52,
        //     }}
        // >
        <>
            {src ? (
                <Box
                    component="img"
                    src={src}
                    alt=""
                    sx={{ width: 60, height: 60, objectFit: "fill", borderRadius: 1 }}
                />
            ) : (
                <Box
                    sx={{
                        bgcolor: "#dbeafe",
                        borderRadius: 2,
                        p: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 52,
                        minHeight: 52,
                    }}
                >
                    <ShieldIcon sx={{ fontSize: 30, color: "#1a5da8" }} />
                </Box>
            )}
            {/* </Box> */}
        </>
    );
};

const BenefitCardIPD: React.FC<{
    benefit: ReturnType<typeof useCheckEligibleCoverage>["benefitsWithBalance"][0];
}> = ({ benefit }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            border: "1px dashed #c0d4f0",
            // borderRadius: "4px 4px 0 0",
            p: 1.5,
            mb: 0,
            bgcolor: "#fff",
            gap: 2,
        }}
    >
        <BenefitIcon benefitId={benefit.id} />

        {/* Title + rate + วงเงินสูงสุด + คงเหลือ */}
        <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
                <Typography variant="body2" fontWeight={700} color="#1a5da8">
                    {benefit.title}
                </Typography>
                {benefit.ratePerUnit && (
                    <Typography variant="body2" fontWeight={700} color="#1a5da8">
                        {benefit.ratePerUnit}
                    </Typography>
                )}
            </Box>
            {/* วงเงินความคุ้มครองสูงสุด */}
            <Typography variant="caption" color="text.secondary" display="block">
                วงเงินความคุ้มครองสูงสุด
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#1a5da8">
                {benefit.maxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </Typography>
            <Box
                sx={{
                    background: "#1a5da8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 0.3,
                    borderRadius: "4px",
                }}
            ></Box>
        </Box>

        {/* <Divider orientation="vertical" flexItem sx={{ mx: 1 }} /> */}

        {/* จำนวนเงินคงเหลือ */}
        <Box sx={{ minWidth: { lg: 140 } }} textAlign="center">
            <Typography variant="caption" color="text.secondary" display="block">
                จำนวนเงินคงเหลือ
            </Typography>
            <Typography
                variant="body2"
                fontWeight={700}
                color={(benefit.remainingAmount ?? 0) > 0 ? "#2e7d32" : "#c62828"}
                sx={{ textDecoration: "underline" }}
            >
                {benefit.remainingAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </Typography>
        </Box>

        {/* จำนวนสูงสุด / คงเหลือ (วัน/คืน) */}
        {benefit.maxDays !== undefined && (
            <>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Box textAlign="center" sx={{ minWidth: { lg: 90 } }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        จำนวนสูงสุด
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#1a5da8">
                        {benefit.maxDays} {benefit.dayUnit}
                    </Typography>
                </Box>
                <Box textAlign="center" sx={{ minWidth: { lg: 90 } }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        จำนวนคงเหลือ
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        color={(benefit.remainingDays ?? 0) > 0 ? "#2e7d32" : "#c62828"}
                        sx={{ textDecoration: "underline" }}
                    >
                        {benefit.remainingDays} {benefit.dayUnit}
                    </Typography>
                </Box>
            </>
        )}
    </Box>
);

const BenefitCardOPD: React.FC<{
    benefit: ReturnType<typeof useCheckEligibleCoverage>["benefitsWithBalance"][0];
}> = ({ benefit }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            border: "1px dashed #c0d4f0",
            // borderRadius: 2,
            p: 1.5,
            mb: 0,
            bgcolor: "#fff",
            gap: 2,
        }}
    >
        <BenefitIcon benefitId={benefit.id} />

        {/* Title + rate + วงเงิน */}
        <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
                <Typography variant="body2" fontWeight={700}>
                    {benefit.title}
                </Typography>
                {benefit.ratePerUnit && (
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                        {benefit.ratePerUnit}
                    </Typography>
                )}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
                วงเงินความคุ้มครองสูงสุด
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#1a5da8">
                {benefit.maxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* จำนวนเงินคงเหลือ */}
        <Box minWidth={100} textAlign="center">
            <Typography variant="caption" color="text.secondary" display="block">
                จำนวนเงินคงเหลือ
            </Typography>
            <Typography
                variant="body2"
                fontWeight={700}
                color={(benefit.remainingAmount ?? 0) > 0 ? "#2e7d32" : "#c62828"}
                sx={{ textDecoration: "underline" }}
            >
                {benefit.remainingAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </Typography>
        </Box>

        {/* จำนวนครั้งสูงสุด / คงเหลือ */}
        {benefit.maxDays !== undefined && (
            <>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Box textAlign="center" minWidth={80}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        จำนวนสูงสุด
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                        {benefit.maxDays} ครั้ง
                    </Typography>
                </Box>
                <Box textAlign="center" minWidth={80}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        จำนวนคงเหลือ
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        // เขียวถ้าคงเหลือ > 0, แดงถ้า = 0
                        color={(benefit.remainingDays ?? 0) > 0 ? "#2e7d32" : "#c62828"}
                        sx={{ textDecoration: "underline" }}
                    >
                        {benefit.remainingDays ?? 0} ครั้ง
                    </Typography>
                </Box>
            </>
        )}
    </Box>
);

// ── CoverageSummaryPanel ──────────────────────────────────────────────────────

const CoverageSummaryPanel: React.FC<Props> = ({
    plan,
    continuousRows,
    isContinuous,
    selectedClaims,
    onToggleClaim,
}) => {
    const { benefitsWithBalance } = useCheckEligibleCoverage(plan.benefits, continuousRows, isContinuous);

    // ดึง claimType จาก store
    const { CheckeLigibleDetails } = useAppSelector(checkeligibleSelector);
    const isOPD = CheckeLigibleDetails?.claimType?.toLowerCase() === "opd";

    const BenefitCard = isOPD ? BenefitCardOPD : BenefitCardIPD;

    console.log("🚀 ~ AmountBlock:", AmountBlock);

    return (
        <Box>
            {/* ตารางเคลมต่อเนื่อง */}
            {isContinuous && (
                <CustomPaper>
                    <ContinuousClaimTable rows={continuousRows} selected={selectedClaims} onToggle={onToggleClaim} />
                </CustomPaper>
            )}

            {/* ความคุ้มครอง */}
            <CustomPaper>
                <HeadingWithColor text="ความคุ้มครอง" />

                {/* Plan Badge */}
                <Box
                    sx={{
                        background: "linear-gradient(90deg, #6DD2F8 0%, #22B3EE 34%, #007DB3 100%)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        borderRadius: "4px 4px 0 0",
                    }}
                >
                    {/* <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    > */}
                    <ShieldIcon sx={{ fontSize: 40, color: "#fff" }} />
                    {/* </Box> */}
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body1" fontWeight={700} lineHeight={1.4}>
                            แผนประกัน : {plan.planCode}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                background: "rgba(255,255,255,0.25)",
                                borderRadius: 1,
                                px: 1,
                                py: 0.25,
                                display: "inline-block",
                                lineHeight: 1.6,
                                mt: 0.25,
                            }}
                        >
                            วันที่เริ่มต้นสัญญา : {formatDateString(plan.effectiveDate, "DD/MM/BBBB")}
                        </Typography>
                    </Box>
                </Box>

                {/* Benefits */}
                <Box
                    sx={{
                        border: "1px solid #e0e0e0",
                        // borderRadius: 2,
                        p: 2,
                        bgcolor: "#fff",
                    }}
                >
                    {benefitsWithBalance.map((b) => (
                        <BenefitCard key={b.id} benefit={b} />
                    ))}
                </Box>
                <Box
                    sx={{
                        background: "#1a5da8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        py: 0.7,
                        px: 1,
                        borderRadius: "0 0 4px 4px",
                    }}
                ></Box>
            </CustomPaper>
        </Box>
    );
};

export default CoverageSummaryPanel;

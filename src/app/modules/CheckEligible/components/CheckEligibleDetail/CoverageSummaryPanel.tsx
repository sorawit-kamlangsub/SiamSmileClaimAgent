import React from "react";
import { Box, Typography, Divider, Skeleton } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import ContinuousClaimTable from "./ContinuousClaimTable";
import { ContinuousClaimRow } from "../../store/checkeligibleSlice";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import { checkeligibleSelector } from "../../store/checkeligibleSlice";
import { setBenefitIcons } from "../../../../functionHelpers";
import { useAppSelector } from "../../../../../redux";
import { formatDateString } from "../../../../functionHelpers";
import { GetCustomerBenefitDetailSearchDtoResponse } from "../../../../api/claimAgentApi.client";

// ─── Types ────────────────────────────────────────────────────────────────────

type BenefitDisplay = {
    id: number;
    title: string;
    ratePerUnit?: string;
    maxAmount: number;
    remainingAmount: number;
    maxDays?: number;
    remainingDays?: number;
    dayUnit?: string;
    productName?: string;
    coverageFrom?: string;
    coverageTo?: string;
};

type Props = {
    benefitData?: GetCustomerBenefitDetailSearchDtoResponse[];
    isLoading?: boolean;
    continuousRows: ContinuousClaimRow[];
    isContinuous: boolean;
    selectedClaims: string[];
    onToggleClaim: (code: string) => void;
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

const mapBenefitData = (data: GetCustomerBenefitDetailSearchDtoResponse[]): BenefitDisplay[] => {
    return data.map((item, index) => ({
        id: index + 1,
        title: item.benefitName ?? "-",
        ratePerUnit:
            item.pricePerUnit && item.pricePerUnit > 0
                ? `${item.pricePerUnit.toLocaleString("th-TH")}/${item.unitName ?? ""}`
                : undefined,
        maxAmount: item.maxPrice ?? 0,
        remainingAmount: item.maxPrice ?? 0,
        maxDays: item.maxQuantity ?? undefined,
        remainingDays: item.maxQuantity ?? undefined,
        dayUnit: (item.quantityUnitName ?? item.unitName ?? "").replace(/ /g, "\u00A0"),
        productName: item.productName ?? undefined,
        coverageFrom: item.coverageFrom?.toString(),
        coverageTo: item.coverageTo?.toString(),
    }));
};

// ─── BenefitIcon ──────────────────────────────────────────────────────────────

const BenefitIcon: React.FC<{ benefitId?: number }> = ({ benefitId }) => {
    const src = setBenefitIcons(benefitId);
    return src ? (
        <Box
            component="img"
            src={src}
            alt=""
            sx={{ width: 60, height: 60, objectFit: "fill", borderRadius: 1, flexShrink: 0 }}
        />
    ) : (
        <Box
            sx={{
                bgcolor: "#dbeafe",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 52,
                minHeight: 52,
                flexShrink: 0,
            }}
        >
            <ShieldIcon sx={{ fontSize: 30, color: "#1a5da8" }} />
        </Box>
    );
};

// ─── BenefitCard ──────────────────────────────────────────────────────────────

const BenefitCard: React.FC<{ benefit: BenefitDisplay }> = ({ benefit }) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            border: "1px dashed #c0d4f0",
            p: 1.5,
            mb: 0,
            bgcolor: "#fff",
            gap: 2,
        }}
    >
        {/* Icon + Title + วงเงิน */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
            <BenefitIcon benefitId={benefit.id} />

            <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={700} color="#1a5da8">
                    {benefit.title}{" "}
                    {benefit.ratePerUnit && (
                        <Typography
                            component="span"
                            variant="body2"
                            fontWeight={700}
                            color="#1a5da8"
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            {benefit.ratePerUnit}
                        </Typography>
                    )}
                </Typography>

                <Box display="flex" alignItems="center" gap={3} flexWrap="wrap" mt={0.5}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            วงเงินความคุ้มครองสูงสุด
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#1a5da8">
                            {benefit.maxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            จำนวนเงินคงเหลือ
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            color={benefit.remainingAmount > 0 ? "#2e7d32" : "#c62828"}
                            sx={{ textDecoration: "underline" }}
                        >
                            {benefit.remainingAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ background: "#1a5da8", py: 0.3, mt: 1, borderRadius: "4px" }} />
            </Box>
        </Box>

        {/* จำนวนสูงสุด / คงเหลือ */}
        {benefit.maxDays !== undefined && (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: { xs: "100%", sm: "auto" },
                    borderTop: { xs: "1px dashed #c0d4f0", sm: "none" },
                    pt: { xs: 1, sm: 0 },
                }}
            >
                <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: "none", sm: "block" } }} />
                <Box textAlign="center" sx={{ flex: 1, width: { sm: 130 } }}>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        จำนวนสูงสุด
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#1a5da8" noWrap>
                        {benefit.maxDays} {benefit.dayUnit}
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Box textAlign="center" sx={{ flex: 1, width: { sm: 130 } }}>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        จำนวนคงเหลือ
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        color={(benefit.remainingDays ?? 0) > 0 ? "#2e7d32" : "#c62828"}
                        sx={{ textDecoration: "underline" }}
                        noWrap
                    >
                        {benefit.remainingDays} {benefit.dayUnit}
                    </Typography>
                </Box>
            </Box>
        )}
    </Box>
);

// ─── BenefitSkeleton ──────────────────────────────────────────────────────────

const BenefitSkeleton: React.FC = () => (
    <Box sx={{ display: "flex", gap: 2, p: 1.5, border: "1px dashed #c0d4f0", mb: 0 }}>
        <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 1, flexShrink: 0 }} />
        <Box flex={1}>
            <Skeleton width="40%" height={20} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="30%" height={20} />
        </Box>
        <Skeleton width={100} height={40} />
    </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CoverageSummaryPanel: React.FC<Props> = ({
    benefitData,
    isLoading,
    continuousRows,
    isContinuous,
    selectedClaims,
    onToggleClaim,
}) => {
    const { CheckeLigibleDetails } = useAppSelector(checkeligibleSelector);

    const benefits: BenefitDisplay[] = benefitData ? mapBenefitData(benefitData) : [];

    const firstItem = benefitData?.[0];
    const planLabel = firstItem?.productName ?? "-";
    const effectiveDate = firstItem?.coverageFrom
        ? formatDateString(firstItem.coverageFrom.toString(), "DD/MM/BBBB")
        : "-";

    return (
        <Box>
            {isContinuous && (
                <CustomPaper>
                    <ContinuousClaimTable rows={continuousRows} selected={selectedClaims} onToggle={onToggleClaim} />
                </CustomPaper>
            )}

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
                    <ShieldIcon sx={{ fontSize: 40, color: "#fff", flexShrink: 0 }} />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body1" fontWeight={700} lineHeight={1.4}>
                            แผนประกัน : {planLabel}
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
                            วันที่เริ่มต้นสัญญา : {effectiveDate}
                        </Typography>
                    </Box>
                </Box>

                {/* Benefits */}
                <Box sx={{ border: "1px solid #e0e0e0", p: { xs: 1, sm: 2 }, bgcolor: "#fff" }}>
                    {isLoading ? (
                        [1, 2, 3].map((i) => <BenefitSkeleton key={i} />)
                    ) : benefits.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                            {CheckeLigibleDetails.claimType
                                ? "ไม่พบข้อมูลความคุ้มครอง"
                                : "กรุณาเลือกประเภทเคลมและกดค้นหา"}
                        </Typography>
                    ) : (
                        benefits.map((b) => <BenefitCard key={b.id} benefit={b} />)
                    )}
                </Box>

                <Box
                    sx={{
                        background: "#1a5da8",
                        py: 0.7,
                        px: 1,
                        borderRadius: "0 0 4px 4px",
                    }}
                />
            </CustomPaper>
        </Box>
    );
};

export default CoverageSummaryPanel;

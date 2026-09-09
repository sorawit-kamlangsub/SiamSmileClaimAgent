import React from "react";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { numberWithCommas, setBenefitIcons } from "../../../../functionHelpers";
import { GetCustomerBenefitDetailHalfDtoResponse } from "../../../../api/coreClaimApi.client";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

interface Props {
    items: GetCustomerBenefitDetailHalfDtoResponse[];
    isLoading: boolean;
    planCode: string | undefined;
    /** เคลมต่อเนื่อง: แสดง benefit คงเหลือ (remainBenefit / remainAmount) แทนวงเงินสูงสุด */
    isContinuous?: boolean;
}

const BenefitIcon: React.FC<{ benefitId?: number }> = ({ benefitId }) => {
    const src = setBenefitIcons(benefitId);
    return src ? (
        <Box component="img" src={src} alt="" sx={{ width: 36, height: 36, objectFit: "fill", borderRadius: 1 }} />
    ) : (
        <Box
            sx={{
                bgcolor: "#dbeafe",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 36,
                minHeight: 36,
            }}
        >
            <MonitorHeartIcon sx={{ fontSize: 22, color: "#1a5da8" }} />
        </Box>
    );
};

const CoverageBox: React.FC<Props> = ({ items, isLoading, planCode, isContinuous = false }) => (
    <Box sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2, p: 1.5 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
                <VerifiedUserIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography fontSize={12} fontWeight={500} color="primary.main">
                    รายละเอียดความคุ้มครอง
                </Typography>
            </Box>
            <Chip
                label={`แผน : ${planCode}`}
                size="small"
                sx={{ bgcolor: "primary.main", color: "#fff", fontSize: 11, height: 20, borderRadius: "10px" }}
            />
        </Box>

        {/* Loading */}
        {isLoading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={3}>
                <CircularProgress size={24} />
            </Box>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={3} gap={0.5}>
                <SearchOffIcon sx={{ fontSize: 28, color: "text.disabled" }} />
                <Typography fontSize={16} color="text.disabled">
                    ไม่พบข้อมูล
                </Typography>
            </Box>
        )}

        {/* Items */}
        {!isLoading &&
            items.map((item) => (
                <Box
                    key={item.benefitId}
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    sx={{
                        bgcolor: "#F5F9FF",
                        border: "0.5px solid",
                        borderColor: "divider",
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 0.8,
                        mb: 0.8,
                        "&:last-child": { mb: 0 },
                    }}
                >
                    <BenefitIcon benefitId={item.benefitId} />

                    <Box flex={1} minWidth={0}>
                        <Typography fontSize={12} fontWeight={500} color="text.primary">
                            {item.benefitName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography fontSize={11} color="primary.main">
                                {numberWithCommas(item.pricePerUnit?.toString() || "0", 0)} บาท{item.unitName}/
                                {isContinuous ? "คงเหลือ" : "สูงสุด"}{" "}
                                {numberWithCommas(
                                    (isContinuous ? item.remainBenefit : item.maxQuantity)?.toString() || "0",
                                    0
                                )}{" "}
                                {item.quantityUnitName}
                            </Typography>
                            {(isContinuous ? item.remainAmount != null : !!item.maxPrice) && (
                                <>
                                    <Typography fontSize={11} color="text.disabled">
                                        |
                                    </Typography>
                                    <Typography
                                        fontSize={11}
                                        color={
                                            isContinuous && (item.remainAmount ?? 0) <= 0
                                                ? "error.main"
                                                : "success.main"
                                        }
                                    >
                                        {isContinuous ? "วงเงินคงเหลือ" : "วงเงินสูงสุด"}{" "}
                                        {numberWithCommas(
                                            (isContinuous ? item.remainAmount : item.maxPrice)?.toString() || "0",
                                            0
                                        )}{" "}
                                        บาท
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>
            ))}
    </Box>
);

export default CoverageBox;

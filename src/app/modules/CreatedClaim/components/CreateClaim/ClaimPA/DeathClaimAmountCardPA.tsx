import { useEffect, useMemo } from "react";
import { Box, Skeleton, Stack, Typography, TextField, Paper } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { ClaimPAFormValues, DeathExtraCoverageId } from "../../../store/claimPASlice";
import { FormikProps } from "formik";
import { GetCustomerBenefitDetailHalfDtoResponse } from "../../../../../api/coreClaimApi.client";
import { classifyDeathBenefit, getDeathMainBenefit } from "../../../../../deathBenefitHelpers";

type Props = {
    benefits: GetCustomerBenefitDetailHalfDtoResponse[];
    isLoading?: boolean;
    extraCoverageIds: number[];
    formik: FormikProps<ClaimPAFormValues>;
};

const EXTRA_HELPER_TEXT: Partial<Record<DeathExtraCoverageId, string>> = {
    [DeathExtraCoverageId.PublicDisaster]: "กรอกเฉพาะยอดเพิ่มเติมภัยสาธารณะ",
    [DeathExtraCoverageId.SchoolLiability]: "กรอกเฉพาะยอดเพิ่มเติมความรับผิดสถานศึกษา",
};

const DeathClaimAmountCardPA = ({ benefits, isLoading, extraCoverageIds, formik }: Props) => {
    const mainBenefit = useMemo(() => getDeathMainBenefit(benefits), [benefits]);

    const extraBenefits = useMemo(
        () =>
            benefits.filter((b) => {
                const category = classifyDeathBenefit(b);
                return category !== undefined && category !== "main" && extraCoverageIds.includes(category);
            }),
        [benefits, extraCoverageIds]
    );

    const visibleBenefits = useMemo(
        () => (mainBenefit ? [mainBenefit, ...extraBenefits] : []),
        [mainBenefit, extraBenefits]
    );

    const amounts = formik.values.deathBenefitAmounts ?? {};

    const transferAmount = useMemo(
        () => visibleBenefits.reduce((sum, b) => sum + (Number(amounts[b.standardMedicalExpenseId ?? -1]) || 0), 0),
        [amounts, visibleBenefits]
    );

    const mainMaxAmount = mainBenefit?.maxPrice ?? 0;

    useEffect(() => {
        formik.setFieldValue("transferAmount", transferAmount, false);
        if (transferAmount > mainMaxAmount) {
            formik.setFieldError(
                "transferAmount",
                `จำนวนเงินที่ต้องการโอนต้องไม่เกิน ${mainMaxAmount.toLocaleString("th-TH")} บาท`
            );
        } else {
            formik.setFieldError("transferAmount", undefined);
        }
    }, [transferAmount, mainMaxAmount]);

    const handleAmountChange = (standardMedicalExpenseId: number | undefined, value: string, maxPrice?: number) => {
        if (standardMedicalExpenseId == null) return;

        let cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");

        const firstDotIndex = cleaned.indexOf(".");
        if (firstDotIndex !== -1) {
            const integerPart = cleaned.slice(0, firstDotIndex);
            const decimalPart = cleaned.slice(firstDotIndex + 1).replace(/\./g, "");
            cleaned = `${integerPart}.${decimalPart.slice(0, 2)}`;
        }

        if (maxPrice != null) {
            const numericValue = Number(cleaned);
            if (!Number.isNaN(numericValue) && numericValue > maxPrice) {
                cleaned = String(maxPrice);
            }
        }

        formik.setFieldValue(
            "deathBenefitAmounts",
            {
                ...amounts,
                [standardMedicalExpenseId]: cleaned,
            },
            false
        );
    };

    if (isLoading) {
        return (
            <Stack spacing={2.5} mt={2} direction={{ xs: "column", md: "row" }}>
                <Skeleton variant="rounded" width="100%" height={430} />
                <Skeleton variant="rounded" width="100%" height={430} />
            </Stack>
        );
    }

    if (!mainBenefit) {
        return (
            <Paper variant="outlined" sx={{ p: 3, mt: 2, textAlign: "center", color: "text.secondary" }}>
                ไม่พบข้อมูลความคุ้มครองเสียชีวิตสำหรับกรมธรรม์นี้
            </Paper>
        );
    }

    return (
        <Stack spacing={3} mt={2}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(3, 1fr)",
                    },
                    gap: 2.5,
                }}
            >
                {visibleBenefits.map((benefit) => (
                    <TransferAmountCard
                        key={benefit.standardMedicalExpenseId}
                        benefit={benefit}
                        isMain={benefit.standardMedicalExpenseId === mainBenefit.standardMedicalExpenseId}
                        value={amounts[benefit.standardMedicalExpenseId ?? -1] ?? ""}
                        onAmountChange={handleAmountChange}
                    />
                ))}
            </Box>

            <SummaryTotalCard totalAmount={transferAmount} />
        </Stack>
    );
};

const TransferAmountCard = ({
    benefit,
    isMain,
    value,
    onAmountChange,
}: {
    benefit: GetCustomerBenefitDetailHalfDtoResponse;
    isMain: boolean;
    value: string;
    onAmountChange: (standardMedicalExpenseId: number | undefined, value: string, maxPrice?: number) => void;
}) => {
    const color = isMain ? "#0076B6" : "#B85F00";
    const borderColor = isMain ? "#A7D7FF" : "#FFA726";
    const sideColor = isMain ? "#0B84C6" : "#F57C00";
    const badgeBg = isMain ? "#E5F5FF" : "#FFF4D8";
    const cardBg = isMain ? "#FBFDFF" : "#FFFDF6";
    const title = isMain ? "ความคุ้มครองหลัก" : "ความคุ้มครองเพิ่มเติม";
    const category = classifyDeathBenefit(benefit);
    const helperText =
        !isMain && category !== "main" && category !== undefined ? EXTRA_HELPER_TEXT[category] : undefined;

    return (
        <Box
            sx={{
                minHeight: 430,
                border: `1px solid ${borderColor}`,
                borderLeft: `7px solid ${sideColor}`,
                borderRadius: 3,
                bgcolor: cardBg,
                p: 3,
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
                display: "flex",
            }}
        >
            <Stack spacing={2.5} sx={{ width: "100%", height: "100%" }}>
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minHeight: 130 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: badgeBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {isMain ? (
                            <VerifiedIcon sx={{ color, fontSize: 30 }} />
                        ) : (
                            <AddCircleIcon sx={{ color, fontSize: 30 }} />
                        )}
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                display: "inline-flex",
                                px: 2,
                                py: 0.8,
                                border: `1px solid ${borderColor}`,
                                borderRadius: 999,
                                color,
                                bgcolor: isMain ? "#EAF7FF" : "#FFF8E5",
                                fontWeight: 700,
                                fontSize: 15,
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 2,
                                color,
                                fontWeight: 600,
                                fontSize: 14,
                                lineHeight: 1.8,
                            }}
                        >
                            {benefit.benefitName ?? "-"}
                        </Typography>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        borderTop: `1px dashed ${isMain ? "#BFDDF4" : "#F5BE7A"}`,
                        mt: 3,
                        pt: 3,
                    }}
                />

                <Box
                    sx={{
                        border: "1px solid #A5E6B8",
                        bgcolor: "#EFFBF3",
                        borderRadius: 2,
                        p: 1.5,
                        visibility: isMain ? "visible" : "hidden",
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: "#DDF4EA",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <PaymentsIcon sx={{ color: "#00833E" }} />
                        </Box>

                        <Typography
                            sx={{
                                color: "#00833E",
                                fontWeight: 700,
                                fontSize: 16,
                            }}
                        >
                            วงเงินสูงสุด {(benefit.maxPrice ?? 0).toLocaleString("th-TH")} บาท
                        </Typography>
                    </Stack>
                </Box>

                <Stack spacing={1} sx={{ mt: "auto" }}>
                    <Typography sx={{ fontSize: 13, color: "#1F2A44" }}>จำนวนเงินที่ต้องการโอน</Typography>

                    <TextField
                        fullWidth
                        name={`benefit-${benefit.standardMedicalExpenseId}-amount`}
                        value={value}
                        onChange={(e) =>
                            onAmountChange(benefit.standardMedicalExpenseId, e.target.value, benefit.maxPrice)
                        }
                        placeholder="จำนวนเงินที่ต้องการโอน"
                        size="medium"
                        inputProps={{
                            inputMode: "decimal",
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: 66,
                                borderRadius: 2,
                                bgcolor: "#fff",
                            },
                            "& input": {
                                fontSize: 16,
                                fontWeight: 500,
                            },
                        }}
                    />

                    {!isMain && helperText && (
                        <Typography sx={{ fontSize: 11, color: "#7890B2" }}>{helperText}</Typography>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

const SummaryTotalCard = ({ totalAmount }: { totalAmount: number }) => {
    return (
        <Box
            sx={{
                border: "1px solid #A7D7FF",
                borderRadius: 3,
                bgcolor: "#F8FCFF",
                p: 2.5,
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "#DDF2FF",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ReceiptLongIcon sx={{ color: "#0076B6", fontSize: 30 }} />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#1F2A44" }}>ยอดเงินรวมทั้งหมด</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "#7890B2" }}>
                        รวมยอดเสียชีวิตหลัก + ยอดเพิ่มเติมอัตโนมัติ
                    </Typography>
                </Box>

                <Typography sx={{ fontSize: 18, color: "#0076B6", fontWeight: 700, minWidth: 150, textAlign: "right" }}>
                    THB{" "}
                    {totalAmount.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </Typography>
            </Stack>
        </Box>
    );
};

export default DeathClaimAmountCardPA;

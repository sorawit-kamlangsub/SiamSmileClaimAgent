import { useEffect, useMemo } from "react";
import { Box, Skeleton, Stack, Typography, Paper } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { ClaimPAFormValues, DeathExtraCoverageId } from "../../../store/claimPASlice";
import { FormikProps, getIn } from "formik";
import { GetCustomerBenefitDetailHalfDtoResponse } from "../../../../../api/coreClaimApi.client";
import { classifyDeathBenefit, getDeathMainBenefit } from "../../../../../deathBenefitHelpers";
import { FormikTextNumber } from "../../../../_common";

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
        if (formik.values.transferAmount !== transferAmount) {
            formik.setFieldValue("transferAmount", transferAmount, false);
        }

        const nextTransferError =
            transferAmount > mainMaxAmount
                ? `จำนวนเงินที่ต้องการโอนต้องไม่เกิน ${mainMaxAmount.toLocaleString("th-TH")} บาท`
                : undefined;

        if (getIn(formik.errors, "transferAmount") !== nextTransferError) {
            formik.setFieldError("transferAmount", nextTransferError);
        }
    }, [transferAmount, mainMaxAmount, formik.values.transferAmount, formik.errors]);

    useEffect(() => {
        visibleBenefits.forEach((b) => {
            if (b.standardMedicalExpenseId == null) return;

            const fieldName = `deathBenefitAmounts.${b.standardMedicalExpenseId}`;
            const amount = Number(amounts[b.standardMedicalExpenseId]) || 0;
            const maxPrice = b.maxPrice == null ? undefined : Number(b.maxPrice);
            const nextError =
                amount <= 0
                    ? "กรุณากรอกจำนวนเงินมากกว่า 0 บาท"
                    : maxPrice != null && amount > maxPrice
                    ? `จำนวนเงินต้องไม่เกินวงเงินสูงสุด ${maxPrice.toLocaleString("th-TH")} บาท`
                    : undefined;

            if (getIn(formik.errors, fieldName) !== nextError) {
                formik.setFieldError(fieldName, nextError);
            }
        });
    }, [amounts, visibleBenefits, formik.errors]);

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
                        formik={formik}
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
    formik,
}: {
    benefit: GetCustomerBenefitDetailHalfDtoResponse;
    isMain: boolean;
    formik: FormikProps<ClaimPAFormValues>;
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
                    {/* <Typography sx={{ fontSize: 13, color: "#1F2A44" }}>จำนวนเงินที่ต้องการโอน</Typography> */}

                    <FormikTextNumber
                        name={`deathBenefitAmounts.${benefit.standardMedicalExpenseId}`}
                        label="จำนวนเงินที่ต้องการโอน"
                        formik={formik}
                        decimalScale={2}
                        thousandSeparator
                        placeholder="จำนวนเงินที่ต้องการโอน"
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
                p: { xs: 1.75, sm: 2.5 },
                overflow: { xs: "hidden", sm: "visible" },
            }}
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={{ xs: 1.5, sm: 2 }}
            >
                <Stack direction="row" alignItems="center" spacing={{ xs: 1.25, sm: 2 }} sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: { xs: 46, sm: 56 },
                            height: { xs: 46, sm: 56 },
                            flexShrink: 0,
                            bgcolor: "#DDF2FF",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ReceiptLongIcon sx={{ color: "#0076B6", fontSize: { xs: 25, sm: 30 } }} />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "#1F2A44",
                                fontSize: { xs: 14, sm: 16 },
                                lineHeight: { xs: 1.35, sm: 1.5 },
                            }}
                        >
                            ยอดเงินรวมทั้งหมด
                        </Typography>
                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: { xs: 11, sm: 12 },
                                lineHeight: { xs: 1.4, sm: 1.43 },
                                color: "#7890B2",
                                whiteSpace: { xs: "normal", sm: "normal" },
                            }}
                        >
                            รวมยอดเสียชีวิตหลัก + ยอดเพิ่มเติมอัตโนมัติ
                        </Typography>
                    </Box>
                </Stack>

                <Typography
                    sx={{
                        width: { xs: "100%", sm: "auto" },
                        minWidth: { sm: 150 },
                        pt: { xs: 1.25, sm: 0 },
                        borderTop: { xs: "1px solid #D8ECFA", sm: "none" },
                        fontSize: { xs: 16, sm: 18 },
                        color: "#0076B6",
                        fontWeight: 700,
                        lineHeight: 1.3,
                        textAlign: { xs: "left", sm: "right" },
                        whiteSpace: "nowrap",
                    }}
                >
                    <Box component="span" sx={{ fontSize: { xs: 12, sm: 18 }, mr: 0.5 }}>
                        THB
                    </Box>
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

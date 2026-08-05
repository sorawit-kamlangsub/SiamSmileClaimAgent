import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography, TextField } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { ClaimPAFormValues } from "../../../store/claimPASlice";
import { FormikProps } from "formik";

type CoverageItem = {
    id: string;
    type: "main" | "extra";
    title: string;
    description: string;
    maxAmount?: number;
    helperText?: string;
    businessId?: number; // id ทางธุรกิจของความคุ้มครองเพิ่มเติม (7 = ภัยสาธารณะ, 8 = ความรับผิดสถานศึกษา)
};

type Props = {
    causeOfIncidentName?: string;
    mainMaxAmount: number;
    extraCoverageIds: number[]; // ความคุ้มครองเพิ่มเติมที่ถูกเลือก (checkbox) จากฟอร์ม
    formik: FormikProps<ClaimPAFormValues>;
};

const coverageItems: CoverageItem[] = [
    {
        id: "main",
        type: "main",
        title: "ความคุ้มครองหลัก",
        description: "เสียชีวิตเนื่องจากอุบัติเหตุทั่วไป",
        maxAmount: 100000,
    },
    {
        id: "public-disaster",
        type: "extra",
        title: "ความคุ้มครองเพิ่มเติม",
        description: "เสียชีวิต จากภัยสาธารณะ อีก 1 เท่าของทุนประกันภัย",
        helperText: "กรอกเฉพาะยอดเพิ่มเติมภัยสาธารณะ",
        businessId: 7,
    },
    {
        id: "student-liability",
        type: "extra",
        title: "ความคุ้มครองเพิ่มเติม",
        description: "ประกันความรับผิดชอบของสถานศึกษา (นักเรียน) เพิ่ม 1 เท่า สูงสุดไม่เกิน 10 เท่าของทุนประกัน",
        helperText: "กรอกเฉพาะยอดเพิ่มเติมความรับผิดสถานศึกษา",
        businessId: 8,
    },
];

const DeathClaimAmountCardPA = ({ causeOfIncidentName, mainMaxAmount, extraCoverageIds, formik }: Props) => {
    const [amounts, setAmounts] = useState<Record<string, number>>({
        main: 0,
        "public-disaster": 0,
        "student-liability": 0,
    });

    const items = coverageItems.map((item) =>
        item.id === "main"
            ? {
                  ...item,
                  description: `เสียชีวิตเนื่องจาก${causeOfIncidentName ?? "-"}`,
                  maxAmount: mainMaxAmount,
              }
            : item
    );

    // แสดงเฉพาะ main กับ extra ที่ถูกติ๊กเลือกไว้เท่านั้น (ที่เหลือตามการ check ของ checkbox)
    const visibleItems = items.filter(
        (item) => item.type === "main" || extraCoverageIds.includes(item.businessId ?? -1)
    );

    const transferAmount = useMemo(() => {
        return visibleItems.reduce((sum, item) => sum + (amounts[item.id] ?? 0), 0);
    }, [amounts, visibleItems]);

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

    const handleAmountChange = (id: string, value: string) => {
        const numericValue = Number(value.replace(/,/g, "")) || 0;

        setAmounts((prev) => ({
            ...prev,
            [id]: numericValue,
        }));
    };

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
                {visibleItems.map((item) => (
                    <TransferAmountCard
                        key={item.id}
                        item={item}
                        value={amounts[item.id] ?? 0}
                        onAmountChange={handleAmountChange}
                    />
                ))}
            </Box>

            <SummaryTotalCard totalAmount={transferAmount} />
        </Stack>
    );
};

const TransferAmountCard = ({
    item,
    value,
    onAmountChange,
}: {
    item: CoverageItem;
    value: number;
    onAmountChange: (id: string, value: string) => void;
}) => {
    const isMain = item.type === "main";

    const color = isMain ? "#0076B6" : "#B85F00";
    const borderColor = isMain ? "#A7D7FF" : "#FFA726";
    const sideColor = isMain ? "#0B84C6" : "#F57C00";
    const badgeBg = isMain ? "#E5F5FF" : "#FFF4D8";
    const cardBg = isMain ? "#FBFDFF" : "#FFFDF6";

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
                            {item.title}
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
                            {item.description}
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
                            วงเงินสูงสุด {(item.maxAmount ?? 0).toLocaleString("th-TH")} บาท
                        </Typography>
                    </Stack>
                </Box>

                <Stack spacing={1} sx={{ mt: "auto" }}>
                    <Typography sx={{ fontSize: 13, color: "#1F2A44" }}>จำนวนเงินที่ต้องการโอน</Typography>

                    <TextField
                        fullWidth
                        name={`${item.id}Amount`}
                        value={value || ""}
                        onChange={(e) => onAmountChange(item.id, e.target.value)}
                        placeholder="จำนวนเงินที่ต้องการโอน"
                        size="medium"
                        inputProps={{
                            inputMode: "numeric",
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

                    {!isMain && item.helperText && (
                        <Typography sx={{ fontSize: 11, color: "#7890B2" }}>{item.helperText}</Typography>
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

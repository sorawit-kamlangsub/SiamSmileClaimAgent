import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Chip, CircularProgress, TextField, InputAdornment } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { GetCustomerBenefitDetailHalfDtoResponse } from "../../../../api/coreClaimApi.client";
import { numberWithCommas, setBenefitIcons } from "../../../../functionHelpers";
interface Props {
    items: GetCustomerBenefitDetailHalfDtoResponse[];
    isLoading: boolean;
    planCode: string | undefined;
    benefitAmounts: Record<number, string>;
    medicalTypeId: number | undefined;
    onBenefitAmountsChange: (value: Record<number, string>) => void;
    onTransferAmountChange: (value: number) => void;
    debounceMs?: number;
    /** เคลมต่อเนื่อง: แสดง/ตรวจสอบด้วย benefit คงเหลือ (remainBenefit / remainAmount) แทนวงเงินสูงสุด */
    isContinuous?: boolean;
}

const BenefitIcon: React.FC<{ benefitId?: number }> = ({ benefitId }) => {
    const src = setBenefitIcons(benefitId);
    return src ? (
        <Box
            component="img"
            src={src}
            alt=""
            sx={{ width: 36, height: 36, objectFit: "fill", borderRadius: 1, flexShrink: 0 }}
        />
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
                flexShrink: 0,
            }}
        >
            <MonitorHeartIcon sx={{ fontSize: 22, color: "#1a5da8" }} />
        </Box>
    );
};

const sanitizeAmountInput = (raw: string): string => {
    // ตัดอักขระที่ไม่ใช่ตัวเลขกับจุดทิ้งทั้งหมด (กัน - และตัวอักษร/สัญลักษณ์)
    const cleaned = raw.replace(/[^0-9.]/g, "");

    const dotIndex = cleaned.indexOf(".");
    if (dotIndex === -1) return cleaned; // ไม่มีจุด ไม่ต้องทำอะไรต่อ

    const intPart = cleaned.slice(0, dotIndex);
    // เอาเฉพาะตัวเลขหลังจุดแรก (ตัดจุดซ้ำที่เหลือทิ้งไปในตัว) แล้วจำกัด 2 ตำแหน่ง
    const decPart = cleaned
        .slice(dotIndex + 1)
        .replace(/\./g, "")
        .slice(0, 2);

    return `${intPart}.${decPart}`;
};

const CoverageAndTransferBox: React.FC<Props> = ({
    items,
    isLoading,
    planCode,
    benefitAmounts,
    medicalTypeId,
    onBenefitAmountsChange,
    onTransferAmountChange,
    debounceMs = 300,
    isContinuous = false,
}) => {
    const [localAmounts, setLocalAmounts] = useState(benefitAmounts);
    const [amountErrors, setAmountErrors] = useState<Record<number, string>>({});
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setLocalAmounts(benefitAmounts);
    }, [benefitAmounts]);
    useEffect(() => {
        setLocalAmounts(benefitAmounts);
    }, [benefitAmounts]);

    // reset ทุกครั้งที่เปลี่ยนประเภทการเบิก (medicalTypeId)
    useEffect(() => {
        setLocalAmounts({});
        setAmountErrors({});
        onBenefitAmountsChange({});
        onTransferAmountChange(0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, [medicalTypeId]);

    const total = useMemo(
        () => Object.values(localAmounts).reduce((sum, v) => sum + (Number(v) || 0), 0),
        [localAmounts]
    );

    const handleAmountChange = (benefitId: number, value: string, maxPrice?: number) => {
        const sanitized = sanitizeAmountInput(value);
        const next = { ...localAmounts, [benefitId]: sanitized };
        setLocalAmounts(next);

        // เช็ค error แบบ real-time แต่ไม่บล็อกการพิมพ์
        const numValue = Number(sanitized) || 0;
        if (maxPrice != null && numValue > maxPrice) {
            setAmountErrors((prev) => ({
                ...prev,
                [benefitId]: `ไม่เกินวงเงิน${isContinuous ? "คงเหลือ" : "สูงสุด"} ${numberWithCommas(
                    maxPrice.toString(),
                    0
                )} บาท`,
            }));
        } else {
            setAmountErrors((prev) => {
                const { [benefitId]: _, ...rest } = prev;
                return rest;
            });
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onBenefitAmountsChange(next);
            const nextTotal = Object.values(next).reduce((sum, v) => sum + (Number(v) || 0), 0);
            onTransferAmountChange(nextTotal);
        }, debounceMs);
    };

    const handleAmountBlur = (benefitId: number) => {
        const currentValue = localAmounts[benefitId] ?? "";
        const numValue = Number(currentValue) || 0;
        const formatted = numValue.toFixed(2);

        if (formatted !== currentValue) {
            const next = { ...localAmounts, [benefitId]: formatted };
            setLocalAmounts(next);
            onBenefitAmountsChange(next);
            const nextTotal = Object.values(next).reduce((sum, v) => sum + (Number(v) || 0), 0);
            onTransferAmountChange(nextTotal);
        }
        // ไม่ clamp ค่า ปล่อยให้ error message เตือนไว้เฉยๆ user ต้องแก้เอง
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: { xs: 2, md: 2 },
                alignItems: "stretch",
            }}
        >
            {/* Header ซ้าย */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2, px: 1.5, py: 1 }}
            >
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

            {/* Header ขวา */}
            <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2, px: 1.5, py: 1 }}
            >
                <CreditCardIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography fontSize={12} fontWeight={500} color="primary.main">
                    รายละเอียดจำนวนเงินโอน
                </Typography>
            </Box>

            {isLoading && (
                <>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        py={3}
                        sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2 }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                    <Box sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2 }} />
                </>
            )}

            {!isLoading && items.length === 0 && (
                <>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        py={3}
                        gap={0.5}
                        sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2 }}
                    >
                        <SearchOffIcon sx={{ fontSize: 28, color: "text.disabled" }} />
                        <Typography fontSize={12} color="text.disabled">
                            ไม่พบข้อมูล
                        </Typography>
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        py={3}
                        gap={0.5}
                        sx={{ border: "0.5px solid #B5D4F4", borderRadius: 2 }}
                    >
                        <SearchOffIcon sx={{ fontSize: 28, color: "text.disabled" }} />
                        <Typography fontSize={12} color="text.disabled">
                            ไม่พบข้อมูล
                        </Typography>
                    </Box>
                </>
            )}

            {!isLoading &&
                items.map((item) => (
                    <React.Fragment key={item.benefitId}>
                        <Box
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
                                                    (isContinuous ? item.remainAmount : item.maxPrice)?.toString() ||
                                                        "0",
                                                    0
                                                )}{" "}
                                                บาท
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder={item.benefitName}
                            value={item.benefitId != null ? localAmounts[item.benefitId] ?? "" : ""}
                            onChange={(e) =>
                                item.benefitId != null &&
                                handleAmountChange(
                                    item.benefitId,
                                    e.target.value,
                                    isContinuous ? item.remainAmount : item.maxPrice
                                )
                            }
                            onBlur={() => item.benefitId != null && handleAmountBlur(item.benefitId)}
                            error={item.benefitId != null && !!amountErrors[item.benefitId]}
                            helperText={item.benefitId != null ? amountErrors[item.benefitId] : undefined}
                            inputProps={{
                                inputMode: "decimal",
                                style: { textAlign: "right" },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "100%",
                                    bgcolor: "#F5F9FF",
                                    borderRadius: 1.5,
                                    fontSize: 12,
                                },
                            }}
                        />
                    </React.Fragment>
                ))}

            <Box sx={{ display: { xs: "none", md: "block" } }} />
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    bgcolor: "#F5F9FF",
                    border: "0.5px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.8,
                }}
            >
                <Typography fontSize={16} fontWeight={500} color="text.primary">
                    จำนวนเงินโอนรวม
                </Typography>
                <TextField
                    size="small"
                    value={numberWithCommas(total.toString(), 2)}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <Typography fontSize={16} color="text.secondary">
                                    บาท
                                </Typography>
                            </InputAdornment>
                        ),
                        sx: { bgcolor: "#fff", borderRadius: 1.5, fontSize: 16, width: 160 },
                    }}
                    inputProps={{ style: { textAlign: "right" } }}
                />
            </Box>
        </Box>
    );
};

export default React.memo(CoverageAndTransferBox);

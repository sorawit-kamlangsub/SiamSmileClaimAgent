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
    onBenefitAmountsChange: (value: Record<number, string>) => void;
    onTransferAmountChange: (value: number) => void;
    debounceMs?: number;
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

const CoverageAndTransferBox: React.FC<Props> = ({
    items,
    isLoading,
    planCode,
    benefitAmounts,
    onBenefitAmountsChange,
    onTransferAmountChange,
    debounceMs = 300,
}) => {
    const [localAmounts, setLocalAmounts] = useState(benefitAmounts);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setLocalAmounts(benefitAmounts);
    }, [benefitAmounts]);

    const total = useMemo(
        () => Object.values(localAmounts).reduce((sum, v) => sum + (Number(v) || 0), 0),
        [localAmounts]
    );

    const handleAmountChange = (benefitId: number, value: string) => {
        const next = { ...localAmounts, [benefitId]: value };
        setLocalAmounts(next);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onBenefitAmountsChange(next);
            const nextTotal = Object.values(next).reduce((sum, v) => sum + (Number(v) || 0), 0);
            onTransferAmountChange(nextTotal);
        }, debounceMs);
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
                                        {numberWithCommas(item.pricePerUnit?.toString() || "0", 0)} บาท{item.unitName}
                                        /สูงสุด {numberWithCommas(item.maxQuantity?.toString() || "0", 0)}{" "}
                                        {item.quantityUnitName}
                                    </Typography>
                                    {item.maxPrice && (
                                        <>
                                            <Typography fontSize={11} color="text.disabled">
                                                |
                                            </Typography>
                                            <Typography fontSize={11} color="success.main">
                                                วงเงินสูงสุด {numberWithCommas(item.maxPrice?.toString() || "0", 0)} บาท
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
                                item.benefitId != null && handleAmountChange(item.benefitId, e.target.value)
                            }
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

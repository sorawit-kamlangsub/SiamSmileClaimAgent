import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import VerifiedIcon from "@mui/icons-material/Verified";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { GetCustomerBenefitDetailSearchDtoResponse } from "../../../../../api/coreClaimApi.client";

type Props = {
    items: GetCustomerBenefitDetailSearchDtoResponse[];
    isLoading: boolean;
};

const DeathClaimAmountCardPH = ({ items, isLoading }: Props) => {
    return (
        <Box
            sx={{
                border: "1px solid #B9D9FF",
                borderLeft: { xs: "1px solid #B9D9FF", sm: "6px solid #1976D2" },
                borderTop: { xs: "6px solid #1976D2", sm: "1px solid #B9D9FF" },
                borderRadius: 3,
                p: { xs: 2, sm: 3 },
                bgcolor: "#fff",
                mt: 2,
            }}
        >
            {/* Loading */}
            {isLoading && (
                <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {/* Empty state */}
            {!isLoading && items.length === 0 && (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4} gap={0.5}>
                    <SearchOffIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                    <Typography fontSize={13} color="text.disabled">
                        ไม่พบข้อมูล
                    </Typography>
                </Box>
            )}

            {/* Items */}
            {!isLoading && items.length > 0 && (
                <Stack spacing={2.5} divider={<Box sx={{ borderTop: "1px dashed", borderColor: "divider" }} />}>
                    {items.map((item, index) => (
                        <Stack key={item.benefitId ?? index} spacing={2}>
                            {/* หัวข้อ */}
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                            >
                                <Box
                                    sx={{
                                        width: { xs: 44, sm: 54 },
                                        height: { xs: 44, sm: 54 },
                                        borderRadius: 2,
                                        bgcolor: "#E8F4FF",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <VerifiedIcon
                                        sx={{
                                            color: "primary.main",
                                            fontSize: { xs: 24, sm: 30 },
                                        }}
                                    />
                                </Box>

                                <Box minWidth={0}>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: "primary.main",
                                            fontSize: { xs: 15, sm: 18 },
                                        }}
                                    >
                                        {index === 0 ? "ความคุ้มครองหลัก" : "ความคุ้มครองเพิ่มเติม"}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontWeight: 600,
                                            fontSize: { xs: 14, sm: 16 },
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {item.benefitName ?? "-"}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box
                                sx={{
                                    border: "1px solid #A5E6B8",
                                    bgcolor: "#EFFBF3",
                                    borderRadius: 2,
                                    p: { xs: 1.5, sm: 2 },
                                }}
                            >
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={{ xs: 1, sm: 2 }}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            bgcolor: "#D8F5E0",
                                            borderRadius: 2,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <PaymentsIcon sx={{ color: "#22A35A" }} />
                                    </Box>

                                    <Typography
                                        sx={{
                                            color: "#13864C",
                                            fontWeight: 700,
                                            fontSize: { xs: 14, sm: 16 },
                                        }}
                                    >
                                        วงเงินสูงสุด {item.maxPrice?.toLocaleString("th-TH") ?? "-"} บาท
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default DeathClaimAmountCardPH;

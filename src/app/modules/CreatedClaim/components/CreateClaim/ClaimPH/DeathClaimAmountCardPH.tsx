import { Box, Stack, Typography } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import VerifiedIcon from "@mui/icons-material/Verified";

type Props = {
    causeOfIncidentName?: string;
    maxAmount: number;
};

const DeathClaimAmountCardPH = ({ causeOfIncidentName, maxAmount }: Props) => {
    return (
        <Box
            sx={{
                border: "1px solid #B9D9FF",
                borderLeft: "6px solid #1976D2",
                borderRadius: 3,
                p: 3,
                bgcolor: "#fff",
                mt: 2,
            }}
        >
            <Stack spacing={3}>
                {/* หัวข้อ */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 54,
                            height: 54,
                            borderRadius: 2,
                            bgcolor: "#E8F4FF",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <VerifiedIcon
                            sx={{
                                color: "primary.main",
                                fontSize: 30,
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                fontSize: 18,
                            }}
                        >
                            ความคุ้มครองหลัก
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontWeight: 600,
                                fontSize: 16,
                            }}
                        >
                            เสียชีวิตจาก{causeOfIncidentName ?? "-"}
                        </Typography>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        border: "1px solid #A5E6B8",
                        bgcolor: "#EFFBF3",
                        borderRadius: 2,
                        p: 2,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                bgcolor: "#D8F5E0",
                                borderRadius: 2,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <PaymentsIcon
                                sx={{
                                    color: "#22A35A",
                                }}
                            />
                        </Box>

                        <Typography
                            sx={{
                                color: "#13864C",
                                fontWeight: 700,
                            }}
                        >
                            วงเงินสูงสุด {maxAmount.toLocaleString("th-TH")} บาท
                        </Typography>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

export default DeathClaimAmountCardPH;

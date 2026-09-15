import BedIcon from "@mui/icons-material/Bed";
import { Box, Grid, Typography } from "@mui/material";

type StayDaysSectionProps = {
    medicalTypeName: string | undefined;
    ipdDays: number;
    icuDays: number;
    totalDays: number;
};

type StayDayBoxProps = {
    label: string;
    value: number;
    borderColor: string;
    valueColor: string;
};

const StayDayBox = ({ label, value, borderColor, valueColor }: StayDayBoxProps) => (
    <Grid item xs={12} md={4}>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 60,
                px: 1.5,
                py: 1,
                border: "1px solid",
                borderColor,
                borderRadius: 2,
                bgcolor: "#fff",
            }}
        >
            <Typography variant="body2" sx={{ color: "#344054", fontWeight: 500 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: valueColor, whiteSpace: "nowrap" }}>
                {value} วัน
            </Typography>
        </Box>
    </Grid>
);

const StayDaysSection = ({ medicalTypeName, ipdDays, icuDays, totalDays }: StayDaysSectionProps) => (
    <Box sx={{ mx: 2, mb: 2, pt: 2, borderTop: "1px solid #E0E0E0" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 1,
                    bgcolor: "#E2F2FF",
                }}
            >
                <BedIcon sx={{ fontSize: 20, color: "#007AC1" }} />
            </Box>
            <Box>
                <Typography sx={{ color: "#007AC1", fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>
                    สรุปจำนวนวันนอน
                </Typography>
                <Typography sx={{ color: "#667085", fontSize: 12, lineHeight: 1.4, mt: 0.25 }}>
                    {medicalTypeName}
                </Typography>
            </Box>
        </Box>
        <Grid container spacing={1.5}>
            <StayDayBox label="จำนวนวัน IPD" value={ipdDays} borderColor="#D6E8FF" valueColor="#007AC1" />
            <StayDayBox label="จำนวนวัน ICU" value={icuDays} borderColor="#FFD9B3" valueColor="#E53935" />
            <StayDayBox label="จำนวนวันนอน" value={totalDays} borderColor="#D0D5DD" valueColor="#344054" />
        </Grid>
    </Box>
);

export default StayDaysSection;

import { Box, Grid, Paper, TextField, Typography } from "@mui/material";
import BedIcon from "@mui/icons-material/Bed";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DarkModeIcon from "@mui/icons-material/DarkMode";

type StatCardConfig = {
    key: "ipd" | "icu" | "total";
    icon: React.ReactNode;
    valueColor: string;
    borderColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
};

const statCards: StatCardConfig[] = [
    {
        key: "ipd",
        icon: <BedIcon sx={{ fontSize: 16, color: "#fff" }} />,
        valueColor: "#1E88E5",
        borderColor: "#a9c6de",
        iconBg: "#1E88E5",
        title: "วัน IPD",
        subtitle: "จำนวนวันนอนรักษาในโรงพยาบาล",
    },
    {
        key: "icu",
        icon: <MedicalServicesIcon sx={{ fontSize: 16, color: "#fff" }} />,
        valueColor: "#F4511E",
        borderColor: "#F4511E33",
        iconBg: "#F4511E",
        title: "วัน ICU",
        subtitle: "จำนวนวันที่พักรักษาในหอผู้ป่วยวิกฤต",
    },
    {
        key: "total",
        icon: <DarkModeIcon sx={{ fontSize: 16, color: "#78909C" }} />,
        valueColor: "#37474F",
        borderColor: "#E0E0E0",
        iconBg: "transparent",
        title: "วันที่นอน",
        subtitle: "จำนวนวันที่ใช้ประกอบการพิจารณา",
    },
];

type StayDaysValues = {
    ipdDays: number;
    icuDays: number;
    totalDays: number;
};

type StayDaysSummaryProps = {
    values: StayDaysValues;
    required: boolean;
    onChange: (field: "ipdDays" | "icuDays", value: number) => void;
};

const StayDaysSummary = ({ values, required, onChange }: StayDaysSummaryProps) => {
    const displayValue: Record<StatCardConfig["key"], number> = {
        ipd: values.ipdDays,
        icu: values.icuDays,
        total: values.totalDays,
    };

    return (
        <Box>
            {/* การ์ดสรุปตัวเลข */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {statCards.map((card) => (
                    <Grid item xs={12} sm={4} key={card.key}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 2,
                                borderColor: card.borderColor,
                                borderWidth: card.key !== "total" ? 1.5 : 1,
                                height: "100%",
                            }}
                        >
                            {/* แถวบน: icon + badge อยู่ด้วยกัน ชิดซ้าย — ลด eye travel */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: card.iconBg,
                                        border: card.key === "total" ? "1px solid #CFD8DC" : "none",
                                    }}
                                >
                                    {card.icon}
                                </Box>
                            </Box>

                            {/* กลุ่มตัวเลข + label ชิดกัน ให้ตาอ่านเป็นก้อนเดียว */}
                            <Box sx={{ textAlign: "center", mt: { xs: 1, sm: 1.5 } }}>
                                <Typography
                                    sx={{
                                        fontSize: { xs: 28, sm: 32 },
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        color: card.valueColor,
                                    }}
                                >
                                    {displayValue[card.key]}
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 0.25,
                                        fontSize: { xs: 13, sm: 14 },
                                        fontWeight: 600,
                                        lineHeight: 1.3,
                                        color: "text.primary",
                                    }}
                                >
                                    {card.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: { xs: 10.5, sm: 11.5 },
                                        lineHeight: 1.3,
                                        color: "text.secondary",
                                        px: 0.5,
                                    }}
                                >
                                    {card.subtitle}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* ช่องกรอกตัวเลข */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        required={required}
                        fullWidth
                        type="number"
                        label="จำนวนวัน IPD"
                        value={values.ipdDays}
                        onChange={(e) => onChange("ipdDays", Number(e.target.value))}
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="จำนวนวัน ICU"
                        value={values.icuDays}
                        onChange={(e) => onChange("icuDays", Number(e.target.value))}
                        inputProps={{ min: 0 }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField fullWidth disabled type="number" label="จำนวนวันนอน" value={values.totalDays} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default StayDaysSummary;

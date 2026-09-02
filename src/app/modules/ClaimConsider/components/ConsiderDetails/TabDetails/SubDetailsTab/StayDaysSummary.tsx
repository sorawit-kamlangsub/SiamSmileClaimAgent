import { Box, Grid, Paper, TextField, Typography } from "@mui/material";
import BedIcon from "@mui/icons-material/Bed";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Dayjs } from "dayjs";

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
};

type StayDaysSummaryProps = {
    values: StayDaysValues;

    admissionDate: Dayjs | null | undefined;
    admissionTime: Dayjs | null | undefined;

    dischargeDate: Dayjs | null | undefined;
    dischargeTime: Dayjs | null | undefined;

    required: boolean;

    onChange: (field: "ipdDays" | "icuDays", value: number) => void;
};

/**
 * รวม Date + Time
 */
const combineDateTime = (date: Dayjs | null | undefined, time: Dayjs | null | undefined) => {
    if (!date || !time) {
        return undefined;
    }

    return date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0);
};

/**
 * คำนวณจำนวนวันนอน
 *
 * < 6 ชั่วโมง          = 0 วัน
 * >= 6 ชั่วโมง         = 1 วัน
 * 1 วัน + < 6 ชั่วโมง  = 1 วัน
 * 1 วัน + >= 6 ชั่วโมง = 2 วัน
 */
const calcStayDays = (
    admissionDate: Dayjs | null | undefined,
    admissionTime: Dayjs | null | undefined,
    dischargeDate: Dayjs | null | undefined,
    dischargeTime: Dayjs | null | undefined
): number => {
    const admission = combineDateTime(admissionDate, admissionTime);

    const discharge = combineDateTime(dischargeDate, dischargeTime);

    if (!admission || !discharge) {
        return 0;
    }

    const diffMinutes = discharge.diff(admission, "minute");

    if (diffMinutes <= 0) {
        return 0;
    }

    const SIX_HOURS = 6 * 60;
    const FULL_DAY = 24 * 60;

    const fullDays = Math.floor(diffMinutes / FULL_DAY);

    const remainingMinutes = diffMinutes % FULL_DAY;

    const extraDay = remainingMinutes >= SIX_HOURS ? 1 : 0;

    return fullDays + extraDay;
};

const StayDaysSummary = ({
    values,
    admissionDate,
    admissionTime,
    dischargeDate,
    dischargeTime,
    required,
    onChange,
}: StayDaysSummaryProps) => {
    /**
     * จำนวนวันนอนจริง
     * คำนวณจาก Admission → Discharge
     */
    const totalDays = calcStayDays(admissionDate, admissionTime, dischargeDate, dischargeTime);

    /**
     * IPD + ICU
     */
    const inputTotalDays = (values.ipdDays || 0) + (values.icuDays || 0);

    /**
     * IPD เกินจำนวนวันนอน
     */
    const ipdOverBedDays = values.ipdDays > totalDays;

    /**
     * ICU เกินจำนวนวันนอน
     */
    const icuOverBedDays = values.icuDays > totalDays;

    /**
     * IPD + ICU ต้องเท่ากับจำนวนวันนอน
     */
    const daysNotEqual = totalDays > 0 && inputTotalDays !== totalDays;

    const ipdError = ipdOverBedDays
        ? "จำนวนวัน IPD ต้องไม่เกินจำนวนวันนอน"
        : daysNotEqual
        ? "จำนวนวัน IPD รวมกับ ICU ต้องเท่ากับจำนวนวันนอน"
        : "";

    const icuError = icuOverBedDays
        ? "จำนวนวัน ICU ต้องไม่เกินจำนวนวันนอน"
        : daysNotEqual
        ? "จำนวนวัน IPD รวมกับ ICU ต้องเท่ากับจำนวนวันนอน"
        : "";

    const displayValue: Record<StatCardConfig["key"], number> = {
        ipd: values.ipdDays,
        icu: values.icuDays,
        total: totalDays,
    };

    const handleChange = (field: "ipdDays" | "icuDays", value: string) => {
        const numberValue = Number(value);

        onChange(field, Math.max(0, numberValue || 0));
    };

    return (
        <Box>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {statCards.map((card) => (
                    <Grid item xs={12} sm={4} key={card.key}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: {
                                    xs: 1.5,
                                    sm: 2,
                                },
                                borderRadius: 2,
                                borderColor: card.borderColor,
                                borderWidth: card.key !== "total" ? 1.5 : 1,
                                height: "100%",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
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

                            <Box
                                sx={{
                                    textAlign: "center",
                                    mt: {
                                        xs: 1,
                                        sm: 1.5,
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: 28,
                                            sm: 32,
                                        },
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
                                        fontSize: {
                                            xs: 13,
                                            sm: 14,
                                        },
                                        fontWeight: 600,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {card.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: 10.5,
                                            sm: 11.5,
                                        },
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

            <Grid
                container
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{
                    mt: {
                        xs: 0.5,
                        sm: 1,
                    },
                }}
            >
                {/* IPD */}
                <Grid item xs={12} sm={4}>
                    <TextField
                        required={required}
                        fullWidth
                        type="number"
                        label="จำนวนวัน IPD"
                        value={values.ipdDays}
                        onChange={(e) => handleChange("ipdDays", e.target.value)}
                        inputProps={{
                            min: 0,
                            step: 1,
                        }}
                        error={!!ipdError}
                        helperText={ipdError || " "}
                    />
                </Grid>

                {/* ICU */}
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="จำนวนวัน ICU"
                        value={values.icuDays}
                        onChange={(e) => handleChange("icuDays", e.target.value)}
                        inputProps={{
                            min: 0,
                            step: 1,
                        }}
                        error={!!icuError}
                        helperText={icuError || " "}
                    />
                </Grid>

                {/* จำนวนวันนอน */}
                <Grid item xs={12} sm={4}>
                    <TextField fullWidth disabled type="number" label="จำนวนวันนอน" value={totalDays} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default StayDaysSummary;

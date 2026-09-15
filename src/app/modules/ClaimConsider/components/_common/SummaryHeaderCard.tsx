import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
    showDivider?: boolean;
    /** จำนวน stat ทั้งหมด — ใช้คำนวณความกว้างคอลัมน์ให้พอดีแถวเสมอ ไม่ว่าจะมีกี่รายการ */
    itemsCount: number;
}

const StatItem = ({ icon, label, value, color, showDivider = true, itemsCount }: StatItemProps) => (
    <Grid
        item
        xs={Math.max(1, Math.floor(12 / itemsCount))}
        sx={{
            textAlign: "center",
            borderRight: showDivider ? "1px solid #E0E0E0" : "none",
            padding: { xs: "4px 2px", sm: "8px 4px" },
        }}
    >
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "4px",
                "& svg": { fontSize: { xs: 18, sm: 26 } },
            }}
        >
            {icon}
        </Box>
        <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, color, lineHeight: 1.3 }}>{label}</Typography>
        <Typography sx={{ fontSize: { xs: "1.05rem", sm: "1.6rem" }, fontWeight: 700, color }}>{value}</Typography>
    </Grid>
);

export interface SummaryStat {
    icon: React.ReactNode;
    label: string;
    value: number | string;
}

export interface SummaryHeaderCardProps {
    color: string;
    lightBackground: string;
    icon: React.ReactNode;
    title: string;
    totalValue: number | string;
    totalUnitLabel?: string;
    stats: SummaryStat[];
}

/**
 * Reusable two-panel summary card: a highlighted total on the left, and
 * up to N smaller stat columns on the right, separated by dividers.
 *
 * <SummaryHeaderCard
 *   color="#2E7D32"
 *   lightBackground="#E8F5E9"
 *   icon={<PersonIcon sx={{ fontSize: 30 }} />}
 *   title="เคลมลูกค้าทั้งหมด"
 *   totalValue={12}
 *   totalUnitLabel="รายการ"
 *   stats={[
 *     { icon: <EditNoteIcon />, label: "รอบันทึกข้อมูล", value: 5 },
 *     { icon: <FactCheckIcon />, label: "รอจ่ายเงิน", value: 6 },
 *     { icon: <CancelIcon />, label: "ยกเลิก", value: 1 },
 *   ]}
 * />
 */
const SummaryHeaderCard = ({
    color,
    lightBackground,
    icon,
    title,
    totalValue,
    totalUnitLabel,
    stats,
}: SummaryHeaderCardProps) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <Grid
                    container
                    spacing={{ xs: 1.25, sm: 2 }}
                    alignItems="center"
                    wrap="nowrap"
                    sx={{ padding: { xs: "10px 12px", sm: 3 }, gap: { xs: 1, sm: 2 } }}
                >
                    <Grid item>
                        <Box
                            sx={{
                                width: { xs: 36, sm: 56 },
                                height: { xs: 36, sm: 56 },
                                borderRadius: "12px",
                                backgroundColor: lightBackground,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color,
                                "& svg": { fontSize: { xs: 20, sm: 30 } },
                            }}
                        >
                            {icon}
                        </Box>
                    </Grid>
                    <Grid item sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700, color, fontSize: { xs: "0.75rem", sm: "1rem" } }}>
                            {title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                            <Typography sx={{ fontWeight: 700, color, fontSize: { xs: "1.3rem", sm: "2rem" } }}>
                                {totalValue}
                            </Typography>
                            {totalUnitLabel && (
                                <Typography sx={{ color, fontSize: { xs: "0.75rem", sm: "0.9rem" } }}>
                                    {totalUnitLabel}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={6}>
                <Paper
                    elevation={0}
                    sx={{
                        border: "1px solid #E0E0E0",
                        borderRadius: "16px",
                        padding: "12px 8px",
                        height: "100%",
                    }}
                >
                    <Grid container alignItems="center">
                        {stats.map((stat, index) => (
                            <StatItem
                                key={stat.label}
                                icon={stat.icon}
                                label={stat.label}
                                value={stat.value}
                                color={color}
                                showDivider={index < stats.length - 1}
                                itemsCount={stats.length}
                            />
                        ))}
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default SummaryHeaderCard;

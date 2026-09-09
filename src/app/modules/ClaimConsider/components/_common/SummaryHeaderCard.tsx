import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
    showDivider?: boolean;
}

const StatItem = ({ icon, label, value, color, showDivider = true }: StatItemProps) => (
    <Grid
        item
        xs={4}
        sx={{
            textAlign: "center",
            borderRight: showDivider ? "1px solid #E0E0E0" : "none",
            padding: "8px 4px",
        }}
    >
        <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>{icon}</Box>
        <Typography sx={{ fontSize: "0.8rem", color, lineHeight: 1.3 }}>{label}</Typography>
        <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color }}>{value}</Typography>
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
                <Grid container spacing={2} alignItems="center" wrap="nowrap" sx={{ padding: 3, gap: 2 }}>
                    <Grid item>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: "12px",
                                backgroundColor: lightBackground,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color,
                            }}
                        >
                            {icon}
                        </Box>
                    </Grid>
                    <Grid item>
                        <Typography sx={{ fontWeight: 700, color, fontSize: "1rem" }}>{title}</Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                            <Typography sx={{ fontWeight: 700, color, fontSize: "2rem" }}>{totalValue}</Typography>
                            {totalUnitLabel && (
                                <Typography sx={{ color, fontSize: "0.9rem" }}>{totalUnitLabel}</Typography>
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
                            />
                        ))}
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default SummaryHeaderCard;

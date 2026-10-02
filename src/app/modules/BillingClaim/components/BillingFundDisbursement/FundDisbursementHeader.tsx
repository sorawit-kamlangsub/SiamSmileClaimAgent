import { Box, Grid, Paper, Skeleton, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import { numberWithCommas } from "../../../../functionHelpers";

const BLUE = "#1565C0";
const BLUE_LIGHT_BG = "#E3F2FD";

type FundDisbursementHeaderProps = {
    totalCount: number;
    totalAmount: number;
    isLoading?: boolean;
};

type StatCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
    <Paper
        elevation={3}
        sx={{ border: "1px solid #E0E0E0", borderRadius: "16px", padding: "16px 20px", height: "100%" }}
    >
        <Grid container alignItems="center" spacing={2} wrap="nowrap">
            <Grid item>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "12px",
                        backgroundColor: BLUE_LIGHT_BG,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: BLUE,
                        "& svg": { fontSize: 30 },
                    }}
                >
                    {icon}
                </Box>
            </Grid>
            <Grid item sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, color: BLUE, fontSize: "1rem" }}>
                    {label}
                </Typography>
                <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: "2rem" }}>{value}</Typography>
            </Grid>
        </Grid>
    </Paper>
);

/**
 * การ์ดสรุปหน้า "ตั้งเบิกกองทุน" — จำนวนรายการรอวางบิล + จำนวนเงินรอวางบิล
 *
 * ยังไม่มี endpoint (ดู useFundDisbursementList.ts) ค่าที่เห็นจึงเป็น 0 เสมอวันนี้ — พอ BE พร้อม
 * ตัวเลขจะไหลมาจาก hook เดียวกับตาราง ไม่ต้องแก้ไฟล์นี้
 */
const FundDisbursementHeader = ({ totalCount, totalAmount, isLoading = false }: FundDisbursementHeaderProps) => {
    if (isLoading) {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={88} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={88} />
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <StatCard
                    icon={<AssignmentIcon />}
                    label="จำนวนรายการรอวางบิล"
                    value={`${numberWithCommas(totalCount, 0)} รายการ`}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <StatCard
                    icon={<PaymentsIcon />}
                    label="จำนวนเงินรอวางบิล"
                    value={`${numberWithCommas(totalAmount, 2)} บาท`}
                />
            </Grid>
        </Grid>
    );
};

export default FundDisbursementHeader;

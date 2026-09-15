import { Box, Grid, Typography } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { numberWithCommas } from "../../../../../functionHelpers";

type SummaryBoxProps = { label: string; value: number; color?: string };

const SummaryBox = ({ label, value, color = "#1565C0" }: SummaryBoxProps) => (
    <Box
        sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "12px 16px",
            textAlign: "center",
            height: "100%",
        }}
    >
        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color }}>{numberWithCommas(value)}</Typography>
    </Box>
);

type BillingExpenseSummaryCardProps = {
    totalClaimedAmount: number;
    totalDiscountAmount: number;
    totalNonCoveredAmount: number;
    netAmount: number;
    transferAmount: number;
};

/**
 * Step 2 : "สรุปยอดเงิน" — Read-only ทั้งหมด รวมยอดจาก `formik.values.expenses` (`useBillingExpenseHook`)
 *
 * "ยอดเงินโอน" ยังไม่ผ่านการตรวจสอบ Benefit จริง (PENDING_BE_FIELDS.benefitBreakdown) ค่าที่แสดงเป็นค่า
 * ประมาณจากยอดสุทธิหักส่วนลด SS ท้ายบิลเดิม (ถ้ามีจาก BE) ไม่ใช่ยอดที่ผ่าน Benefit แล้ว
 */
const BillingExpenseSummaryCard = ({
    totalClaimedAmount,
    totalDiscountAmount,
    totalNonCoveredAmount,
    netAmount,
    transferAmount,
}: BillingExpenseSummaryCardProps) => (
    <CustomPaper>
        <HeadingWithColor icon={<CalculateIcon sx={{ fontSize: 27 }} />} text="สรุปยอดเงิน" color="blue" />
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox label="ยอดเงินตามใบเสร็จรวม" value={totalClaimedAmount} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox label="ส่วนลดรวม" value={totalDiscountAmount} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox label="ยอดไม่คุ้มครองรวม" value={totalNonCoveredAmount} color="#B32615" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox label="ยอดเงินสุทธิ" value={netAmount} color="#178236" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox label="ยอดเงินโอน" value={transferAmount} color="#178236" />
            </Grid>
        </Grid>
    </CustomPaper>
);

export default BillingExpenseSummaryCard;

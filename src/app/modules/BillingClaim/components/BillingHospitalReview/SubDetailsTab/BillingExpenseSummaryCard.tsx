import { ReactNode } from "react";
import { Box, Grid, Typography } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { numberWithCommas } from "../../../../../functionHelpers";

/**
 * โทนสีต่อความหมายของยอด — ใช้ชุดสีเดิมของโปรเจค (สถานะ App : เขียว/เหลือง/แดง, header : น้ำเงินเข้ม)
 * `accent` = สีตัวเลข/ไอคอน, `tint` = พื้นวงกลมไอคอน
 */
const TONE = {
    blue: { accent: "#0D3D6B", tint: "#E3F2FD" },
    amber: { accent: "#a56e07", tint: "#FFF1CD" },
    red: { accent: "#B32615", tint: "#FFCFC9" },
    green: { accent: "#11734B", tint: "#D4EDBC" },
} as const;

type SummaryBoxProps = {
    label: string;
    value: number;
    icon: ReactNode;
    tone: keyof typeof TONE;
};

const SummaryBox = ({ label, value, icon, tone }: SummaryBoxProps) => {
    const { accent, tint } = TONE[tone];

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                height: "100%",
                p: "14px 16px",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "12px",
                bgcolor: "background.paper",
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: tint,
                    color: accent,
                    "& .MuiSvgIcon-root": { fontSize: 22 },
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    {label}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.3, color: accent }}>
                    {numberWithCommas(value)}
                </Typography>
            </Box>
        </Box>
    );
};

/** การ์ดยอดสุดท้าย ("ยอดเงินโอน") — พื้นไล่สีเดียวกับ header ผู้เอาประกัน ให้เด่นกว่ายอดอื่น */
const TransferBox = ({ value }: { value: number }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            height: "100%",
            p: "14px 16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0D3D6B 0%, #1E88C7 100%)",
            color: "#FFFFFF",
            boxShadow: 1,
        }}
    >
        <Box
            sx={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255, 255, 255, 0.18)",
                "& .MuiSvgIcon-root": { fontSize: 22 },
            }}
        >
            <PaymentsOutlinedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: "0.8rem", opacity: 0.85 }}>
                ยอดเงินโอน
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.3 }}>
                {numberWithCommas(value)}
            </Typography>
        </Box>
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
                <SummaryBox
                    label="ยอดเงินตามใบเสร็จรวม"
                    value={totalClaimedAmount}
                    icon={<ReceiptLongIcon />}
                    tone="blue"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox
                    label="ส่วนลดรวม"
                    value={totalDiscountAmount}
                    icon={<LocalOfferOutlinedIcon />}
                    tone="amber"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox
                    label="ยอดไม่คุ้มครองรวม"
                    value={totalNonCoveredAmount}
                    icon={<RemoveCircleOutlineIcon />}
                    tone="red"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
                <SummaryBox
                    label="ยอดเงินสุทธิ"
                    value={netAmount}
                    icon={<AccountBalanceWalletOutlinedIcon />}
                    tone="green"
                />
            </Grid>
            <Grid item xs={12} sm={12} md={2.4}>
                <TransferBox value={transferAmount} />
            </Grid>
        </Grid>
    </CustomPaper>
);

export default BillingExpenseSummaryCard;

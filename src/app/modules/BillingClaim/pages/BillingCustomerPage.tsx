import { Box, Paper, Typography } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";

/**
 * หน้า "วางบิลเคลม - เคลมลูกค้า" — Placeholder
 *
 * ตาม Handoff ข้อ 1 ขอบเขตงานนี้ไม่รวมเมนู "วางบิลเคลม > เคลมลูกค้า" (ยังเป็น
 * checkbox เลือกหลายรายการ + ยืนยันตั้งเบิก ตาม demo) จึงใส่ไว้แค่เป็นทางเข้าเมนูก่อน
 * รอ Spec แยกต่างหาก
 */
const BillingCustomerPage = () => {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 6,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
            }}
        >
            <ConstructionIcon sx={{ fontSize: 48, color: "#90A4AE" }} />
            <Typography variant="h6" fontWeight={700}>
                วางบิลเคลม - เคลมลูกค้า
            </Typography>
            <Box>อยู่ระหว่างพัฒนา</Box>
        </Paper>
    );
};

export default BillingCustomerPage;

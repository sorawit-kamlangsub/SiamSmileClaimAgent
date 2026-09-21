import { Box, Divider, Grid, Skeleton, Typography } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { GetStandardMedicalExpenseByCaseDtoResponse } from "../../../../../api/coreClaimApi.client";

const PRIMARY = "#0D5C9E";
const CARD_BORDER = "#D6E6F5";

const formatAmount = (value?: number) =>
    (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const IconBadge = ({ children }: { children: React.ReactNode }) => (
    <Box
        sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "#E3F0FB",
            color: PRIMARY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        }}
    >
        {children}
    </Box>
);

type DeathDisabilityExpenseSectionProps = {
    /** รายการจาก GetStandardMedicalExpenseByCase — 1 แถวต่อ 1 ความคุ้มครอง */
    items: GetStandardMedicalExpenseByCaseDtoResponse[];
    isLoading: boolean;
};

/** การ์ดความคุ้มครอง 1 รายการ: ชื่อความคุ้มครอง + วงเงินสูงสุด + จำนวนเงินที่ต้องการโอน (netCaseAmount) */
const ExpenseItemCard = ({ item, title }: { item: GetStandardMedicalExpenseByCaseDtoResponse; title: string }) => (
    <Box sx={{ mt: 2, p: 2.5, border: `1px solid ${CARD_BORDER}`, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconBadge>
                <VerifiedUserIcon />
            </IconBadge>
            <Box>
                <Typography color="text.secondary">{title}</Typography>
                <Typography fontWeight={700} color={PRIMARY}>
                    {item.descriptionTH || item.descriptionEN || "-"}
                </Typography>
            </Box>
        </Box>
        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
        <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={8}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1B7F3B" }}>
                    <AccountBalanceWalletIcon fontSize="small" sx={{ color: PRIMARY }} />
                    <Typography fontWeight={600}>
                        วงเงินสูงสุด {item.maximumLimit !== undefined ? item.maximumLimit.toLocaleString() : "-"} บาท
                    </Typography>
                </Box>
                <Typography color="text.secondary" mt={1}>
                    ยอดที่กรอกในหน้าแจ้งเคลม
                </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
                <Typography color="text.secondary" mb={1}>
                    จำนวนเงินที่ต้องการโอน
                </Typography>
                <Box
                    sx={{
                        px: 2,
                        py: 1.25,
                        border: `1px solid ${CARD_BORDER}`,
                        borderRadius: 2,
                        bgcolor: "#F5F9FD",
                        textAlign: "right",
                        fontWeight: 600,
                    }}
                >
                    {formatAmount(item.netCaseAmount)} บาท
                </Box>
            </Grid>
        </Grid>
    </Box>
);

/** Section "รายละเอียดค่าใช้จ่าย" (read-only) — การ์ดต่อความคุ้มครอง + ยอดเงินรวมทั้งหมด (ผลรวม netCaseAmount) */
const DeathDisabilityExpenseSection = ({ items, isLoading }: DeathDisabilityExpenseSectionProps) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.netCaseAmount ?? 0), 0);
    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />}
                text="รายละเอียดค่าใช้จ่าย"
                color="blue"
            />
            {isLoading && <Skeleton variant="rounded" sx={{ mt: 2, height: 160 }} />}
            {!isLoading && items.length === 0 && (
                <Typography color="text.secondary" textAlign="center" sx={{ mt: 2, py: 3 }}>
                    ไม่พบรายการค่าใช้จ่าย
                </Typography>
            )}
            {!isLoading &&
                items.map((item, index) => (
                    <ExpenseItemCard
                        key={item.caseItemId ?? item.standardMedicalExpenseId ?? index}
                        item={item}
                        // รายการแรก = ความคุ้มครองหลัก, รายการถัดไป = ความคุ้มครองเพิ่มเติม (ตามลำดับที่ API ส่งมา)
                        title={index === 0 ? "ความคุ้มครองหลัก" : "ความคุ้มครองเพิ่มเติม"}
                    />
                ))}
            <Box
                sx={{
                    mt: 2,
                    p: 2.5,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 3,
                    bgcolor: "#F0F6FD",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1.5,
                }}
            >
                <IconBadge>
                    <SummarizeIcon />
                </IconBadge>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={700}>ยอดเงินรวมทั้งหมด</Typography>
                    <Typography color="text.secondary">แสดงตามยอดที่กรอกในหน้าแจ้งเคลม</Typography>
                </Box>
                <Typography fontWeight={700} color={PRIMARY}>
                    THB {isLoading ? "-" : formatAmount(totalAmount)}
                </Typography>
            </Box>
        </CustomPaper>
    );
};

export default DeathDisabilityExpenseSection;

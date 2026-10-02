import { Box, Divider, Grid, Typography } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import {
    DISABILITY_COVERAGE_TYPE_ID,
    DeathDisabilityExpenseItem,
} from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityExpenseHook";

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
    /** รายการค่าใช้จ่าย (map จาก GetStandardMedicalExpenseByCase หรือ GetCaseDisabilityBenefitByCaseId) */
    items: DeathDisabilityExpenseItem[];
    isLoading: boolean;
    /** productTypeId ของกรมธรรม์ (PH = 6, PA = 26) */
    productTypeId: number | undefined;
    /** coverageTypeId ของเคลม (ทุพพลภาพ/สูญเสียอวัยวะ = 4) */
    coverageTypeId: number | undefined;
};

const PH_PRODUCT_TYPE_ID = 6;

/**
 * รายการที่แสดง + หัวการ์ด ตาม spec
 * - ทุพพลภาพ/สูญเสียอวัยวะ: ทุกรายการใช้หัว "ความคุ้มครอง"
 * - PH: แสดงเฉพาะความคุ้มครองหลัก (รายการแรก)
 * - PA: รายการแรก = ความคุ้มครองหลัก, รายการถัดไป = ความคุ้มครองเพิ่มเติม ตามที่ระบุตอนแจ้งเคลม
 * (ลำดับตามที่ API ส่งมา)
 */
const getDisplayItems = (
    items: DeathDisabilityExpenseItem[],
    productTypeId: number | undefined,
    coverageTypeId: number | undefined
) => {
    if (coverageTypeId === DISABILITY_COVERAGE_TYPE_ID) {
        return items.map((item) => ({ item, title: "ความคุ้มครอง" }));
    }
    const visibleItems = productTypeId === PH_PRODUCT_TYPE_ID ? items.slice(0, 1) : items;
    return visibleItems.map((item, index) => ({
        item,
        title: index === 0 ? "ความคุ้มครองหลัก" : "ความคุ้มครองเพิ่มเติม",
    }));
};

/** การ์ดความคุ้มครอง 1 รายการ: ชื่อความคุ้มครอง + วงเงินสูงสุด + จำนวนเงินที่ต้องการโอน (netCaseAmount) */
const ExpenseItemCard = ({ item, title }: { item: DeathDisabilityExpenseItem; title: string }) => (
    <Box sx={{ mt: 2, p: 2.5, border: `1px solid ${CARD_BORDER}`, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconBadge>
                <VerifiedUserIcon />
            </IconBadge>
            <Box>
                <Typography color="text.secondary">{title}</Typography>
                <Typography fontWeight={700} color={PRIMARY}>
                    {item.description || "-"}
                </Typography>
            </Box>
        </Box>
        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
        <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={8}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1B7F3B" }}>
                    <AccountBalanceWalletIcon fontSize="small" sx={{ color: PRIMARY }} />
                    <Typography fontWeight={600}>
                        วงเงินสูงสุด {item.maximumLimit != null ? item.maximumLimit.toLocaleString() : "0"} บาท
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

/** ยอดเงินรวมทั้งหมดของ section (ผลรวม netCaseAmount ของรายการที่แสดงจริง) — ใช้เป็นเพดานยอดโอนผู้รับผลประโยชน์ */
export const getExpenseTotalAmount = (
    items: DeathDisabilityExpenseItem[],
    productTypeId: number | undefined,
    coverageTypeId: number | undefined
) =>
    getDisplayItems(items, productTypeId, coverageTypeId).reduce((sum, { item }) => sum + (item.netCaseAmount ?? 0), 0);

/** Section "รายละเอียดค่าใช้จ่าย" (read-only) — การ์ดต่อความคุ้มครอง + ยอดเงินรวมทั้งหมด (ผลรวม netCaseAmount) */
const DeathDisabilityExpenseSection = ({
    items,
    isLoading,
    productTypeId,
    coverageTypeId,
}: DeathDisabilityExpenseSectionProps) => {
    const displayItems = getDisplayItems(items, productTypeId, coverageTypeId);
    const totalAmount = getExpenseTotalAmount(items, productTypeId, coverageTypeId);
    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />}
                text="รายละเอียดค่าใช้จ่าย"
                color="blue"
            />
            {!isLoading && displayItems.length === 0 && (
                <Typography color="text.secondary" textAlign="center" sx={{ mt: 2, py: 3 }}>
                    ไม่พบรายการค่าใช้จ่าย
                </Typography>
            )}
            {!isLoading &&
                displayItems.map(({ item, title }) => <ExpenseItemCard key={item.key} item={item} title={title} />)}
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

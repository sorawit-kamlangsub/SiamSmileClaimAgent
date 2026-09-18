import { Box, Divider, Grid, Typography } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { DeathDisabilityExpense } from "../mock/deathDisabilityConsiderMock";

const PRIMARY = "#0D5C9E";
const CARD_BORDER = "#D6E6F5";

const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

/** Section "รายละเอียดค่าใช้จ่าย" — ความคุ้มครองหลัก + วงเงิน + จำนวนเงินที่ต้องการโอน + ยอดเงินรวมทั้งหมด (read-only) */
const DeathDisabilityExpenseSection = ({ expense }: { expense: DeathDisabilityExpense }) => (
    <CustomPaper>
        <HeadingWithColor icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />} text="รายละเอียดค่าใช้จ่าย" color="blue" />
        <Box sx={{ mt: 2, p: 2.5, border: `1px solid ${CARD_BORDER}`, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <IconBadge>
                    <VerifiedUserIcon />
                </IconBadge>
                <Box>
                    <Typography color="text.secondary">ความคุ้มครองหลัก</Typography>
                    <Typography fontWeight={700} color={PRIMARY}>
                        {expense.coverageName}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ my: 2, borderStyle: "dashed" }} />
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1B7F3B" }}>
                        <AccountBalanceWalletIcon fontSize="small" sx={{ color: PRIMARY }} />
                        <Typography fontWeight={600}>วงเงินสูงสุด {expense.maxLimit.toLocaleString()} บาท</Typography>
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
                        {formatAmount(expense.requestedAmount)} บาท
                    </Box>
                </Grid>
            </Grid>
        </Box>
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
                THB {formatAmount(expense.requestedAmount)}
            </Typography>
        </Box>
    </CustomPaper>
);

export default DeathDisabilityExpenseSection;

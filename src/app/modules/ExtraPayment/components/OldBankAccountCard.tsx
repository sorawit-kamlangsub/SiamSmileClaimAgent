import React from "react";
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";
import { BankAccount } from "../store/ExtraPayment.types";
import { setBankLogo } from "../../../functionHelpers";

interface OldBankAccountCardProps {
    bankAccount: BankAccount;
}

// การ์ดแสดงบัญชีรับสินไหมเดิม (read-only) — อิงจากที่แจ้งเคลมครั้งแรก แก้ไขไม่ได้
export const OldBankAccountCard: React.FC<OldBankAccountCardProps> = ({ bankAccount }) => {
    const logoSrc = setBankLogo(bankAccount.bankId);

    return (
        <Card variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50", width: "100%" }}>
            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                    "&:last-child": { pb: 0 },
                    "&:first-child": { pt: 0 },
                }}
            >
                <Avatar
                    src={logoSrc ?? undefined}
                    variant="circular"
                    sx={{ width: 70, height: 70, bgcolor: logoSrc ? "transparent" : "#e3f2fd", flexShrink: 0 }}
                >
                    {!logoSrc && (
                        <Typography variant="caption" color="primary" fontWeight={700}>
                            {bankAccount.bankName?.slice(0, 2)}
                        </Typography>
                    )}
                </Avatar>
                <Box width="100%">
                    <Typography variant="body2" fontWeight={700} mb={0.5}>
                        บัญชีรับสินไหมเดิม
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        ความสัมพันธ์ :{" "}
                        <Typography component="span" variant="caption" color="primary" fontWeight={700}>
                            {bankAccount.bankAccountRelationTypeName}
                        </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        ธนาคาร :{" "}
                        <Typography component="span" variant="caption" color="primary" fontWeight={700}>
                            {bankAccount.bankName}
                        </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        เลขที่บัญชี :{" "}
                        <Typography component="span" variant="caption" color="primary" fontWeight={700}>
                            {bankAccount.bankAccountNo}
                        </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        ชื่อบัญชี :{" "}
                        <Typography component="span" variant="caption" color="primary" fontWeight={700}>
                            {bankAccount.bankAccountName}
                        </Typography>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

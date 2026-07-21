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
        <Card variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 0 } }}>
                <Avatar
                    src={logoSrc ?? undefined}
                    variant="circular"
                    sx={{ width: 48, height: 48, bgcolor: logoSrc ? "transparent" : "#e3f2fd" }}
                >
                    {!logoSrc && (
                        <Typography variant="caption" color="primary" fontWeight={700}>
                            {bankAccount.bankName?.slice(0, 2)}
                        </Typography>
                    )}
                </Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={700} mb={0.5}>
                        บัญชีรับสินไหมเดิม
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        ความสัมพันธ์ : {bankAccount.bankAccountRelationTypeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        ธนาคาร : {bankAccount.bankName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        เลขที่บัญชี : {bankAccount.bankAccountNo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        ชื่อบัญชี : {bankAccount.bankAccountName}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

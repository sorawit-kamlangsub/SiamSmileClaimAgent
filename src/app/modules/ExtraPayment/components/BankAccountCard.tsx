import React from "react";
import { Card, CardContent, Box, Typography, Chip, Avatar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BankAccount } from "../store/ExtraPayment.types";
import { setBankLogo } from "../../../functionHelpers";

interface BankCardProps {
    bank: BankAccount;
    selected: boolean;
    onSelect: () => void;
}

export const BankAccountCard: React.FC<BankCardProps> = ({ bank, selected, onSelect }) => {
    const logoSrc = setBankLogo(3);
    return (
        <Card
            variant="outlined"
            onClick={onSelect}
            sx={{
                cursor: "pointer",
                borderColor: selected ? "success.main" : "divider",
                borderWidth: selected ? 2 : 1,
                position: "relative",
                width: { lg: "93%", md: "100%" },
            }}
        >
            {selected && (
                <Chip
                    icon={<CheckCircleIcon fontSize="small" />}
                    label="บัญชีที่เลือก"
                    color="success"
                    size="small"
                    sx={{ position: "absolute", top: 8, right: 8, fontWeight: 700 }}
                />
            )}
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                    src={logoSrc ?? undefined}
                    variant="circular"
                    sx={{ width: 70, height: 70, bgcolor: logoSrc ? "transparent" : "#e3f2fd", flexShrink: 0 }}
                >
                    {!logoSrc && (
                        <Typography variant="caption" color="primary" fontWeight={700}>
                            {bank.bankName?.slice(0, 2)}
                        </Typography>
                    )}
                </Avatar>

                <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                        {bank.bankAccountName}
                    </Typography>
                    <Typography variant="body2" color="primary" mb={1} fontWeight={700}>
                        {bank.bankAccountNo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ประเภทผู้ติดต่อ&nbsp;
                    </Typography>
                    <Typography variant="caption" fontWeight={700}>
                        {bank.bankAccountRelationTypeName}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

import { Avatar, Box, Card, CardContent, IconButton, Radio, Typography } from "@mui/material";
import { setBankLogo } from "../../../../functionHelpers";
import { ClaimBankAccount } from "../../store/claimPHSlice";
import CloseIcon from "@mui/icons-material/Close";

interface BankCardProps {
    bank: ClaimBankAccount;
    selected: boolean;
    onSelect: () => void;
    onDelete?: () => void;
}

export const BankAccountCard: React.FC<BankCardProps> = ({ bank, selected, onSelect, onDelete }) => {
    const logoSrc = setBankLogo(bank.bankId);
    return (
        <Card
            variant="outlined"
            onClick={onSelect}
            sx={{
                mb: 1,
                cursor: "pointer",
                borderColor: selected ? "primary.main" : "divider",
                borderWidth: selected ? 2 : 1,
                transition: "border-color 0.2s",
                p: { xs: 0.75, sm: 1 },
                ml: { sm: 2 },
                maxWidth: { xs: "100%", lg: 450 },
                minHeight: { xs: 96, sm: 110 },
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {onDelete && (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 18,
                        height: 18,
                        color: "text.secondary",
                        p: 1.7,
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20, fontWeight: "bold" }} />
                </IconButton>
            )}
            <CardContent
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    py: 0.5,
                    px: { xs: 0.5, sm: 1 },
                    pr: { xs: 4, sm: 5 },
                    "&:last-child": { pb: 0.5 },
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "auto 52px minmax(0, 1fr)", sm: "auto 70px minmax(0, 1fr)" },
                        alignItems: "center",
                        gap: { xs: 1, sm: 2 },
                        width: "100%",
                        minWidth: 0,
                    }}
                >
                    <Radio
                        size="small"
                        checked={selected}
                        onChange={onSelect}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: { xs: 0.25, sm: 0.5 } }}
                    />
                    <Avatar
                        src={logoSrc ?? undefined}
                        variant="circular"
                        sx={{
                            width: { xs: 52, sm: 70 },
                            height: { xs: 52, sm: 70 },
                            bgcolor: logoSrc ? "transparent" : "#e3f2fd",
                            flexShrink: 0,
                        }}
                    >
                        {!logoSrc && (
                            <Typography variant="caption" color="primary" fontWeight={700}>
                                {bank.bankName?.slice(0, 2)}
                            </Typography>
                        )}
                    </Avatar>
                    <Box sx={{ minWidth: 0, width: "100%" }}>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                        >
                            {bank.bankAccountRelationTypeName}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                        >
                            {bank.bankName}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                        >
                            {bank.bankAccountNo}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                        >
                            {bank.bankAccountName}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

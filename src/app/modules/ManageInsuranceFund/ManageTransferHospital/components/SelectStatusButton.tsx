import { Box, Button, Typography } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export interface StatusPillOption {
    id: number | undefined;
    label: string;
}

export interface TransferListEmptyStateProps {
    statusOptions: StatusPillOption[];
    onSelectStatus: (id: number | undefined) => void;
}

const SelectStatusButton = ({ statusOptions, onSelectStatus }: TransferListEmptyStateProps) => {
    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                padding: "48px 24px",
                textAlign: "center",
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "16px",
                    backgroundColor: "#E3F2FD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                }}
            >
                <AccountBalanceWalletIcon sx={{ color: "#1565C0", fontSize: 36 }} />
            </Box>

            <Typography sx={{ fontWeight: 700, color: "#212121", fontSize: "1.05rem", marginBottom: "6px" }}>
                เลือกสถานะเพื่อจัดการรายการโอนเงิน
            </Typography>
            <Typography sx={{ color: "#78909C", fontSize: "0.9rem", marginBottom: "24px" }}>
                ติดตามตั้งแต่รายการเคลมรอสร้างกลุ่ม จบถึงผลการโอนและการส่งเอกสาร
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
                {statusOptions.map((option) => (
                    <Button
                        key={option.id}
                        variant="outlined"
                        onClick={() => onSelectStatus(option.id)}
                        sx={{
                            textTransform: "none",
                            borderRadius: "20px",
                            borderColor: "#90CAF9",
                            color: "#1565C0",
                            fontWeight: 600,
                            "&:hover": { borderColor: "#1565C0", backgroundColor: "#EAF4FC" },
                        }}
                    >
                        {option.label}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default SelectStatusButton;

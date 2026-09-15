import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { setBankLogo } from "../../../../../functionHelpers";

export interface ReceivingAccountCardProps {
    contactPerson: string;
    accountNo: string;
    accountName: string;
    addedDate: string;
    bankId: number | undefined;
}

const ReceivingAccountCard = ({
    contactPerson: contactType,
    accountNo,
    accountName,
    addedDate,
    bankId,
}: ReceivingAccountCardProps) => {
    const avatarBank = setBankLogo(bankId);
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "16px",
                border: "1.5px solid #1565C0",
                borderRadius: "10px",
                padding: "12px 20px",
                backgroundColor: "#FFFFFF",
                minWidth: "360px",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    transform: "scale(1.01)",
                    boxShadow: "0 6px 16px rgba(21, 101, 192, 0.25)",
                },
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>ประเภทผู้ติดต่อ: {contactType}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>
                    เลขที่บัญชี : <b>{accountNo}</b>
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>
                    ชื่อ : <b>{accountName}</b>
                </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#78909C", whiteSpace: "nowrap" }}>
                วันที่เพิ่มบัญชี : {`${addedDate ?? dayjs().format("DD/MM/YYYY")}`}
            </Typography>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: "50%",
                    backgroundColor: "#E3F2FD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* <AccountBalanceIcon sx={{ color: "#1565C0", fontSize: 20 }} /> */}
                <Box
                    component="img"
                    src={avatarBank}
                    alt={contactType}
                    sx={{ width: 24, height: 24, objectFit: "contain", borderRadius: "12px", scale: "1.4" }}
                />
            </Box>
        </Box>
    );
};

export default ReceivingAccountCard;

import { Box, Typography } from "@mui/material";
import { numberWithCommas } from "../../../../../../../functionHelpers";

export default function HighlightRow({
    icon,
    label,
    value,
    bg,
    border,
    valueColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    bg: string;
    border: string;
    valueColor: string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: bg,
                border: `1px solid ${border}`,
                borderRadius: "8px",
                px: 1.5,
                py: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {icon}
                <Typography sx={{ fontWeight: 600, color: "#424242", fontSize: "0.875rem" }}>{label}</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, color: valueColor }}>{numberWithCommas(value ?? 0)} บาท</Typography>
        </Box>
    );
}

import { Box, Typography } from "@mui/material";
import { numberWithCommas } from "../../../../../../../functionHelpers";

export default function SummaryBox({ label, value }: { label: string; value: number }) {
    return (
        <Box
            sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                p: 1.5,
            }}
        >
            <Typography sx={{ fontSize: "0.8rem", color: "#757575", mb: 0.5 }}>{label}</Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                <Typography sx={{ fontWeight: 700, color: "#1a237e", fontSize: "1.1rem" }}>
                    {numberWithCommas(value ?? 0)}
                </Typography>
                <Typography sx={{ fontWeight: 600, color: "#1a237e", fontSize: "0.9rem" }}>บาท</Typography>
            </Box>
        </Box>
    );
}

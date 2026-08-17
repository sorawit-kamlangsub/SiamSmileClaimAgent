import { Box, Typography } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

export interface HelpTipsCardProps {
    tips: React.ReactNode[];
}

const AutoTransferHint = ({ tips }: HelpTipsCardProps) => {
    return (
        <Box
            sx={{
                borderRadius: "12px",
                border: "1px dashed #BDBDBD",
                backgroundColor: "#FFFFFF",
                padding: "16px 20px",
                height: "100%",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LightbulbIcon sx={{ color: "#00569D", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: "#00569D" }}>ช่วยเหลือ</Typography>
            </Box>

            {tips.map((tip, index) => (
                <Typography
                    key={index}
                    sx={{
                        fontSize: "0.85rem",
                        color: "#00569D",
                        lineHeight: 1.7,
                        marginBottom: index < tips.length - 1 ? "10px" : 0,
                    }}
                >
                    - {tip}
                </Typography>
            ))}
        </Box>
    );
};

export default AutoTransferHint;

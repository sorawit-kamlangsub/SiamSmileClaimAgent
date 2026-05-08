import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

type ColorKey = "blue" | "green" | "red" | "yellow" | "pink" | "orange";

type HeadingWithColorProps = {
    text?: string;
    color?: ColorKey;
    button?: ReactNode | undefined;
};

const backgroundColor: Record<ColorKey, string> = {
    blue: "#e8f0fb",
    green: "#F7FEE7",
    red: "#FEF2F2",
    yellow: "#fdf6e3",
    pink: "#FCE7F3",
    orange: "#FFF1CD",
};

export const colorLine: Record<ColorKey, string> = {
    blue: "#1a5da8",
    green: "#05DF72",
    red: "#FF6467",
    yellow: "#c8a415",
    pink: "#FB64B6",
    orange: "#FF8904",
};

export const HeadingWithColor = ({ text, color = "blue", button, ...sx }: HeadingWithColorProps) => {
    return (
        <Box
            sx={{
                bgcolor: backgroundColor[color],
                borderLeft: "4px solid " + colorLine[color],
                px: 2,
                py: 1,
                mb: 2,
                borderRadius: "0 4px 4px 0",
                justifyContent: "space-between",
                display: "flex",
                alignItems: "center",
                ...sx,
            }}
        >
            <Typography variant="subtitle1" fontWeight={700} color={colorLine[color]}>
                {text}
            </Typography>
            {button && <Box>{button}</Box>}
        </Box>
    );
};

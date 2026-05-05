import { Box, Typography } from "@mui/material";

type ColorKey = "blue" | "green" | "red" | "yellow" | "pink" | "orange";

type HeadingWithColorProps = {
    text?: string;
    color?: ColorKey;
};

const backgroundColor: Record<ColorKey, string> = {
    blue: "#e8f0fb",
    green: "#F7FEE7",
    red: "#FEF2F2",
    yellow: "#FEF9C2",
    pink: "#FCE7F3",
    orange: "#FFF1CD",
};

export const colorLine: Record<ColorKey, string> = {
    blue: "#1a5da8",
    green: "#05DF72",
    red: "#FF6467",
    yellow: "#FDC745",
    pink: "#FB64B6",
    orange: "#FF8904",
};

export const HeadingWithColor = ({ text, color = "blue" }: HeadingWithColorProps) => {
    return (
        // <Grid
        //     container
        //     sx={{
        //         backgroundColor: backgroundColor[color],
        //         padding: "0.5rem",
        //         marginBottom: "1rem",
        //         borderLeft: "5px solid " + colorLine[color],
        //     }}
        // >
        //     <Grid item>
        //         <Typography fontWeight="bold" fontSize={18}>
        //             {text}
        //         </Typography>
        //     </Grid>
        // </Grid>
        <Box
            sx={{
                bgcolor: backgroundColor[color],
                borderLeft: "4px solid " + colorLine[color],
                px: 2,
                py: 1,
                mb: 2,
                borderRadius: "0 4px 4px 0",
            }}
        >
            <Typography variant="subtitle1" fontWeight={700} color={colorLine[color]}>
                {text}
            </Typography>
        </Box>
    );
};

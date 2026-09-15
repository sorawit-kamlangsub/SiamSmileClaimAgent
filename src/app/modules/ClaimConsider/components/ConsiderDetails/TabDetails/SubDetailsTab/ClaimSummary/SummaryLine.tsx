import { Box, Divider, Typography } from "@mui/material";

type SummaryLineProps = {
    label: string;
    value: string;
    bold?: boolean;
    color?: string;
    bg?: string;
    noDivider?: boolean;
};

const SummaryLine = ({ label, value, bold = false, color, bg, noDivider = false }: SummaryLineProps) => (
    <>
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py={0.75}
            px={1.5}
            sx={{ bgcolor: bg ?? "transparent" }}
        >
            <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color ?? "text.primary"}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={bold ? 700 : 400}
                color={color ?? "text.primary"}
                minWidth={110}
                textAlign="right"
            >
                {value}
            </Typography>
        </Box>
        {!noDivider && <Divider />}
    </>
);

export default SummaryLine;

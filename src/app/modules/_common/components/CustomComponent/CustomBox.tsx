import { Box } from "@mui/material";

type CustomBoxProps = {
    children: React.ReactNode;
    sx?: Record<string, any>;
};

const CustomBox = ({ children, sx }: CustomBoxProps) => {
    return (
        <Box
            sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2.5,
                bgcolor: "#fff",
                mb: 1,
                ...sx,
            }}
        >
            {children}
        </Box>
    );
};

export default CustomBox;

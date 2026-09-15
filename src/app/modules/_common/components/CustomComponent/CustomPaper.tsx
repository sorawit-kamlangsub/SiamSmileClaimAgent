import { Paper } from "@mui/material";

type CustomPaperProps = {
    children: React.ReactNode;
    sx?: Record<string, any>;
};

const CustomPaper = ({ children, sx }: CustomPaperProps) => {
    return (
        <Paper sx={{ p: "1.5rem", lineHeight: "50px", mb: "1.5rem",  ...sx }} variant="outlined">
            {children}
        </Paper>
    );
};

export default CustomPaper;

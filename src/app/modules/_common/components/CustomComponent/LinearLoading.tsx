import { LinearProgress, Paper } from "@mui/material";

type LinearLoadingProps = {
    children?: React.ReactNode;
    isLoading?: boolean;
    sx?: Record<string, any>;
};

const LinearLoading = ({ children, isLoading, sx }: LinearLoadingProps) => {
    return (
        <>
            {isLoading ? (
                <Paper sx={{ p: "1.5rem", lineHeight: "50px", mb: "1.5rem", ...sx }} variant="outlined">
                    {" "}
                    <LinearProgress sx={{ height: "5px" }} />{" "}
                </Paper>
            ) : (
                children || <></>
            )}
        </>
    );
};

export default LinearLoading;

import { Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

export const CustomTypographyWithGrid = ({ label, value }: { label: string; value?: ReactNode | undefined }) => {
    const detailStyle: React.CSSProperties = { fontWeight: "bold", color: "#007AC1" };

    if (typeof value == "string" || typeof value == "undefined")
        return (
            <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary">{label} :</Typography>
                {value != undefined && value.trim() !== "" ? (
                    <Typography style={detailStyle}>{value}</Typography>
                ) : (
                    <Typography style={detailStyle}>-</Typography>
                )}
            </Grid>
        );

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Typography color="text.secondary">{label} :</Typography>
            {value}
        </Grid>
    );
};

import { Grid, GridProps, Typography } from "@mui/material";
import { ReactNode } from "react";

type CustomDisplayTextProps = {
    label: string;
    value?: ReactNode | undefined;
    xs?: GridProps["xs"];
    sm?: GridProps["sm"];
    md?: GridProps["md"];
    lg?: GridProps["lg"];
};

export const CustomDisplayText = ({ label, value, xs = 12, sm = 6, md = 3, lg }: CustomDisplayTextProps) => {
    const detailStyle: React.CSSProperties = { fontWeight: "bold", color: "#007AC1" };

    if (typeof value === "string" || typeof value === "undefined") {
        const displayValue = value !== undefined && value.trim() !== "" ? value : "-";

        return (
            <Grid item xs={xs} sm={sm} md={md} lg={lg}>
                <Typography>{label} :</Typography>
                <Typography style={detailStyle}>{displayValue}</Typography>
            </Grid>
        );
    }

    return (
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
            <Typography>{label} :</Typography>
            {value}
        </Grid>
    );
};

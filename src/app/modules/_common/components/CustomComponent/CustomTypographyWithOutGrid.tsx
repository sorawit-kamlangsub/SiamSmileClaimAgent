import { Typography } from "@mui/material";
import { ReactNode } from "react";

type CustomTypographyWithLabelProps = {
    label: string | undefined;
    value?: ReactNode | undefined;
    color?: string | undefined;
};

export const CustomTypographyWithOutGrid = ({ label, value, color = "#007AC1" }: CustomTypographyWithLabelProps) => {
    const detailStyle: React.CSSProperties = { fontWeight: "bold", color: color, whiteSpace: "pre-wrap" };

    if (typeof value == "string" || typeof value == "undefined")
        return (
            <>
                <Typography>{label} :</Typography>
                {value != undefined && value.trim() !== "" ? (
                    <Typography style={detailStyle}>{value}</Typography>
                ) : (
                    <Typography style={detailStyle}>-</Typography>
                )}
            </>
        );

    return (
        <>
            <Typography>{label} :</Typography>
            <Typography>{value}</Typography>
        </>
    );
};

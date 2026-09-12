import { Box, Typography } from "@mui/material";
import React from "react";

export type CardClaimInfoProps = {
    icon: React.ReactNode;
    label: string;
    value: string | number | undefined;
    iconColor?: string;
    iconBgColor?: string;
};

const CardClaimInfo = ({ icon, label, value, iconColor = "#0B7FC7", iconBgColor = "#EAF5FF" }: CardClaimInfoProps) => {
    return (
        <Box
            sx={{
                borderRadius: 4,
                backgroundColor: "rgba(255, 255, 255, 1)",
                padding: "16px 20px",
                position: "relative",
                overflow: "hidden",
                width: "100%",
                boxShadow: 1,
                display: "flex",
                alignItems: "center",
                gap: "12px",
            }}
        >
            <Box
                sx={{
                    width: 52,
                    height: 52,
                    minWidth: 52,
                    borderRadius: 4,
                    backgroundColor: iconBgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {React.isValidElement(icon)
                    ? React.cloneElement(icon as React.ReactElement, {
                          sx: { color: iconColor, fontSize: 28 },
                      })
                    : icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#757575" }}>{label}</Typography>
                <Typography
                    sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0068B0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {value ?? "-"}
                </Typography>
            </Box>
        </Box>
    );
};

export default CardClaimInfo;

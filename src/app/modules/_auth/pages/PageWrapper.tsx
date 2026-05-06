import { Divider, Paper, Typography } from "@mui/material";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { VITE_BASE_URL } from "../../../../Const";

export type PageWrapperProps = {
    title: string;
    children: React.ReactNode;
    disableBack?: boolean;
};

const PageWrapper = ({ title, children, disableBack = false }: PageWrapperProps) => {
    const { pathname } = useLocation();
    const pathCount = pathname.split("/").length;
    const pathWithoutLast = pathname.split("/").slice(0, -1).join("/");

    return (
        <Paper
            sx={(theme) => ({
                position: "relative",
                p: 3,
                mb: 3,
                [theme.breakpoints.down("md")]: {
                    m: -3,
                    p: 2,
                    mb: 2,
                },
            })}
        >
            {pathCount > 2 && !disableBack && (
                <Link to={VITE_BASE_URL + `${pathWithoutLast}`} style={{ float: "right" }}>
                    Back
                </Link>
            )}
            <Typography variant="h5">{title}</Typography>
            <Divider sx={{ my: 2 }} />
            {children}
        </Paper>
    );
};

export default PageWrapper;

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, LinearProgress, LinearProgressProps, Skeleton } from "@mui/material";
import React from "react";

type LoadingPlaceHolderProps = {
    children: React.ReactNode;
    isLoading: boolean;
    height?: number;
    isError?: boolean;
    error?: string;
    isEmpty?: boolean;
    emptyMessage?: string;
} & LinearProgressProps;

const LoadingPlaceHolder = ({
    children,
    isLoading,
    height = 300,
    isError = false,
    error = "Unknown Error",
    isEmpty = false,
    emptyMessage = "Data is not available",
    ...linearProgressProps
}: LoadingPlaceHolderProps) => {
    if (isLoading) {
        return (
            <>
                <LinearProgress {...linearProgressProps} />
                <Skeleton variant="rectangular" width="100%" height={height} />
            </>
        );
    }

    if (isError) {
        return (
            <Box
                sx={(theme) => ({
                    p: 3,
                    backgroundColor: theme.palette.background.default,
                    height: height,
                    "& svg": { color: theme.palette.error.main },
                })}
                justifyContent="center"
                alignItems="center"
                display="flex"
                flexDirection="column"
            >
                <FontAwesomeIcon icon="exclamation-triangle" size="4x" />
                <br />
                Error : {error}
            </Box>
        );
    }

    if (isEmpty) {
        return (
            <Box
                sx={(theme) => ({
                    p: 3,
                    backgroundColor: theme.palette.background.default,
                    height: height,
                    "& svg": { color: theme.palette.primary.main },
                })}
                justifyContent="center"
                alignItems="center"
                display="flex"
                flexDirection="column"
            >
                <FontAwesomeIcon icon="info-circle" size="4x" />
                <br />
                {emptyMessage}
            </Box>
        );
    }

    return <>{children}</>;
};

export default LoadingPlaceHolder;

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface NoticePageProps {
    title: string;
    body: string;
    isRedirect?: boolean;
    redirectTo?: string;
    timeout?: number;
}

const NoticePage = ({ title, body, isRedirect = false, redirectTo = "/", timeout = 5 }: NoticePageProps) => {
    const navigate = useNavigate();
    const [secondsRemaining, setSecondsRemaining] = useState(timeout);

    useEffect(() => {
        if (isRedirect) {
            const intervalId = setInterval(() => {
                setSecondsRemaining((prevSeconds) => prevSeconds - 1);
            }, 1000);

            const timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                navigate(redirectTo);
            }, timeout * 1000);

            return () => {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
        }
    }, [isRedirect]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1">
                {isRedirect ? `${body} (Redirecting in ${secondsRemaining} seconds...)` : body}
            </Typography>
        </Box>
    );
};

export default NoticePage;

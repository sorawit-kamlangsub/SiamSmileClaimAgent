import { Box, Grid } from "@mui/material";
import BackgroundM from "../../../../../public/BackgroundM.png";
import { useEffect } from "react";
import HeaderSurvey from "../components/HeaderSurvey";
import HeaderDetailSurveyBox from "../components/HeaderDetailSurveyBox";

const SurveyPage = () => {
    useEffect(() => {
        const prevHtml = document.documentElement.style.overflow;
        const prevBody = document.body.style.overflow;
        const isMobile = window.innerWidth < 600;
        if (!isMobile) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.documentElement.style.overflow = prevHtml;
            document.body.style.overflow = prevBody;
        };
    }, []);

    return (
        <Box
            sx={(theme) => ({
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100vh",
                zIndex: theme.zIndex.drawer + 2,
                backgroundImage: `url(${BackgroundM})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                margin: 0,
                padding: 3,

                boxSizing: "border-box",
                overflow: { xs: "auto", sm: "auto", md: "hidden" },
            })}
        >
            <Grid container>
                <Box>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mx: 2, pb: 7 }}>
                        <HeaderSurvey />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 10 }}>
                        <HeaderDetailSurveyBox />
                    </Grid>
                </Box>
            </Grid>
        </Box>
    );
};

export default SurveyPage;

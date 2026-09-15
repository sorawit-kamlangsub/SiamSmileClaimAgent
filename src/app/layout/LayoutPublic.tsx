import { CssBaseline, Fab, Icon, ThemeProvider, Zoom, styled, useScrollTrigger } from "@mui/material";
import React from "react";
import { Outlet, useMatches } from "react-router-dom";
import { useAppSelector } from "../../redux";
import { ASideMenuList, RouteHandleType } from "../routes";
import { AllAppsDialog, ResKeyUpdator, TitleAppBar, VersionChecker } from "./components";
import { selectLayout } from "./layoutSlice";
import theme from "./theme";

const LayoutContainer = styled("div")({
    display: "flex",
    width: "100%",
});

const LayoutContentContainer = styled("div")(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: `calc(${theme.spacing(3)} + 96px)`,
    overflowX: "hidden",
}));

const ScrollTopDiv = styled("div")(({ theme }) => ({
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
}));

const ScrollTop = ({ children }: { children: React.ReactNode }) => {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = () => {
        window.scrollTo(0, 0);
    };

    return (
        <Zoom in={trigger}>
            <ScrollTopDiv onClick={handleClick} role="presentation">
                {children}
            </ScrollTopDiv>
        </Zoom>
    );
};

const LayoutPublic = () => {
    const selectedTheme = theme[0];
    const { drawerOpen } = useAppSelector(selectLayout);
    const matches = useMatches();

    const matchHandle = matches[matches.length - 1].handle as RouteHandleType;

    const hideAppBar = matchHandle.hideAppBar ?? false;
    const hideAsideMenu = matchHandle.hideAsideMenu ?? false;

    return (
        <ThemeProvider theme={selectedTheme}>
            <LayoutContainer>
                <CssBaseline />
                <ResKeyUpdator />
                <VersionChecker />
                {!hideAppBar && <TitleAppBar />}
                {!hideAsideMenu && <ASideMenuList />}
                <LayoutContentContainer
                    style={{
                        marginLeft: !hideAsideMenu && drawerOpen ? selectedTheme.drawerWidth : 0,
                        paddingTop: hideAppBar ? selectedTheme.spacing(3) : undefined,
                    }}
                >
                    <a id="back-to-top-anchor" />
                    <Outlet />
                    <ScrollTop>
                        <Fab color="primary" size="small" aria-label="scroll back to top">
                            <Icon>keyboard_arrow_up</Icon>
                        </Fab>
                    </ScrollTop>
                    <AllAppsDialog />
                </LayoutContentContainer>
            </LayoutContainer>
        </ThemeProvider>
    );
};

export default LayoutPublic;

import { CssBaseline, Fab, Icon, ThemeProvider, Zoom, styled, useScrollTrigger } from "@mui/material";
import React from "react";
import { Outlet, useMatches, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux";
import { checkPermissions, useAuth } from "../modules/_auth";
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

const Layout = () => {
    const selectedTheme = theme[0];
    const { drawerOpen } = useAppSelector(selectLayout);
    const matches = useMatches();
    const navigate = useNavigate();
    const { isAuthenticated, permissions } = useAuth();

    if (!isAuthenticated) {
        return;
    }

    const matchHandle = matches[matches.length - 1].handle as RouteHandleType;

    if (matchHandle.permissions) {
        const hasPermission = checkPermissions(permissions, matchHandle.permissions, matchHandle.condition);

        if (!hasPermission) {
            navigate("/unauthorized");

            return;
        }
    }

    return (
        <ThemeProvider theme={selectedTheme}>
            <LayoutContainer>
                <CssBaseline />
                <ResKeyUpdator />
                <VersionChecker />
                <TitleAppBar />
                <ASideMenuList />
                <LayoutContentContainer
                    style={{
                        marginLeft: drawerOpen ? selectedTheme.drawerWidth : 0,
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

export default Layout;

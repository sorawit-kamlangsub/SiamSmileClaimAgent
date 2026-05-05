import {
    AppBar,
    Breadcrumbs,
    Divider,
    Grid,
    Icon,
    IconButton,
    Slide,
    Stack,
    Toolbar,
    Typography,
    styled,
    useScrollTrigger,
} from "@mui/material";
import React from "react";
import { Link, useLocation, useMatches } from "react-router-dom";
import { UserMenu } from ".";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { RouteHandleType } from "../../routes";
import { setDrawerOpen } from "../layoutSlice";

const TitleAppToolbar = styled(Toolbar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

const TitleAppIconButton = styled(IconButton)(({ theme }) => ({
    marginRight: theme.spacing(2),
}));

const TitleAppPageTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontSize: "1.2rem",
}));

type HideOnScrollProps = {
    children: React.ReactNode;
    windows?: Window;
};

const HideOnScroll = ({ children, windows }: HideOnScrollProps) => {
    const trigger = useScrollTrigger({ target: windows ?? undefined });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            <div style={{ display: trigger ? "none" : "block" }}>{children}</div>
        </Slide>
    );
};

const StyledBreadcrumbIcon = styled(Icon)(({ theme }) => ({
    marginRight: theme.spacing(1),
    fontSize: "1.25rem",
}));

const Breadcrumb = () => {
    const location = useLocation();
    const matches = useMatches();

    const crumbs = matches.filter((match) => !match.pathname.endsWith("/"));

    return (
        <TitleAppToolbar variant="dense">
            <Breadcrumbs aria-label="breadcrumb">
                {crumbs.map((crumb, index) => {
                    const handle = crumb.handle as RouteHandleType;

                    let title = handle.title;
                    if (handle.getTitle && crumb.data) title = handle.getTitle(crumb.data);

                    return index === crumbs.length - 1 ? (
                        <Typography color="textPrimary" key={crumb.pathname}>
                            {handle.icon && <StyledBreadcrumbIcon>{handle.icon}</StyledBreadcrumbIcon>}
                            {title}
                        </Typography>
                    ) : (
                        <Link color="inherit" to={crumb.pathname} key={crumb.pathname}>
                            {handle.icon && <StyledBreadcrumbIcon>{handle.icon}</StyledBreadcrumbIcon>}
                            {title}
                        </Link>
                    );
                })}
                {location.pathname === "/" && (
                    <Typography color="textPrimary" key={location.pathname}>
                        <Stack direction={"row"}>
                            <StyledBreadcrumbIcon>home</StyledBreadcrumbIcon>
                            Home
                        </Stack>
                    </Typography>
                )}
            </Breadcrumbs>
        </TitleAppToolbar>
    );
};

const TitleAppBar = () => {
    const dispatch = useAppDispatch();

    const layoutReducer = useAppSelector((state) => state.layout);

    const matches = useMatches();
    const crumbs = matches.filter((match) => !match.pathname.endsWith("/"));

    const handleDrawerToggle = () => {
        dispatch(setDrawerOpen(!layoutReducer.drawerOpen));
    };

    const HeaderBar = styled(AppBar)(({ theme }) => ({
        width: `calc(100% - ${layoutReducer.drawerOpen ? theme.drawerWidth : 0}px)`,
        left: layoutReducer.drawerOpen ? theme.drawerWidth : 0,
        transition: theme.transitions.create(["left"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
        }),
    }));

    let pageTitle = "Home";

    if (crumbs.length > 0) {
        const handle = crumbs[crumbs.length - 1].handle as RouteHandleType;

        if (handle.getTitle && crumbs[crumbs.length - 1].data) {
            pageTitle = handle.getTitle(crumbs[crumbs.length - 1].data);
        } else {
            pageTitle = handle.title;
        }
    }

    return (
        <HeaderBar position="fixed" color="default">
            <TitleAppToolbar variant="dense">
                <Grid container direction="row" wrap="nowrap">
                    <Grid container item alignItems="center" wrap="nowrap">
                        <TitleAppIconButton edge="start" onClick={handleDrawerToggle}>
                            <Icon>menu</Icon>
                        </TitleAppIconButton>
                        <TitleAppPageTitle color="primary">{pageTitle}</TitleAppPageTitle>
                    </Grid>
                    <Grid container item justifyContent="flex-end" wrap="nowrap">
                        <UserMenu />
                    </Grid>
                </Grid>
            </TitleAppToolbar>
            <HideOnScroll>
                <Divider light />
                <Breadcrumb />
            </HideOnScroll>
        </HeaderBar>
    );
};

export default TitleAppBar;

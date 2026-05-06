import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Icon, IconButton, ListItem, ListItemText, Menu, TextField, Typography, styled } from "@mui/material";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { selectLayout, setAllAppDialogOpen, setRecentUsedMenu } from "..";
import { useAppDispatch, useAppSelector } from "../../../redux";
import { useAppMenuLinksFilter } from "../menuApi";

const MenuContainer = styled(Menu)(({ theme }) => ({
    "& .menu-container": {
        margin: `0 ${theme.spacing(1)}`,
        "& .fa-sm": {
            marginRight: theme.spacing(1),
        },
        "& .MuiListItem-root": {
            margin: "0",
            padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
            borderRadius: theme.shape.borderRadius,
            "&:hover": {
                textDecoration: "none",
                backgroundColor: theme.palette.background.default,
            },
        },
        "& .MuiListItemText-root": {
            margin: 0,
        },
        "& .MuiTypography-root": {
            fontSize: theme.typography.caption.fontSize,
            "&.MuiListItemText-secondary": {
                fontSize: `calc(${theme.typography.caption.fontSize} * 0.8)`,
            },
            [theme.breakpoints.down("sm")]: {
                fontSize: `calc(${theme.typography.caption.fontSize} * 1.2)`,
                "&.MuiListItemText-secondary": {
                    fontSize: `calc(${theme.typography.caption.fontSize})`,
                },
            },
        },
        "& #app-menu-search": {
            margin: 0,
            fontSize: theme.typography.caption.fontSize,
            padding: theme.spacing(0.5),
            [theme.breakpoints.down("sm")]: {
                fontSize: `calc(${theme.typography.caption.fontSize} * 1.2)`,
            },
        },
    },
}));

const AppMenu = () => {
    const dispatch = useAppDispatch();
    const { recentUsedMenu } = useAppSelector(selectLayout);

    // Menu button
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSearch("");
    };

    const handleAllAppOpen = () => {
        dispatch(setAllAppDialogOpen(true));
        handleClose();
    };

    // Menu data
    const [search, setSearch] = React.useState<string>("");
    const { data, isLoading } = useAppMenuLinksFilter(search, recentUsedMenu);

    const Menues = () =>
        useMemo(() => {
            if (data?.length === 0)
                return (
                    <Typography component="div" variant="caption" align="center" sx={{ my: 2 }}>
                        ไม่พบเมนู
                    </Typography>
                );

            return (
                !isLoading &&
                data?.map((link) => {
                    if (!link) return null;
                    const { linkId, linkIconFA6, linkURL, linkTitle, linkDescription } = link;
                    const icon = linkIconFA6.split(" ");

                    return (
                        <ListItem
                            key={linkId}
                            component={Link}
                            to={linkURL}
                            target="_blank"
                            onClick={() => dispatch(setRecentUsedMenu(linkId))}
                        >
                            <FontAwesomeIcon icon={icon as any} size="sm" style={{ width: 20 }} />
                            <ListItemText primary={linkTitle} secondary={linkDescription} />
                        </ListItem>
                    );
                })
            );
        }, [search, data, recentUsedMenu]);

    return (
        <>
            <IconButton color="secondary" onClick={handleMenu}>
                <Icon>apps</Icon>
            </IconButton>
            <MenuContainer
                id="app-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                open={open}
                onClose={handleClose}
            >
                <div className="menu-container">
                    <TextField
                        id="app-menu-search"
                        fullWidth
                        placeholder="ค้นหา App ที่ต้องการ"
                        variant="outlined"
                        size="small"
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        value={search}
                        autoFocus
                    />
                    <Typography variant="caption">Apps</Typography>
                    <Menues />
                    <Button variant="text" size="small" onClick={handleAllAppOpen}>
                        ดูทั้งหมด
                    </Button>
                </div>
            </MenuContainer>
        </>
    );
};

export default AppMenu;

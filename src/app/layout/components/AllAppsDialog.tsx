import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ExpandMore } from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Icon,
    IconButton,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { selectLayout, setAllAppDialogOpen, setRecentUsedMenu } from "..";
import { useAppDispatch, useAppSelector } from "../../../redux";
import { MenuProps, useAppMenuFilter } from "../menuApi";

const AllAppsDialog = () => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

    const intitialState = {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: true,
        7: true,
        8: true,
        9: true,
        10: true,
        11: true,
        12: true,
        13: true,
        14: true,
        15: true,
    };

    const [expanded, setExpanded] = useState<{ [key: number]: boolean }>(intitialState);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useAppMenuFilter(search);

    const { allAppDialogOpen } = useAppSelector(selectLayout);

    const handleClose = () => {
        dispatch(setAllAppDialogOpen(false));
        setExpanded(intitialState);
        setSearch("");
    };

    const handleLinkClick = (link: MenuProps) => {
        dispatch(setRecentUsedMenu(link.linkId));
        dispatch(setAllAppDialogOpen(false));
        setExpanded(intitialState);
    };

    const handleOpen = (index: number) => {
        setExpanded({ ...expanded, [index]: !expanded[index] });
    };

    return (
        <Dialog fullScreen={fullScreen} open={allAppDialogOpen} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle id="responsive-dialog-title">
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid
                        item
                        sx={{
                            [theme.breakpoints.down("md")]: {
                                display: "none",
                            },
                        }}
                    >
                        <Typography variant="h6">All Apps</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            id="app-menu-search"
                            placeholder="ค้นหา App ที่ต้องการ"
                            variant="outlined"
                            fullWidth
                            sx={{
                                input: {
                                    margin: 0,
                                    padding: theme.spacing(0.5),
                                    minWidth: 280,
                                    [theme.breakpoints.down("sm")]: {
                                        fontSize: `calc(${theme.typography.caption.fontSize} * 1.2)`,
                                    },
                                },
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            autoFocus
                        />
                    </Grid>
                    <Grid item style={{ textAlign: "right" }}>
                        <IconButton onClick={handleClose}>
                            <Icon>close</Icon>
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {data?.length === 0 && (
                    <Typography component="div" variant="caption" align="center" sx={{ my: 2 }}>
                        ไม่พบเมนู
                    </Typography>
                )}
                {!isLoading &&
                    data &&
                    data.map((group) => {
                        const { linkGroupId: menuId, linkGroupName: menuName } = group;
                        const isExpanded = expanded[menuId];

                        return (
                            <Accordion
                                key={menuId}
                                expanded={isExpanded}
                                placeholder="menu-group"
                                disableGutters
                                onChange={() => handleOpen(group.linkGroupId)}
                                sx={{
                                    boxShadow: theme.shadows[4],
                                    "& .MuiAccordionSummary-root": {
                                        minHeight: "32px !important",
                                    },
                                    "& .MuiAccordionSummary-content": {
                                        my: 1.5,
                                    },
                                    "& .MuiAccordionDetails-root": {
                                        padding: 1,
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    aria-controls={`menu-${menuId}-links`}
                                    id={`menu-${menuId}-group`}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={(theme) => ({
                                            fontSize: theme.typography.body1,
                                        })}
                                    >
                                        {menuName}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container>
                                        {group.links?.map((link) => {
                                            const { linkTitle, linkDescription, linkIconFA6, linkURL, linkId } = link;
                                            const icon = linkIconFA6.split(" ");

                                            return (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                    md={4}
                                                    component={Link}
                                                    to={linkURL}
                                                    target="_blank"
                                                    onClick={() => handleLinkClick(link)}
                                                    key={linkId}
                                                    sx={(theme) => ({
                                                        padding: theme.spacing(1),
                                                        borderRadius: theme.shape.borderRadius,
                                                        "&:hover": {
                                                            backgroundColor: theme.palette.action.hover,
                                                            textDecoration: "none",
                                                        },
                                                    })}
                                                >
                                                    <Grid container spacing={1} alignItems="center">
                                                        <Grid item xs={3} textAlign="center">
                                                            <FontAwesomeIcon icon={icon as any} size="2x" />
                                                        </Grid>
                                                        <Grid item xs={9}>
                                                            <Typography variant="body1">{linkTitle}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {linkDescription}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
            </DialogContent>
        </Dialog>
    );
};

export default AllAppsDialog;

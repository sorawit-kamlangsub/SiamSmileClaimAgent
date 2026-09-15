import { Palette, PaletteColor, Theme, createTheme } from "@mui/material";
import "./theme.d";

export const defaultTheme = createTheme({
    drawerWidth: 240,
    palette: {
        common: {
            black: "#212121",
            white: "#E2F1F8",
        },
        primary: {
            main: "#007AC1",
            light: "#67DAff",
            dark: "#03A9F4",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#01579B",
            light: "#4F83CC",
            dark: "#002F6C",
            contrastText: "#FFFFFF",
        },
        submit: {
            main: "#388E3C",
            light: "#00600f",
            dark: "#6ABF69",
            contrastText: "#FFFFFF",
        },
        success: {
            main: "#388E3C",
            light: "#6ABF69",
            dark: "#00600f",
            contrastText: "#FFFFFF",
        },
        unapprove: {
            main: "#BF360C",
            light: "#F9683A",
            dark: "#870000",
            contrastText: "#FFFFFF",
        },
        error: {
            main: "#BF360C",
            light: "#F9683A",
            dark: "#870000",
            contrastText: "#FFFFFF",
        },
        edit: {
            main: "#fbc02d",
            light: "#FFF263",
            dark: "#c49000",
            contrastText: "#000",
        },
        text: {
            primary: "#212121",
            secondary: "#757575",
            disabled: "#A6A6A6",

            //hint: '#e0e0e0',
        },
        background: {
            default: "#F5F5F7",
            paper: "#FFFFFF",
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: (theme: Theme) => ({
                a: {
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    "&:hover": {
                        textDecoration: "underline",
                    },
                },
                ".MuiDrawer-root": {
                    "& .MuiDrawer-paper": {
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                            width: "8px",
                            background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: theme.palette.primary.contrastText + "66",
                            borderRadius: "20px",
                        },
                    },
                    "& a": {
                        color: theme.palette.primary.contrastText,
                        "&:hover": {
                            textDecoration: "none",
                        },
                    },

                    // #.MuiDrawer-root > ul > .MuiCollapse-root > ul > .MuiCollapse-root > ul > a
                    "& ul": {
                        "& .MuiCollapse-root": {
                            "& .MuiButtonBase-root": {
                                paddingLeft: `calc(${theme.spacing(3)} * 1)`,
                            },
                            "& ul": {
                                padding: "0",
                                "& .MuiCollapse-root": {
                                    "& .MuiButtonBase-root": {
                                        paddingLeft: `calc(${theme.spacing(3)} * 1.5)`,
                                    },
                                },
                            },
                        },
                    },
                    "& .MuiListItemIcon-root svg": {
                        maxHeight: "20px",
                        maxWidth: "20px",
                        "&.svg-inline--fa": {
                            maxHeight: "16px",
                            maxWidth: "16px",
                            verticalAlign: "1em",
                        },
                    },
                },
                ".MuiFormControlLabel-asterisk, .MuiFormLabel-asterisk": {
                    color: theme.palette.error.main,
                },
                ".swal2-container": {
                    zIndex: theme.zIndex.modal + 1,
                },
                ".swal2-styled": {
                    fontFamily: theme.typography.fontFamily,
                    "&.swal2-confirm": {
                        marginLeft: "1rem",
                        background: theme.palette.submit?.main,
                        color: theme.palette.submit?.contrastText,
                        boxShadow: theme.shadows[2],
                        "&:hover": {
                            background: theme.palette.submit?.dark,
                        },
                        "&:focus": {
                            boxShadow: theme.shadows[2],
                        },
                        "&.swal2-ok": {
                            background: theme.palette.primary?.main,
                            color: theme.palette.primary?.contrastText,
                            "&:hover": {
                                background: theme.palette.primary?.dark,
                            },
                        },
                    },
                    "&.swal2-cancel": {
                        background: "unset",
                        color: theme.palette.unapprove?.main,
                        border: `1px solid ${theme.palette.unapprove?.main}`,
                        "&:hover": {
                            border: `1px solid ${theme.palette.unapprove?.light}`,
                        },
                    },
                },
            }),
        },
        MuiAutocomplete: {
            defaultProps: {
                color: "primary",
            },
            styleOverrides: {
                listbox: ({ ownerState, theme }) => ({
                    "& [aria-selected='true']": {
                        backgroundColor:
                            (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor).main +
                            " !important",
                        color: (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor)
                            .contrastText,
                        "&:hover": {
                            backgroundColor:
                                (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor).dark +
                                " !important",
                        },
                    },
                }),
                root: ({ ownerState, theme }) => ({
                    "& .MuiChip-root": {
                        backgroundColor:
                            (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor).main +
                            "EE !important",
                        color: (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor)
                            .contrastText,
                        "&:hover": {
                            backgroundColor:
                                (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor)
                                    .light + "FF !important",
                        },
                        "& .MuiChip-deleteIcon": {
                            color: (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor)
                                .contrastText,
                        },
                    },
                }),
            },
        },
        MuiButton: {
            defaultProps: {
                size: "small",
                variant: "contained",
                color: "primary",
            },
        },
        MuiDrawer: {
            styleOverrides: {
                root: {
                    "& a": {
                        textDecoration: "none",
                    },
                },
            },
        },
        MuiFilledInput: {
            defaultProps: {
                margin: "dense",
                size: "small",
            },
        },
        MuiFormControl: {
            defaultProps: {
                margin: "dense",
                size: "small",
                variant: "outlined",
            },
        },
        MuiFormHelperText: {
            defaultProps: {
                margin: "dense",
            },
            styleOverrides: {
                root: {
                    position: "absolute",
                    top: "40px",
                },
            },
        },
        MuiIcon: {
            styleOverrides: {
                root: {
                    overflow: "visible",
                },
            },
        },
        MuiIconButton: {
            defaultProps: {
                size: "small",
            },
        },
        MuiInputBase: {
            defaultProps: {
                margin: "dense",
                size: "small",
            },
        },
        MuiInputLabel: {
            defaultProps: {
                margin: "dense",
                size: "small",
            },
        },
        MuiListItem: {
            defaultProps: {
                dense: true,
            },
        },
        MuiOutlinedInput: {
            defaultProps: {
                margin: "dense",
                size: "small",
            },
        },
        MuiFab: {
            defaultProps: {
                size: "small",
            },
        },
        MuiTextField: {
            defaultProps: {
                margin: "dense",
                variant: "outlined",
                size: "small",
            },
        },
        MuiToolbar: {
            defaultProps: {
                variant: "dense",
            },
        },
        MuiButtonBase: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    "&.MuiMenuItem-root.Mui-selected": {
                        backgroundColor: (
                            theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor
                        ).main,
                        color: (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor)
                            .contrastText,
                    },
                    "&.MuiMenuItem-root:hover": {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.primary,
                    },
                }),
            },
        },
        MuiSelect: {
            defaultProps: {
                variant: "outlined",
                margin: "dense",
                size: "small",
            },
            styleOverrides: {
                multiple: ({ ownerState, theme }) => ({
                    "& .MuiChip-root": {
                        backgroundColor: (
                            theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor
                        ).main,
                        color: (theme.palette[(ownerState.color ?? "primary") as keyof Palette] as PaletteColor)
                            .contrastText,
                    },
                }),
            },
        },
        MuiList: {
            defaultProps: {
                dense: true,
            },
        },
    },
    typography: {
        fontFamily: ["Sarabun", "sans-serif"].join(","),
    },
});

const theme: Array<Theme> = [defaultTheme];

export default theme;

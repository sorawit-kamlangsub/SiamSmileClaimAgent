export declare type ThemeColor = {
    submit: true;
    unapprove: true;
    edit: true;
};

export declare type ThemeColorList =
    | "submit"
    | "unapprove"
    | "edit"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";

declare module "@mui/material/styles" {
    interface Theme {
        drawerWidth: number;
    }
    interface Palette {
        submit: Palette["primary"];
        unapprove: Palette["primary"];
        edit: Palette["primary"];
        hint: Palette["primary"];
    }

    interface PaletteOptions {
        submit?: PaletteOptions["primary"];
        unapprove?: PaletteOptions["primary"];
        edit?: PaletteOptions["primary"];
        hint?: Palette["primary"];
    }

    interface ThemeOptions {
        drawerWidth?: number;
    }
}

declare module "@mui/material" {
    interface AlertPropsColorOverrides extends ThemeColor {}
    interface BadgePropsColorOverrides extends ThemeColor {}
    interface ButtonPropsColorOverrides extends ThemeColor {}
    interface ButtonGroupPropsColorOverrides extends ThemeColor {}
    interface CheckboxPropsColorOverrides extends ThemeColor {}
    interface ChipPropsColorOverrides extends ThemeColor {}
    interface CircularProgressPropsColorOverrides extends ThemeColor {}
    interface FabPropsColorOverrides extends ThemeColor {}
    interface FormControlPropsColorOverrides extends ThemeColor {}
    interface FormLabelPropsColorOverrides extends ThemeColor {}
    interface IconButtonPropsColorOverrides extends ThemeColor {}
    interface InputBasePropsColorOverrides extends ThemeColor {}
    interface LinearProgressPropsColorOverrides extends ThemeColor {}
    interface RadioPropsColorOverrides extends ThemeColor {}
    interface SvgIconPropsColorOverrides extends ThemeColor {}
    interface SwitchPropsColorOverrides extends ThemeColor {}
    interface TextFieldPropsColorOverrides extends ThemeColor {}
    interface ToggleButtonPropsColorOverrides extends ThemeColor {}
    interface ToggleButtonGroupPropsColorOverrides extends ThemeColor {}
}

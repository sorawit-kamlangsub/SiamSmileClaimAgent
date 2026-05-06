import { FormikProps } from "formik";

export type FormikMuiXDateTimeUseThaiProps = {
    useThaiLanguage?: boolean;
    useBuddhistEra?: boolean;
};

export type FormikMuiXDateTimeProps = {
    name: string;
    label?: string;
    formik: FormikProps<any>;
} & FormikMuiXDateTimeUseThaiProps;

export type MUIDateTimeThProviderProps = {
    children: React.ReactNode;
} & FormikMuiXDateTimeUseThaiProps;

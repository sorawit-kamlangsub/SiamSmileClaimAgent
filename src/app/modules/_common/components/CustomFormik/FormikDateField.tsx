import { FormControl, TextFieldProps } from "@mui/material";
import { DateField, DateFieldProps } from "@mui/x-date-pickers/DateField";
import { Dayjs } from "dayjs";
import { useEffect } from "react";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";
import { FormikFocusError } from "../FormikFocusError";
import { handleValidationDateOrTime } from "../Helpers";

type OmitDateFieldProps = "name" | "label" | "value" | "error" | "helperText" | "variant";

export type FormikDateFieldProps = { fieldClearable?: boolean; useFocusError?: boolean } & FormikMuiXDateTimeProps &
    DateFieldProps<Dayjs | null> &
    Omit<TextFieldProps, OmitDateFieldProps>;

const FormikDateField = ({
    name,
    label,
    formik,
    useThaiLanguage = true,
    useBuddhistEra = true,
    fieldClearable = false,
    useFocusError = true,
    ...other
}: FormikDateFieldProps) => {
    const formikGetFieldMeta = formik.getFieldMeta<Dayjs | null>(name);
    const { value } = formikGetFieldMeta;

    const { setFieldValue, setFieldTouched } = formik;

    const textFieldProps: Omit<TextFieldProps, OmitDateFieldProps> = other;

    const handleDateChange = (date: Dayjs | null) => setFieldValue(name, date);

    const handleBlur = () => setFieldTouched(name, true, false);

    const { helperText, error } = handleValidationDateOrTime(formikGetFieldMeta);

    useEffect(() => {
        if (error || helperText) formik.setFieldError(name, helperText.toString());
    }, [handleDateChange]);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl fullWidth error={error} onBlur={handleBlur} sx={{ margin: "0rem" }}>
                <MUIDateTimeThProvider useThaiLanguage={useThaiLanguage} useBuddhistEra={useBuddhistEra}>
                    <DateField
                        {...other}
                        clearable={fieldClearable}
                        value={value}
                        label={label}
                        onBlur={handleBlur}
                        onChange={handleDateChange}
                        slotProps={{
                            textField: {
                                id: `${name}-formik-date-field`,
                                name,
                                error,
                                helperText,
                                label,
                                ...textFieldProps,
                            },
                        }}
                    />
                </MUIDateTimeThProvider>
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikDateField;

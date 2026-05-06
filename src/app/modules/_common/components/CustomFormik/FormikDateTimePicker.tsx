import { FormControl, TextFieldProps } from "@mui/material";
import { PickersActionBarAction } from "@mui/x-date-pickers";
import { DateTimePicker, DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";
import { Dayjs } from "dayjs";
import { useEffect } from "react";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";
import { FormikFocusError } from "../FormikFocusError";
import { handleValidationDateOrTime } from "../Helpers";

type OmitDateTimePicker = "name" | "label" | "value" | "error" | "helperText" | "variant";

type FormikDateTimePickerProps = {
    fieldReadOnly?: boolean;
    fieldClearable?: boolean;
    actions?: PickersActionBarAction[];
    useFocusError?: boolean;
} & FormikMuiXDateTimeProps &
    DateTimePickerProps<Dayjs | null> &
    Omit<TextFieldProps, OmitDateTimePicker>;

const FormikDateTimePicker = ({
    name,
    label,
    formik,
    useThaiLanguage = true,
    useBuddhistEra = true,
    fieldReadOnly = false,
    fieldClearable = false,
    actions = ["clear"],
    useFocusError = true,
    ...other
}: FormikDateTimePickerProps) => {
    const formikGetFieldMeta = formik.getFieldMeta<Dayjs | null>(name);
    const { value } = formikGetFieldMeta;

    const { setFieldValue, setFieldTouched } = formik;

    const textFieldProps: Omit<TextFieldProps, OmitDateTimePicker> = other;

    const handleDateChange = (date: Dayjs | null) => setFieldValue(name, date);

    const handleBlur = () => setFieldTouched(name, true, true);

    const { helperText, error } = handleValidationDateOrTime(formikGetFieldMeta);

    useEffect(() => {
        if (error || helperText) formik.setFieldError(name, helperText.toString());
    }, [handleDateChange]);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl fullWidth error={error} onBlur={handleBlur} sx={{ margin: "0rem" }}>
                <MUIDateTimeThProvider useThaiLanguage={useThaiLanguage} useBuddhistEra={useBuddhistEra}>
                    <DateTimePicker
                        {...other}
                        value={value}
                        label={label}
                        onChange={handleDateChange}
                        onClose={handleBlur}
                        slotProps={{
                            textField: {
                                id: `${name}-formik-date-time-picker`,
                                name,
                                error,
                                helperText,
                                label,
                                ...textFieldProps,
                            },
                            field: {
                                readOnly: fieldReadOnly,
                                clearable: fieldClearable,
                            },
                            actionBar: { actions: actions },
                        }}
                    />
                </MUIDateTimeThProvider>
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikDateTimePicker;

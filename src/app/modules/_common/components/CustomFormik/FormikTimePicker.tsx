import { FormControl, TextFieldProps } from "@mui/material";
import { PickersActionBarAction } from "@mui/x-date-pickers";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";
import { useEffect } from "react";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";
import { FormikFocusError } from "../FormikFocusError";
import { handleValidationDateOrTime } from "../Helpers";

type FormikTimePickerProps = {
    fieldReadOnly?: boolean;
    fieldClearable?: boolean;
    actions?: PickersActionBarAction[];
    useFocusError?: boolean;
} & FormikMuiXDateTimeProps &
    TimePickerProps<Dayjs | null> &
    Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant">;

const FormikTimePicker = ({
    name,
    label,
    formik,
    useThaiLanguage = true,
    useBuddhistEra = true,
    actions = ["clear"],
    useFocusError = true,
    ...other
}: FormikTimePickerProps) => {
    const formikGetFieldMeta = formik.getFieldMeta<Dayjs | null>(name);
    const { value } = formikGetFieldMeta;

    const { setFieldValue, setFieldTouched } = formik;

    const textFieldProps: Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant"> = other;

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
                    <TimePicker
                        {...other}
                        value={value}
                        label={label}
                        onChange={handleDateChange}
                        onClose={handleBlur}
                        slotProps={{
                            textField: {
                                id: `${name}-formik-timepicker`,
                                name,
                                error,
                                helperText,
                                label,
                                ...textFieldProps,
                            },
                            actionBar: { actions: actions },
                        }}
                    />
                </MUIDateTimeThProvider>
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikTimePicker;

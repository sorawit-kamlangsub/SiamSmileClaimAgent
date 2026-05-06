import { FormControl, TextFieldProps } from "@mui/material";
import { PickersActionBarAction } from "@mui/x-date-pickers";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { useEffect } from "react";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";
import { FormikFocusError } from "../FormikFocusError";
import { handleValidationDateOrTime } from "../Helpers";

type OmitDatePickerProps = "name" | "label" | "value" | "error" | "helperText" | "variant";

type FormikDatePickerProps = {
    fieldReadOnly?: boolean;
    fieldClearable?: boolean;
    actions?: PickersActionBarAction[];
    useFocusError?: boolean;
    textHelperIsValid?: string;
} & FormikMuiXDateTimeProps &
    DatePickerProps<Dayjs | null> &
    Omit<TextFieldProps, OmitDatePickerProps>;

const FormikDatePicker = ({
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
}: FormikDatePickerProps) => {
    const formikGetFieldMeta = formik.getFieldMeta<Dayjs | null>(name);
    const { value } = formikGetFieldMeta;

    const { setFieldValue, setFieldTouched } = formik;
    const textFieldProps: Omit<TextFieldProps, OmitDatePickerProps> = other;

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
                    <DatePicker
                        {...other}
                        value={value}
                        onChange={handleDateChange}
                        slotProps={{
                            textField: {
                                id: `${name}-formik-date-picker`,
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

export default FormikDatePicker;

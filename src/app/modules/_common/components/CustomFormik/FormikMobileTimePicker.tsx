import { FormControl, TextFieldProps } from "@mui/material";
import { PickersActionBarAction } from "@mui/x-date-pickers";
import { MobileTimePicker, MobileTimePickerProps } from "@mui/x-date-pickers/MobileTimePicker";
import { Dayjs } from "dayjs";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";
import { FormikFocusError } from "../FormikFocusError";
import { handleValidationDateOrTime } from "../Helpers";

type FormikMobileTimePickerProps = {
    fieldReadOnly?: boolean;
    fieldClearable?: boolean;
    actions?: PickersActionBarAction[];
    useFocusError?: boolean;
    textHelperIsValid?: string;
} & FormikMuiXDateTimeProps &
    MobileTimePickerProps<Dayjs | null> &
    Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant">;

const FormikMobileTimePicker = ({
    name,
    label,
    formik,
    useThaiLanguage = true,
    useBuddhistEra = true,
    actions = ["clear", "accept"],
    useFocusError = true,
    ...other
}: FormikMobileTimePickerProps) => {
    const formikGetFieldMeta = formik.getFieldMeta<Dayjs | null>(name);
    const { value } = formikGetFieldMeta;

    const { setFieldValue, setFieldTouched } = formik;

    const textFieldProps: Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant"> = other;

    const handleDateChange = (date: Dayjs | null) => setFieldValue(name, date);

    const handleBlur = () => setFieldTouched(name, true, true);

    const { helperText, error } = handleValidationDateOrTime(formikGetFieldMeta);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl fullWidth error={error} onBlur={handleBlur}>
                <MUIDateTimeThProvider useThaiLanguage={useThaiLanguage} useBuddhistEra={useBuddhistEra}>
                    <MobileTimePicker
                        {...other}
                        value={value}
                        label={label}
                        onChange={handleDateChange}
                        onClose={handleBlur}
                        slotProps={{
                            textField: {
                                id: `${name}-formik-mobile-time-picker`,
                                name: name,
                                error: error,
                                helperText: helperText,
                                label: label,
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

export default FormikMobileTimePicker;

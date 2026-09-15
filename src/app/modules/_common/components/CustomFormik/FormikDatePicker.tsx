import { FormControl, TextFieldProps } from "@mui/material";
import { PickersActionBarAction } from "@mui/x-date-pickers";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { FieldMetaProps } from "formik";
import { useEffect } from "react";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";

type OmitDatePickerProps = "name" | "label" | "value" | "error" | "helperText" | "variant";

type FormikDatePickerProps = {
    fieldReadOnly?: boolean;
    fieldClearable?: boolean;
    actions?: PickersActionBarAction[];
    useFocusError?: boolean;
    textHelperIsValid?: string;
    bgcolor?: string;
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
    actions = ["cancel", "accept"],
    bgcolor = "#fff",
    ...other
}: FormikDatePickerProps) => {
    const formikGetFieldMeta = formik.getFieldMeta<Dayjs | null>(name);
    const { value } = formikGetFieldMeta;

    const { setFieldValue, setFieldTouched } = formik;
    const { sx: textFieldSx, ...textFieldProps }: Omit<TextFieldProps, OmitDatePickerProps> = other;

    const handleDateChange = (date: Dayjs | null) => setFieldValue(name, date);

    const handleBlur = () => setFieldTouched(name, true, true);

    const handleValidationDateOrTime = (
        formikGetFieldMeta: FieldMetaProps<Dayjs | null>
    ): { error: boolean; helperText: boolean | string } => {
        const { touched, error, value } = formikGetFieldMeta;
        const isValid = dayjs(value).isValid();
        return {
            error: (touched && !!error) || (!isValid && touched),
            helperText: (touched && error) || (!isValid && touched),
        };
    };
    useEffect(() => {
        if (error || helperText) formik.setFieldError(name, helperText.toString());
    }, [handleDateChange]);

    const { helperText, error } = handleValidationDateOrTime(formikGetFieldMeta);

    return (
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
                            sx: [
                                { "& .MuiOutlinedInput-root": { backgroundColor: bgcolor } },
                                ...(Array.isArray(textFieldSx) ? textFieldSx : textFieldSx ? [textFieldSx] : []),
                            ],
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
    );
};

export default FormikDatePicker;

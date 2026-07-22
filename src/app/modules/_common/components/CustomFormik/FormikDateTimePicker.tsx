import { TextFieldProps } from "@mui/material";
import { Dayjs } from "dayjs";
import { FormikMuiXDateTimeProps, MUIDateTimeThProvider } from ".";
import { DateTimePicker, DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";

type FormikDateTimePickerProps = {
    bgcolor?: string;
} & FormikMuiXDateTimeProps &
    DateTimePickerProps<Dayjs | null> &
    Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant">;

const FormikDateTimePicker = ({
    name,
    label,
    formik,
    useThaiLanguage = true,
    useBuddhistEra = true,
    bgcolor = "#fff",
    ...other
}: FormikDateTimePickerProps) => {
    const { touched, value, error } = formik.getFieldMeta<Dayjs | null>(name);
    const { setFieldValue, setFieldTouched } = formik;

    const {
        sx: textFieldSx,
        ...textFieldProps
    }: Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant"> = other;

    const handleDateChange = (date: Dayjs | null) => setFieldValue(name, date);

    const handleBlur = () => setFieldTouched(name, true, true);

    return (
        <MUIDateTimeThProvider useThaiLanguage={useThaiLanguage} useBuddhistEra={useBuddhistEra}>
            <DateTimePicker
                {...other}
                value={value}
                label={label}
                onChange={handleDateChange}
                onClose={handleBlur}
                slotProps={{
                    textField: {
                        helperText: error,
                        error: touched && !!error,
                        ...textFieldProps,
                        sx: [
                            { "& .MuiOutlinedInput-root": { backgroundColor: bgcolor } },
                            ...(Array.isArray(textFieldSx) ? textFieldSx : textFieldSx ? [textFieldSx] : []),
                        ],
                    },
                }}
            />
        </MUIDateTimeThProvider>
    );
};

export default FormikDateTimePicker;

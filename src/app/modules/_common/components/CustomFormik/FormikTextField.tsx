import { TextField, TextFieldProps } from "@mui/material";
import { FormikProps } from "formik";
import { FormikFocusError } from "../FormikFocusError";

export type FormikTextFieldProps = {
    name: string;
    label: string;
    formik: FormikProps<any>;
    isPaddingHelperText?: boolean;
    useFocusError?: boolean;
} & Omit<TextFieldProps, "name" | "label" | "value" | "error" | "helperText" | "variant">;

const FormikTextField = ({ name, formik, useFocusError = true, ...textFieldProps }: FormikTextFieldProps) => {
    const { value, error, touched } = formik.getFieldMeta<string>(name);
    const { handleChange, handleBlur } = formik;

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <TextField
                fullWidth
                id={`${name}-formik-text-field`}
                name={name}
                value={value}
                variant="outlined"
                error={touched && !!error}
                helperText={touched && error}
                onChange={handleChange}
                onBlur={handleBlur}
                FormHelperTextProps={{}}
                {...textFieldProps}
            />
        </FormikFocusError>
    );
};

export default FormikTextField;

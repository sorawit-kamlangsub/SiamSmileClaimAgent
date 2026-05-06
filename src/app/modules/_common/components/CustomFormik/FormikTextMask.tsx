import { OutlinedTextFieldProps, TextField } from "@mui/material";
import { FormikProps } from "formik";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { FormikFocusError } from "../FormikFocusError";

export type FormikTextMaskProps = {
    name: string;
    label: string;
    formik: FormikProps<any>;
    value?: any;
    defaultValue?: any;
    variant?: "outlined";
    useFocusError?: boolean;
} & PatternFormatProps<Omit<OutlinedTextFieldProps, "value" | "defaultValue" | "type" | "variant">>;

const FormikTextMask = ({ name, formik, label, inputMode, useFocusError = true, ...props }: FormikTextMaskProps) => {
    const { value, error, touched, initialValue } = formik.getFieldMeta<any>(name);
    const { handleChange, handleBlur } = formik;

    const textFieldProps: PatternFormatProps<
        Omit<OutlinedTextFieldProps, "value" | "defaultValue" | "type" | "variant">
    > = props;

    const patternFormatProps: Omit<FormikTextMaskProps, "formik"> = {
        ...textFieldProps,
        id: `${name}-formik-text-mask`,
        variant: "outlined",
        name: name,
        value: value,
        onChange: textFieldProps.onValueChange ? undefined : handleChange,
        onBlur: handleBlur,
        error: !!error && !!touched,
        helperText: touched && error,
        label: label,
        defaultValue: initialValue,
    };

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <PatternFormat
                value={value}
                customInput={TextField}
                inputMode={inputMode}
                {...patternFormatProps}
                {...props}
            />
        </FormikFocusError>
    );
};

export default FormikTextMask;

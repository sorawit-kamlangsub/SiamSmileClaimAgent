import { OutlinedTextFieldProps, TextField } from "@mui/material";
import { FormikProps } from "formik";
import React, { CSSProperties } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { FormikFocusError } from "../FormikFocusError";

type CustomNumberProps = {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
} & NumericFormatProps;

export type FormikTextNumberProps = {
    name: string;
    label: string;
    formik: FormikProps<any>;
    value?: number;
    defaultValue?: number;
    variant?: "outlined";
    size?: "medium";
    numericCustomStyle?: CSSProperties;
    useFocusError?: boolean;
} & NumericFormatProps &
    Omit<OutlinedTextFieldProps, "value" | "defaultValue" | "type" | "variant" | "size">;

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomNumberProps>(
    function NumericFormatCustom(props, ref) {
        const {
            name,
            onChange,
            decimalScale,
            allowNegative,
            fixedDecimalScale,
            thousandSeparator,
            inputMode,
            ...other
        } = props;

        return (
            <NumericFormat
                name={name}
                allowLeadingZeros={false}
                valueIsNumericString
                getInputRef={ref}
                inputMode={inputMode}
                decimalScale={decimalScale}
                allowNegative={allowNegative}
                fixedDecimalScale={fixedDecimalScale}
                thousandSeparator={thousandSeparator}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: name,
                            value: values.value,
                        },
                    });
                }}
                {...other}
            />
        );
    }
);

const FormikTextNumber = ({
    name,
    formik,
    label,
    valueIsNumericString = true,
    decimalScale = 0,
    allowNegative = false,
    thousandSeparator = true,
    fixedDecimalScale = true,
    numericCustomStyle = { textAlign: "left" },
    useFocusError = true,
    inputProps = {
        inputMode: "decimal",
    },
    ...props
}: FormikTextNumberProps) => {
    const { value, error, touched, initialValue } = formik.getFieldMeta<number | undefined>(name);
    const { setFieldValue, handleBlur } = formik;

    const textFieldProps: Omit<OutlinedTextFieldProps, "value" | "defaultValue" | "type" | "variant"> = props;

    const numericCustomFormatProps: Omit<NumericFormatProps, "onChange"> = props;
    numericCustomFormatProps.allowNegative = allowNegative;
    numericCustomFormatProps.decimalScale = decimalScale;
    numericCustomFormatProps.thousandSeparator = thousandSeparator;
    numericCustomFormatProps.fixedDecimalScale = fixedDecimalScale;
    numericCustomFormatProps.valueIsNumericString = valueIsNumericString;
    numericCustomFormatProps.style = numericCustomStyle;
    numericCustomFormatProps.inputMode = inputProps.inputMode;

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <TextField
                fullWidth
                id={`${name}-formik-text-number`}
                variant={"outlined"}
                name={name}
                onChange={({ target: { value } }) => {
                    return setFieldValue(name, value ? Number(value) : "");
                }}
                onBlur={handleBlur}
                value={value || ""}
                error={touched && !!error}
                helperText={touched && error}
                label={label}
                defaultValue={initialValue}
                InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    inputProps: numericCustomFormatProps as any,
                    inputRef: props.inputRef,
                    onBlur: handleBlur,
                    size: "small",
                }}
                inputProps={inputProps}
                {...textFieldProps}
            />
        </FormikFocusError>
    );
};

export default FormikTextNumber;

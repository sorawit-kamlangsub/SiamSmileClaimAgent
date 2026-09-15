import { FormikFocusError } from "../FormikFocusError";
import FormikTextMask, { FormikTextMaskProps } from "./FormikTextMask";

type FormikTextMaskPhoneProps = {
    value?: string;
    defaultValue?: string;
    useFocusError?: boolean;
} & Omit<FormikTextMaskProps, "value" | "defaultValue" | "format" | "patternChar" | "inputMode">;

const FormikTextMaskPhone = ({ name, formik, useFocusError = true, ...textMaskProps }: FormikTextMaskPhoneProps) => {
    const { setFieldValue } = formik;

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormikTextMask
                id={`${name}-formik-mask-phone`}
                name={name}
                formik={formik}
                {...textMaskProps}
                inputMode="numeric"
                format="###-###-####"
                allowEmptyFormatting
                onValueChange={(values) => {
                    setFieldValue(name, values.value);
                }}
            />
        </FormikFocusError>
    );
};

export default FormikTextMaskPhone;

import { FormikFocusError } from "../FormikFocusError";
import FormikTextMask, { FormikTextMaskProps } from "./FormikTextMask";

type FormikTextMaskCardIdProps = {
    value?: string;
    defaultValue?: string;
    useFocusError?: boolean;
} & Omit<FormikTextMaskProps, "value" | "defaultValue" | "format" | "patternChar" | "inputMode">;

const FormikTextMaskCardId = ({ useFocusError = true, ...props }: FormikTextMaskCardIdProps) => {
    const { name, formik } = props;
    const { setFieldValue } = formik;

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormikTextMask
                id={`${name}-formik-text-mask-card-id`}
                inputMode="numeric"
                format="%-%%%%-%%%%%-%%-%"
                allowEmptyFormatting
                patternChar="%"
                mask="_"
                onValueChange={(values) => {
                    setFieldValue(name, values.value);
                }}
                {...props}
            />
        </FormikFocusError>
    );
};

export default FormikTextMaskCardId;

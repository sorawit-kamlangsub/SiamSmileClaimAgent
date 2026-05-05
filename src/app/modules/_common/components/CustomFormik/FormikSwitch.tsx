import { FormControlLabel, FormControlLabelProps, FormHelperText, Switch, SwitchProps } from "@mui/material";
import { FormikProps } from "formik";
import { FormikFocusError } from "../FormikFocusError";

type FormikSwitchProps = {
    name: string;
    label: string;
    formik: FormikProps<any>;
    useFocusError?: boolean;
} & SwitchProps &
    Omit<FormControlLabelProps, "control">;

const FormikSwitch = ({ name, label, formik, useFocusError = true, ...props }: FormikSwitchProps) => {
    const { value, touched, error } = formik.getFieldMeta<boolean | undefined>(name);
    const { setFieldValue, setFieldTouched } = formik;

    const switchProps: SwitchProps = props;
    const formControlLabelProps: Omit<FormControlLabelProps, "control" | "label"> = props;

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControlLabel
                id={`${name}-formik-switch-container`}
                {...formControlLabelProps}
                control={
                    <Switch
                        id={`${name}-formik-switch`}
                        name={name}
                        onBlur={() => setFieldTouched(name, true, true)}
                        onChange={(_, value) => setFieldValue(name, value, true)}
                        checked={value}
                        {...switchProps}
                    />
                }
                label={label}
            />
            {error && touched && <FormHelperText>{error}</FormHelperText>}
        </FormikFocusError>
    );
};

export default FormikSwitch;

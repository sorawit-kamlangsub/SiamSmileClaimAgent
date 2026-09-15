import {
    Checkbox,
    CheckboxProps,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
} from "@mui/material";
import { FormikProps } from "formik";
import React from "react";
import { FormikFocusError } from "../FormikFocusError";

export type FormikCheckboxProps = {
    /**
     * ชื่อของ field ที่ต้องการใช้ (จำเป็นต้องใช้)
     *
     * ชื่อ field จะตรงกับ key ของ values ของ formik
     */
    name: string;

    /**
     * ชื่อแสดงแทนค่าของ field (จำเป็นต้องใช้)
     */
    label: string;

    /**
     * ป้ายกำกับที่ต้องการใช้
     */
    formLabel?: string;

    /**
     * ปรับแต่ง style ของ label (เช่น fontSize) โดยไม่กระทบ default
     * ถ้าไม่ส่งมา จะใช้ style เริ่มต้นของ MUI FormControlLabel ตามปกติ
     *
     * ใช้ CSSProperties ธรรมดา (ไม่ใช่ SxProps เต็มรูปแบบ) เพราะ SxProps รองรับ array/function
     * ซึ่ง TypeScript infer ไม่ผ่านเวลาเอาไปซ้อนใน nested selector key
     */
    labelSx?: React.CSSProperties;

    /**
     * formik ที่ต้องการใช้
     */
    formik: FormikProps<any>;
    useFocusError?: boolean;
} & Omit<CheckboxProps, "checked">;

/**
 * `FormikCheckBox` เป็น Component ที่ใช้เป็นส่วนขยายจาก `Checkbox` ของ MUI
 *
 * @example
 *
 * ```tsx
 * <FormikCheckBox
 *  color="submit"
 *  name="isAgree"
 *  label="I agree"
 *  required
 *  formLabel="You must accepted the term."
 *  labelSx={{ fontSize: 13 }}
 *  formik={formik}
 * />
 * ```
 *
 * ดูเพิ่มเติม :
 *
 *  * https://mui.com/components/checkboxes/
 */
const FormikCheckbox = ({
    name,
    label,
    required,
    formLabel,
    labelSx,
    formik,
    useFocusError = true,
    ...checkboxProps
}: FormikCheckboxProps) => {
    const { value, error, touched } = formik.getFieldMeta<boolean>(name);
    const { setFieldValue, setFieldTouched } = formik;

    // Use the formik props to set the value
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setFieldValue(name, event.target.checked);
    const handleBlur = () => setFieldTouched(name, true);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl fullWidth error={touched && !!error} component="fieldset" id={`${name}-formik-checkbox`}>
                {formLabel && <FormLabel component="legend">{formLabel}</FormLabel>}
                <FormGroup>
                    <FormControlLabel
                        name={`${name}-label`}
                        control={
                            <Checkbox
                                name={name}
                                checked={value}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                {...checkboxProps}
                            />
                        }
                        label={label}
                        required={required}
                        sx={labelSx ? { "& .MuiFormControlLabel-label": labelSx } : undefined}
                    />
                </FormGroup>
                {touched && !!error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
        </FormikFocusError>
    );
};

FormikCheckbox.defaultProps = {
    color: "primary",
};

export default FormikCheckbox;

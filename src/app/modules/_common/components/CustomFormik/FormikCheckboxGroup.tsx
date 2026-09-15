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

export type FormikCheckboxGroupProps = {
    /**
     * ชื่อของ field ที่ต้องการใช้ (จำเป็นต้องใช้)
     *
     * ชื่อ field จะตรงกับ key ของ values ของ formik
     */
    name: string;

    /**
     * ป้ายกำกับที่ต้องการใช้
     */
    label?: string;

    /**
     * ข้อมูลที่ต้องการใช้ในการสร้าง checkbox
     * ตัวอย่าง : `[{ id: 0, name: "Do not forget to set data" }]`
     **/
    data: { [key: string]: any }[];

    /**
     * isLoading ของ checkbox จาก react-query
     */
    isLoading?: boolean;

    /**
     * component ที่ต้องการแสดงเมื่อ isLoading เป็น true
     */
    isLoadingElement?: React.ReactNode;

    /**
     * formik ที่ต้องการใช้
     */
    formik: FormikProps<any>;

    /**
     * ชื่อ key ของ data ที่ต้องการใช้เป็นค่า value
     *
     * default : `id`
     */
    valueFieldName?: string;

    /**
     * ชื่อ key ของ data ที่ต้องการใช้เป็นค่าแสดงผล
     *
     * default : `name`
     */
    displayFieldName?: string;

    /**
     * ปรับให้ checkbox แสดงแบบแนวนอน
     *
     * default : `false`
     */
    row?: boolean;

    /**
     * ปรับให้แสดงแบบเต็มความกว้างของ container
     */
    fullWidth?: boolean;

    /**
     * กรณีต้องการ handle onChange เอง
     */
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    useFocusError?: boolean;
} & Omit<CheckboxProps, "checked" | "defaultChecked" | "id">;

/**
 * `FormikCheckBoxGroup` เป็น Component ที่ใช้เป็นส่วนขยายจาก `Checkbox` ของ MUI
 *
 * @example
 *
 * ตัวอย่างข้อมูลที่ต้องการสร้าง checkbox
 * ```ts
 * const data = [
 *  { id: 1, name: "Football" },
 * { id: 2, name: "Basketball" },
 * { id: 3, name: "Tennis" }
 * ];
 * ```
 *
 * ตัวอย่างการใช้งาน
 * ```tsx
 * <FormikCheckBoxGroup color="submit" name="favoriteSports" label="กีฬาที่ชอบ" data={data} formik={formik} />
 * ```
 *
 * ดูเพิ่มเติม :
 *
 *  * https://mui.com/components/checkboxes/
 */

const FormikCheckboxGroup = ({
    formik,
    data,
    valueFieldName = "id",
    displayFieldName = "name",
    name,
    label,
    row = false,
    fullWidth,
    useFocusError = true,
    ...checkboxProps
}: FormikCheckboxGroupProps) => {
    const { value, error, touched } = formik.getFieldMeta<any[] | undefined | null>(name);
    const { setFieldValue, setFieldTouched } = formik;
    const { onChange: overrideOnChange, required, ...rest } = checkboxProps;

    function checkboxFormikProps(item: { [key: string]: any }): Omit<CheckboxProps, "defaultChecked" | "id"> {
        const props = {
            checked: value?.includes(item[valueFieldName]),
        };

        if (overrideOnChange) {
            return {
                ...props,
                onChange: overrideOnChange,
            };
        }

        return {
            ...props,
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = event.target.checked
                    ? [...(value ?? []), item[valueFieldName]]
                    : value?.filter((itemValue) => itemValue !== item[valueFieldName]);
                setFieldValue(name, newValue);
            },
        };
    }

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl
                error={touched && !!error}
                onBlur={() => {
                    setFieldTouched(name, true, true);
                }}
                required={required}
                component="fieldset"
                fullWidth={fullWidth}
                id={`${name}-formik-checkbox-group`}
                name={name}
            >
                {label && <FormLabel component="legend">{label}</FormLabel>}
                <FormGroup row={row}>
                    {data.map((item, index: number) => (
                        <FormControlLabel
                            key={index as number}
                            control={
                                <Checkbox
                                    {...checkboxFormikProps(item)}
                                    {...rest}
                                    required={false}
                                    id={`${name}-formik-checkbox-group-${index}`}
                                />
                            }
                            label={item[`${displayFieldName}`]}
                            value={item[`${valueFieldName}`]}
                        />
                    ))}
                </FormGroup>
                {touched && !!error && (
                    <FormHelperText
                        sx={
                            !row
                                ? {
                                      top: 0 + "!important",
                                      position: "relative !important",
                                      fontWeight: 400 + "!important",
                                      fontSize: "0.75rem !important",
                                      lineHeight: 1.66 + "!important",
                                      textAlign: "left !important",
                                      marginTop: "4px !important",
                                      marginRight: "14px !important",
                                      marginBottom: 0 + "!important",
                                      marginLeft: "14px !important",
                                  }
                                : {}
                        }
                    >
                        {error}
                    </FormHelperText>
                )}
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikCheckboxGroup;

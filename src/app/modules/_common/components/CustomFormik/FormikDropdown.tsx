import {
    CircularProgress,
    FormControl,
    FormControlProps,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import { FormikProps } from "formik";
import { FormikFocusError } from "../FormikFocusError";

export type FormikDropdownProps = {
    name: string;
    label: string;
    data?: { [key: string]: any }[];
    isLoading?: boolean;
    formik: FormikProps<any>;
    valueFieldName?: string;
    displayFieldName?: string;
    selectedCallback?: (value: any) => void;
    firstItemText?: string;
    disableFirstItem?: boolean;
    disabledItemValue?: any[];
    useFocusError?: boolean;
} & Omit<FormControlProps, "name" | "label" | "value" | "onChange" | "onBlur" | "input">;

const FormikDropdown = ({
    name,
    label,
    data,
    formik,
    valueFieldName = "id",
    displayFieldName = "name",
    selectedCallback,
    firstItemText,
    disableFirstItem = false,
    disabledItemValue,
    isLoading = false,
    useFocusError = true,
    ...formcontrolProps
}: FormikDropdownProps) => {
    const { value, touched, error } = formik.getFieldMeta<number | string>(name);
    const { setFieldValue, handleBlur } = formik;

    const handleOnChange = (event: SelectChangeEvent<string | number | undefined>) => {
        const setValue = event.target.value === "-1" ? undefined : event.target.value;
        setFieldValue(name, setValue, true);
        setFieldValue(
            `${name}_selectedText`,
            data?.find((item) => item[valueFieldName] === setValue)?.[displayFieldName] ?? undefined,
            true
        );
        selectedCallback && selectedCallback(setValue ?? undefined);
    };

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl {...formcontrolProps} error={touched && !!error} id={`${name}-formik-select`}>
                <InputLabel>{label}</InputLabel>
                <Select
                    name={name}
                    label={label}
                    value={value ?? (firstItemText ? "-1" : "")}
                    defaultValue={firstItemText ? "-1" : ""}
                    color={formcontrolProps.color}
                    onChange={handleOnChange}
                    onBlur={handleBlur}
                    type="number"
                    startAdornment={isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                >
                    {firstItemText && (
                        <MenuItem disabled={disableFirstItem} value={"-1"} color={formcontrolProps.color}>
                            <em>{firstItemText}</em>
                        </MenuItem>
                    )}
                    {data &&
                        data.map((item, index) => (
                            <MenuItem
                                color={formcontrolProps.color}
                                key={`${name}-${item[valueFieldName]}-${index as number}`}
                                value={item[valueFieldName]}
                                disabled={disabledItemValue && disabledItemValue.includes(item[valueFieldName])}
                            >
                                {item[displayFieldName]}
                            </MenuItem>
                        ))}
                </Select>
                {touched && !!error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikDropdown;

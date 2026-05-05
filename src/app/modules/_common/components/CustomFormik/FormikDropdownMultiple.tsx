import {
    Chip,
    CircularProgress,
    FormControl,
    FormControlProps,
    FormHelperText,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    SelectProps,
} from "@mui/material";
import { FormikProps } from "formik";
import React from "react";
import { FormikFocusError } from "../FormikFocusError";

export type FormikDropdownMultipleProps = {
    name: string;
    label?: string;
    labelColor?: FormControlProps["color"];
    data?: { [key: string]: any }[];
    isLoading?: boolean;
    valueFieldName?: string;
    displayFieldName?: string;
    formik: FormikProps<any>;
    selectedCallback?: (value: any) => void;
    firstItemText?: string;
    disableFirstItem?: boolean;
    useFocusError?: boolean;
} & FormControlProps &
    Omit<SelectProps, "value" | "defaultValue" | "onChange">;

const FormikDropdownMultiple = ({
    name,
    label,
    labelColor,
    data,
    isLoading = false,
    valueFieldName = "id",
    displayFieldName = "name",
    formik,
    selectedCallback,
    firstItemText,
    disableFirstItem,
    useFocusError = true,
    ...props
}: FormikDropdownMultipleProps) => {
    const [muiValue, setMuiValue] = React.useState<any[]>([]);
    const { touched, value, error } = formik.getFieldMeta<any[]>(name);
    const { setFieldValue, setFieldTouched } = formik;

    const formControlProps: FormControlProps = props;
    const selectProps: Omit<SelectProps, "value" | "defaultValue" | "onChange"> = props;

    const handleChange = (event: SelectChangeEvent<typeof value>) => {
        const {
            target: { value },
        } = event;

        const dataToFormik = typeof value === "string" ? value.split(",") : value;
        setMuiValue(dataToFormik);
        setFieldValue(name, dataToFormik);
        selectedCallback && selectedCallback(dataToFormik);
    };

    React.useEffect(() => {
        if (!value) {
            setMuiValue([]);

            return;
        }
        if (value.length === 0 && firstItemText) {
            setMuiValue([0]);

            return;
        }

        if (value.length === 0) {
            setMuiValue([]);

            return;
        }

        setMuiValue(value);
    }, [value]);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl
                fullWidth
                onBlur={() => {
                    setFieldTouched(name, true);
                }}
                error={!!error && touched}
                id={`${name}-formik-dropdown-multiple`}
                {...formControlProps}
            >
                {label && (
                    <InputLabel
                        color={labelColor}
                        id={`${name}-formik-dropdown-multiple-label`}
                        sx={{
                            textShadow: "#FFF 0 0 5px,#FFF 0 0 5px,#FFF 0 0 5px",
                        }}
                    >
                        {label}
                    </InputLabel>
                )}
                <Select
                    id={`${name}-formik-dropdown-multiple`}
                    label={label}
                    labelId={`${name}-formik-dropdown-multiple-label`}
                    name={name}
                    multiple
                    value={muiValue}
                    defaultValue={firstItemText ? [0] : undefined}
                    input={
                        <OutlinedInput
                            color={selectProps.color}
                            id={`${name}-formik-dropdown-multiple-input`}
                            label={label}
                        />
                    }
                    startAdornment={isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    renderValue={(selected) => {
                        return (
                            <React.Fragment>
                                {selected.map((value, index: number) => (
                                    <Chip
                                        label={
                                            data &&
                                            data.filter((item) => item[valueFieldName] === value)[0][displayFieldName]
                                        }
                                        key={index as number}
                                        color={selectProps.color}
                                        sx={{ marginX: 0.5 }}
                                    />
                                ))}
                            </React.Fragment>
                        );
                    }}
                    onChange={handleChange}
                    {...selectProps}
                >
                    {firstItemText && (
                        <MenuItem color={selectProps.color} disabled={disableFirstItem} value={0}>
                            <em>{firstItemText}</em>
                        </MenuItem>
                    )}
                    {data &&
                        data.map((item) => (
                            <MenuItem
                                color={selectProps.color}
                                key={item[displayFieldName]}
                                value={item[valueFieldName]}
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

export default FormikDropdownMultiple;

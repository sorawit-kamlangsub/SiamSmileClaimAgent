import {
    Autocomplete,
    Chip,
    CircularProgress,
    FormControl,
    FormControlProps,
    FormHelperText,
    TextField,
} from "@mui/material";
import { FormikProps } from "formik";
import React from "react";
import { FormikFocusError } from "../FormikFocusError";

export type FormikAutocompleteMultipleProps = {
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
    filterSelectedOptions?: boolean;
    useFocusError?: boolean;
} & FormControlProps;

const FormikAutocompleteMultiple = ({
    name,
    label,
    data,
    isLoading = false,
    valueFieldName = "id",
    displayFieldName = "name",
    formik,
    selectedCallback,
    filterSelectedOptions,
    useFocusError = true,
    ...formControlProps
}: FormikAutocompleteMultipleProps) => {
    const [muiValue, setMuiValue] = React.useState<{ [key: string]: any }[]>([]);
    const { touched, value, error } = formik.getFieldMeta<string[] | number[] | undefined>(name);
    const { setFieldValue, setFieldTouched } = formik;

    const handleChange = (_event: any, value: { [key: string]: any }[]) => {
        setFieldValue(
            name,
            value.map((item) => item[valueFieldName]),
            true
        );
        setFieldValue(`${name}_selectedText`, value.map((item) => item[displayFieldName]) ?? undefined, true);
        selectedCallback && selectedCallback(value.map((item) => item[valueFieldName]));
    };

    React.useEffect(() => {
        if (!value || value.length === 0) {
            setMuiValue([]);

            return;
        }

        const selectedValues =
            data?.filter((item) => value.includes(item[valueFieldName as keyof typeof item] as never)) ?? [];
        setMuiValue(selectedValues);
    }, [value]);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl
                fullWidth
                error={touched && !!error}
                onBlur={() => setFieldTouched(name, true, true)}
                {...formControlProps}
            >
                <Autocomplete
                    id={`${name}-formik-autocomplete-multiple`}
                    multiple
                    filterSelectedOptions={filterSelectedOptions}
                    options={data ?? []}
                    getOptionLabel={(option) => option[displayFieldName]}
                    defaultValue={undefined}
                    value={muiValue}
                    onChange={handleChange}
                    isOptionEqualToValue={(option, value) => option[valueFieldName] === value[valueFieldName]}
                    onBlur={() => setFieldTouched(name, true, true)}
                    color={formControlProps.color}
                    disabled={formControlProps.disabled}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            name={name}
                            label={label}
                            color={formControlProps.color}
                            required={formControlProps.required}
                            disabled={formControlProps.disabled}
                            error={touched && !!error}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: isLoading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    params.InputProps.endAdornment
                                ),
                            }}
                        />
                    )}
                    renderTags={(value: readonly { [key: string]: any }[], getTagProps) =>
                        value.map((option: { [key: string]: any }, index: number) => (
                            <Chip label={option[displayFieldName]} {...getTagProps({ index })} key={index as number} />
                        ))
                    }
                />
                {touched && !!error && <FormHelperText sx={{ top: "50px !important" }}>{error}</FormHelperText>}
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikAutocompleteMultiple;

import {
    Autocomplete,
    CircularProgress,
    FormControl,
    FormControlProps,
    FormHelperText,
    ListItemText,
    TextField,
} from "@mui/material";
import { FormikProps } from "formik";
import { useMemo } from "react";
import { FormikFocusError } from "../FormikFocusError";

export type FormikAutocompleteProps = {
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

const FormikAutocomplete = ({
    name,
    label,
    data,
    isLoading = false,
    valueFieldName = "id",
    displayFieldName = "name",
    formik,
    selectedCallback,
    useFocusError = true,
    ...formControlProps
}: FormikAutocompleteProps) => {
    const { touched, value, error } = formik.getFieldMeta<string | number | undefined | null>(name);
    const { setFieldValue, setFieldTouched } = formik;

    const handleChange = (_event: any, newValue: { [key: string]: any } | null) => {
        if (!newValue) {
            setFieldValue(name, null, true);
            setFieldValue(`${name}_selectedText`, null, true);
            selectedCallback && selectedCallback(null);
            return;
        }

        setFieldValue(name, newValue[valueFieldName], true);
        setFieldValue(`${name}_selectedText`, newValue[displayFieldName] ?? undefined, true);
        selectedCallback && selectedCallback(newValue[valueFieldName]);
    };

    const valueState = useMemo(() => {
        if (value == null || value == -1) return null;
        return data?.find((item) => item[valueFieldName] == value) ?? null;
    }, [data, value]);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl
                fullWidth
                error={touched && !!error}
                onBlur={() => setFieldTouched(name, true, true)}
                {...formControlProps}
            >
                <Autocomplete
                    id={`${name}-formik-autocomplete`}
                    options={data ?? []}
                    getOptionLabel={(option) => option[displayFieldName]}
                    value={valueState}
                    {...formControlProps}
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
                    renderOption={(props, item) => (
                        <li {...props} key={item[valueFieldName]}>
                            <ListItemText sx={{ m: 0 }}>{item[displayFieldName]}</ListItemText>
                        </li>
                    )}
                />
                {touched && !!error && <FormHelperText sx={{ top: "50px !important" }}>{error}</FormHelperText>}
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikAutocomplete;

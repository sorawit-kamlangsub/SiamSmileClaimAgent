import {
    Autocomplete,
    CircularProgress,
    FormControl,
    FormControlProps,
    FormHelperText,
    ListItemText,
    TextField,
} from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import { FormikProps } from "formik";
import { useMemo, useState } from "react";
import { FormikFocusError } from "../FormikFocusError";

type FormikAutocompleteApiProp = {
    formik: FormikProps<any>;
    name: string;
    label: string;
    useQueryGet: (filter: any, defaultId: any) => UseQueryResult<{ [key: string]: any }[], unknown>;
    valueFieldName: string;
    displayFieldName: string;
    selectedCallback?: (value: any) => void;
    filterSelectedOptions?: boolean;
    useFocusError?: boolean;
} & FormControlProps;

const FormikAutocompleteApi = ({
    formik,
    name,
    label,
    useQueryGet,
    valueFieldName,
    displayFieldName,
    disabled,
    variant = "outlined",
    selectedCallback,
    filterSelectedOptions,
    required = false,
    useFocusError = true,
    ...formControlProps
}: FormikAutocompleteApiProp) => {
    const { touched, value, error } = formik.getFieldMeta<string | number | undefined>(name);
    const { setFieldValue, setFieldTouched } = formik;

    const [searchText, setSearchText] = useState("");

    const { data: options, isLoading: loading, isError } = useQueryGet(searchText, value);

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
        return options?.find((item) => item[valueFieldName] == value) ?? null;
    }, [options, value]);

    return (
        <FormikFocusError formik={formik} useFocusError={useFocusError}>
            <FormControl
                fullWidth
                error={touched && !!error}
                onBlur={() => setFieldTouched(name, true, true)}
                {...formControlProps}
            >
                {!loading && (
                    <Autocomplete
                        value={valueState}
                        filterSelectedOptions={filterSelectedOptions}
                        getOptionLabel={(option) => option[displayFieldName]}
                        onChange={handleChange}
                        options={!loading ? options ?? [] : []}
                        loading={loading}
                        loadingText="กำลังค้นหา"
                        isOptionEqualToValue={(option, value) =>
                            option && value ? option[valueFieldName] === value[valueFieldName] : false
                        }
                        onInputChange={(_event, value) => {
                            if (value == "") {
                                setFieldValue(name, null, true);
                                setFieldValue(`${name}_selectedText`, null, true);
                                selectedCallback && selectedCallback(undefined);
                            }
                            setSearchText(value);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                name={name}
                                disabled={disabled}
                                fullWidth
                                error={(touched && !!error) || isError}
                                onBlur={() => setFieldTouched(name, true, true)}
                                label={label}
                                variant={variant}
                                value={formik.values[name]}
                                required={required}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, item) => {
                            const { ...liprops } = props as any;
                            return (
                                <li {...liprops} key={item[valueFieldName]}>
                                    <ListItemText sx={{ m: 0 }}>{item[displayFieldName]}</ListItemText>
                                </li>
                            );
                        }}
                    />
                )}
                {touched && !!error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
        </FormikFocusError>
    );
};

export default FormikAutocompleteApi;

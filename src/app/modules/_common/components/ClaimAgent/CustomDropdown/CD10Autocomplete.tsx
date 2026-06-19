import { useGetICD10 } from "../../../../../api/claimAgentMaster";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type CD10AutocompleteProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const CD10Autocomplete = ({ formik, ...props }: CD10AutocompleteProps) => {
    const { data, isLoading } = useGetICD10();

    return (
        <FormikAutocomplete
            data={data?.data ?? []}
            label="การวินิจฉัยโรค"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="icD10Id"
            displayFieldName="icD10Detail"
            isLoading={isLoading}
        />
    );
};

export default CD10Autocomplete;

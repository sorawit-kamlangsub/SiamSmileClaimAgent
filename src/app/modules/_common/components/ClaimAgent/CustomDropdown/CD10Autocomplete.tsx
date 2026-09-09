import { useGetICD10Filter } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";
import FormikAutocompleteApi from "../../CustomFormik/FormikAutocompleteApi";

type CD10AutocompleteProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName" | "filterSelectedOptions"
> & {
    /** loading จากภายนอก (เช่น รอ prefill icD10Id จากเคลมตั้งต้น) — แสดง progress + disable ช่อง */
    loading?: boolean;
    disabled?: boolean;
};

const CD10Autocomplete = ({ formik, ...props }: CD10AutocompleteProps) => {
    return (
        <>
            <FormikAutocompleteApi
                fullWidth
                {...props}
                valueFieldName="icD10Id"
                displayFieldName="icD10Detail"
                useQueryGet={useGetICD10Filter}
                label="การวินิจฉัย "
                formik={formik}
            />
        </>
    );
};

export default CD10Autocomplete;

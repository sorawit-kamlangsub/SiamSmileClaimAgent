import { getUserFilter } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";
import FormikAutocompleteApi from "../../CustomFormik/FormikAutocompleteApi";

type UserAutocompleteApiProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName" | "filterSelectedOptions"
>;

const UserAutocompleteApi = ({ formik, ...props }: UserAutocompleteApiProps) => {
    return (
        <FormikAutocompleteApi
            {...props}
            valueFieldName="userId"
            displayFieldName="displayName"
            useQueryGet={getUserFilter}
            label="ผู้ให้บริการ"
            formik={formik}
        />
    );
};

export default UserAutocompleteApi;

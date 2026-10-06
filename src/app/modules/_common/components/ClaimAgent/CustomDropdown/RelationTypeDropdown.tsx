import { useGetRelationType } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type RelationTypeDropdownProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const RelationTypeDropdown = ({ formik, ...props }: RelationTypeDropdownProps) => {
    const { data, isLoading } = useGetRelationType();

    return (
        <FormikAutocomplete
            data={data?.data ?? []}
            label="ความสัมพันธ์"
            sx={{ mt: 0 }}
            {...props}
            formik={formik}
            valueFieldName="relationTypeId"
            displayFieldName="relationTypeName"
            isLoading={isLoading}
            fullWidth
        />
    );
};

export default RelationTypeDropdown;

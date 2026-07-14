import { useGetBank } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type BankAutocompleteProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const BankAutocomplete = ({ formik, ...props }: BankAutocompleteProps) => {
    const { data, isLoading } = useGetBank();

    return (
        <FormikAutocomplete
            data={data?.data ?? []}
            label="ธนาคาร"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="organizeId"
            displayFieldName="organizeName"
            isLoading={isLoading}
        />
    );
};

export default BankAutocomplete;

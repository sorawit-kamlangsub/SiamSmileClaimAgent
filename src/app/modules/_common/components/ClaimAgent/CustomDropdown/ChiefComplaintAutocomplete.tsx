import { useGetChiefComplaint } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type ChiefComplaintAutocompleteProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const ChiefComplaintAutocomplete = ({ formik, ...props }: ChiefComplaintAutocompleteProps) => {
    const { data, isLoading } = useGetChiefComplaint();

    return (
        <FormikAutocomplete
            data={data?.data ?? []}
            label="อาการสำคัญ"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="chiefComplaintId"
            displayFieldName="detail"
            isLoading={isLoading}
        />
    );
};

export default ChiefComplaintAutocomplete;

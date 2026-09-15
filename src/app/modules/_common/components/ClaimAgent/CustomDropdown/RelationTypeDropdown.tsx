import { useGetRelationType } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type RelationTypeDropdownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const RelationTypeDropdown = ({ formik, ...props }: RelationTypeDropdownProps) => {
    const { data, isLoading } = useGetRelationType();

    return (
        <FormikDropdown
            data={data?.data ?? []}
            label="ความสัมพันธ์"
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

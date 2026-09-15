import { useGetZebraCarOwner } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type ZebraCarOwnerDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const ZebraCarOwnerDropDown = ({ formik, ...props }: ZebraCarOwnerDropDownProps) => {
    const { data, isLoading } = useGetZebraCarOwner();

    return (
        <FormikDropdown
            data={data?.data ?? []}
            label="เจ้าของรถ"
            {...props}
            formik={formik}
            valueFieldName="zebraId"
            displayFieldName="employeeFullName"
            isLoading={isLoading}
            fullWidth
        />
    );
};

export default ZebraCarOwnerDropDown;

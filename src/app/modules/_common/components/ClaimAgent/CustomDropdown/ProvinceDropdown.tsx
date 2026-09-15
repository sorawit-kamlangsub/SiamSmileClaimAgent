import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";
import { useGetProvince } from "../../../../../api/coreClaimMastersApi";

type ProvinceDropdownProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName" | "filterSelectedOptions"
>;

const ProvinceDropdown = ({ formik, ...props }: ProvinceDropdownProps) => {
    const { data, isLoading } = useGetProvince();
    return (
        <>
            <FormikAutocomplete
                data={data?.data ?? []}
                label="จังหวัดสถานศึกษา"
                {...props}
                formik={formik}
                isLoading={isLoading}
                filterSelectedOptions
                valueFieldName="provinceId"
                displayFieldName="provinceName"
            />
        </>
    );
};

export default ProvinceDropdown;

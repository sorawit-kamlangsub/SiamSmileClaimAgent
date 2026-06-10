import { useMemo } from "react";
import { useGetProvince } from "../../../../../api/claimAgentMaster";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type ProvinceDropdownProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName" | "filterSelectedOptions"
>;

const ProvinceDropdown = ({ formik, ...props }: ProvinceDropdownProps) => {
    const { data, isLoading } = useGetProvince();
    useMemo(() => {
        if (data && data.data) {
            data.data.unshift({
                provinceId: 0,
                provinceName: "ทั้งหมด",
            });
        }
    }, [data]);
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

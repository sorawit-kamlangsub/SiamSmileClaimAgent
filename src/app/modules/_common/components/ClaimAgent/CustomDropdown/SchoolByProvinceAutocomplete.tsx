import { useGetSchoolByProvinceId } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type SchoolByProvinceAutocompleteProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>

const SchoolByProvinceAutocomplete = ({ formik, ...props }: SchoolByProvinceAutocompleteProps) => {
    const { data, isLoading } = useGetSchoolByProvinceId(formik.values.provinceId);

    return (
        <FormikAutocomplete
            data={data?.data ?? []}
            label="โรงเรียน"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="organizeId"
            displayFieldName="organizeName"
            isLoading={isLoading}
        />
    );
};

export default SchoolByProvinceAutocomplete;

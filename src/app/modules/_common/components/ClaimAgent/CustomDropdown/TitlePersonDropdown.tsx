import { useGetTitle } from "../../../../../api/coreClaimMastersApi";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";

type TitlePersonDropdownProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const TitlePersonDropdown = ({ formik, ...props }: TitlePersonDropdownProps) => {
    const { data, isLoading } = useGetTitle(undefined, 2);

    return (
        <FormikAutocomplete
            data={data?.data ?? []}
            label="คำนำหน้าชื่อ"
            sx={{ mt: 0 }}
            {...props}
            formik={formik}
            valueFieldName="titleId"
            displayFieldName="titleName"
            isLoading={isLoading}
            fullWidth
        />
    );
};

export default TitlePersonDropdown;

import { useGetTitle } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type TitlePersonDropdownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const TitlePersonDropdown = ({ formik, ...props }: TitlePersonDropdownProps) => {
    const { data, isLoading } = useGetTitle(undefined, 2);

    return (
        <FormikDropdown
            data={data?.data ?? []}
            label="คำนำหน้าชื่อ"
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

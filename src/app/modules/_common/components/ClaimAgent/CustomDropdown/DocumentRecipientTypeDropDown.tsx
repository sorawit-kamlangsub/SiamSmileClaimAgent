import { useGetDocumentRecipientType } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type DocumentRecipientTypeDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const DocumentRecipientTypeDropDown = ({ formik, ...props }: DocumentRecipientTypeDropDownProps) => {
    const { data, isLoading } = useGetDocumentRecipientType();

    return (
        <FormikDropdown
            data={data?.data ?? []}
            label="ผู้รับเอกสาร"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="documentRecipientTypeId"
            displayFieldName="documentRecipientTypeName"
            isLoading={isLoading}
        />
    );
};

export default DocumentRecipientTypeDropDown;

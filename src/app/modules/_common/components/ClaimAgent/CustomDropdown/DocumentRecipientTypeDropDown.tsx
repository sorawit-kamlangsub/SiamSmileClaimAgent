import { useMemo } from "react";
import { useGetDocumentRecipientType } from "../../../../../api/coreClaimMastersApi";
import { DocumentRecipientType } from "../../../../../functionHelpers";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type DocumentRecipientTypeDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
>;

const DocumentRecipientTypeDropDown = ({ formik, ...props }: DocumentRecipientTypeDropDownProps) => {
    const { data, isLoading } = useGetDocumentRecipientType();
    // RC-010 10.1 : ตัวเลือกมีแค่ Walk Out / Walk in / Pivot — ตัด n/a ออก
    // useMemo เพราะ FormikDropdown ยิง selectedCallback ซ้ำทุกครั้งที่ reference ของ data เปลี่ยน
    const options = useMemo(
        () => (data?.data ?? []).filter((item) => item.documentRecipientTypeId !== DocumentRecipientType.NotApplicable),
        [data]
    );

    return (
        <FormikDropdown
            data={options}
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

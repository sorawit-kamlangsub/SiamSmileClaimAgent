import { useGetContactPersonType } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type ContactPersonTypeDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
> & {
    filterIds?: number[];
    contactPersonGroupId?: number;
    productTypeId?: number;
};

const ContactPersonTypeDropDown = ({
    formik,
    filterIds,
    contactPersonGroupId,
    productTypeId,
    ...props
}: ContactPersonTypeDropDownProps) => {
    //contactPersonGroupId : 1 = ph, deadclaim | 2 = pa | 3 = motor
    const { data, isLoading } = useGetContactPersonType(undefined, contactPersonGroupId, productTypeId);

    let filteredData = filterIds
        ? data?.data?.filter((item: any) => filterIds.includes(item.contactPersonTypeId))
        : data?.data ?? [];

    if (filterIds) {
        filteredData = filteredData?.sort(
            (a: any, b: any) => filterIds.indexOf(a.contactPersonTypeId) - filterIds.indexOf(b.contactPersonTypeId)
        );
    }

    return (
        <FormikDropdown
            data={filteredData}
            label="ประเภทผู้ติดต่อ"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="contactPersonTypeId"
            displayFieldName="contactPersonTypeName"
            isLoading={isLoading}
        />
    );
};

export default ContactPersonTypeDropDown;

import { useGetBankAccountRelationType } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type BankAccountRelationTypeDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
> & {
    filterIds?: number[];
    bankAccountRelationGroupId?: number | undefined;
    productTypeId?: number | undefined;
};

const BankAccountRelationTypeDropDown = ({
    formik,
    filterIds,
    bankAccountRelationGroupId,
    productTypeId,
    ...props
}: BankAccountRelationTypeDropDownProps) => {
    //bankAccountRelationGroupId : 1 = ph, pa, claimmisc | 2 = motor
    const { data, isLoading } = useGetBankAccountRelationType(undefined, bankAccountRelationGroupId, productTypeId);

    let filteredData = filterIds
        ? data?.data?.filter((item: any) => filterIds.includes(item.bankAccountRelationTypeId))
        : data?.data ?? [];

    if (filterIds) {
        filteredData = filteredData?.sort(
            (a: any, b: any) =>
                filterIds.indexOf(a.bankAccountRelationTypeId) - filterIds.indexOf(b.bankAccountRelationTypeId)
        );
    }

    return (
        <FormikDropdown
            data={filteredData}
            label="ประเภทความสัมพันธ์"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="bankAccountRelationTypeId"
            displayFieldName="bankAccountRelationTypeName"
            isLoading={isLoading}
        />
    );
};

export default BankAccountRelationTypeDropDown;

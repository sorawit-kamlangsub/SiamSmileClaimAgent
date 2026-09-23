import { useMemo } from "react";
import { useGetBranch } from "../../../../IncreaseLimitTransfer/_common/masterAPI";
import { FormikAutocomplete } from "../../CustomFormik";
import { FormikAutocompleteProps } from "../../CustomFormik/FormikAutocomplete";
import { useIsHeadOfficeBranch } from "../../../branchPermission";

type BranchAutocompleteProps = Omit<
    FormikAutocompleteProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
> & {
    // เปิด/ปิดตัวเลือก "ทั้งหมด" — ให้ผู้เรียกใช้เป็นคนตัดสินใจแทนที่จะ hardcode ไว้ในนี้
    withAllOption?: boolean;
    allOptionLabel?: string;
};

const BranchAutocomplete = ({
    formik,
    withAllOption = false,
    allOptionLabel = "ทั้งหมด",
    ...props
}: BranchAutocompleteProps) => {
    const { data, isLoading } = useGetBranch();
    const isHeadOfficeBranch = useIsHeadOfficeBranch();

    const options = useMemo(() => {
        const branches = data?.data ?? [];
        if (!withAllOption || !isHeadOfficeBranch) return branches;
        return [{ branchId: 0, branchName: allOptionLabel }, ...branches];
    }, [data, withAllOption, allOptionLabel, isHeadOfficeBranch]);

    return (
        <FormikAutocomplete
            data={options}
            label="สาขา"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="branchId"
            displayFieldName="branchName"
            isLoading={isLoading}
        />
    );
};

export default BranchAutocomplete;

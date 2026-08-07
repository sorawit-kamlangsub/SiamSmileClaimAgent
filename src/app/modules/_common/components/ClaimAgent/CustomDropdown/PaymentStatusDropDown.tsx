import { useMemo } from "react";
import { useGetPaymentStatus } from "../../../../../api/coreClaimMastersApi";
import FormikDropdown, { FormikDropdownProps } from "../../CustomFormik/FormikDropdown";

type PaymentStatusDropDownProps = Omit<
    FormikDropdownProps,
    "data" | "isLoading" | "valueFieldName" | "label" | "displayFieldName"
> & {
    filterIds?: number[];
    withAllOption?: boolean;
    allOptionLabel?: string;
};

const PaymentStatusDropDown = ({
    formik,
    filterIds,
    withAllOption = false,
    allOptionLabel = "ทั้งหมด",
    ...props
}: PaymentStatusDropDownProps) => {
    const { data, isLoading } = useGetPaymentStatus();

    const options = useMemo(() => {
        let items = data?.data ?? [];

        if (filterIds) {
            items = items
                .filter((item: any) => filterIds.includes(item.paymentStatusId))
                .sort((a: any, b: any) => filterIds.indexOf(a.paymentStatusId) - filterIds.indexOf(b.paymentStatusId));
        }

        if (!withAllOption) return items;
        return [{ paymentStatusId: 0, paymentStatusNameTH: allOptionLabel }, ...items];
    }, [data, filterIds, withAllOption, allOptionLabel]);

    return (
        <FormikDropdown
            data={options}
            label="สถานะการโอนเงิน"
            fullWidth
            {...props}
            formik={formik}
            valueFieldName="paymentStatusId"
            displayFieldName="paymentStatusNameTH"
            isLoading={isLoading}
        />
    );
};

export default PaymentStatusDropDown;

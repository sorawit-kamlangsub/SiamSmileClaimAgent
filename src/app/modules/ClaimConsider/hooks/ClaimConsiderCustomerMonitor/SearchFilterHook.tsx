import dayjs, { Dayjs } from "dayjs";
import { FormikErrors, useFormik } from "formik";
import { useGetClaimTransactionType } from "../../../../api/coreClaimMastersApi";
import { useMemo } from "react";

export type SearchFilterType = {
    dateType: number | undefined;
    dateFrom: Dayjs | undefined | null;
    dateTo: Dayjs | undefined | null;
    product: number[] | undefined;
    searchFrom: number | undefined;
    searchDetail: string | undefined;
    statusId: number | undefined;
};

export type AppliedFilter = Omit<SearchFilterType, "dateFrom" | "dateTo"> & {
    isSearch: boolean;
    dateFrom?: Dayjs;
    dateTo?: Dayjs;
    path: string;
};

type UseSearchFilterHookParams = {
    onSearch?: (values: SearchFilterType) => void;
};

const useSearchFilterHook = ({ onSearch }: UseSearchFilterHookParams = {}) => {
    const currentDate = dayjs();
    const { data: claimTransactionTypeData, isLoading: claimTransactionTypeDataLoading } = useGetClaimTransactionType();
    const statusOptions = useMemo(
        () => [
            { value: 0, label: "ทั้งหมด" },
            ...(claimTransactionTypeData?.data ?? [])
                .filter((item) => item.claimTransactionTypeId !== 9) // ซ่อนสถานะ "อนุมัติ" (id 9)
                .map((item) => ({
                    value: item.claimTransactionTypeId ?? 0,
                    label: item.claimTransactionTypeName ?? "",
                })),
        ],
        [claimTransactionTypeData]
    );

    const defaultValues: SearchFilterType = {
        dateType: 1,
        dateFrom: currentDate,
        dateTo: currentDate,
        product: [6, 26],
        searchFrom: undefined,
        searchDetail: "",
        statusId: 0,
    };
    const formik = useFormik<SearchFilterType>({
        initialValues: defaultValues,
        validate: () => {
            const errors: FormikErrors<SearchFilterType> = {};
            return errors;
        },
        onSubmit: (values) => {
            onSearch?.(values); // ← เพิ่ม
        },
    });
    return { formik, statusOptions, claimTransactionTypeDataLoading };
};

export default useSearchFilterHook;

// SearchFilterHook.ts — export ออกมา
export const getDefaultSearchFilter = (currentDate: Dayjs): SearchFilterType => ({
    dateType: 1,
    dateFrom: currentDate,
    dateTo: currentDate,
    product: [6, 26],
    searchFrom: undefined,
    searchDetail: "",
    statusId: 0,
});

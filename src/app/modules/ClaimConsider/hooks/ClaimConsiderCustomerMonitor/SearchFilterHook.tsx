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
    /** กำหนดสถานะที่แสดงเอง (เช่น Death & Disability) — ระบุแล้วจะแสดงเฉพาะ id เหล่านี้ รวม "อนุมัติ" (9) ด้วย */
    includedStatusIds?: number[];
    /** สถานะที่ซ่อนจากตัวกรอง — ใช้เมื่อไม่ได้ระบุ includedStatusIds (ค่าเริ่มต้นซ่อน "อนุมัติ" (9)) */
    excludedStatusIds?: number[];
};

/** ซ่อนสถานะ "อนุมัติ" (9) จากตัวกรองของ Monitor */
const DEFAULT_EXCLUDED_STATUS_IDS = [9];

const useSearchFilterHook = ({
    onSearch,
    includedStatusIds,
    excludedStatusIds = DEFAULT_EXCLUDED_STATUS_IDS,
}: UseSearchFilterHookParams = {}) => {
    const currentDate = dayjs();
    const { data: claimTransactionTypeData, isLoading: claimTransactionTypeDataLoading } = useGetClaimTransactionType();
    const statusOptions = useMemo(
        () => [
            { value: 0, label: "ทั้งหมด" },
            ...(claimTransactionTypeData?.data ?? [])
                .filter((item) =>
                    includedStatusIds
                        ? includedStatusIds.includes(item.claimTransactionTypeId ?? -1)
                        : !excludedStatusIds.includes(item.claimTransactionTypeId ?? -1)
                )
                .map((item) => ({
                    value: item.claimTransactionTypeId ?? 0,
                    label: item.claimTransactionTypeName ?? "",
                })),
        ],
        [claimTransactionTypeData, includedStatusIds, excludedStatusIds]
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
        validate: (values) => {
            const errors: FormikErrors<SearchFilterType> = {};
            if (values.dateFrom && values.dateTo && values.dateTo.isBefore(values.dateFrom, "day")) {
                errors.dateTo = "ถึงวันที่แจ้งเคลมต้องไม่น้อยกว่าจากวันที่แจ้งเคลม";
            }
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

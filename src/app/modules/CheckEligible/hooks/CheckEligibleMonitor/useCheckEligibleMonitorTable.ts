import React from "react";
import { PaginationSortableDto } from "../../../_common";
import { useAppSelector } from "../../../../../redux";
import { useGetCustomerSearch } from "../../../../api/claimAgentApi";

const useCheckEligibleMonitorTable = () => {
    const { checkeligibleMonitorSearch, isSearchcheckeligibleMonitor } = useAppSelector((s) => s.checkeligible);

    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    const { data: apiData, isLoading } = useGetCustomerSearch(
        isSearchcheckeligibleMonitor,
        checkeligibleMonitorSearch?.searchTypeId, // searchIndex
        false, // isSeachDetail
        undefined, // dateHappen
        undefined, // schoolId
        undefined, // provinceId
        checkeligibleMonitorSearch?.searchDetail, // searchDetail
        undefined, // orderingField
        undefined, // ascendingOrder
        paginated.page, // page
        paginated.recordsPerPage // recordsPerPage
    );

    const data = apiData?.data ?? [];

    return { isLoading, data, paginated, setPaginated };
};

export default useCheckEligibleMonitorTable;

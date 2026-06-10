import React from "react";
import { PaginationSortableDto } from "../../../_common";
import { useAppSelector } from "../../../../../redux";
import { useGetCustomerSearch } from "../../../../api/claimAgentApi";

const useCheckEligibleMonitorTable = () => {
    const { searchTypeId, searchDetail} = useAppSelector((s) => s.checkeligible.checkeligibleMonitorSearch);

    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    const { data: apiData, isLoading } = useGetCustomerSearch(
        searchTypeId, // searchIndex
        !!searchDetail, // isSeachDetail
        undefined, // dateHappen
        undefined, // schoolId
        undefined, // provinceId
        searchDetail, // searchDetail
        undefined, // orderingField
        undefined, // ascendingOrder
        paginated.page, // page
        paginated.recordsPerPage // recordsPerPage
    );

    const data = apiData?.data ?? [];

    return { isLoading, data, paginated, setPaginated };
};

export default useCheckEligibleMonitorTable;

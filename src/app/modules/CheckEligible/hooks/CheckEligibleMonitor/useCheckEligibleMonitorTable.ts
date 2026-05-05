import React from "react";
import { PaginationSortableDto } from "../../../_common";

const useCheckEligibleMonitorTable = () => {
    const isLoading = false;

    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    const data = [
        {
            appId: "APP-001",
            customerName: "นายสมชาย ใจดี",
            productName: "ประกันสุขภาพ",
            productCategoryName: "แผน A",
            startCoverDate: "2025-01-01",
            endCoverDate: "2027-01-01",
        },
    ];

    return { isLoading, data, paginated, setPaginated };
};

export default useCheckEligibleMonitorTable;

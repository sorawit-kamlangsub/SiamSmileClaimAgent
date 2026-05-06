import React from "react";
import { PaginationSortableDto } from "../../../_common";
import { MUIDataTableColumn } from "mui-datatables";
import { cellAlignOptions, formatDateString, numberWithCommas } from "../../../../functionHelpers";
import dayjs from "dayjs";

const useContinuousClaimTable = () => {
    const isLoading = false;

    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    const data = [
        {
            claimCode: "claim-001",
            chiefComplain: "ปวดหัว",
            incidentDate: dayjs(),
            amount: 3000,
            amountPay: 2000,
        },
    ];

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimCode",
            label: "Claim Code",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "chiefComplain",
            label: "อาการสำคัญ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "incidentDate",
            label: "วันที่เกิดเหตุ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => {
                    return formatDateString(value?.toString(), `DD/MM/BBBB`);
                },
            },
        },
        {
            name: "amount",
            label: "ยอดรวมเบิก",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => {
                    return numberWithCommas(value?.toString() || 0);
                },
            },
        },
        {
            name: "amountPay",
            label: "ยอดรวมจ่าย",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => {
                    return numberWithCommas(value?.toString() || 0);
                },
            },
        },
    ];

    return { isLoading, data, paginated, setPaginated, columns };
};

export default useContinuousClaimTable;

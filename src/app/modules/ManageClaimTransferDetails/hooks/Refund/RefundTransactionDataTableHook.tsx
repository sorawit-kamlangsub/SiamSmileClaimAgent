import dayjs from "dayjs";
import { MUIDataTableColumn } from "mui-datatables";
import { useGetRefundClaimTransaction } from "../../../Refund/refundAPI";
import { Box } from "@mui/material";
import { numberWithCommas } from "../../../../functionHelpers";
import { useMemo, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";

type RefundTransactionDataTableHookProps = {
    caseId: string;
};

const RefundTransactionDataTableHook = ({ caseId }: RefundTransactionDataTableHookProps) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const {
        data: transactionData,
        isLoading: isTransactionLoading,
        isError: isTransactionError,
        error: transactionError,
    } = useGetRefundClaimTransaction(caseId, paginated);

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: transactionData?.totalAmountRecords ?? 0,
            totalAmountPages: transactionData?.totalAmountPages ?? 0,
            currentPage: transactionData?.currentPage ?? 0,
            recordsPerPage: transactionData?.recordsPerPage ?? 0,
            pageIndex: transactionData?.pageIndex ?? 0,
        }),
        [transactionData]
    );

    const columns: MUIDataTableColumn[] = [
        {
            name: "transactionDate",
            label: "วันที่ทำรายการ",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    const d = transactionData?.data?.[rowIndex]?.transactionDate;
                    return d ? dayjs(d).format("DD/MM/YYYY HH:mm:ss") : "-";
                },
            },
        },
        {
            name: "claimTransactionTypeName",
            label: "ประเภทรายการ",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "createdByFullName",
            label: "ผู้ทำรายการ",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "amountTotal",
            label: "จำนวนเงิน",
            options: {
                filter: false,
                sort: false,
                setCellHeaderProps: () => ({ align: "right" as const }),
                customBodyRenderLite: (rowIndex) => {
                    const amount = transactionData?.data?.[rowIndex]?.amountTotal ?? 0;
                    return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
                },
            },
        },
        {
            name: "remark",
            label: "หมายเหตุ",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (rowIndex) => transactionData?.data?.[rowIndex]?.remark ?? "-",
            },
        },
    ];

    return {
        columns,
        transactionData,
        isTransactionLoading,
        isTransactionError,
        transactionError,
        pagination,
        setPaginated,
    };
};

export default RefundTransactionDataTableHook;
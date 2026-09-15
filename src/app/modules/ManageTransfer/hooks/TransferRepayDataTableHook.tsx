import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../functionHelpers";
import { Box, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRefundDataTable } from "../repayAPI";
import { useAppSelector } from "../../../../redux";
import { PaginationSortableDto } from "../../_common";
import { useState } from "react";
import dayjs from "dayjs";

const useTransferRepayDataTableHook = () => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { searchRepay: searchRefund } = useAppSelector((state) => state.repay);
    const { data: refundDataTableData, isLoading: refundDataTableIsLoading } = useRefundDataTable({
        searchDetail: searchRefund.searchDetail,
        page: paginated.page,
        recordsPerPage: paginated.recordsPerPage,
    });

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "เลขที่ CL",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "claimCreated",
            label: "วันที่สร้างเคลม",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = refundDataTableData?.data?.[rowIndex]?.claimCreated
                        ? dayjs(refundDataTableData?.data?.[rowIndex]?.claimCreated).format("DD/MM/YYYY HH:mm:ss")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "toAccountNo",
            label: "เลขที่บัญชี",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "toAccountName",
            label: "ชื่อบัญชี",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "toBank",
            label: "ธนาคาร",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "totalNetPaidAmount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box sx={{ textAlign: "end" }}>
                            {numberWithCommas(refundDataTableData?.data?.[rowIndex]?.totalNetPaidAmount ?? 0)}
                        </Box>
                    );
                },
            },
        },
        {
            name: "paymentStatusNameTH",
            label: "สถานะโอนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: 3,
                                color: "#BF360C",
                                bgcolor: "#FCE8E6",
                                justifyItems: "center",
                                gap: "4px",
                                padding: "3px 12px",
                            }}
                        >
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#BF360C" }} />
                            {refundDataTableData?.data?.[rowIndex]?.paymentStatusNameTH}
                        </Box>
                    );
                },
            },
        },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (_rowIndex) => {
                    return (
                        <IconButton sx={{ backgroundColor: "#00569D", color: "#FFFFFF", scale: -0.8 }}>
                            <RefreshIcon />
                        </IconButton>
                    );
                },
            },
        },
    ];
    return { columns, refundDataTableData, refundDataTableIsLoading, paginated, setPaginated };
};

export default useTransferRepayDataTableHook;

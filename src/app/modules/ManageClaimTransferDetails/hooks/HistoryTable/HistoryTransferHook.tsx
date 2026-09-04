import { Box } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../../functionHelpers";
import dayjs from "dayjs";

export interface PayTransferDetail {
    paymentCode: string;
    createdDate: string;
    paymentTypeName: string;
    totalNetPaidAmount: number;
    toBankName: string;
    toBankAccountNo: string;
    toBankAccountName: string;
}

const amountHeadRender = (columnMeta: { label: string }) => (
    <Box
        sx={{
            textAlign: "end",
            p: 2,
            width: "100%",
            borderBottom: "1px solid #E0E0E0",
            boxSizing: "border-box",
        }}
    >
        {columnMeta.label}
    </Box>
);

export const usePayTransferHistoryColumns = (data: PayTransferDetail[]): MUIDataTableColumn[] => [
    {
        name: "createdDate",
        label: "วันที่ทำรายการ",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) => {
                const createdDate = data[rowIndex]?.createdDate;
                return createdDate ? dayjs(createdDate).format("DD/MM/YYYY HH:mm:ss") : "-";
            },
        },
    },
    {
        name: "paymentTypeName",
        label: "ประเภทรายการ",
        options: { filter: false, sort: false },
    },
    {
        name: "totalNetPaidAmount",
        label: "จำนวนเงิน",
        options: {
            filter: false,
            sort: false,
            customHeadRender: (columnMeta) => {
                return amountHeadRender({ label: columnMeta.label ?? "" });
            },
            customBodyRenderLite: (rowIndex) => {
                const amount = data[rowIndex]?.totalNetPaidAmount ?? 0;
                return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
            },
        },
    },
    {
        name: "detail",
        label: "รายละเอียด",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) => {
                const row = data[rowIndex];
                if (!row) return "-";
                return `${row.toBankName} ${row.toBankAccountNo} ${row.toBankAccountName}`;
            },
        },
    },
];

export const useRefundHistoryColumns = (data: PayTransferDetail[]): MUIDataTableColumn[] => [
    {
        name: "createdDate",
        label: "วันที่ทำรายการ",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) => {
                const createdDate = data[rowIndex]?.createdDate;
                return createdDate ? dayjs(createdDate).format("DD/MM/YYYY HH:mm:ss") : "-";
            },
        },
    },
    {
        name: "paymentTypeName",
        label: "ประเภทรายการ",
        options: { filter: false, sort: false },
    },
    {
        name: "totalNetPaidAmount",
        label: "จำนวนเงิน",
        options: {
            filter: false,
            sort: false,
            customHeadRender: (columnMeta) => {
                return amountHeadRender({ label: columnMeta.label ?? "" });
            },
            customBodyRenderLite: (rowIndex) => {
                const amount = data[rowIndex]?.totalNetPaidAmount ?? 0;
                return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
            },
        },
    },
    {
        name: "detail",
        label: "รายละเอียด",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) => {
                const row = data[rowIndex];
                if (!row) return "-";
                return `${row.toBankName} ${row.toBankAccountNo} ${row.toBankAccountName}`;
            },
        },
    },
];

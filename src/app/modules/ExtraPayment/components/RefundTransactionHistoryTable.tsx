import React from "react";
import StandardDataTable from "../../_common/components/DataTable/StandardDataTable";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../_common/components/CustomComponent/HeadingWithColor";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../functionHelpers";
import dayjs, { Dayjs } from "dayjs";
import { AnyAsyncThunk } from "@reduxjs/toolkit/dist/matchers";

type RefundItem = {
    transactionCode: string;
    performedAt: Dayjs;
    type: string;
    amount: number;
    reason: string;
};

// const formatDate = (iso?: string) => {
//     if (!iso) return "";
//     const d = new Date(iso);
//     const pad = (n: number) => n.toString().padStart(2, "0");
//     return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
//         d.getMinutes()
//     )}:${pad(d.getSeconds())}`;
// };

const mockData: RefundItem[] = [
    {
        transactionCode: "RT690500011",
        performedAt: dayjs(),
        type: "คืนเงินสำเร็จ",
        amount: -100.0,
        reason: "บันทึกยอดผิด",
    },
];

export const RefundTransactionHistoryTable: React.FC = () => {
    const columns = [
        {
            name: "transactionCode",
            label: "Transaction Code",
            options: { filter: false, sort: false, ...cellAlignOptions() },
        },
        {
            name: "performedAt",
            label: "วันที่ทำรายการ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value: any) => formatDateString(value, "DD/MM/BBBB HH:mm:ss"),
            },
        },
        {
            name: "type",
            label: "ประเภทรายการ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value: AnyAsyncThunk) =>
                    Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "details",
            label: "รายละเอียด",
            options: { filter: false, sort: false, ...cellAlignOptions() },
        },
    ];

    const rows = mockData.map((m) => ({
        transactionCode: m.transactionCode,
        performedAt: m.performedAt,
        type: m.type,
        amount: m.amount,
        details: m.reason,
    }));

    return (
        <CustomPaper>
            <HeadingWithColor text="ประวัติการคืนเงิน" color="blue" icon={<HistoryOutlinedIcon />} />
            <StandardDataTable
                name="refund-transaction-history"
                title={undefined}
                columns={columns}
                data={rows}
                rowsPerPage={[5, 10, 15]}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                options={{ ...defaultOptionStandardDataTable }}
                sx={smallSizeFooter}
            />
        </CustomPaper>
    );
};

export default RefundTransactionHistoryTable;

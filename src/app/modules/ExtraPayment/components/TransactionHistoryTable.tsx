import React from "react";
import StandardDataTable from "../../_common/components/DataTable/StandardDataTable";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";
// import { HeadingWithColor } from "../../_common/components/CustomComponent/HeadingWithColor";
// import ListAltIcon from "@mui/icons-material/ListAlt";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../functionHelpers";
import dayjs, { Dayjs } from "dayjs";

type TransactionItem = {
    transactionCode: string;
    performedAt: Dayjs; // ISO date
    type: string;
    actor: string;
    amount: number;
};

const mockData: TransactionItem[] = [
    {
        transactionCode: "TR690506754",
        performedAt: dayjs(),
        type: "คืนเงินสำเร็จ",
        actor: "นางฐิติมา อินทะปัญญา",
        amount: -100.0,
    },
    {
        transactionCode: "TR690506753",
        performedAt: dayjs(),
        type: "คืนเงิน",
        actor: "นางฐิติมา อินทะปัญญา",
        amount: -100.0,
    },
    {
        transactionCode: "TR690506751",
        performedAt: dayjs(),
        type: "โอนสำเร็จ Transfer",
        actor: "System",
        amount: 500.0,
    },
    {
        transactionCode: "TR690506749",
        performedAt: dayjs(),
        type: "โอนเพิ่ม",
        actor: "นางฐิติมา อินทะปัญญา",
        amount: 200.0,
    },
    {
        transactionCode: "TR690506747",
        performedAt: dayjs(),
        type: "สร้างรายการเคลม",
        actor: "นางฐิติมา อินทะปัญญา",
        amount: 0.0,
    },
];

export const TransactionHistoryTable: React.FC = () => {
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
            name: "actor",
            label: "ผู้ทำรายการ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value: any) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
    ];

    const rows = mockData.map((m) => ({
        transactionCode: m.transactionCode,
        performedAt: m.performedAt,
        type: m.type,
        actor: m.actor,
        amount: m.amount,
    }));

    return (
        <CustomPaper>
            {/* <HeadingWithColor text="ประวัติการทำรายการ" icon={<ListAltIcon />} /> */}
            <StandardDataTable
                name="transaction-history"
                title={undefined}
                columns={columns}
                data={rows}
                rowsPerPage={[5, 10, 15]}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                options={{ ...defaultOptionStandardDataTable }}
                sx={smallSizeFooter}
                rowHover={false}
                // rowBackgroundColor
            />
        </CustomPaper>
    );
};

export default TransactionHistoryTable;

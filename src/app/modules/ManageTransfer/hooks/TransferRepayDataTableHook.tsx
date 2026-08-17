import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../functionHelpers";
import { Box, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const useTransferRepayDataTableHook = () => {
    const dataMock = [
        {
            claimNo: "CL6907000001",
            createdDate: "01/07/2569",
            accountNo: "1234567890",
            accountName: "นายสมชาย ใจดี",
            bank: "กรุงไทย",
            amount: 3200.0,
            transferStatus: "โอนสำเร็จ",
        },
        {
            claimNo: "CL6907000002",
            createdDate: "02/07/2569",
            accountNo: "2345678901",
            accountName: "นางสาวนวพร ก้องเกียรติสกุล",
            bank: "กสิกรไทย",
            amount: 1500.5,
            transferStatus: "รอโอน",
        },
        {
            claimNo: "CL6907000003",
            createdDate: "03/07/2569",
            accountNo: "3456789012",
            accountName: "นายอนุชา พงษ์ไพบูลย์",
            bank: "ไทยพาณิชย์",
            amount: 640.0,
            transferStatus: "โอนสำเร็จ",
        },
        {
            claimNo: "CL6907000004",
            createdDate: "04/07/2569",
            accountNo: "4567890123",
            accountName: "นางสาวพิมพ์ชนก เจริญสุข",
            bank: "กรุงเทพ",
            amount: 4800.75,
            transferStatus: "โอนไม่สำเร็จ",
        },
        {
            claimNo: "CL6907000005",
            createdDate: "05/07/2569",
            accountNo: "5678901234",
            accountName: "นายกิตติศักดิ์ ภาณุกิจไพบูลย์",
            bank: "กรุงไทย",
            amount: 2100.0,
            transferStatus: "รอโอน",
        },
        {
            claimNo: "CL6907000006",
            createdDate: "06/07/2569",
            accountNo: "6789012345",
            accountName: "นางวิภาดา แสงทอง",
            bank: "ทหารไทยธนชาต",
            amount: 950.25,
            transferStatus: "ยกเลิก",
        },
    ];

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
            name: "createdDate",
            label: "วันที่สร้างเคลม",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "accountNo",
            label: "เลขที่บัญชี",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "accountName",
            label: "ชื่อบัญชี",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "bank",
            label: "ธนาคาร",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return <Box sx={{ textAlign: "end" }}>{numberWithCommas(dataMock?.[rowIndex]?.amount ?? 0)}</Box>;
                },
            },
        },
        {
            name: "transferStatus",
            label: "สถานะโอนเงิน",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <IconButton sx={{ backgroundColor: "#00569D", color: "#FFFFFF", scale: -0.8 }}>
                            <RefreshIcon />
                        </IconButton>
                    );
                },
            },
        },
    ];
    return { columns, dataMock };
};

export default useTransferRepayDataTableHook;

import { Box, IconButton, Link, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";

export type ClRefundTransactionStatus = "รอดำเนินการ" | "คืนเงินสำเร็จ" | "ยกเลิกการคืนเงิน" | "ปฏิเสธการคืนเงิน";

export interface ClRefundTransactionRow {
    transactionCode: string;
    clNo: string;
    ccNo: string;
    createdDate: string;
    insuredName: string;
    amount: number;
    refundAmount: number;
    status: ClRefundTransactionStatus;
    reason: string;
}

const dataMock: ClRefundTransactionRow[] = [
    {
        transactionCode: "RT681200011",
        clNo: "CL690467210",
        ccNo: "CC690467210",
        createdDate: "12/10/2569 09:14:02",
        insuredName: "นายกิตติ วงศ์สุวรรณ",
        amount: 4000.0,
        refundAmount: 600.0,
        status: "รอดำเนินการ",
        reason: "จ่ายเงินเกินสิทธิ",
    },
    {
        transactionCode: "RT690500004",
        clNo: "CL690400069",
        ccNo: "CC690400069",
        createdDate: "20/07/2569 12:33:31",
        insuredName: "นางรัชชนก คำภาพันธ์",
        amount: 2735.0,
        refundAmount: 400.0,
        status: "รอดำเนินการ",
        reason: "จ่ายเงินเกินสิทธิ",
    },
    {
        transactionCode: "RT690500005",
        clNo: "CL690400101",
        ccNo: "CC690400101",
        createdDate: "20/07/2569 13:44:22",
        insuredName: "นายสมชาย แก้วมณี",
        amount: 4152.0,
        refundAmount: 300.0,
        status: "รอดำเนินการ",
        reason: "จ่ายเงินเกินสิทธิ",
    },
    {
        transactionCode: "RT690500008",
        clNo: "CL690417642",
        ccNo: "CC690417642",
        createdDate: "10/10/2569 11:24:23",
        insuredName: "นายปารเมศ คำภาพันธ์",
        amount: 1000.0,
        refundAmount: 100.0,
        status: "รอดำเนินการ",
        reason: "ปัญหาบัญชีผู้ใช้",
    },
    {
        transactionCode: "RT690500007",
        clNo: "CL690459081",
        ccNo: "CC690459081",
        createdDate: "10/10/2569 11:24:23",
        insuredName: "นายธนิก เงินล้ำยอง",
        amount: 1000.0,
        refundAmount: 100.0,
        status: "ปฏิเสธการคืนเงิน",
        reason: "ปัญหาบัญชีผู้ใช้",
    },
];

const statusColorMap: Record<ClRefundTransactionStatus, { bg: string; text: string }> = {
    รอดำเนินการ: { bg: "#FFF3E0", text: "#EF6C00" },
    คืนเงินสำเร็จ: { bg: "#E8F5E9", text: "#2E7D32" },
    ยกเลิกการคืนเงิน: { bg: "#FDECEA", text: "#C62828" },
    ปฏิเสธการคืนเงิน: { bg: "#FDECEA", text: "#C62828" },
};

const StatusPill = ({ status }: { status: ClRefundTransactionStatus }) => {
    const { bg, text } = statusColorMap[status];
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "20px",
                padding: "3px 12px",
                border: `1px solid ${text}`,
                backgroundColor: bg,
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: text }} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: text }}>{status}</Typography>
        </Box>
    );
};

const formatAmount = (value: number) =>
    value.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const useRefundDataTableHook = () => {
    const handleView = (row: ClRefundTransactionRow) => {
        // TODO: open view dialog / navigate to detail page
        console.log("view", row);
    };

    const handleReject = (row: ClRefundTransactionRow) => {
        // TODO: whatever the red "X" action does for a rejected row
        console.log("rejected row action", row);
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "transactionCode",
            label: "รหัสรายการ",
            options: { sort: false, filter: false },
        },
        {
            name: "clNo",
            label: "เลขที่ CL",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = dataMock[dataIndex];
                    return (
                        <Link
                            component="button"
                            underline="hover"
                            sx={{ color: "#1565C0", fontWeight: 600 }}
                            onClick={() => handleView(row)}
                        >
                            {row.clNo}
                        </Link>
                    );
                },
            },
        },
        {
            name: "ccNo",
            label: "เลขที่ CC",
            options: { sort: false, filter: false },
        },
        {
            name: "createdDate",
            label: "วันที่สร้างเคลม",
            options: { sort: false, filter: false },
        },
        {
            name: "insuredName",
            label: "ชื่อผู้เอาประกัน",
            options: { sort: false, filter: false },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => formatAmount(dataMock[dataIndex].amount),
            },
        },
        {
            name: "refundAmount",
            label: "โอนคืน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => formatAmount(dataMock[dataIndex].refundAmount),
            },
        },
        {
            name: "status",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => <StatusPill status={dataMock[dataIndex].status} />,
            },
        },
        {
            name: "reason",
            label: "สาเหตุ",
            options: { sort: false, filter: false },
        },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = dataMock[dataIndex];

                    if (row.status === "ปฏิเสธการคืนเงิน" || row.status === "ยกเลิกการคืนเงิน") {
                        return (
                            <IconButton size="small" onClick={() => handleReject(row)}>
                                <CancelIcon sx={{ color: "#E53935", fontSize: 20 }} />
                            </IconButton>
                        );
                    }

                    return (
                        <IconButton size="small" onClick={() => handleView(row)}>
                            <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                        </IconButton>
                    );
                },
            },
        },
    ];

    return { columns, dataMock };
};

export default useRefundDataTableHook;

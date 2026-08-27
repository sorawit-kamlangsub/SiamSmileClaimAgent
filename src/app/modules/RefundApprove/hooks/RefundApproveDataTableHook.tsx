import { Box, IconButton, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";

export type RefundTransactionStatus = "รอดำเนินการ" | "คืนเงินสำเร็จ" | "ยกเลิกการคืนเงิน" | "ปฏิเสธการคืนเงิน";

export interface RefundTransactionRow {
    transactionCode: string;
    cpgCode: string;
    createdDate: string;
    insuredName: string;
    branch: string;
    amount: number;
    refundAmount: number;
    status: RefundTransactionStatus;
    reason: string;
}

const dataMock: RefundTransactionRow[] = [
    {
        transactionCode: "RT681200011",
        cpgCode: "CPG690467210",
        createdDate: "22/05/2569 06:10:11",
        insuredName: "โรงเรียนบ้านนาแหม",
        branch: "กรุงเทพมหานคร",
        amount: 4000.0,
        refundAmount: 600.0,
        status: "รอดำเนินการ",
        reason: "จ่ายเงินเกินสิทธิ",
    },
    {
        transactionCode: "RT690500010",
        cpgCode: "CPG690455197",
        createdDate: "11/10/2569 12:24:23",
        insuredName: "นางสาวรัชชนก สุวรรณโชค",
        branch: "กรุงเทพมหานคร",
        amount: 1700.0,
        refundAmount: 300.0,
        status: "คืนเงินสำเร็จ",
        reason: "จ่ายเงินเกินสิทธิ",
    },
    {
        transactionCode: "RT690500009",
        cpgCode: "CPG690488305",
        createdDate: "10/10/2569 11:24:23",
        insuredName: "นางสาว ปวิตรา แผนสุวรรณ์",
        branch: "สำนักงานใหญ่",
        amount: 1000.0,
        refundAmount: 100.0,
        status: "ยกเลิกการคืนเงิน",
        reason: "เลขที่บัญชีปลายทางไม่ถูกต้อง",
    },
    {
        transactionCode: "RT690500008",
        cpgCode: "CPG690417642",
        createdDate: "10/10/2569 11:24:23",
        insuredName: "นายปารเมศ คำภาพันธ์",
        branch: "สำนักงานใหญ่",
        amount: 1000.0,
        refundAmount: 100.0,
        status: "คืนเงินสำเร็จ",
        reason: "ปัญหาบัญชีผู้ใช้",
    },
    {
        transactionCode: "RT690500007",
        cpgCode: "CPG690459081",
        createdDate: "10/10/2569 11:24:23",
        insuredName: "นายธนิก เงินล้ำยอง",
        branch: "สำนักงานใหญ่",
        amount: 1000.0,
        refundAmount: 100.0,
        status: "ปฏิเสธการคืนเงิน",
        reason: "ปัญหาบัญชีผู้ใช้",
    },
];

const statusColorMap: Record<RefundTransactionStatus, { bg: string; text: string }> = {
    รอดำเนินการ: { bg: "#FFF3E0", text: "#EF6C00" },
    คืนเงินสำเร็จ: { bg: "#E8F5E9", text: "#2E7D32" },
    ยกเลิกการคืนเงิน: { bg: "#FDECEA", text: "#C62828" },
    ปฏิเสธการคืนเงิน: { bg: "#FDECEA", text: "#C62828" },
};

const StatusPill = ({ status }: { status: RefundTransactionStatus }) => {
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

const useRefundApproveDataTableHook = () => {
    const handleView = (row: RefundTransactionRow) => {
        // TODO: open view dialog / navigate to detail page
        console.log("view", row);
    };

    const handleEdit = (row: RefundTransactionRow) => {
        // TODO: open the "ดำเนินการ" (process/edit) dialog for a pending row
        console.log("edit", row);
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "transactionCode",
            label: "รหัสรายการ",
            options: { sort: false, filter: false },
        },
        {
            name: "cpgCode",
            label: "เลขที่ CPG",
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
            name: "branch",
            label: "สาขา",
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

                    if (row.status === "รอดำเนินการ") {
                        return (
                            <IconButton size="small" onClick={() => handleEdit(row)}>
                                <FactCheckIcon sx={{ color: "#8D6E00", fontSize: 20 }} />
                            </IconButton>
                        );
                    }

                    if (row.status === "คืนเงินสำเร็จ") {
                        return (
                            <IconButton size="small" onClick={() => handleView(row)}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                        );
                    }

                    return <>-</>;
                },
            },
        },
    ];

    return { columns, dataMock };
};

export default useRefundApproveDataTableHook;

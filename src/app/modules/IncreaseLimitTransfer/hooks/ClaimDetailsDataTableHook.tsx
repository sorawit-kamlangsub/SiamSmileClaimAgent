import { Box, IconButton, Link, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";

export interface CpgTransferRow {
    cpgCode: string;
    claimNo: string;
    createdDate: string;
    branch: string;
    amount: number;
    accountNo: string;
    transferType: string;
    status: "รอตรวจสอบ" | "อนุมัติ" | "ปฏิเสธ";
    reason: string | null;
}

const dataMock: CpgTransferRow[] = [
    {
        cpgCode: "CPG690600047",
        claimNo: "CL6904000962",
        createdDate: "22/05/2569 06:10:11",
        branch: "กรุงเทพมหานคร",
        amount: 7000.0,
        accountNo: "1821000011",
        transferType: "โอนเงินเพิ่ม",
        status: "รอตรวจสอบ",
        reason: null,
    },
    {
        cpgCode: "CPG690600648",
        claimNo: "CL6904000784",
        createdDate: "11/10/2569 12:24:23",
        branch: "กรุงเทพมหานคร",
        amount: 1700.0,
        accountNo: "1821000442",
        transferType: "โอนเงินครั้งแรก",
        status: "รอตรวจสอบ",
        reason: null,
    },
    {
        cpgCode: "CPG690600784",
        claimNo: "CL6904000318",
        createdDate: "10/10/2569 11:24:23",
        branch: "สำนักงานใหญ่",
        amount: 1000.0,
        accountNo: "1821000453",
        transferType: "โอนเงินครั้งแรก",
        status: "รอตรวจสอบ",
        reason: null,
    },
];

const StatusPill = ({ status }: { status: CpgTransferRow["status"] }) => {
    const colorMap: Record<CpgTransferRow["status"], { bg: string; text: string }> = {
        รอตรวจสอบ: { bg: "#FFF3E0", text: "#EF6C00" },
        อนุมัติ: { bg: "#E8F5E9", text: "#2E7D32" },
        ปฏิเสธ: { bg: "#FDECEA", text: "#C62828" },
    };
    const { bg, text } = colorMap[status];

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

const useClaimCpgTransferDataTableHook = () => {
    const handleViewRow = (row: CpgTransferRow) => {
        // TODO: open view dialog / navigate to detail page
        console.log("view", row);
    };

    const handleEditRow = (row: CpgTransferRow) => {
        // TODO: open edit/inspect dialog
        console.log("edit", row);
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "cpgCode",
            label: "เลขที่ CPG",
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
                            onClick={() => handleViewRow(row)}
                        >
                            {row.cpgCode}
                        </Link>
                    );
                },
            },
        },
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
            name: "branch",
            label: "สาขา",
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
                customBodyRenderLite: (dataIndex) => {
                    const row = dataMock[dataIndex];
                    return row.amount.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
                },
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
            name: "transferType",
            label: "ประเภทโอนเงิน",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "status",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = dataMock[dataIndex];
                    return <StatusPill status={row.status} />;
                },
            },
        },
        {
            name: "reason",
            label: "สาเหตุ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = dataMock[dataIndex];
                    return row.reason ?? "-";
                },
            },
        },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = dataMock[dataIndex];
                    return (
                        <Box sx={{ display: "flex", gap: "4px" }}>
                            <IconButton size="small" onClick={() => handleViewRow(row)}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleEditRow(row)}>
                                <FactCheckIcon sx={{ color: "#8D6E00", fontSize: 20 }} />
                            </IconButton>
                        </Box>
                    );
                },
            },
        },
    ];

    return { columns, dataMock };
};

export default useClaimCpgTransferDataTableHook;

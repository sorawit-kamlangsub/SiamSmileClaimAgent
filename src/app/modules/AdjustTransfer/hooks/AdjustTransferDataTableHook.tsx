import { Box, IconButton, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

export type AdditionalTransferStatus = "รอดำเนินการ" | "โอนสำเร็จ" | "โอนเงินไม่สำเร็จ";

export interface AdditionalTransferRow {
    clNo: string;
    ccNo: string;
    createdDate: string;
    insuredName: string;
    branch: string;
    transferredAmount: number;
    additionalAmount: number;
    status: AdditionalTransferStatus;
    reason: string | null;
}

const dataMock: AdditionalTransferRow[] = [
    {
        clNo: "CL6904000010",
        ccNo: "CC6904000010",
        createdDate: "21/07/2569 09:35:27",
        insuredName: "โรงเรียนบ้านท่ามะกา",
        branch: "กาญจนบุรี",
        transferredAmount: 4000.0,
        additionalAmount: 4734.0,
        status: "รอดำเนินการ",
        reason: null,
    },
    {
        clNo: "CL6904000048",
        ccNo: "CC6904000048",
        createdDate: "21/07/2569 09:37:36",
        insuredName: "โรงเรียนบ้านสันติสุข",
        branch: "สำนักงานใหญ่",
        transferredAmount: 1700.0,
        additionalAmount: 1895.0,
        status: "รอดำเนินการ",
        reason: null,
    },
    {
        clNo: "CL6904000115",
        ccNo: "CC6904000115",
        createdDate: "20/07/2569 13:10:39",
        insuredName: "นางสาวสุนิสา สุวรรณโชค",
        branch: "สำนักงานใหญ่",
        transferredAmount: 1000.0,
        additionalAmount: 2093.0,
        status: "โอนเงินไม่สำเร็จ",
        reason: "บัญชีปลายทางปิด",
    },
    {
        clNo: "CL6904000132",
        ccNo: "CC6904000132",
        createdDate: "22/07/2569 10:22:14",
        insuredName: "โรงเรียนวัดบางไผ่",
        branch: "กรุงเทพมหานคร",
        transferredAmount: 1200.0,
        additionalAmount: 1500.0,
        status: "โอนเงินไม่สำเร็จ",
        reason: "เลขที่บัญชีปลายทางไม่ถูกต้อง",
    },
];

const statusColorMap: Record<AdditionalTransferStatus, { bg: string; text: string }> = {
    รอดำเนินการ: { bg: "#FFF3E0", text: "#EF6C00" },
    โอนสำเร็จ: { bg: "#E8F5E9", text: "#2E7D32" },
    โอนเงินไม่สำเร็จ: { bg: "#FDECEA", text: "#C62828" },
};

const StatusPill = ({ status }: { status: AdditionalTransferStatus }) => {
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

const useAdjustTransferDataTableHook = () => {
    const handleView = (row: AdditionalTransferRow) => {
        // TODO: open view dialog / navigate to detail page
        console.log("view", row);
    };

    const handleEdit = (row: AdditionalTransferRow) => {
        // TODO: open edit dialog for a failed transfer (e.g. fix account no. and retry)
        console.log("edit", row);
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "clNo",
            label: "เลขที่ CL",
            options: {
                sort: false,
                filter: false,
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
            name: "branch",
            label: "สาขา",
            options: { sort: false, filter: false },
        },
        {
            name: "transferredAmount",
            label: "จำนวนเงินที่โอนแล้ว",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => formatAmount(dataMock[dataIndex].transferredAmount),
            },
        },
        {
            name: "additionalAmount",
            label: "โอนเพิ่ม",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => formatAmount(dataMock[dataIndex].additionalAmount),
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
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => dataMock[dataIndex].reason ?? "-",
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
                            <IconButton size="small" onClick={() => handleView(row)}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                            {row.status === "โอนเงินไม่สำเร็จ" && (
                                <IconButton size="small" onClick={() => handleEdit(row)}>
                                    <EditIcon sx={{ color: "#B8860B", fontSize: 20 }} />
                                </IconButton>
                            )}
                        </Box>
                    );
                },
            },
        },
    ];

    return { columns, dataMock };
};

export default useAdjustTransferDataTableHook;

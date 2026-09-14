import { Box, IconButton, Link, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import { useGetRefundMonitorWithFilter } from "../refundAPI";
import { PaginationResultDto, PaginationSortableDto } from "../../_common";
import { useMemo, useState } from "react";
import { useAppSelector } from "../../../../redux";
import dayjs from "dayjs";

const defaultStatusColor = { bg: "#ECEFF1", text: "#607D8B" };

type StatusColor = { bg: string; text: string };

const statusColorMapById: Record<number, StatusColor> = {
    2: { bg: "#FFF3E0", text: "#EF6C00" },
    3: { bg: "#E8F5E9", text: "#2E7D32" },
    4: { bg: "#FDECEA", text: "#C62828" },
};

const StatusPill = ({ status, color }: { status: string; color: StatusColor }) => {
    const { bg, text } = color;
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
    const { searchMonitor } = useAppSelector((state) => state.refund);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data: getRefundMonitorData, isLoading: isGetRefundLoading } = useGetRefundMonitorWithFilter({
        branceId: searchMonitor.branchId ?? null,
        refundStatusId: searchMonitor.paymentStatusId ?? null,
        pagination: paginated,
    });

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: getRefundMonitorData?.totalAmountRecords ?? 0,
            totalAmountPages: getRefundMonitorData?.totalAmountPages ?? 0,
            currentPage: getRefundMonitorData?.currentPage ?? 0,
            recordsPerPage: getRefundMonitorData?.recordsPerPage ?? paginated.recordsPerPage,
            pageIndex: getRefundMonitorData?.pageIndex ?? 0,
        }),
        [getRefundMonitorData, paginated]
    );

    const handleView = (row: any) => {
        // TODO: open view dialog / navigate to detail page
        console.log("view", row);
    };

    const handleReject = (row: any) => {
        // TODO: whatever the red "X" action does for a rejected row
        console.log("rejected row action", row);
    };

    const columns: MUIDataTableColumn[] = [
        // {
        //     name: "refundNo",
        //     label: "เลขที่ Refund",
        //     options: { sort: false, filter: false },
        // },
        {
            name: "claimNo",
            label: "เลขที่ CL",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = getRefundMonitorData?.data?.[dataIndex];
                    return (
                        <Link
                            component="button"
                            underline="hover"
                            sx={{ color: "#1565C0", fontWeight: 600 }}
                            onClick={() => handleView(row)}
                        >
                            {row?.claimNo}
                        </Link>
                    );
                },
            },
        },
        {
            name: "caseNo",
            label: "เลขที่ CC",
            options: { sort: false, filter: false },
        },
        {
            name: "createdDate",
            label: "วันที่สร้างเคลม",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const createdDate = getRefundMonitorData?.data?.[dataIndex]?.createdDate;
                    return createdDate ? dayjs(createdDate).format("DD/MM/YYYY HH:mm:ss") : "-";
                },
            },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { sort: false, filter: false },
        },
        {
            name: "totalNetPaidAmount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) =>
                    formatAmount(getRefundMonitorData?.data?.[dataIndex]?.totalNetPaidAmount ?? 0),
            },
        },
        {
            name: "refundAmount",
            label: "โอนคืน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) =>
                    formatAmount(getRefundMonitorData?.data?.[dataIndex]?.refundAmount ?? 0),
            },
        },
        {
            name: "status",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = getRefundMonitorData?.data?.[dataIndex];
                    const status = row?.refundStatusNameTH ?? row?.status ?? "-";
                    const color = statusColorMapById[row?.refundStatusId] ?? defaultStatusColor;
                    return <StatusPill status={status} color={color} />;
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
                    const row = getRefundMonitorData?.data?.[dataIndex];

                    if (row?.refundStatusId === 2) {
                        return (
                            <IconButton size="small" onClick={() => handleView(row)}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                        );
                    }

                    if (row?.refundStatusId === 4) {
                        return (
                            <IconButton size="small" onClick={() => handleReject(row)}>
                                <CancelIcon sx={{ color: "#E53935", fontSize: 20 }} />
                            </IconButton>
                        );
                    }

                    return <>-</>;
                },
            },
        },
    ];

    return { columns, setPaginated, pagination, getRefundMonitorData, isGetRefundLoading };
};

export default useRefundDataTableHook;
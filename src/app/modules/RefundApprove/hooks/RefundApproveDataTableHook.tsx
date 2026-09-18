import { Box, IconButton, Link, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useGetRefundApproveMonitorWithFilter } from "../../Refund/refundAPI";
import { PaginationResultDto, PaginationSortableDto } from "../../_common";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { RefundSearchFilterValues } from "../../Refund/_common/RefundSearchFilterForm";

const defaultStatusColor = { bg: "#ECEFF1", text: "#607D8B" };

type StatusColor = { bg: string; text: string };

const statusColorMapById: Record<number, StatusColor> = {
    2: { bg: "#FFF3E0", text: "#EF6C00" },
    3: { bg: "#E8F5E9", text: "#2E7D32" },
    4: { bg: "#FDECEA", text: "#C62828" },
    5: { bg: "#FDECEA", text: "#C62828" },
};

const refundStatusNameMapById: Record<number, string> = {
    2: "รอดำเนินการ",
    3: "คืนเงินสำเร็จ",
    4: "ปฏิเสธการคืนเงิน",
    5: "ยกเลิกการคืนเงิน",
};

export type RefundApproveMonitorRow = {
    caseId?: string;
    claimId?: string;
    refundNo?: string;
    claimNo?: string;
    caseNo?: string;
    branceName?: string;
    customerName?: string;
    createdDate?: string;
    totalNetPaidAmount?: number;
    refundAmount?: number;
    refundStatusId?: number;
    refundStatusNameTH?: string;
    remark?: string;
};

export type RefundApproveDataTableHookProps = {
    filter: RefundSearchFilterValues | undefined;
    hasSearched: boolean;
    searchKey: number;
    onEdit?: (row: RefundApproveMonitorRow) => void;
    onView?: (row: RefundApproveMonitorRow) => void;
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

const useRefundApproveDataTableHook = ({ filter, hasSearched, searchKey, onEdit, onView }: RefundApproveDataTableHookProps) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const {
        data: getRefundMonitorData,
        isLoading: isGetRefundLoading,
        isError: isGetRefundError,
        error: getRefundError,
    } = useGetRefundApproveMonitorWithFilter({
        branceId: filter?.branchId ?? null,
        refundStatusId: filter?.statusId ?? null,
        searchDetail: filter?.searchText,
        transferDateFrom: filter?.transferDateFrom,
        transferDateTo: filter?.transferDateTo,
        searchKey,
        pagination: paginated,
        enabled: hasSearched,
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

    const data = getRefundMonitorData?.data ?? [];

    const handleView = (row: RefundApproveMonitorRow) => {
        if (onView) {
            onView(row);
        }
    };

    const handleEdit = (row: RefundApproveMonitorRow) => {
        if (onEdit) {
            onEdit(row);
        }
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "เลขที่ CL",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = data[dataIndex];
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
                    const createdDate = data[dataIndex]?.createdDate;
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
            name: "branceName",
            label: "สาขา",
            options: { sort: false, filter: false },
        },
        {
            name: "totalNetPaidAmount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) =>
                    formatAmount(data[dataIndex]?.totalNetPaidAmount ?? 0),
            },
        },
        {
            name: "refundAmount",
            label: "โอนคืน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => formatAmount(data[dataIndex]?.refundAmount ?? 0),
            },
        },
        {
            name: "status",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = data[dataIndex];
                    const status =
                        row?.refundStatusNameTH ??
                        refundStatusNameMapById[row?.refundStatusId] ??
                        row?.status ??
                        "-";
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
                    const row = data[dataIndex];

                    return (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <IconButton size="small" onClick={() => handleView(row)}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                            {row?.refundStatusId === 2 && (
                                <IconButton size="small" onClick={() => handleEdit(row)}>
                                    <FactCheckIcon sx={{ color: "#8D6E00", fontSize: 20 }} />
                                </IconButton>
                            )}
                        </Box>
                    );
                },
            },
        },
    ];

    return { columns, data, isLoading: isGetRefundLoading, isError: isGetRefundError, error: getRefundError, pagination, setPaginated };
};

export default useRefundApproveDataTableHook;
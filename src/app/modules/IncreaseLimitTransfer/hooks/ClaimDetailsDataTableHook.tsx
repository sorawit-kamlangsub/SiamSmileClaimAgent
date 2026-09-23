import { Box, IconButton, Link, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetIncreaseTransferLimitMonitors } from "../../../api/coreClaimApi";
import { IncreaseTransferLimitMonitorResponseDto } from "../../../api/coreClaimApi.client";
import { PaginationResultDto, PaginationSortableDto } from "../../_common";
import { ClaimSearchFilterValues } from "../_common/ClaimSearchFilterForm";

const defaultStatusColor = { bg: "#ECEFF1", text: "#607D8B" };

type StatusColor = { bg: string; text: string };

const statusColorMapById: Record<number, StatusColor> = {
    2: { bg: "#FFF3E0", text: "#EF6C00" },
    3: { bg: "#FDECEA", text: "#C62828" },
    4: { bg: "#E8F5E9", text: "#2E7D32" },
};

export type IncreaseTransferMonitorRow = {
    caseTransferApprovalId?: string;
    caseId?: string;
    caseNo?: string;
    claimNo?: string;
    createdDate?: dayjs.Dayjs | undefined;
    branchName?: string;
    caseAmount?: number;
    toAccountNo?: string;
    transferType?: string;
    remark?: string;
    transferApprovalStatusName?: string;
    transferApprovalStatusId?: number;
};

export type IncreaseLimitTransferDataTableHookProps = {
    filter: ClaimSearchFilterValues | undefined;
    hasSearched: boolean;
    // TODO: updateIncreaseTransferLimitStatus ยังไม่มี API จาก CodeGen — กลับมาเมื่อ backend มี API ครบ
    searchTrigger?: number;
    onEdit?: (row: IncreaseTransferMonitorRow) => void;
};

// const StatusPill = ({ status, color }: { status: string; color: StatusColor }) => {
//     const { bg, text } = color;
//     return (
//         <Box
//             sx={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 borderRadius: "20px",
//                 padding: "3px 12px",
//                 border: `1px solid ${text}`,
//                 backgroundColor: bg,
//             }}
//         >
//             <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: text }} />
//             <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: text }}>{status}</Typography>
//         </Box>
//     );
// };

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

const useClaimCpgTransferDataTableHook = ({
    filter,
    hasSearched,
    searchTrigger,
    onEdit,
}: IncreaseLimitTransferDataTableHookProps) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const {
        data: getIncreaseTransferLimitMonitors,
        isLoading: isGetIncreaseTransferLimitLoading,
        isError: isGetIncreaseTransferLimitError,
        error: getIncreaseTransferLimitError,
    } = useGetIncreaseTransferLimitMonitors(
        filter?.searchText,
        paginated.orderingField,
        paginated.ascendingOrder,
        paginated.page ?? 1,
        paginated.recordsPerPage ?? 10,
        {
            branceId: filter?.branchId,
            transferApprovalStatusId: filter?.statusId,
            claimCreatedDateFrom: filter?.transferDateFrom,
            claimCreatedDateTo: filter?.transferDateTo,
        },
        searchTrigger ?? 0,
        hasSearched
    );

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: getIncreaseTransferLimitMonitors?.totalAmountRecords ?? 0,
            totalAmountPages: getIncreaseTransferLimitMonitors?.totalAmountPages ?? 0,
            currentPage: getIncreaseTransferLimitMonitors?.currentPage ?? 0,
            recordsPerPage: getIncreaseTransferLimitMonitors?.recordsPerPage ?? paginated.recordsPerPage,
            pageIndex: getIncreaseTransferLimitMonitors?.pageIndex ?? 0,
        }),
        [getIncreaseTransferLimitMonitors, paginated]
    );

    const rows = getIncreaseTransferLimitMonitors?.data ?? [];

    const handleViewRow = (row: IncreaseTransferLimitMonitorResponseDto) => {
        // TODO: open view dialog / navigate to detail page
        console.log("view", row);
    };

    const handleEditRow = (row: IncreaseTransferMonitorRow) => {
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
                    const row = rows[dataIndex];
                    return (
                        <Link
                            component="button"
                            underline="hover"
                            sx={{ color: "#212121", fontWeight: 400 }}
                            onClick={() => handleViewRow(row)}
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
                customBodyRenderLite: (dataIndex) => {
                    const createdDate = rows[dataIndex]?.createdDate;
                    return createdDate ? dayjs(createdDate).format("DD/MM/YYYY HH:mm:ss") : "-";
                },
            },
        },
        {
            name: "branchName",
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
                customBodyRenderLite: (dataIndex) => (
                    <Box
                        sx={{ width: "100%", textAlign: "right" }}
                        title={rows[dataIndex]?.caseAmount?.toLocaleString("th-TH")}
                    >
                        {formatAmount(rows[dataIndex]?.caseAmount ?? 0)}
                    </Box>
                ),
            },
        },
        {
            name: "toAccountNo",
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
                    const row = rows[dataIndex];
                    const status = row?.transferApprovalStatusName ?? "-";
                    const color = statusColorMapById[row?.transferApprovalStatusId ?? -1] ?? defaultStatusColor;
                    return <StatusPill status={status} color={color} />;
                },
            },
        },
        // TODO: คอลัมน์สาเหตุ ยังไม่มี field reason ใน response จาก CodeGen — กลับมาเมื่อ backend เพิ่ม field ให้
        // {
        //     name: "reason",
        //     label: "สาเหตุ",
        //     options: {
        //         sort: false,
        //         filter: false,
        //         customBodyRenderLite: (dataIndex) => rows[dataIndex]?.reason ?? "-",
        //     },
        // },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = rows[dataIndex];
                    return (
                        <Box sx={{ display: "flex", gap: "4px" }}>
                            <IconButton size="small" onClick={() => handleViewRow(row)}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                            {row?.transferApprovalStatusId === 2 && (
                                <IconButton size="small" onClick={() => handleEditRow(row)}>
                                    <FactCheckIcon sx={{ color: "#8D6E00", fontSize: 20 }} />
                                </IconButton>
                            )}
                        </Box>
                    );
                },
            },
        },
    ];

    return {
        columns,
        data: rows,
        isLoading: isGetIncreaseTransferLimitLoading,
        isError: isGetIncreaseTransferLimitError,
        error: getIncreaseTransferLimitError,
        pagination,
        setPaginated,
    };
};

export default useClaimCpgTransferDataTableHook;

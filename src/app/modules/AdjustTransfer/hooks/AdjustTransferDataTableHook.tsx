import { Box, IconButton, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useGetClaimAdjustMonitorWithFilter } from "../adjustTransferMonitorAPI";
import { PaginationResultDto, PaginationSortableDto } from "../../_common";
import { useMemo, useState } from "react";
import { numberWithCommas } from "../../../functionHelpers";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import dayjs from "dayjs";
import { setOpenDialogAdjustDetail, setSelectedRowForEdit } from "../store/adjustTransferMonitorSlice";

const statusColorMap: Record<number, { bg: string; text: string }> = {
    2: { bg: "#FFF3E0", text: "#EF6C00" },
    3: { bg: "#E8F5E9", text: "#2E7D32" },
    4: { bg: "#FDECEA", text: "#C62828" },
    5: { bg: "#FDECEA", text: "#C62828" },
};

const defaultStatusColor = { bg: "#ECEFF1", text: "#607D8B" };

const StatusPill = ({
    paymentStatusId,
    paymentStatusNameTH,
}: {
    paymentStatusId: number;
    paymentStatusNameTH: string;
}) => {
    const { bg, text } = statusColorMap[paymentStatusId] ?? defaultStatusColor;

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
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: text }}>{paymentStatusNameTH}</Typography>
        </Box>
    );
};

const useAdjustTransferDataTableHook = () => {
    const { searchMonitor } = useAppSelector((state) => state.refund);
    const dispatch = useAppDispatch();
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data: getClaimAdjustMonitorData, isLoading: isGetClaimAdjustLoading } = useGetClaimAdjustMonitorWithFilter({
        branceId: searchMonitor.branchId ?? null,
        paymentStatusId: searchMonitor.paymentStatusId ?? null,
        pagination: paginated,
    });
    // const handleView = (row: AdditionalTransferRow) => {
    //     // TODO: open view dialog / navigate to detail page
    //     console.log("view", row);
    // };

    const handleEdit = (row: { caseId: string; totalNetPaidAmount: number }) => {
        dispatch(
            setSelectedRowForEdit({
                paymentId: "588DD869-9E5C-46EB-8A0C-9C7C8328AB62",
                amount: row.totalNetPaidAmount ?? 0,
            })
        );
        dispatch(setOpenDialogAdjustDetail({ isOpen: true }));
    };

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: getClaimAdjustMonitorData?.totalAmountRecords ?? 0,
            totalAmountPages: getClaimAdjustMonitorData?.totalAmountPages ?? 0,
            currentPage: getClaimAdjustMonitorData?.currentPage ?? 0,
            recordsPerPage: getClaimAdjustMonitorData?.recordsPerPage ?? 0,
            pageIndex: getClaimAdjustMonitorData?.pageIndex ?? 0,
        }),
        [getClaimAdjustMonitorData]
    );

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
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = getClaimAdjustMonitorData?.data?.[rowIndex]?.createdDate
                        ? dayjs(getClaimAdjustMonitorData?.data?.[rowIndex]?.createdDate).format("DD/MM/YYYY HH:mm:ss")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { sort: false, filter: false },
        },
        {
            name: "branchName",
            label: "สาขา",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return getClaimAdjustMonitorData?.data?.[rowIndex]?.branchName ?? "-";
                },
            },
        },
        {
            name: "totalNetPaidAmount",
            label: "จำนวนเงินที่โอนแล้ว",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) =>
                    numberWithCommas(getClaimAdjustMonitorData?.data?.[rowIndex]?.totalNetPaidAmount ?? 0),
            },
        },
        {
            name: "addPayAmount",
            label: "โอนเพิ่ม",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) =>
                    numberWithCommas(getClaimAdjustMonitorData?.data?.[rowIndex]?.addPayAmount ?? 0),
            },
        },
        {
            name: "status",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => (
                    <StatusPill
                        paymentStatusId={getClaimAdjustMonitorData?.data?.[rowIndex]?.paymentStatusId}
                        paymentStatusNameTH={getClaimAdjustMonitorData?.data?.[rowIndex]?.paymentStatusNameTH}
                    />
                ),
            },
        },
        {
            name: "remark",
            label: "สาเหตุ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => getClaimAdjustMonitorData?.data?.[rowIndex]?.remark ?? "-",
            },
        },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const row = getClaimAdjustMonitorData?.data?.[rowIndex];
                    return (
                        <Box sx={{ display: "flex", gap: "4px" }}>
                            <IconButton size="small" onClick={() => {}}>
                                <VisibilityIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                            </IconButton>
                            {row.paymentStatusId === 5 && (
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        handleEdit(row);
                                    }}
                                >
                                    <EditIcon sx={{ color: "#B8860B", fontSize: 20 }} />
                                </IconButton>
                            )}
                        </Box>
                    );
                },
            },
        },
    ];

    return { columns, setPaginated, pagination, getClaimAdjustMonitorData, isGetClaimAdjustLoading };
};

export default useAdjustTransferDataTableHook;

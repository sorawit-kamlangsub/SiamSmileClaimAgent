import { Chip, Grid, IconButton, Tooltip } from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MUIDataTableColumn } from "mui-datatables";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import {
    backgroundColorMapClaimTransactionType,
    cellAlignOptions,
    colorMapClaimTransactionType,
    formatDateString,
} from "../../../../functionHelpers";
import { AppliedFilter } from "../ClaimConsiderCustomerMonitor/SearchFilterHook";
import { useGetDeathAndDisabilityClaimAdjudicationMonitor } from "../../../../api/coreClaimApi";

/** ตาม spec: แสดงปุ่มพิจารณาเคลมเฉพาะ รอพิจารณา(2)/รอแก้ไข(4) — สถานะอื่นแสดงแค่ปุ่มดูรายละเอียด */
const CONSIDERABLE_CLAIM_TRANSACTION_TYPE_IDS = [2, 4];

const useDataTableConsiderDeathDisabilityHook = (appliedFilter: AppliedFilter) => {
    const navigate = useNavigate();
    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });

    // รีเซ็ต page ระหว่าง render (ไม่ใช่ useEffect) เหมือน DataTableConsiderCustomer — กันยิง query ด้วย filter ใหม่ + page เก่า
    const prevAppliedFilterRef = React.useRef(appliedFilter);
    if (prevAppliedFilterRef.current !== appliedFilter) {
        prevAppliedFilterRef.current = appliedFilter;
        setPaginated((prev) => ({ ...prev, page: 1 }));
    }

    const isProductTypeId_PH = appliedFilter.product?.includes(6);
    const isProductTypeId_PA = appliedFilter.product?.includes(26);
    // statusId 0 = ทั้งหมด → ไม่ส่ง filter สถานะ
    const { data: monitorData, isLoading } = useGetDeathAndDisabilityClaimAdjudicationMonitor(
        appliedFilter.isSearch,
        appliedFilter.dateFrom,
        appliedFilter.dateTo,
        isProductTypeId_PH,
        isProductTypeId_PA,
        appliedFilter.statusId || undefined,
        appliedFilter.searchDetail || undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const rows = useMemo(() => monitorData?.data ?? [], [monitorData]);
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: monitorData?.totalAmountRecords ?? 0,
            totalAmountPages: monitorData?.totalAmountPages ?? 0,
            currentPage: monitorData?.currentPage ?? 0,
            recordsPerPage: monitorData?.recordsPerPage ?? 0,
            pageIndex: monitorData?.pageIndex ?? 0,
        }),
        [monitorData]
    );

    const column: MUIDataTableColumn[] = [
        {
            name: "createdDate",
            label: "วันที่แจ้งเคลม",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value?.toString(), "DD/MM/BBBB HH:mm:ss") : "-"),
            },
        },
        {
            name: "claimNo",
            label: "เลขที่ CL",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
            },
        },
        {
            name: "branchName",
            label: "สาขา",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "customerName",
            label: "ชื่อ-สกุลผู้เอาประกัน",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "productName",
            label: "ผลิตภัณฑ์",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) =>
                    value ? (
                        <Chip
                            label={value}
                            size="small"
                            sx={{ backgroundColor: "#1a5da8", color: "#fff", fontWeight: 600, minWidth: 52 }}
                        />
                    ) : (
                        "-"
                    ),
            },
        },
        {
            name: "claimTransactionTypeName",
            label: "สถานะรายการ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRenderLite: (rowIndex) => {
                    const row = rows[rowIndex];
                    if (!row?.claimTransactionTypeName) return "-";
                    const typeId = row.claimTransactionTypeId;
                    return (
                        <Chip
                            label={row.claimTransactionTypeName}
                            size="small"
                            sx={{
                                backgroundColor: typeId ? backgroundColorMapClaimTransactionType[typeId] : undefined,
                                color: typeId ? colorMapClaimTransactionType[typeId] : undefined,
                                fontWeight: 600,
                                borderRadius: "16px",
                            }}
                        />
                    );
                },
            },
        },
        {
            name: "caseAmount",
            label: "จำนวนเงิน",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) =>
                    (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            },
        },
        {
            name: "_option",
            label: " ",
            options: {
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    const row = rows[rowIndex];
                    const canConsider = CONSIDERABLE_CLAIM_TRANSACTION_TYPE_IDS.includes(
                        row?.claimTransactionTypeId ?? -1
                    );
                    // route ลูก ":id/:caseId" — encode ทั้งคู่ด้วย btoa
                    const detailPath = `${appliedFilter.path}/${btoa(row?.claimId ?? "")}/${btoa(row?.caseId ?? "")}`;
                    return (
                        <Grid container sx={{ gap: 1.5, flexWrap: "nowrap" }}>
                            {canConsider && (
                                <Tooltip title="พิจารณาเคลม">
                                    <IconButton
                                        onClick={() => navigate(detailPath)}
                                        sx={{ backgroundColor: "#FFF1CD", ":hover": { backgroundColor: "#e7cf95" } }}
                                    >
                                        <FactCheckIcon sx={{ color: "#a56e07" }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {/* TODO(death-disability-api): ยังไม่มีหน้าดูรายละเอียดของเคลมเสียชีวิต/ทุพพลภาพ */}
                            <Tooltip title="ดูรายละเอียด">
                                <IconButton sx={{ bgcolor: "#E2F2FF", "&:hover": { bgcolor: "#d4ecff" } }}>
                                    <VisibilityIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    );
                },
            },
        },
    ];

    return { column, rows, isLoading, setPaginated, pagination };
};

export default useDataTableConsiderDeathDisabilityHook;

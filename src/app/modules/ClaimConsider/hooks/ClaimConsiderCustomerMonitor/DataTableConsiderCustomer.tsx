import { IconButton, Tooltip, Grid, Chip } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import React, { useEffect, useMemo } from "react";
import { useGetClaimTransactionMonitor } from "../../../../api/coreClaimApi";
import { AppliedFilter } from "./SearchFilterHook";
import {
    backgroundColorMapClaimTransactionType,
    cellAlignOptions,
    colorMapClaimTransactionType,
    formatDateString,
} from "../../../../functionHelpers";

const useDataTableConsiderCustomerHook = (appliedFilter: AppliedFilter) => {
    const navigate = useNavigate();
    const isProductTypeId_PH = appliedFilter.product?.includes(6);
    const isProductTypeId_PA = appliedFilter.product?.includes(26);
    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    useEffect(() => {
        setPaginated((prev) => ({ ...prev, page: 1 }));
    }, [appliedFilter]);

    const { data: claimTransactionData, isLoading: claimTransactionDataLoading } = useGetClaimTransactionMonitor(
        appliedFilter.isSearch,
        appliedFilter.dateType,
        appliedFilter.dateFrom,
        appliedFilter.dateTo,
        isProductTypeId_PH,
        isProductTypeId_PA,
        appliedFilter.statusId,
        appliedFilter.searchFrom,
        appliedFilter.searchDetail,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: claimTransactionData?.totalAmountRecords ?? 0,
            totalAmountPages: claimTransactionData?.totalAmountPages ?? 0,
            currentPage: claimTransactionData?.currentPage ?? 0,
            recordsPerPage: claimTransactionData?.recordsPerPage ?? 0,
            pageIndex: claimTransactionData?.pageIndex ?? 0,
        }),
        [claimTransactionData]
    );

    const column: MUIDataTableColumn[] = [
        {
            name: "paymentDate",
            label: "วันที่โอนเงิน",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value?.toString(), "DD/MM/BBBB HH:mm:ss") : "-"),
            },
        },
        {
            name: "claimNo",
            label: "ClaimCode",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
            },
        },
        {
            name: "schoolName",
            label: "ชื่อสถานศึกษา",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? value : "-"),
            },
        },
        {
            name: "customerName",
            label: "ชื่อ-สกุลผู้เอาประกัน",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? value : "-"),
            },
        },
        {
            name: "cardDetail",
            label: "เลขบัตรประชาชน",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? value : "-"),
            },
        },
        {
            name: "totalAmount",
            label: "จำนวนเงิน",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => {
                    if (value === undefined || value === null) return "0.00";
                    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                },
            },
        },
        {
            name: "claimTransactionTypeName",
            label: "สถานะรายการ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRenderLite: (rowIndex) => {
                    const row = claimTransactionData?.data?.[rowIndex];
                    const value = row?.claimTransactionTypeName;
                    if (!value) return "-";
                    const bgColor = row?.claimTransactionTypeId
                        ? backgroundColorMapClaimTransactionType[row?.claimTransactionTypeId]
                        : undefined;
                    const textColor = row?.claimTransactionTypeId
                        ? colorMapClaimTransactionType[row?.claimTransactionTypeId]
                        : undefined;
                    return (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                backgroundColor: bgColor,
                                color: textColor,
                                fontWeight: 600,
                                borderRadius: "16px",
                            }}
                        />
                    );
                },
            },
        },
        {
            name: "_option",
            label: " ",
            options: {
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <>
                            <Grid container sx={{ gap: 1.5 }}>
                                <Tooltip title="พิจารณาเคลม">
                                    <IconButton
                                        onClick={() => {
                                            navigate(
                                                `${appliedFilter.path}/${btoa(
                                                    claimTransactionData?.data?.[rowIndex]?.claimId ?? ""
                                                )}`
                                            );
                                        }}
                                        sx={{
                                            backgroundColor: "#FFF1CD",
                                            ":hover": {
                                                backgroundColor: "#e7cf95",
                                            },
                                        }}
                                    >
                                        <FactCheckIcon sx={{ color: "#a56e07" }}></FactCheckIcon>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="ดูรายละเอียดเอกสาร">
                                    <IconButton
                                        onClick={() => {
                                            navigate(
                                                `${appliedFilter.path}/${btoa(
                                                    claimTransactionData?.data?.[rowIndex]?.claimId ?? ""
                                                )}/document`
                                            );
                                        }}
                                        sx={{
                                            bgcolor: "#E2F2FF",
                                            "&:hover": { bgcolor: "#d4ecff" },
                                            borderColor: "#a8d6fc",
                                        }}
                                    >
                                        <VisibilityIcon color="primary"></VisibilityIcon>
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </>
                    );
                },
            },
        },
    ];
    return { column, claimTransactionData, claimTransactionDataLoading, setPaginated, pagination };
};

export default useDataTableConsiderCustomerHook;

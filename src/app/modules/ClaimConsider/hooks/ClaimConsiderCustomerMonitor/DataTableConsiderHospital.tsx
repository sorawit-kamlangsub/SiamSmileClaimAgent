import { IconButton, Tooltip, Grid, Chip } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import React, { useEffect, useMemo } from "react";
import { AppliedFilter } from "./SearchFilterHook";
import {
    backgroundColorMapClaimTransactionType,
    cellAlignOptions,
    colorMapClaimTransactionType,
    formatDateString,
} from "../../../../functionHelpers";
import { useGetHospitalClaimAdjudicationMonitor } from "../../../../api/coreClaimApi";
import { GetHospitalClaimAdjudicationMonitorDtoResponse } from "../../../../api/coreClaimApi.client";
import ClaimNoWithContinuousBadge from "../../components/_common/ClaimNoWithContinuousBadge";

/**
 * TODO(caseId): BE ยังไม่ส่ง caseId มากับ monitor list — cast ชั่วคราวจนกว่าจะ `npm run codegen`
 * ให้ GetHospitalClaimAdjudicationMonitorDtoResponse มี field caseId แล้วค่อยลบ type นี้ทิ้ง
 * TODO(caseCount): BE ยังไม่ส่ง caseCount (ฝั่ง customer monitor มีแล้ว) — ระหว่างนี้ badge "เคลมต่อเนื่อง" จะไม่แสดง
 * เมื่อ codegen แล้วมี field นี้ badge จะทำงานเอง
 */
type MonitorRowWithCaseId = GetHospitalClaimAdjudicationMonitorDtoResponse & { caseId?: string; caseCount?: number };

// ตาม spec: สถานะ "อยู่ระหว่างดำเนินการ" (7), "ปฏิเสธ" (5), "ยกเลิก" (6) แสดงเฉพาะปุ่มดูรายละเอียด ซ่อนปุ่มพิจารณาเคลม
const HIDE_ADJUDICATE_BUTTON_STATUS_IDS = [5, 6, 7];

/**
 * DFUAT-063 : รายการที่ SmileConnect จองสิทธิ์ (Reservation) / แจ้งเข้ารับการรักษา (Admission) — BE ส่ง isReadOnly = true
 * ห้ามพิจารณา แสดงสถานะเป็น "อยู่ระหว่างดำเนินการ" (7) และกดดูรายละเอียดได้อย่างเดียว
 */
const IN_PROGRESS_STATUS_ID = 7;
const IN_PROGRESS_STATUS_NAME = "อยู่ระหว่างดำเนินการ";

const useDataTableConsiderHospitalHook = (appliedFilter: AppliedFilter) => {
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

    const { data: claimHospitalData, isLoading: claimHospitalDataLoading } = useGetHospitalClaimAdjudicationMonitor(
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
            totalAmountRecords: claimHospitalData?.totalAmountRecords ?? 0,
            totalAmountPages: claimHospitalData?.totalAmountPages ?? 0,
            currentPage: claimHospitalData?.currentPage ?? 0,
            recordsPerPage: claimHospitalData?.recordsPerPage ?? 0,
            pageIndex: claimHospitalData?.pageIndex ?? 0,
        }),
        [claimHospitalData]
    );

    /**
     * TODO(caseCount): นับจำนวนเคสต่อ claimId จากแถวในหน้าปัจจุบันแทนไปก่อน — ถ้าเคสของเคลมเดียวกันอยู่คนละหน้าจะนับไม่ครบ
     * (BE ใช้ COUNT(CaseId) OVER (PARTITION BY ClaimId) ก่อนแบ่งหน้า) เมื่อ BE ส่ง caseCount มาแล้วให้ลบส่วนนี้ทิ้ง
     */
    const pageCaseCountByClaimId = useMemo(() => {
        const counts = new Map<string, number>();
        claimHospitalData?.data?.forEach((row) => {
            if (row.claimId) counts.set(row.claimId, (counts.get(row.claimId) ?? 0) + 1);
        });
        return counts;
    }, [claimHospitalData]);

    const column: MUIDataTableColumn[] = [
        {
            name: "decisionDate",
            label: "วันที่ทำรายการ",
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
                customBodyRenderLite: (rowIndex) => {
                    const row = claimHospitalData?.data?.[rowIndex] as MonitorRowWithCaseId | undefined;
                    const caseCount =
                        row?.caseCount ?? (row?.claimId ? pageCaseCountByClaimId.get(row.claimId) : undefined);
                    return <ClaimNoWithContinuousBadge claimNo={row?.claimNo} caseCount={caseCount} />;
                },
            },
        },
        {
            name: "hospitalName",
            label: "ชื่อสถานพยาบาล",
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
            name: "medicalType",
            label: "ประเภทรายการเคลม",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? value : "-"),
            },
        },
        {
            name: "productName",
            label: "ผลิตภัณฑ์",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRenderLite: (rowIndex) => {
                    const row = claimHospitalData?.data?.[rowIndex];
                    const value = row?.productName;
                    if (!value) return "-";
                    const bgColor = "#1976d2";
                    const textColor = "#ffffff";
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
                    const row = claimHospitalData?.data?.[rowIndex];
                    const value = row?.isReadOnly ? IN_PROGRESS_STATUS_NAME : row?.claimTransactionTypeName;
                    if (!value) return "-";
                    const statusId = row?.isReadOnly ? IN_PROGRESS_STATUS_ID : row?.claimTransactionTypeId;
                    const bgColor = statusId ? backgroundColorMapClaimTransactionType[statusId] : undefined;
                    const textColor = statusId ? colorMapClaimTransactionType[statusId] : undefined;
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
                    const row = claimHospitalData?.data?.[rowIndex] as MonitorRowWithCaseId | undefined;
                    const showAdjudicateButton =
                        !row?.isReadOnly &&
                        !HIDE_ADJUDICATE_BUTTON_STATUS_IDS.includes(row?.claimTransactionTypeId ?? -1);
                    return (
                        <>
                            <Grid container sx={{ gap: 1.5 }} wrap="nowrap">
                                <Tooltip title={showAdjudicateButton ? "พิจารณาเคลม" : ""}>
                                    <IconButton
                                        disabled={!showAdjudicateButton}
                                        onClick={() => {
                                            navigate(
                                                `${appliedFilter.path}/${btoa(row?.claimId ?? "")}/${btoa(
                                                    row?.caseId ?? ""
                                                )}`
                                            );
                                        }}
                                        sx={{
                                            visibility: showAdjudicateButton ? "visible" : "hidden",
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
                                                `${appliedFilter.path}/${btoa(row?.claimId ?? "")}/${btoa(
                                                    row?.caseId ?? ""
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
    return { column, claimHospitalData, claimHospitalDataLoading, setPaginated, pagination };
};

export default useDataTableConsiderHospitalHook;

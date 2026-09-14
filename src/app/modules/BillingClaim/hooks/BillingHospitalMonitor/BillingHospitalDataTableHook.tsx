import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chip, Grid, IconButton, Tooltip } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { cellAlignOptions, formatDateString, numberWithCommas } from "../../../../functionHelpers";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { useGetHospitalBillingFilter } from "../../../../api/hospitalBillingApi";
import { BillingListItemDto } from "../../../../api/coreClaimApi.client";
import {
    backgroundColorMapBillingStatus,
    billingStatusLabel,
    colorMapBillingStatus,
} from "../../store/billingStatusHelpers";
import { BillingSearchFilterValues } from "./BillingSearchFilterHook";

export type BillingAppliedFilter = Pick<BillingSearchFilterValues, "searchBy" | "searchDetail" | "statusId">;

/**
 * ตาราง list "วางบิลเคลม - เคลมโรงพยาบาล" — ต่อ GET /billing/hospital/filter จริง
 *
 * เรียก query ตัวเดียวที่นี่แล้ว page ส่ง `counts` ต่อให้ Header, ส่ง column/rows/pagination ต่อให้
 * ตาราง — ไม่แยกเรียก 2 ที่ (ดู BillingHospitalMonitorPage.tsx)
 */
const useBillingHospitalDataTableHook = (appliedFilter: BillingAppliedFilter) => {
    const navigate = useNavigate();
    const [paginated, setPaginated] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });

    useEffect(() => {
        setPaginated((prev) => ({ ...prev, page: 1 }));
    }, [appliedFilter]);

    const { data, isLoading } = useGetHospitalBillingFilter(
        appliedFilter.statusId,
        appliedFilter.searchBy,
        appliedFilter.searchDetail.trim() || undefined,
        paginated.orderingField,
        paginated.ascendingOrder,
        paginated.page,
        paginated.recordsPerPage
    );

    const rows = useMemo(() => data?.data?.items ?? [], [data]);
    const counts = data?.data?.counts ?? {};

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: data?.totalAmountRecords ?? 0,
            totalAmountPages: data?.totalAmountPages ?? 0,
            currentPage: data?.currentPage ?? 0,
            recordsPerPage: data?.recordsPerPage ?? 0,
            pageIndex: data?.pageIndex ?? 0,
        }),
        [data]
    );

    const column: MUIDataTableColumn[] = [
        {
            name: "submittedDate",
            label: "วันที่ รพ. ส่งวางบิล",
            options: {
                // orderingField ที่ BE รองรับมีแค่ submittedDate / claimCode (hospital-billing-fe.md ข้อ 4)
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap", sort: true }),
                customBodyRender: (value) => (value ? formatDateString(value.toString(), "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "treatmentDate",
            label: "วันที่เข้า รพ.",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value.toString(), "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "claimCode",
            label: "ClaimCode",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap", sort: true }),
                customBodyRender: (value) => value ?? "-",
            },
        },
        {
            name: "insuredName",
            label: "ชื่อผู้เอาประกัน",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        {
            name: "hospitalName",
            label: "ชื่อสถานพยาบาล",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        {
            name: "statusId",
            label: "สถานะรายการ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value: number) => (
                    <Chip
                        label={billingStatusLabel(value)}
                        size="small"
                        sx={{
                            backgroundColor: backgroundColorMapBillingStatus[value as 1 | 2 | 3 | 4 | 5],
                            color: colorMapBillingStatus[value as 1 | 2 | 3 | 4 | 5],
                            fontWeight: 600,
                            borderRadius: "16px",
                        }}
                    />
                ),
            },
        },
        {
            name: "amount",
            label: "จำนวนเงินวางบิล",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value: number) => numberWithCommas(value ?? 0, 2),
            },
        },
        {
            name: "_option",
            label: "ดำเนินรายการ",
            options: {
                sort: false,
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRenderLite: (rowIndex) => {
                    const row: BillingListItemDto | undefined = rows[rowIndex];
                    if (!row?.billingDetailId) return null;
                    const encodedId = btoa(row.billingDetailId);
                    return (
                        <Grid container sx={{ gap: 1.5, justifyContent: "center" }}>
                            {row.canReview && (
                                <Tooltip title="ตรวจสอบรายการ">
                                    <IconButton
                                        onClick={() => navigate(`/billing/hospital/${encodedId}/review`)}
                                        sx={{ backgroundColor: "#FFF1CD", ":hover": { backgroundColor: "#e7cf95" } }}
                                    >
                                        <FactCheckIcon sx={{ color: "#a56e07" }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="ดูรายละเอียด">
                                <IconButton
                                    onClick={() => navigate(`/billing/hospital/${encodedId}/document`)}
                                    sx={{ bgcolor: "#E2F2FF", "&:hover": { bgcolor: "#d4ecff" } }}
                                >
                                    <VisibilityIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    );
                },
            },
        },
    ];

    return { column, rows, counts, isLoading, setPaginated, pagination };
};

export default useBillingHospitalDataTableHook;

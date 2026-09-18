import { Chip, Grid, IconButton, Tooltip } from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MUIDataTableColumn } from "mui-datatables";
import dayjs, { Dayjs } from "dayjs";
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

/**
 * TODO(death-disability-api): BE ยังไม่มี endpoint รายการเคลมเสียชีวิต/ทุพพลภาพ — type นี้เดาจาก monitor อื่น + mockup
 * เมื่อมีแล้วให้ `npm run codegen` เปลี่ยนไปใช้ DTO ที่ generate, เพิ่ม hook ใน coreClaimApi.ts แล้วแทน rows/pagination ด้านล่าง
 */
type DeathDisabilityMonitorRow = {
    claimId?: string;
    caseId?: string;
    paymentDate?: Dayjs;
    claimNo?: string;
    caseCount?: number;
    branchName?: string;
    customerName?: string;
    productName?: string;
    claimTransactionTypeId?: number;
    claimTransactionTypeName?: string;
    totalAmount?: number;
};

/**
 * TODO(death-disability-api): ข้อมูล mock ชั่วคราวไว้เช็คหน้าตา/สีสถานะตาม mockup — ลบทิ้งเมื่อต่อ API จริง
 * ครอบคลุมทุกสถานะของหน้านี้ + 1 แถวเคลมต่อเนื่อง (caseCount > 1)
 */
const MOCK_ROWS: DeathDisabilityMonitorRow[] = [
    {
        claimId: "mock-1",
        caseId: "c1",
        paymentDate: dayjs("2026-06-17T09:38:02"),
        claimNo: "CL6906000104",
        caseCount: 1,
        branchName: "สำนักงานใหญ่",
        customerName: "นายวีระศักดิ์ วรวุฒิอนันตกุล",
        productName: "PH",
        claimTransactionTypeId: 2,
        claimTransactionTypeName: "รอพิจารณา",
        totalAmount: 1250,
    },
    {
        claimId: "mock-2",
        caseId: "c2",
        paymentDate: dayjs("2026-08-24T13:15:38"),
        claimNo: "CL6906000082",
        caseCount: 2,
        branchName: "กระบี่",
        customerName: "นายวีรัตน์ แสนวงศ์",
        productName: "PH",
        claimTransactionTypeId: 7,
        claimTransactionTypeName: "อยู่ระหว่างทำรายการ",
        totalAmount: 300,
    },
    {
        claimId: "mock-3",
        caseId: "c3",
        paymentDate: dayjs("2026-06-17T14:29:43"),
        claimNo: "CL6906000095",
        caseCount: 1,
        branchName: "ระนอง",
        customerName: "นางวิมลพร พงษ์พัฒน์เปรียน",
        productName: "PH",
        claimTransactionTypeId: 4,
        claimTransactionTypeName: "รอแก้ไข",
        totalAmount: 700,
    },
    {
        claimId: "mock-4",
        caseId: "c4",
        paymentDate: dayjs("2026-06-17T14:42:24"),
        claimNo: "CLPA6906000112",
        caseCount: 1,
        branchName: "สุพรรณบุรี",
        customerName: "เด็กชายธนภัทร สถานนท์",
        productName: "PA",
        claimTransactionTypeId: 5,
        claimTransactionTypeName: "ปฏิเสธ",
        totalAmount: 2310.5,
    },
    {
        claimId: "mock-5",
        caseId: "c5",
        paymentDate: dayjs("2026-07-02T10:05:11"),
        claimNo: "CLPA6906000120",
        caseCount: 1,
        branchName: "เชียงใหม่",
        customerName: "นายสมชาย ใจดี",
        productName: "PA",
        claimTransactionTypeId: 6,
        claimTransactionTypeName: "ยกเลิก",
        totalAmount: 1500,
    },
    {
        claimId: "mock-6",
        caseId: "c6",
        paymentDate: dayjs("2026-08-24T15:47:27"),
        claimNo: "CLPA6906000113",
        caseCount: 1,
        branchName: "สำนักงานใหญ่",
        customerName: "นางสาววิญา ศรีโกศล",
        productName: "PA",
        claimTransactionTypeId: 9,
        claimTransactionTypeName: "อนุมัติ",
        totalAmount: 2140.9,
    },
];

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

    // TODO(death-disability-api): ตัดหน้าจาก mock ฝั่งหน้าบ้านไปก่อน — API จริงจะแบ่งหน้ามาให้แล้ว
    const page = paginated.page ?? 1;
    const recordsPerPage = paginated.recordsPerPage ?? 5;
    const rows = useMemo(
        () => MOCK_ROWS.slice((page - 1) * recordsPerPage, page * recordsPerPage),
        [page, recordsPerPage]
    );
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: MOCK_ROWS.length,
            totalAmountPages: Math.ceil(MOCK_ROWS.length / recordsPerPage),
            currentPage: paginated.page,
            recordsPerPage: paginated.recordsPerPage,
            pageIndex: 0,
        }),
        [paginated]
    );

    const column: MUIDataTableColumn[] = [
        {
            name: "paymentDate",
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
            name: "totalAmount",
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

    return { column, rows, isLoading: false, setPaginated, pagination };
};

export default useDataTableConsiderDeathDisabilityHook;

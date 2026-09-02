import { MUIDataTableColumn } from "mui-datatables";
import {
    Box,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Snackbar,
    Tooltip,
    Typography,
    Zoom,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BedIcon from "@mui/icons-material/Bed";
import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../../_common";
import { CaseDocumentV2Request } from "../../../../../../api/coreClaimApi.client";
import { DOC_STORAGE_URL } from "../../../../../../../Const";
import { useAppSelector } from "../../../../../../../redux";
import {
    cellAlignOptions,
    handleClickLink,
    defaultOptionStandardDataTable,
    formatDateString,
} from "../../../../../../functionHelpers";
import { claimPHSelector } from "../../../../../CreatedClaim/store/claimPHSlice";
import { useFormikContext } from "formik";
import { claimConsiderSelector, ClaimConsiderValues } from "../../../../store/claimConsiderSlice";
import { CustomDisplayText } from "../../../../../_common/components/CustomComponent/CustomDisplayText";
import dayjs, { Dayjs } from "dayjs";
import { fmt } from "../../../../../CreatedClaim/components/CreateClaim/ClaimHistoryCard";
import { useMemo, useState } from "react";
import { calculateSummary } from "../../../../../ClaimSimulate/components/ConfirmCalaulateModal";

type ClaimSummaryProps = {
    attachedDocuments: CaseDocumentV2Request[];
    createdClaimDate: Dayjs | undefined;
};
const formatDate = (date: Dayjs | undefined) => formatDateString(date?.toString(), "DD/MM/BBBB") ?? undefined;

const formatTime = (date: Dayjs | undefined) =>
    date && dayjs(date).isValid() ? dayjs(date).format("HH:mm") : undefined;
const formatDiagnosis = (d?: { icd10Id?: number; icd10Detail?: string }) =>
    d?.icd10Id !== undefined ? d.icd10Detail ?? "-" : undefined;
// กล่องสรุปจำนวนวัน 1 กล่อง — สีคาดซ้ายและสีตัวเลขปรับตาม type

type StayDayBoxProps = {
    label: string;
    value: number;
    borderColor: string;
    valueColor: string;
};

const tableSx = {
    "& td, & th": {
        fontSize: "15px !important",
        py: "5px !important",
        px: "9px !important",
    },

    "& td": {
        borderRight: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        "&:last-child": {
            borderRight: "none",
        },
    },

    "& th": {
        borderRight: "1px solid #ffffff44",
    },

    "& .MuiTableBody-root .MuiTableRow-root:only-child td": {
        bgcolor: "#fff !important",
        color: "text.secondary",
        fontWeight: 400,
        textAlign: "center",
        borderRight: "none",
    },

    "& tbody tr:last-child:not(:only-child) td": {
        bgcolor: "#3d3d3d !important",
        color: "#fff !important",
        fontWeight: "700 !important",
        borderRight: "1px solid #555 !important",
        borderBottom: "none !important",

        "&:last-child": {
            borderRight: "none !important",
        },
    },

    "& table": {
        borderCollapse: "collapse",
    },
};
const tableOptions = {
    serverSide: false,
    pagination: false,
    selectableRows: "none" as const,
    search: false,
    filter: false,
    download: false,
    print: false,
    viewColumns: false,
};
const StayDayBox = ({ label, value, borderColor, valueColor }: StayDayBoxProps) => (
    <Grid item xs={12} md={4}>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 60,
                px: 1.5,
                py: 1,
                border: "1px solid",
                borderColor,
                borderRadius: 2,
                bgcolor: "#fff",
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: "#344054",
                    fontWeight: 500,
                }}
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    color: valueColor,
                    whiteSpace: "nowrap",
                }}
            >
                {value} วัน
            </Typography>
        </Box>
    </Grid>
);
const SummaryLine = ({
    label,
    value,
    bold = false,
    color,
    bg,
    noDivider = false,
}: {
    label: string;
    value: string;
    bold?: boolean;
    color?: string;
    bg?: string;
    noDivider?: boolean;
}) => (
    <>
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py={0.75}
            px={1.5}
            sx={{ bgcolor: bg ?? "transparent" }}
        >
            <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color ?? "text.primary"}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={bold ? 700 : 400}
                color={color ?? "text.primary"}
                minWidth={110}
                textAlign="right"
            >
                {value}
            </Typography>
        </Box>
        {!noDivider && <Divider />}
    </>
);
const ClaimSummary = ({ attachedDocuments, createdClaimDate }: ClaimSummaryProps) => {
    const { documentScanList, documentDetailById } = useAppSelector(claimPHSelector);
    const { calculateResult } = useAppSelector(claimConsiderSelector);
    const { values } = useFormikContext<ClaimConsiderValues>();
    const [diagnosis1, diagnosis2, diagnosis3] = values.diagnoses ?? [];
    const [mergeOption, setMergeOption] = useState<"single" | "all" | null>(null);
    const summary = useMemo(() => {
        return calculateSummary(
            {
                compensateNet: calculateResult?.compensateNet ?? 0,
                compensateInclude: calculateResult?.compensateInclude ?? 0,
                compensateRemain: calculateResult?.compensateRemain ?? 0,

                medicalNet: calculateResult?.medicalNet ?? 0,
                medicalCoverPay: calculateResult?.medicalCoverPay ?? 0,
                medicalCompensateInclude: calculateResult?.medicalCompensateInclude ?? 0,
                medicalPay: calculateResult?.medicalPay ?? 0,
                medicalUnpay: calculateResult?.medicalUnpay ?? 0,
            },
            mergeOption
        );
    }, [calculateResult, mergeOption]);
    // ── map medicalExpense จาก API → ตารางรายการค่ารักษา ─────────────────────
    const medicalExpenseRows = calculateResult?.medicalExpense ?? [];
    const COMPENSATION = calculateResult?.compensateExpense ?? [];

    const treatmentTableData = [
        ...medicalExpenseRows.map((item) => ({
            benefitName: item.benefitName ?? "-",
            amountNet: item.net ?? 0,
            coveredAmount: item.cover ?? 0,
            nonCoveredAmount: item.unCover ?? 0,
            unPayAmount: item.unPay ?? 0,
            payAmount: item.pay ?? 0,
        })),
        {
            groupName: "รวมทั้งหมด",
            benefitName: "",
            amountNet: medicalExpenseRows.reduce((s, r) => s + (r.net ?? 0), 0),
            coveredAmount: medicalExpenseRows.reduce((s, r) => s + (r.cover ?? 0), 0),
            nonCoveredAmount: medicalExpenseRows.reduce((s, r) => s + (r.unCover ?? 0), 0),
            unPayAmount: medicalExpenseRows.reduce((s, r) => s + (r.unPay ?? 0), 0),
            payAmount: medicalExpenseRows.reduce((s, r) => s + (r.pay ?? 0), 0),
        },
    ];
    const compensationTableData = [
        ...COMPENSATION.map((item) => ({
            description: item.benefitName ?? "-",
            amount: item.pay ?? 0,
        })),
        {
            description: "รวมทั้งหมด",
            amount: COMPENSATION.reduce((sum, item) => sum + (item.pay ?? 0), 0),
        },
    ];
    const treatmentColumns: MUIDataTableColumn[] = [
        { name: "benefitName", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        {
            name: "amountNet",
            label: "รายการเบิก",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        },
        {
            name: "payAmount",
            label: "สิทธิ์เบิก",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        },
        {
            name: "unPayAmount",
            label: "ส่วนเกินสิทธิ์",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        },
    ];

    const compensationColumns: MUIDataTableColumn[] = [
        { name: "description", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        // { name: "days", label: "จำนวนวัน", options: { ...cellAlignOptions({ align: "center" }) } },
        // {
        //     name: "ratePerDay",
        //     label: "อัตราต่อวัน",
        //     options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        // },
        {
            name: "amount",
            label: "สิทธิ์เบิก",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        },
    ];
    const rows = attachedDocuments
        .map((attached) => {
            const scanInfo = documentScanList.find((d) => d.documentId === attached.documentId);
            const detail = documentDetailById[attached.documentId ?? ""];

            if (!scanInfo) return null;

            return {
                documentId: scanInfo.documentId,
                documentCode: scanInfo.documentCode,
                documentSubTypeName: scanInfo.documentSubTypeName,
                fileCount: detail?.docDetail?.fileCount ?? 0,
            };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentCode",
            label: "รหัสเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentSubTypeName",
            label: "ประเภทเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentId",
            label: "รายละเอียด",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value) => (
                    <Grid container alignItems="center" justifyContent="center">
                        <Tooltip title="ดูรายละเอียด" arrow placement="top" enterDelay={100} leaveDelay={50}>
                            <IconButton
                                aria-label="preview"
                                size="small"
                                sx={{ backgroundColor: "#E2F2FF" }}
                                onClick={() => {
                                    const url = `${DOC_STORAGE_URL}/document/${value}/preview`;
                                    handleClickLink(url);
                                }}
                            >
                                <Visibility color="primary" />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                ),
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />} text="สรุปรายการเคลม" color="blue" />
            <Grid container spacing={2} p={2}>
                <CustomDisplayText label="เหตุของการเคลม" value={values.incidentTypeName} />
                <CustomDisplayText label="ประเภทความคุ้มครอง" value={values.coverageTypeName} />
                <CustomDisplayText label="ประเภทการรักษา" value={values.medicalTypeName} />
                <CustomDisplayText label="วันที่แจ้งเคลม" value={formatDate(createdClaimDate)} />
                <CustomDisplayText label="วันที่เกิดเหตุ" value={formatDate(values.incidentDate)} />

                <CustomDisplayText label="เวลาที่เกิดเหตุ" value={formatTime(values.incidentTime)} />
                <CustomDisplayText label="วันที่เข้า รพ." value={formatDate(values.admissionDate)} />
                <CustomDisplayText label="เวลาที่เข้า รพ." value={formatTime(values.admissionTime)} />
                <CustomDisplayText label="วันที่ออก รพ." value={formatDate(values.dischargeDate)} />
                <CustomDisplayText label="เวลาที่ออก รพ." value={formatTime(values.dischargeTime)} />
                <CustomDisplayText label="อาการสำคัญ" value={values.chiefComplaintId_selectedText} xs={12} md={6} />

                <CustomDisplayText label="สถานพยาบาล" value={values.hospitalName} xs={12} md={12} />
                <CustomDisplayText label="คำวินิจฉัย 1" value={formatDiagnosis(diagnosis1)} xs={12} md={12} />
                <CustomDisplayText label="คำวินิจฉัย 2" value={formatDiagnosis(diagnosis2)} xs={12} md={12} />
                <CustomDisplayText label="คำวินิจฉัย 3" value={formatDiagnosis(diagnosis3)} xs={12} md={12} />
                <CustomDisplayText label="หมายเหตุ" value={values.detail ?? "-"} xs={12} md={12} />
            </Grid>
            <Box
                sx={{
                    mx: 2,
                    mb: 2,
                    pt: 2,
                    borderTop: "1px solid #E0E0E0",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1.5,
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: 1,
                            bgcolor: "#E2F2FF",
                        }}
                    >
                        <BedIcon
                            sx={{
                                fontSize: 20,
                                color: "#007AC1",
                            }}
                        />
                    </Box>

                    {/* Title */}
                    <Box>
                        <Typography
                            sx={{
                                color: "#007AC1",
                                fontWeight: 700,
                                fontSize: 13,
                                lineHeight: 1.4,
                            }}
                        >
                            สรุปจำนวนวันนอน
                        </Typography>

                        <Typography
                            sx={{
                                color: "#667085",
                                fontSize: 12,
                                lineHeight: 1.4,
                                mt: 0.25,
                            }}
                        >
                            IPD
                        </Typography>
                    </Box>
                </Box>

                {/* Stay Day Summary */}
                <Grid container spacing={1.5}>
                    <StayDayBox
                        label="จำนวนวัน IPD"
                        value={values.ipdDays ?? 0}
                        borderColor="#D6E8FF"
                        valueColor="#007AC1"
                    />

                    <StayDayBox
                        label="จำนวนวัน ICU"
                        value={values.icuDays ?? 0}
                        borderColor="#FFD9B3"
                        valueColor="#E53935"
                    />

                    <StayDayBox
                        label="จำนวนวันนอน"
                        value={values.totalDays ?? 0}
                        borderColor="#D0D5DD"
                        valueColor="#344054"
                    />
                </Grid>
            </Box>
            <StandardDataTable
                name="claimSummaryDocumentTable"
                title=""
                data={rows}
                isLoading={false}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                displayFooter={false}
                options={defaultOptionStandardDataTable}
            />
            <Grid container spacing={2} mt={1}>
                <Grid item xs={12}>
                    <HeadingWithColor
                        text="ค่าชดเชย"
                        color="blue"
                        icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ mb: 1 }}
                    />
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <StandardDataTable
                            name="CompensationTable"
                            title=""
                            data={compensationTableData}
                            isLoading={false}
                            columns={compensationColumns}
                            color="primary"
                            columnHeaderAlign="center"
                            displayToolbar={false}
                            displayFooter={false}
                            options={{
                                ...tableOptions,
                                setRowProps: (_r, _d, i) => ({
                                    style:
                                        i === compensationTableData.length - 1
                                            ? { backgroundColor: "#3d3d3d" }
                                            : i % 2 === 0
                                            ? { backgroundColor: "#ffffff" }
                                            : { backgroundColor: "#f9f9f9" },
                                }),
                            }}
                            sx={tableSx}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <HeadingWithColor
                        text="สรุปค่าชดเชย"
                        color="blue"
                        icon={<SummarizeOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ mb: 1 }}
                    />
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <Box px={1.5} py={0.5} bgcolor="#f8f9fa">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={mergeOption === "single"}
                                        onChange={() => setMergeOption("single")}
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา</Typography>}
                                sx={{ m: 0, display: "flex", py: 0.5 }}
                            />
                            <Divider />
                        </Box>
                        <Divider />
                        <SummaryLine label="ค่าชดเชยรวม" value={fmt(summary.compensateNet)} />
                        <SummaryLine
                            label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)"
                            value={fmt(summary.compensateInclude)}
                        />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            py={0.75}
                            px={1.5}
                            sx={{ bgcolor: "#F7FEE7" }}
                        >
                            <Typography variant="body2" fontWeight={700} sx={{ color: "#15803d" }}>
                                ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                minWidth={110}
                                textAlign="right"
                                sx={{ color: "#15803d" }}
                            >
                                {fmt(summary.compensateRemain)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <HeadingWithColor
                        text="สรุปค่าใช้จ่ายโรงพยาบาล"
                        color="blue"
                        icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ mb: 1 }}
                    />
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <SummaryLine label="ยอดเบิกรวม" value={fmt(summary.medicalNet)} />
                        <SummaryLine label="สิทธิ์ความคุ้มครอง" value={fmt(summary.medicalCoverPay)} />
                        <SummaryLine
                            label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)"
                            value={fmt(summary.compensateInclude)}
                        />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            py={0.75}
                            px={1.5}
                            sx={{ bgcolor: "#e8f0fb" }}
                        >
                            <Typography variant="body2" fontWeight={700} color="#1a5da8">
                                สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color="#1a5da8"
                                    minWidth={110}
                                    textAlign="right"
                                >
                                    {fmt(summary.medicalPay)}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            py={0.75}
                            px={1.5}
                            sx={{ bgcolor: "#FEF2F2" }}
                        >
                            <Typography variant="body2" fontWeight={700} color="#FF6467">
                                ส่วนเกิน (ลูกค้าจ่าย)
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="#FF6467"
                                minWidth={110}
                                textAlign="right"
                            >
                                {fmt(summary.medicalUnpay)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </CustomPaper>
    );
};

export default ClaimSummary;

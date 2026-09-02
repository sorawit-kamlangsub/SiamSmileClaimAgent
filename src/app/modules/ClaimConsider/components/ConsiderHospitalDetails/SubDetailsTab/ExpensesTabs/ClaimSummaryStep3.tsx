import { useMemo, useState } from "react";
import { Box, Checkbox, Divider, FormControlLabel, Grid, Paper, Typography } from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import { MUIDataTableColumn } from "mui-datatables";

import { StandardDataTable } from "../../../../../_common";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import { cellAlignOptions } from "../../../../../../functionHelpers";
import {
    CompensationSummaryData,
    MergeOption,
    calculateCompensationSummary,
} from "./_common/calculateCompensationSummary";

/** 1 แถวของตารางรายการค่ารักษาในหน้าสรุป */
export type Step3TreatmentRow = {
    benefitName: string;
    /** รายการเบิก (ยอดสุทธิ) */
    amountNet: number;
    /** สิทธิ์เบิก */
    payAmount: number;
    /** ส่วนเกินสิทธิ์ */
    unPayAmount: number;
};

export type Step3CompensationRow = {
    description: string;
    amount: number;
};

type ClaimSummaryStep3Props = {
    days?: { ipdDays: number; icuDays: number; bedDays: number };
    treatmentRows?: Step3TreatmentRow[];
    compensationRows?: Step3CompensationRow[];
    /** ค่าตั้งต้นจาก API คำนวณ (ยังไม่มี endpoint สำหรับหน้าพิจารณา จึง default 0) */
    summary?: Partial<CompensationSummaryData>;
};

const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

const withTotalRow = <T extends Record<string, unknown>>(rows: T[], totalRow: T): T[] =>
    rows.length === 0 ? [] : [...rows, totalRow];

const tableSx = {
    "& td, & th": { fontSize: "15px !important", py: "5px !important", px: "9px !important" },
    "& td": { borderRight: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0", "&:last-child": { borderRight: "none" } },
    "& tbody tr:last-child:not(:only-child) td": {
        bgcolor: "#3d3d3d !important",
        color: "#fff !important",
        fontWeight: "700 !important",
    },
    "& table": { borderCollapse: "collapse" as const },
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
        <Box display="flex" justifyContent="space-between" alignItems="center" py={0.75} px={1.5} sx={{ bgcolor: bg ?? "transparent" }}>
            <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color ?? "text.primary"}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color ?? "text.primary"} minWidth={110} textAlign="right">
                {value}
            </Typography>
        </Box>
        {!noDivider && <Divider />}
    </>
);

const DayCard = ({ label, value, color, bg, icon }: { label: string; value: number; color: string; bg: string; icon: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%", borderColor: bg, bgcolor: bg, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#fff", color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {label}
            </Typography>
            <Typography fontWeight={700} fontSize={22} color={color} lineHeight={1.1}>
                {value} วัน
            </Typography>
        </Box>
    </Paper>
);

/**
 * Step 3 : สรุปรายการเคลม (เคลมโรงพยาบาล)
 *
 * Layout ย้ายมาจาก ClaimSimulate/ConfirmCalaulateModal — รายการค่ารักษา + ค่าชดเชย +
 * สรุปค่าชดเชย (โอนรวมกับค่ารักษา) + สรุปค่าใช้จ่ายโรงพยาบาล (สิทธิ์ตั้งเบิก / ส่วนเกิน)
 * ยอดเงินรอ API คำนวณของหน้าพิจารณา ตอนนี้รับผ่าน props (default 0)
 */
const ClaimSummaryStep3 = ({ days, treatmentRows = [], compensationRows = [], summary }: ClaimSummaryStep3Props) => {
    const [mergeOption, setMergeOption] = useState<MergeOption>("single");

    const calc = useMemo(
        () =>
            calculateCompensationSummary(
                {
                    compensateNet: summary?.compensateNet ?? 0,
                    compensateInclude: summary?.compensateInclude ?? 0,
                    compensateRemain: summary?.compensateRemain ?? 0,
                    medicalNet: summary?.medicalNet ?? 0,
                    medicalCoverPay: summary?.medicalCoverPay ?? 0,
                    medicalCompensateInclude: summary?.medicalCompensateInclude ?? 0,
                    medicalPay: summary?.medicalPay ?? 0,
                    medicalUnpay: summary?.medicalUnpay ?? 0,
                },
                mergeOption
            ),
        [summary, mergeOption]
    );

    const treatmentColumns: MUIDataTableColumn[] = [
        { name: "benefitName", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        { name: "amountNet", label: "รายการเบิก", options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) } },
        { name: "payAmount", label: "สิทธิ์เบิก", options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) } },
        { name: "unPayAmount", label: "ส่วนเกินสิทธิ์", options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) } },
    ];

    const compensationColumns: MUIDataTableColumn[] = [
        { name: "description", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        { name: "amount", label: "สิทธิ์เบิก", options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(Number(v)) } },
    ];

    const treatmentData = withTotalRow(treatmentRows, {
        benefitName: "รวมทั้งหมด",
        amountNet: treatmentRows.reduce((s, r) => s + r.amountNet, 0),
        payAmount: treatmentRows.reduce((s, r) => s + r.payAmount, 0),
        unPayAmount: treatmentRows.reduce((s, r) => s + r.unPayAmount, 0),
    });

    const compensationData = withTotalRow(compensationRows, {
        description: "รวมทั้งหมด",
        amount: compensationRows.reduce((s, r) => s + r.amount, 0),
    });

    return (
        <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
                <DayCard label="IPD" value={days?.ipdDays ?? 0} color="#1A5DA8" bg="#E8F0FB" icon={<HotelOutlinedIcon />} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <DayCard label="ICU" value={days?.icuDays ?? 0} color="#FF6467" bg="#FEF2F2" icon={<LocalHospitalOutlinedIcon />} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <DayCard label="วันที่นอน" value={days?.bedDays ?? 0} color="#5EA529" bg="#F7FEE7" icon={<KingBedOutlinedIcon />} />
            </Grid>

            <Grid item xs={12}>
                <HeadingWithColor text="รายการค่ารักษา" color="blue" icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />} />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <StandardDataTable
                        name="HospitalTreatmentSummaryTable"
                        title=""
                        data={treatmentData}
                        isLoading={false}
                        columns={treatmentColumns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={tableOptions}
                        sx={tableSx}
                    />
                </Paper>
            </Grid>

            <Grid item xs={12}>
                <HeadingWithColor text="ค่าชดเชย" color="blue" icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 18 }} />} />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <StandardDataTable
                        name="HospitalCompensationTable"
                        title=""
                        data={compensationData}
                        isLoading={false}
                        columns={compensationColumns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={tableOptions}
                        sx={tableSx}
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <HeadingWithColor text="สรุปค่าชดเชย" color="blue" icon={<SummarizeOutlinedIcon sx={{ fontSize: 18 }} />} />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <Box px={1.5} py={0.5} bgcolor="#f8f9fa">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={mergeOption === "single"}
                                    onChange={() => setMergeOption(mergeOption === "single" ? null : "single")}
                                    color="primary"
                                />
                            }
                            label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา</Typography>}
                            sx={{ m: 0, display: "flex", py: 0.5 }}
                        />
                        <Divider />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={mergeOption === "all"}
                                    onChange={() => setMergeOption(mergeOption === "all" ? null : "all")}
                                    color="primary"
                                />
                            }
                            label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา (ทั้งหมด)</Typography>}
                            sx={{ m: 0, display: "flex", py: 0.5 }}
                        />
                    </Box>
                    <Divider />
                    <SummaryLine label="ค่าชดเชยรวม" value={fmt(calc.compensateNet)} />
                    <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(calc.compensateInclude)} />
                    <SummaryLine
                        label="ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)"
                        value={fmt(calc.compensateRemain)}
                        bold
                        color="#15803d"
                        bg="#F7FEE7"
                        noDivider
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <HeadingWithColor text="สรุปค่าใช้จ่ายโรงพยาบาล" color="blue" icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />} />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
                    <SummaryLine label="ยอดเบิกรวม" value={fmt(calc.medicalNet)} />
                    <SummaryLine label="สิทธิ์ความคุ้มครอง" value={fmt(calc.medicalCoverPay)} />
                    <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(calc.compensateInclude)} />
                    <SummaryLine label="สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท" value={fmt(calc.medicalPay)} bold color="#1a5da8" bg="#e8f0fb" />
                    <SummaryLine label="ส่วนเกิน (ลูกค้าจ่าย)" value={fmt(calc.medicalUnpay)} bold color="#FF6467" bg="#FEF2F2" noDivider />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ClaimSummaryStep3;

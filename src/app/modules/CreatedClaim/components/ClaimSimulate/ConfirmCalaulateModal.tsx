import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { MUIDataTableColumn } from "mui-datatables";
import { useAppSelector } from "../../../../../redux";
import { StandardDataTable } from "../../../_common";
import { cellAlignOptions } from "../../../../functionHelpers";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

interface CompensationItem {
    description: string;
    days: number;
    ratePerDay: number;
    amount: number;
}

// const MOCK_COMPENSATION: CompensationItem[] = [
//     { description: "ค่าชดเชยการนอนรักษาพยาบาลเป็นผู้ป่วยใน", days: 0, ratePerDay: 0, amount: 0 },
// ];

const ConfirmCalaulateModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
    const { daysCalculate, calculateResult } = useAppSelector((s) => s.claimsimulate);
    const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    const [mergeOption, setMergeOption] = useState<"single" | "all" | null>(null);

    // ── map medicalExpense จาก API → ตารางรายการค่ารักษา ─────────────────────
    const medicalExpenseRows = calculateResult?.medicalExpense ?? [];
    const MOCK_COMPENSATION = calculateResult?.compensateExpense ?? [];

    const treatmentTableData = [
        ...medicalExpenseRows.map((item) => ({
            groupName: item.benefit_id ?? "-",
            benefitName: item.benefit_Detail ?? "-",
            coveredAmount: item.cover ?? 0,
            nonCoveredAmount: item.unCover ?? 0,
            totalAmount: item.pay ?? 0,
        })),
        // แถว totals
        {
            groupName: "รวมทั้งหมด",
            benefitName: "",
            coveredAmount: medicalExpenseRows.reduce((s, r) => s + (r.cover ?? 0), 0),
            nonCoveredAmount: medicalExpenseRows.reduce((s, r) => s + (r.unCover ?? 0), 0),
            totalAmount: medicalExpenseRows.reduce((s, r) => s + (r.pay ?? 0), 0),
        },
    ];

    // ── ค่าชดเชย (ยังใช้ mock ไปก่อน รอ API) ─────────────────────────────────
    // const compensationTotal = MOCK_COMPENSATION.reduce((s, r) => s + (r.pay ?? 0), 0);
    const compensationTotal = 0;

    // const compensationInCoverage = MOCK_COMPENSATION.reduce((s, r) => s + (r.cover ?? 0), 0);
    const compensationInCoverage = 0;
    const compensationRemaining = 0;
    const compensationTableData = [
        ...MOCK_COMPENSATION.map((item) => ({
            description: item.benefit_Detail ?? "-",
            days: item.countDay ?? 0,
            ratePerDay: item.dayOfUnit ?? 0,
            amount: item.cover ?? 0,
        })),
    ];
    // const compensationTableData = [...MOCK_COMPENSATION];

    // ── สรุปค่าใช้จ่ายจาก calculateResult ────────────────────────────────────
    const totalExpense = calculateResult?.summaryMedicalPay ?? 0;
    const totalNotCovered = calculateResult?.summaryMedicalUnPay ?? 0;
    const medicalNet = calculateResult?.medicalNet ?? 0;
    const medicalPay = calculateResult?.medicalPay ?? 0;
    // const coverageRight = medicalPay;
    const compensation = compensationInCoverage;
    // const totalCoverage = coverageRight + compensation;
    // const customerPay = Math.max(totalExpense - totalCoverage, 0);

    // ── columns: รายการค่ารักษา (ปรับตาม MedicalExpenseList) ─────────────────
    const treatmentColumns: MUIDataTableColumn[] = [
        {
            name: "groupName",
            label: "หมวดค่าใช้จ่าย",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "benefitName",
            label: "รายการ",
            options: { ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "coveredAmount",
            label: "สิทธิ์เบิก",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => fmt(v),
            },
        },
        {
            name: "nonCoveredAmount",
            label: "ส่วนเกินสิทธิ์",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => fmt(v),
            },
        },
        {
            name: "totalAmount",
            label: "ยอดรวม",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => fmt(v),
            },
        },
    ];

    const compensationColumns: MUIDataTableColumn[] = [
        { name: "description", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        { name: "days", label: "จำนวนวัน", options: { ...cellAlignOptions({ align: "center" }) } },
        {
            name: "ratePerDay",
            label: "อัตราต่อวัน",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
        },
    ];

    const tableSx = {
        "& td, & th": { fontSize: "14px !important", py: "5px !important", px: "9px !important" },
        "& td": {
            borderRight: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
            "&:last-child": { borderRight: "none" },
        },
        "& th": { borderRight: "1px solid #ffffff44" },
        "& tbody tr:last-child td": {
            bgcolor: "#3d3d3d !important",
            color: "#fff !important",
            fontWeight: "700 !important",
            borderRight: "1px solid #555 !important",
            borderBottom: "none !important",
            "&:last-child": { borderRight: "none !important" },
        },
        "& table": { borderCollapse: "collapse" },
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

    return (
        <Dialog open={open} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            {/* ── Header ── */}
            <DialogTitle sx={{ pb: 0, px: 3, pt: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 42, height: 42, bgcolor: "#e8f0fb", border: "1px solid #c5d8f7" }}>
                            <ReceiptLongIcon sx={{ fontSize: 22, color: "primary.main" }} />
                        </Avatar>
                        <Box>
                            <Typography fontWeight={700} fontSize={18} lineHeight={1.2}>
                                สรุปรายการค่าใช้จ่าย
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {daysCalculate.customerName} · {daysCalculate.appId}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: "grey.100",
                            color: "grey.600",
                            width: 28,
                            height: 28,
                            "&:hover": { bgcolor: "error.main", color: "white" },
                            transition: "all 0.2s",
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* ── Day chips ── */}
                <Stack direction="row" spacing={1.5} mt={1.5} mb={0.5} flexWrap="wrap">
                    {[
                        { label: "วัน IPD", value: daysCalculate.ipdDays, color: "#1a5da8", bg: "#e8f0fb" },
                        { label: "วัน ICU", value: daysCalculate.icuDays, color: "#FF6467", bg: "#FEF2F2" },
                        { label: "วันที่นอน", value: daysCalculate.bedDays, color: "#5EA529", bg: "#F7FEE7" },
                    ].map((chip) => (
                        <Box
                            key={chip.label}
                            sx={{
                                px: 1.5,
                                py: 0.4,
                                borderRadius: 2,
                                bgcolor: chip.bg,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                            }}
                        >
                            <Typography sx={{ fontSize: 14 }} color={chip.color} fontWeight="bold">
                                {chip.label}
                            </Typography>
                            <Typography sx={{ fontSize: 14 }} color={chip.color} fontWeight="bold">
                                {chip.value} วัน
                            </Typography>
                        </Box>
                    ))}

                    {/* ── summary chips จาก API ── */}
                    {/* {[
                        { label: "ยอดเบิกรวม", value: fmt(totalExpense), color: "#1a5da8", bg: "#e8f0fb" },
                        { label: "สิทธิ์โรงพยาบาล", value: fmt(medicalPay), color: "#15803d", bg: "#F7FEE7" },
                        { label: "ส่วนเกิน", value: fmt(totalNotCovered), color: "#FF6467", bg: "#FEF2F2" },
                    ].map((chip) => (
                        <Box
                            key={chip.label}
                            sx={{
                                px: 1.5,
                                py: 0.4,
                                borderRadius: 2,
                                bgcolor: chip.bg,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                            }}
                        >
                            <Typography sx={{ fontSize: 14 }} color={chip.color} fontWeight={500}>
                                {chip.label} :
                            </Typography>
                            <Typography sx={{ fontSize: 14 }} color={chip.color} fontWeight="bold">
                                {chip.value}
                            </Typography>
                        </Box>
                    ))} */}
                </Stack>
                <Divider sx={{ mt: 1 }} />
            </DialogTitle>

            <DialogContent sx={{ pt: 2, px: 3 }}>
                <Grid container spacing={2.5}>
                    {/* ── ตารางรายการค่ารักษา (จาก medicalExpense) ── */}
                    <Grid item xs={12}>
                        <HeadingWithColor
                            text="รายการค่ารักษา"
                            color="blue"
                            icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />}
                            sx={{ mb: 1 }}
                        />
                        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                            <StandardDataTable
                                name="TreatmentSummaryTable"
                                title=""
                                data={treatmentTableData}
                                isLoading={false}
                                columns={treatmentColumns}
                                color="primary"
                                columnHeaderAlign="center"
                                displayToolbar={false}
                                displayFooter={false}
                                options={{
                                    ...tableOptions,
                                    setRowProps: (_r, _d, i) => ({
                                        style:
                                            i === treatmentTableData.length - 1
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

                    {/* ── ตารางค่าชดเชย ── */}
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

                    {/* ── สรุป 2 คอลัมน์ ── */}
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
                            <SummaryLine label="ค่าชดเชยรวม" value={fmt(compensationTotal)} />
                            <SummaryLine
                                label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)"
                                value={fmt(compensationInCoverage)}
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
                                    {fmt(compensationRemaining)}
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
                            <SummaryLine label="ยอดเบิกรวม" value={fmt(medicalNet)} />
                            <SummaryLine label="สิทธิ์ความคุ้มครอง" value={fmt(medicalPay)} />
                            <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(compensation)} />
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                py={0.75}
                                px={1.5}
                                sx={{ bgcolor: "#e8f0fb" }}
                            >
                                <Typography variant="body2" fontWeight={700} color="#1a5da8">
                                    สิทธิ์โรงพยาบาล
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color="#1a5da8"
                                    minWidth={110}
                                    textAlign="right"
                                >
                                    {fmt(totalExpense)}
                                </Typography>
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
                                    {fmt(totalNotCovered)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* ── Warning ── */}
                    <Grid item xs={12}>
                        <HeadingWithColor
                            text="กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการบันทึก"
                            color="yellow"
                            icon={<WarningAmberRoundedIcon sx={{ fontSize: 24 }} />}
                            sx={{ mb: 0 }}
                        />
                    </Grid>

                    {/* ── ปุ่มยืนยัน ── */}
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="center">
                            <Button
                                variant="contained"
                                color="success"
                                size="medium"
                                startIcon={<SaveIcon />}
                                onClick={onConfirm}
                                sx={{
                                    px: 5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    boxShadow: 2,
                                    "&:hover": { boxShadow: 4 },
                                    minWidth: 200,
                                }}
                            >
                                ยืนยันการบันทึก
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmCalaulateModal;

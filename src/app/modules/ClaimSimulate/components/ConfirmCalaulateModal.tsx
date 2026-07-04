import React, { useMemo, useState } from "react";
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
    Snackbar,
    Stack,
    Tooltip,
    Typography,
    Zoom,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { MUIDataTableColumn } from "mui-datatables";
import { useAppSelector } from "../../../../redux";
import { StandardDataTable } from "../../_common";
import { cellAlignOptions } from "../../../functionHelpers";
import { HeadingWithColor } from "../../_common/components/CustomComponent/HeadingWithColor";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

interface SummaryData {
    compensateNet: number;
    compensateInclude: number;
    compensateRemain: number;

    medicalNet: number;
    medicalCoverPay: number;
    medicalCompensateInclude: number;
    medicalPay: number;
    medicalUnpay: number;
}

type MergeOption = "single" | "all" | null;

export const calculateSummary = (data: SummaryData, mergeOption: MergeOption): SummaryData => {
    const result: SummaryData = { ...data };

    result.compensateInclude = 0;
    result.medicalCompensateInclude = 0;
    result.compensateRemain = result.compensateNet;

    // โอนค่าชดเชยรวมกับค่ารักษา
    if (mergeOption === "single") {
        if (result.medicalUnpay > 0) {
            if (result.medicalUnpay >= result.compensateNet) {
                result.medicalCompensateInclude = result.compensateNet;
                result.compensateRemain = 0;
            } else {
                result.medicalCompensateInclude = result.medicalUnpay;
                result.compensateRemain = result.compensateNet - result.medicalCompensateInclude;
            }

            result.compensateInclude = result.medicalCompensateInclude;
            result.medicalPay += result.medicalCompensateInclude;
            result.medicalUnpay -= result.medicalCompensateInclude;
        }
    }

    // โอนค่าชดเชยรวมกับค่ารักษาทั้งหมด
    if (mergeOption === "all") {
        result.medicalCompensateInclude = result.compensateNet;
        result.compensateInclude = result.compensateNet;
        result.compensateRemain = 0;

        result.medicalPay += result.medicalCompensateInclude;
        result.medicalUnpay -= result.medicalCompensateInclude;

        if (result.medicalUnpay < 0) {
            result.medicalUnpay = 0;
        }
    }

    return result;
};

const ConfirmCalaulateModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
    const { daysCalculate, calculateResult, selectedInsured } = useAppSelector((s) => s.claimsimulate);
    const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    const [mergeOption, setMergeOption] = useState<"single" | "all" | null>("single");
    const [copied, setCopied] = useState(false);

    const handleCopyMedicalPay = async (value: number) => {
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
        } catch {
            // ignore clipboard errors
        }
    };

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
    const MOCK_COMPENSATION = calculateResult?.compensateExpense ?? [];

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

    // ── Summary Compensate ──────────────────────────────────────────────────
    // const compensationTotal = calculateResult?.compensateNet ?? 0; // ค่าชดเชยรวม
    // const compensationInCoverage = calculateResult?.compensateInclude ?? 0; // ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)
    // const compensationRemaining = calculateResult?.compensateRemain ?? 0; // ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)

    const compensationTableData = [
        ...MOCK_COMPENSATION.map((item) => ({
            description: item.benefitName ?? "-",
            amount: item.pay ?? 0,
        })),
        {
            description: "รวมทั้งหมด",
            amount: MOCK_COMPENSATION.reduce((sum, item) => sum + (item.pay ?? 0), 0),
        },
    ];

    // ── Summary Medic ────────────────────────────────────────────────────────
    // const medicalNet = calculateResult?.medicalNet ?? 0; // ยอดเบิกรวม
    // const medicalPay = calculateResult?.medicalCoverPay ?? 0; // สิทธิ์ความคุ้มครอง
    // const compensation = calculateResult?.medicalCompensateInclude ?? 0; // ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)
    // const totalExpense = calculateResult?.medicalPay ?? 0; // สิทธิ์โรงพยาบาล
    // const totalNotCovered = calculateResult?.medicalUnpay ?? 0; // ส่วนเกิน (ลูกค้าจ่าย)

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
                                {selectedInsured?.customerName ?? "-"} · {selectedInsured?.policyCode ?? "-"}
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
            </DialogTitle>

            <DialogContent sx={{ pt: 2, px: 3 }}>
                <Grid container spacing={1.5} mt={1.5} mb={1}>
                    <Grid item xs={12} md={5}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                height: "100%",
                                borderColor: "#d7e5f7",
                                bgcolor: "#f8fbff",
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: "#e8f0fb",
                                        color: "#1976d2",
                                        width: 42,
                                        height: 42,
                                    }}
                                >
                                    <PersonOutlineOutlinedIcon />
                                </Avatar>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        ผู้เอาประกัน :
                                    </Typography>

                                    <Typography fontWeight={700} color="primary.main" sx={{ lineHeight: 1.3 }}>
                                        {selectedInsured?.customerName ?? "-"}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" mt={0.3}>
                                        ApplicationID :
                                        <Typography component="span" fontWeight={700} color="primary.main">
                                            {" "}
                                            {selectedInsured?.policyCode ?? "-"}
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {[
                        {
                            label: "IPD",
                            value: daysCalculate.ipdDays,
                            color: "#1A5DA8",
                            bg: "#E8F0FB",
                            icon: <HotelOutlinedIcon />,
                        },
                        {
                            label: "ICU",
                            value: daysCalculate.icuDays,
                            color: "#FF6467",
                            bg: "#FEF2F2",
                            icon: <LocalHospitalOutlinedIcon />,
                        },
                        {
                            label: "วันที่นอน",
                            value: daysCalculate.bedDays,
                            color: "#5EA529",
                            bg: "#F7FEE7",
                            icon: <KingBedOutlinedIcon />,
                        },
                    ].map((item) => (
                        <Grid item xs={12} sm={4} md={2.33} key={item.label}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    height: "100%",
                                    borderColor: item.bg,
                                    bgcolor: item.bg,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: item.bg,
                                        color: item.color,
                                        mr: 1.5,
                                    }}
                                >
                                    {item.icon}
                                </Avatar>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        {item.label}
                                    </Typography>

                                    <Typography fontWeight={700} fontSize={22} color={item.color} lineHeight={1.1}>
                                        {item.value} วัน
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={2.5}>
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
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={mergeOption === "all"}
                                            onChange={() => setMergeOption("all")}
                                            color="primary"
                                        />
                                    }
                                    label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา (ทั้งหมด)</Typography>}
                                    sx={{ m: 0, display: "flex", py: 0.5 }}
                                />
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
                                    <Tooltip
                                        title="คัดลอกยอดเงิน"
                                        arrow
                                        placement="top"
                                        TransitionComponent={Zoom}
                                        enterDelay={100}
                                        leaveDelay={50}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopyMedicalPay(summary.medicalPay)}
                                            sx={{ color: "#1a5da8" }}
                                        >
                                            <ContentCopyIcon sx={{ fontSize: 17 }} />
                                        </IconButton>
                                    </Tooltip>
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

                    <Grid item xs={12}>
                        <HeadingWithColor
                            text="กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการบันทึก"
                            color="yellow"
                            icon={<WarningAmberRoundedIcon sx={{ fontSize: 24 }} />}
                            sx={{ mb: 0 }}
                        />
                    </Grid>

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
            <Snackbar
                open={copied}
                autoHideDuration={2000}
                onClose={() => setCopied(false)}
                message="คัดลอกยอดเงินแล้ว"
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            />
        </Dialog>
    );
};

export default ConfirmCalaulateModal;

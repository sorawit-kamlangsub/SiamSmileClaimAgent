import React from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";

import FormikDateTimePicker from "../../_common/components/CustomFormik/FormikDateTimePicker";
import FormikDatePicker from "../../_common/components/CustomFormik/FormikDatePicker";
import { FormikDropdown } from "../../_common";

import { useClaimSimulatePage } from "../hooks/useClaimSimulatePage";
import { CONTINUOUS_CLAIM_OPTIONS } from "../store/claimSimulateOptions";
import InsuredSearchModal from "./InsuredSearchModal";
import ConfirmCalaulateModal from "./ConfirmCalaulateModal";

// ─── Reference palette (ตามไฟล์ HTML ต้นแบบ) ─────────────────────────────────
const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#eaf5ff",
    line: "#dce8f4",
    lineStrong: "#c4d7ea",
    muted: "#718096",
    text: "#243447",
};

// ─── Shared input styles (ตาม .input / .table-input ใน reference) ──────────
const refInputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: "#fff",
        fontSize: 13,
        "& fieldset": { borderColor: REF.lineStrong },
        "&:hover fieldset": { borderColor: REF.primary },
        "&.Mui-focused fieldset": { borderColor: REF.primary, borderWidth: 1.5 },
    },
};

const tableInputSx = {
    ...refInputSx,
    "& .MuiOutlinedInput-root": {
        ...refInputSx["& .MuiOutlinedInput-root"],
        height: 32,
    },
    "& .MuiOutlinedInput-input": { padding: "4px 8px", textAlign: "center" as const },
};

const tableSelectSx = {
    height: 32,
    fontSize: 13,
    borderRadius: "8px",
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: REF.lineStrong },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: REF.primary },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: REF.primary, borderWidth: 1.5 },
};

// ─── Category icon map (เหมือนเดิม) ───────────────────────────────────────────
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
    ค่ารักษาพยาบาลทางการแพทย์: <MedicationOutlinedIcon sx={{ fontSize: 16 }} />,
    การตรวจวินิจฉัย: <BiotechOutlinedIcon sx={{ fontSize: 16 }} />,
    การผ่าตัด: <ContentCutOutlinedIcon sx={{ fontSize: 16 }} />,
    ทันตกรรม: <LocalHospitalOutlinedIcon sx={{ fontSize: 16 }} />,
    บริการวิชาชีพและการดูแล: <AccessibilityNewOutlinedIcon sx={{ fontSize: 16 }} />,
    อุปกรณ์เฉพาะทาง: <DevicesOutlinedIcon sx={{ fontSize: 16 }} />,
    แพทย์ทางเลือก: <SpaOutlinedIcon sx={{ fontSize: 16 }} />,
    บริการเหมาจ่าย: <CardGiftcardOutlinedIcon sx={{ fontSize: 16 }} />,
    ค่าบริการโรงพยาบาล: <ApartmentOutlinedIcon sx={{ fontSize: 16 }} />,
    ค่าแพทย์: <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
    ค่าห้องและสิ่งอำนวยความสะดวก: <HotelOutlinedIcon sx={{ fontSize: 16 }} />,
    ขนส่งและบริการพิเศษ: <DirectionsCarOutlinedIcon sx={{ fontSize: 16 }} />,
    บริการทั่วไป: <MiscellaneousServicesOutlinedIcon sx={{ fontSize: 16 }} />,
};

const causeIconMap: Record<number, React.ReactNode> = {
    2: <HealthAndSafetyOutlinedIcon sx={{ fontSize: 22, color: "primary.main" }} />,
    3: <PersonOutlineOutlinedIcon sx={{ fontSize: 22, color: "primary.main" }} />,
};

interface TreeNode {
    id: number;
    label: string;
    children: TreeNode[];
}

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
    icon,
    title,
    subtitle,
}) => (
    <Box display="flex" alignItems="center" gap={1.25} mb={2}>
        <Box
            sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "#eaf5ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography fontWeight={700} color="primary.main" lineHeight={1.3}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
);

const DaySummaryCard: React.FC<{ label: string; value: number; color: string; disabled?: boolean }> = ({
    label,
    value,
    color,
    disabled,
}) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            textAlign: "center",
            border: "1px solid",
            borderColor: disabled ? "divider" : `${color}.light`,
            borderRadius: 2,
            bgcolor: disabled ? "action.disabledBackground" : `${color}.50`,
            opacity: disabled ? 0.7 : 1,
        }}
    >
        <Typography variant="h4" fontWeight={700} color={disabled ? "text.disabled" : `${color}.main`}>
            {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
    </Paper>
);

// ─── Recursive tree (เหมือนเดิม) ──────────────────────────────────────────────
const TreeNodeRow = ({
    node,
    depth = 0,
    expandedIds,
    onToggle,
    onSelectLeaf,
    selectedLeafId,
}: {
    node: TreeNode;
    depth?: number;
    expandedIds: number[];
    onToggle: (id: number) => void;
    onSelectLeaf: (code: string, description: string, id: number) => void;
    selectedLeafId: number | null;
}) => {
    const isExpanded = expandedIds.includes(node.id);
    const hasChildren = node.children.length > 0;
    const match = node.label.match(/^([\d.]+)\s+(.+)$/);
    const code = match?.[1] ?? "";
    const description = match?.[2] ?? node.label;
    const isLeaf = !hasChildren;
    const isSelected = isLeaf && selectedLeafId === node.id;

    return (
        <>
            <Box
                onClick={() => (hasChildren ? onToggle(node.id) : onSelectLeaf(code, description, node.id))}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pl: 1.5 + depth * 2,
                    pr: 1.5,
                    py: 0.8,
                    cursor: "pointer",
                    mx: 0.5,
                    borderRadius: 1,
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    "&:hover": { bgcolor: isLeaf ? "primary.50" : "grey.100" },
                }}
            >
                {hasChildren ? (
                    <Box sx={{ mr: 0.75, display: "flex", color: "primary.main" }}>
                        {isExpanded ? (
                            <ExpandLessIcon sx={{ fontSize: 16 }} />
                        ) : (
                            <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        )}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            mr: 0.75,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: isSelected ? "primary.main" : "grey.400",
                            bgcolor: isSelected ? "primary.main" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {isSelected && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "white" }} />}
                    </Box>
                )}
                <Typography variant="body2" fontWeight={isSelected ? 600 : isLeaf ? 400 : 600} color="primary.main">
                    {node.label}
                </Typography>
            </Box>

            {hasChildren && (
                <Collapse in={isExpanded}>
                    {node.children.map((child) => (
                        <TreeNodeRow
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            onSelectLeaf={onSelectLeaf}
                            selectedLeafId={selectedLeafId}
                        />
                    ))}
                </Collapse>
            )}
        </>
    );
};

// ─── Main: หน้าเดียวจบ ─────────────────────────────────────────────────────────
const ClaimSimulate: React.FC = () => {
    const {
        // insured + header
        selectedInsured,
        header,
        claimCauseOptions,
        coverageTypeOptions,
        handleOpenInsuredSearch,
        handleSelectClaimCause,
        handleSelectCoverageType,
        // days
        formik,
        openConfirm,
        isCalculating,
        handleContinuousChange,
        handleConfirm,
        handleCloseConfirm,
        // expense table
        filledItems,
        showAddPanel,
        setShowAddPanel,
        searchText,
        setSearchText,
        expandedIds,
        handleToggleExpand,
        selectedItem,
        selectedLeafId,
        handleSelectLeaf,
        pendingAmount,
        setPendingAmount,
        pendingDiscount,
        setPendingDiscount,
        pendingNotCovered,
        setPendingNotCovered,
        pendingReason,
        setPendingReason,
        handleAddToTable,
        handleUpdateItem,
        handleRemoveItem,
        totalClaim,
        totalDiscount,
        totalNotCovered,
        netAmount,
        notCoveredReasonOptions,
        filteredCategories,
        isCategoryLoading,
        isFrequentLoading,
        discountError,
        notCoveredError,
        hasDiscountError,
        hasNotCoveredError,
        hasAnyAmount,
        handleNext,
    } = useClaimSimulatePage();

    const fmt = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    const headCell = {
        fontWeight: 700,
        fontSize: 12.5,
        bgcolor: REF.soft,
        color: REF.primaryDark,
        textAlign: "center" as const,
        whiteSpace: "nowrap" as const,
        py: 1,
        px: 1,
        border: "1px solid",
        borderColor: REF.line,
    };
    const bodyCell = {
        fontSize: 13,
        py: 0.75,
        px: 1,
        border: "1px solid",
        borderColor: REF.line,
        bgcolor: "#fff",
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                {/* ── 1) ข้อมูลผู้เอาประกัน ── */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        mb: 2.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <SectionTitle
                        icon={<PeopleAltOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />}
                        title="ข้อมูลผู้เอาประกัน"
                        subtitle="เลือกผู้เอาประกันเพื่อคำนวณวงเงินเคลม"
                    />
                    <Box
                        sx={{
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 1.75,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            bgcolor: "#f7fbff",
                        }}
                    >
                        {selectedInsured ? (
                            <Box>
                                <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        AppID : <b>{selectedInsured.appId}</b>
                                    </Typography>
                                    {selectedInsured.plan && (
                                        <Chip
                                            label={`แผน : ${selectedInsured.plan}`}
                                            size="small"
                                            color="primary"
                                            sx={{ height: 22 }}
                                        />
                                    )}
                                </Stack>
                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                    {selectedInsured.customerName}
                                </Typography>
                                {selectedInsured.startCoverDate && (
                                    <Typography variant="caption" color="text.secondary">
                                        วันที่เริ่มคุ้มครอง : {selectedInsured.startCoverDate}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.disabled">
                                ยังไม่ได้เลือกข้อมูลผู้เอาประกัน
                            </Typography>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<SearchIcon />}
                            onClick={handleOpenInsuredSearch}
                            sx={{
                                borderRadius: 1.5,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                bgcolor: "#fff",
                                ":hover": { bgcolor: "#f7fbff" },
                            }}
                        >
                            ค้นหาผู้เอาประกัน
                        </Button>
                    </Box>
                </Paper>

                {/* ── 2) รายละเอียดเคลม ── */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        mb: 2.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <SectionTitle
                        icon={<DescriptionOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />}
                        title="รายละเอียดเคลม"
                        subtitle="ระบุเหตุของการเคลม ประเภทความคุ้มครอง และวันที่รักษา"
                    />

                    {/* เหตุของการเคลม */}
                    <Typography variant="body2" fontWeight={600} mb={1}>
                        เหตุของการเคลม{" "}
                        <Box component="span" color="error.main">
                            *
                        </Box>
                    </Typography>
                    <Grid container spacing={2} mb={3}>
                        {claimCauseOptions.map((opt) => {
                            const isSelected = header.claimCause === opt.value;
                            return (
                                <Grid item xs={12} sm={6} key={opt.value}>
                                    <Paper
                                        onClick={() => handleSelectClaimCause(opt.value)}
                                        elevation={0}
                                        sx={{
                                            position: "relative",
                                            p: 2,
                                            borderRadius: 2,
                                            cursor: "pointer",
                                            border: "2px solid",
                                            borderColor: isSelected ? "primary.main" : "divider",
                                            bgcolor: isSelected ? "primary.50" : "white",
                                        }}
                                    >
                                        {isSelected && (
                                            <CheckCircleIcon
                                                color="primary"
                                                sx={{ position: "absolute", top: 12, right: 12, fontSize: 22 }}
                                            />
                                        )}
                                        <Box mb={1}>{causeIconMap[opt.value]}</Box>
                                        <Typography fontWeight={700}>{opt.label}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {opt.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* ประเภทความคุ้มครอง — segmented buttons (ไม่มี checkbox/radio) */}
                    <Typography variant="body2" fontWeight={600} mb={1}>
                        ประเภทความคุ้มครอง{" "}
                        <Box component="span" color="error.main">
                            *
                        </Box>
                    </Typography>
                    <Box display="flex" gap={1.25} mb={3} flexWrap="wrap">
                        {coverageTypeOptions.map((opt) => {
                            const OptIcon = opt.icon;
                            const isSelected = header.coverageType === opt.value;
                            return (
                                <Box
                                    key={opt.value}
                                    onClick={() => handleSelectCoverageType(opt.value)}
                                    role="button"
                                    tabIndex={0}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.75,
                                        cursor: "pointer",
                                        userSelect: "none",
                                        minWidth: 128,
                                        border: "1px solid",
                                        borderColor: isSelected ? REF.primary : REF.line,
                                        borderRadius: "12px",
                                        px: 2.25,
                                        py: 1.1,
                                        bgcolor: isSelected ? REF.soft : "#fff",
                                        boxShadow: isSelected ? "0 7px 16px rgba(11,116,189,.12)" : "none",
                                        transition: "all .15s ease",
                                        "&:hover": {
                                            borderColor: REF.primary,
                                            bgcolor: REF.soft,
                                        },
                                    }}
                                >
                                    <OptIcon
                                        sx={{
                                            fontSize: 18,
                                            color: isSelected ? REF.primary : "text.secondary",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        fontWeight={isSelected ? 700 : 600}
                                        color={isSelected ? REF.primary : "text.secondary"}
                                    >
                                        {opt.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* วันที่ */}
                    <Typography variant="body2" fontWeight={600} mb={1}>
                        ประเภทการรักษา{" "}
                        <Box component="span" color="error.main">
                            *
                        </Box>
                    </Typography>
                    <Grid container spacing={2} mb={1}>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDatePicker
                                name="dateHappen"
                                label="วันที่เกิดเหตุ"
                                formik={formik}
                                fullWidth
                                required
                                size="small"
                                maxDate={dayjs()}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDateTimePicker
                                name="admitDate"
                                label="วันที่เข้า"
                                formik={formik}
                                fullWidth
                                required
                                size="small"
                                maxDate={dayjs()}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDateTimePicker
                                name="dischargeDate"
                                label="วันที่ออก"
                                formik={formik}
                                fullWidth
                                required
                                size="small"
                                maxDate={dayjs()}
                                minDate={formik.values.admitDate}
                            />
                        </Grid>
                    </Grid>

                    {/* สรุปจำนวนวัน */}
                    <Grid container spacing={2} mt={1} mb={1}>
                        <Grid item xs={4}>
                            <DaySummaryCard label="วัน IPD" value={formik.values.ipdDays || 0} color="primary" />
                        </Grid>
                        <Grid item xs={4}>
                            <DaySummaryCard label="วัน ICU" value={formik.values.icuDays || 0} color="error" />
                        </Grid>
                        <Grid item xs={4}>
                            <DaySummaryCard
                                label="วันที่นอน"
                                value={formik.values.bedDays || 0}
                                color="success"
                                disabled
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={6}>
                            <TextField
                                label="จำนวนวัน IPD"
                                size="small"
                                fullWidth
                                type="number"
                                value={formik.values.ipdDays}
                                onChange={(e) => formik.setFieldValue("ipdDays", Number(e.target.value || 0))}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="จำนวนวัน ICU"
                                size="small"
                                fullWidth
                                type="number"
                                value={formik.values.icuDays}
                                onChange={(e) => formik.setFieldValue("icuDays", Number(e.target.value || 0))}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                    </Grid>

                    {/* เคลมต่อเนื่อง */}
                    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                        <SectionTitle
                            icon={<HistoryOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />}
                            title="เคลมต่อเนื่อง"
                            subtitle="เลือก ClaimNo เดิม เพื่อใช้ในการคำนวณวงเงินคงเหลือ"
                        />
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs="auto">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formik.values.isContinuous}
                                            onChange={(e) => handleContinuousChange(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" fontWeight={500}>
                                            เป็นเคลมต่อเนื่องจาก
                                        </Typography>
                                    }
                                />
                            </Grid>
                            <Grid item xs sm={6}>
                                <FormikDropdown
                                    name="continuousFromClaimNo"
                                    label="เลือก ClaimNo"
                                    formik={formik}
                                    data={CONTINUOUS_CLAIM_OPTIONS}
                                    firstItemText="-- เลือก --"
                                    displayFieldName="label"
                                    valueFieldName="value"
                                    fullWidth
                                    size="small"
                                    disabled={!formik.values.isContinuous}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {/* ── 3) รายการค่าใช้จ่าย + สรุปยอดเงิน ── */}
                <Grid container spacing={2.5}>
                    <Grid item xs={12} md={8.5}>
                        <Paper
                            elevation={0}
                            sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
                        >
                            <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
                                <SectionTitle
                                    icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />}
                                    title="รายการค่าใช้จ่าย"
                                    subtitle="ระบุรายละเอียดค่ารักษา แล้วระบบคำนวณยอดรวมให้อัตโนมัติ"
                                />
                            </Box>
                            <Divider />

                            <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                                {/* ── รายการที่เลือกแล้ว ── */}
                                <Box
                                    sx={{
                                        border: "1px solid",
                                        borderColor: REF.lineStrong,
                                        borderRadius: 1.5,
                                        overflow: "hidden",
                                        mb: 2.5,
                                        boxShadow: "0 2px 8px rgba(31,64,104,.08)",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            px: 1.75,
                                            py: 1.25,
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <ReceiptLongOutlinedIcon sx={{ fontSize: 18, color: REF.primaryDark }} />
                                            <Typography fontWeight={700} color={REF.primaryDark} fontSize={14}>
                                                รายการค่ารักษาที่เลือกแล้ว
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                                            {filledItems.length} รายการ
                                        </Typography>
                                    </Box>

                                    <TableContainer>
                                        <Table size="small" sx={{ minWidth: 760 }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ ...headCell, width: "32%" }}>
                                                        รายการค่ารักษา
                                                    </TableCell>
                                                    <TableCell sx={{ ...headCell, width: "11%" }}>ยอดเบิก</TableCell>
                                                    <TableCell sx={{ ...headCell, width: "10%" }}>ส่วนลด</TableCell>
                                                    <TableCell sx={{ ...headCell, width: "12%" }}>
                                                        ยอดไม่คุ้มครอง
                                                    </TableCell>
                                                    <TableCell sx={{ ...headCell, width: "16%" }}>
                                                        สาเหตุไม่คุ้มครอง
                                                    </TableCell>
                                                    <TableCell sx={{ ...headCell, width: "14%" }}>หมายเหตุ</TableCell>
                                                    <TableCell sx={{ ...headCell, width: 36 }} />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {isFrequentLoading ? (
                                                    Array.from({ length: 2 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell sx={bodyCell}>
                                                                <Skeleton variant="text" width="60%" />
                                                            </TableCell>
                                                            {[...Array(5)].map((_, j) => (
                                                                <TableCell key={j} sx={{ ...bodyCell, p: 0.5 }}>
                                                                    <Skeleton variant="rounded" height={32} />
                                                                </TableCell>
                                                            ))}
                                                            <TableCell sx={{ ...bodyCell, p: 0.5 }} />
                                                        </TableRow>
                                                    ))
                                                ) : filledItems.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            sx={{ textAlign: "center", py: 2, color: "text.disabled" }}
                                                        >
                                                            ไม่พบรายการ
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filledItems.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell sx={bodyCell}>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {item.code} {item.description}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={tableInputSx}
                                                                    value={item.claimAmount ?? ""}
                                                                    onChange={(e) =>
                                                                        handleUpdateItem({
                                                                            ...item,
                                                                            claimAmount: Number(e.target.value || 0),
                                                                        })
                                                                    }
                                                                    type="number"
                                                                    inputProps={{ min: 0 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={tableInputSx}
                                                                    value={item.discount ?? ""}
                                                                    onChange={(e) =>
                                                                        handleUpdateItem({
                                                                            ...item,
                                                                            discount: Number(e.target.value || 0),
                                                                        })
                                                                    }
                                                                    type="number"
                                                                    error={
                                                                        Number(item.discount ?? 0) >
                                                                        Number(item.claimAmount ?? 0)
                                                                    }
                                                                    helperText={
                                                                        Number(item.discount ?? 0) >
                                                                        Number(item.claimAmount ?? 0)
                                                                            ? "ส่วนลดต้องไม่มากกว่ายอดเบิก"
                                                                            : ""
                                                                    }
                                                                    inputProps={{ min: 0 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={tableInputSx}
                                                                    value={item.notCovered ?? ""}
                                                                    onChange={(e) =>
                                                                        handleUpdateItem({
                                                                            ...item,
                                                                            notCovered: Number(e.target.value || 0),
                                                                        })
                                                                    }
                                                                    type="number"
                                                                    error={
                                                                        Number(item.discount ?? 0) <=
                                                                            Number(item.claimAmount ?? 0) &&
                                                                        Number(item.notCovered ?? 0) >
                                                                            Number(item.claimAmount ?? 0) -
                                                                                Number(item.discount ?? 0)
                                                                    }
                                                                    inputProps={{ min: 0 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                <Select
                                                                    size="small"
                                                                    fullWidth
                                                                    displayEmpty
                                                                    sx={tableSelectSx}
                                                                    value={item.reason}
                                                                    onChange={(e) =>
                                                                        handleUpdateItem({
                                                                            ...item,
                                                                            reason: e.target.value,
                                                                        })
                                                                    }
                                                                >
                                                                    <MenuItem value="">
                                                                        <em>-</em>
                                                                    </MenuItem>
                                                                    {notCoveredReasonOptions.map((o) => (
                                                                        <MenuItem
                                                                            key={o.value}
                                                                            value={o.value}
                                                                            sx={{ fontSize: 13 }}
                                                                        >
                                                                            {o.label}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    sx={tableInputSx}
                                                                    value={item.remark}
                                                                    onChange={(e) =>
                                                                        handleUpdateItem({
                                                                            ...item,
                                                                            remark: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ ...bodyCell, textAlign: "center", p: 0.5 }}
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: "#fff1f0",
                                                                        color: "#d92d20",
                                                                        borderRadius: 1.5,
                                                                    }}
                                                                    onClick={() => handleRemoveItem(item.id as number)}
                                                                >
                                                                    <RemoveCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>

                                {/* ── รายการค่ารักษาเพิ่มเติม (แสดงตลอด ไม่ต้องเปิด/ปิด) ── */}
                                <Box
                                    sx={{
                                        border: "1px solid",
                                        borderColor: REF.lineStrong,
                                        borderRadius: 1.5,
                                        p: 1.75,
                                        boxShadow: "0 2px 8px rgba(31,64,104,.08)",
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        gap={2}
                                        mb={1.5}
                                        flexWrap="wrap"
                                    >
                                        <Box>
                                            <Typography fontWeight={700} color={REF.primaryDark} fontSize={15}>
                                                รายการค่ารักษาเพิ่มเติม
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                กรณีไม่มีในรายการที่ใช้บ่อย กรุณาเลือกหมวดและเพิ่มรายการลงในตาราง
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant={showAddPanel ? "outlined" : "contained"}
                                            size="small"
                                            startIcon={showAddPanel ? <RemoveCircleIcon /> : <AddCircleOutlineIcon />}
                                            onClick={() => setShowAddPanel(!showAddPanel)}
                                            sx={{ borderRadius: 1, fontWeight: 600, whiteSpace: "nowrap" }}
                                        >
                                            {showAddPanel ? "ซ่อน" : "เพิ่มรายการค่ารักษา"}
                                        </Button>
                                    </Box>

                                    <Collapse in={showAddPanel}>
                                        <Grid container spacing={2}>
                                            {/* ── ฝั่งซ้าย: ค้นหา + tree หมวด ── */}
                                            <Grid item xs={12} sm={7}>
                                                <Box
                                                    sx={{
                                                        border: "1px solid",
                                                        borderColor: REF.lineStrong,
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            p: 1.5,
                                                            borderBottom: "1px solid",
                                                            borderColor: "divider",
                                                        }}
                                                    >
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            placeholder="ค้นหารายการค่ารักษา เช่น ยา , ค่าแพทย์ , ค่าห้อง"
                                                            value={searchText}
                                                            onChange={(e) => setSearchText(e.target.value)}
                                                            sx={refInputSx}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        {isCategoryLoading ? (
                                                                            <CircularProgress
                                                                                size={18}
                                                                                color="inherit"
                                                                            />
                                                                        ) : (
                                                                            <SearchIcon
                                                                                sx={{
                                                                                    fontSize: 20,
                                                                                    color: REF.primary,
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
                                                        {filteredCategories.map((cat) => (
                                                            <Box key={cat.id}>
                                                                <Box
                                                                    onClick={() => handleToggleExpand(cat.id)}
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        px: 1.5,
                                                                        py: 1,
                                                                        cursor: "pointer",
                                                                        borderBottom: "1px solid",
                                                                        borderColor: "divider",
                                                                        bgcolor: expandedIds.includes(cat.id)
                                                                            ? REF.soft
                                                                            : "white",
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            mr: 1,
                                                                            color: REF.primaryDark,
                                                                            bgcolor: REF.soft,
                                                                            width: 26,
                                                                            height: 26,
                                                                            borderRadius: 1,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        {CATEGORY_ICON_MAP[cat.label] ?? (
                                                                            <MiscellaneousServicesOutlinedIcon
                                                                                sx={{ fontSize: 16 }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight={700}
                                                                        color={REF.primaryDark}
                                                                        sx={{ flex: 1 }}
                                                                    >
                                                                        หมวด : {cat.label}
                                                                    </Typography>
                                                                    {expandedIds.includes(cat.id) ? (
                                                                        <ExpandLessIcon
                                                                            sx={{
                                                                                fontSize: 18,
                                                                                color: REF.primaryDark,
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <ExpandMoreIcon
                                                                            sx={{
                                                                                fontSize: 18,
                                                                                color: REF.primaryDark,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                                <Collapse in={expandedIds.includes(cat.id)}>
                                                                    <Box sx={{ bgcolor: "grey.50" }}>
                                                                        {cat.children.map((child) => (
                                                                            <TreeNodeRow
                                                                                key={child.id}
                                                                                node={child}
                                                                                depth={0}
                                                                                expandedIds={expandedIds}
                                                                                onToggle={handleToggleExpand}
                                                                                onSelectLeaf={handleSelectLeaf}
                                                                                selectedLeafId={selectedLeafId}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Collapse>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            {/* ── ฝั่งขวา: ฟอร์มเพิ่มรายการ (เรียงแนวตั้ง ตาม reference) ── */}
                                            <Grid item xs={12} sm={5}>
                                                <Box
                                                    sx={{
                                                        border: "1px solid",
                                                        borderColor: REF.lineStrong,
                                                        borderRadius: 1,
                                                        bgcolor: "#f8fbff",
                                                        p: 1.75,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 1.25,
                                                        height: "100%",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        fontWeight={600}
                                                    >
                                                        รายการค่ารักษาที่เลือก
                                                    </Typography>

                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={
                                                            selectedItem
                                                                ? `${selectedItem.code} ${selectedItem.description}`
                                                                : ""
                                                        }
                                                        placeholder="รายการค่ารักษาที่เลือก"
                                                        InputProps={{ readOnly: true }}
                                                        sx={refInputSx}
                                                    />

                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        type="number"
                                                        placeholder="ยอดเบิก"
                                                        value={pendingAmount}
                                                        onChange={(e) => setPendingAmount(e.target.value)}
                                                        disabled={!selectedItem}
                                                        sx={refInputSx}
                                                        inputProps={{ min: 0 }}
                                                    />

                                                    <Box display="flex" gap={1.25}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            type="number"
                                                            placeholder="ส่วนลด"
                                                            value={pendingDiscount}
                                                            onChange={(e) => setPendingDiscount(e.target.value)}
                                                            disabled={!selectedItem}
                                                            error={!!discountError}
                                                            helperText={discountError}
                                                            sx={refInputSx}
                                                            inputProps={{ min: 0 }}
                                                        />
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            type="number"
                                                            placeholder="ยอดไม่คุ้มครอง"
                                                            value={pendingNotCovered}
                                                            onChange={(e) => setPendingNotCovered(e.target.value)}
                                                            disabled={!selectedItem}
                                                            error={!!notCoveredError}
                                                            helperText={notCoveredError}
                                                            sx={refInputSx}
                                                            inputProps={{ min: 0 }}
                                                        />
                                                    </Box>

                                                    <Select
                                                        size="small"
                                                        fullWidth
                                                        displayEmpty
                                                        value={pendingReason}
                                                        onChange={(e) => setPendingReason(e.target.value)}
                                                        disabled={!selectedItem}
                                                        sx={tableSelectSx}
                                                    >
                                                        <MenuItem value="">
                                                            <em>สาเหตุไม่คุ้มครอง</em>
                                                        </MenuItem>
                                                        {notCoveredReasonOptions.map((o) => (
                                                            <MenuItem key={o.value} value={o.value}>
                                                                {o.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>

                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        multiline
                                                        minRows={2}
                                                        placeholder="หมายเหตุ"
                                                        disabled={!selectedItem}
                                                        sx={refInputSx}
                                                    />

                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<AddBoxOutlinedIcon />}
                                                        onClick={handleAddToTable}
                                                        disabled={
                                                            !selectedItem ||
                                                            !pendingAmount ||
                                                            !!discountError ||
                                                            !!notCoveredError
                                                        }
                                                        sx={{ borderRadius: 1.5, fontWeight: 700, mt: "auto" }}
                                                    >
                                                        เพิ่มลงในตาราง
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* ══ RIGHT col: สรุปยอดเงิน ══ */}
                    <Grid item xs={12} md={3.5}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                position: { md: "sticky" },
                                top: { md: 16 },
                                overflow: "hidden",
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: "primary.50",
                                    px: 2,
                                    py: 1.5,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <AttachMoneyIcon color="primary" />
                                <Typography fontWeight={700} color="primary.main">
                                    สรุปยอดเงิน
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={0}>
                                    {[
                                        { label: "ยอดเบิกรวม", value: fmt(totalClaim) },
                                        { label: "ส่วนลดรวม", value: fmt(totalDiscount) },
                                        { label: "ยอดไม่คุ้มครองรวม", value: fmt(totalNotCovered) },
                                    ].map((row, i, arr) => (
                                        <Box key={row.label}>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                py={1}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    {row.label} :
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={
                                                        row.label === "ยอดไม่คุ้มครองรวม"
                                                            ? "error.main"
                                                            : "text.primary"
                                                    }
                                                >
                                                    {row.value}
                                                </Typography>
                                            </Box>
                                            {i < arr.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                </Stack>

                                <Divider sx={{ my: 1.5 }} />

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: "success.50",
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "success.200",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        ยอดเงินสุทธิ
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="h5" fontWeight={800} color="success.main" lineHeight={1}>
                                            {fmt(netAmount)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            บาท
                                        </Typography>
                                    </Box>
                                </Paper>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    endIcon={
                                        isCalculating ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : (
                                            <ArrowForwardIcon />
                                        )
                                    }
                                    onClick={handleNext}
                                    fullWidth
                                    disabled={!hasAnyAmount || hasDiscountError || hasNotCoveredError || isCalculating}
                                    sx={{ mt: 2, borderRadius: 2, fontWeight: 700, boxShadow: 2 }}
                                >
                                    {isCalculating ? "กำลังคำนวณ..." : "ถัดไป"}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <InsuredSearchModal />
                <ConfirmCalaulateModal open={openConfirm} onClose={handleCloseConfirm} onConfirm={handleConfirm} />
            </Box>
        </LocalizationProvider>
    );
};

export default ClaimSimulate;


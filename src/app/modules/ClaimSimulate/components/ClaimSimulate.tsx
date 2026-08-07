import React, { useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
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
    Tooltip,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import HealingIcon from "@mui/icons-material/Healing";

import FormikDateTimePicker from "../../_common/components/CustomFormik/FormikDateTimePicker";
import FormikDatePicker from "../../_common/components/CustomFormik/FormikDatePicker";
import { FormikDropdown } from "../../_common";

import { useClaimSimulatePage } from "../hooks/useClaimSimulatePage";
import { sanitizeDecimalInput, toAmount, toInteger, hasAmountSumError } from "../store/Claimsimulateutils";
import InsuredSearchModal from "./InsuredSearchModal";
import ConfirmCalaulateModal from "./ConfirmCalaulateModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDateString } from "../../../functionHelpers";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useGetDataFromApi } from "../hooks/useGetDataFromApi";
import { CATEGORY_ICON_MAP } from "./CategoryIcon";

const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#eaf5ff",
    line: "#dce8f4",
    lineStrong: "#c4d7ea",
    muted: "#718096",
    text: "#243447",
    success: "#15803d",
    successSoft: "#f0f8f1",
    successLine: "#d1e9d6",
};

const FORM_FIELD_HEIGHT = 40;

const refInputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: "#fff",
        fontSize: 15,
        height: FORM_FIELD_HEIGHT,
        "& fieldset": { borderColor: REF.lineStrong },
        "&:hover fieldset": { borderColor: REF.primary },
        "&.Mui-focused fieldset": { borderColor: REF.primary, borderWidth: 1.5 },
    },
};

const refTextAreaSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: "#fff",
        fontSize: 15,
        "& fieldset": { borderColor: REF.lineStrong },
        "&:hover fieldset": { borderColor: REF.primary },
        "&.Mui-focused fieldset": { borderColor: REF.primary, borderWidth: 1.5 },
    },
};

const formSelectSx = {
    height: FORM_FIELD_HEIGHT,
    fontSize: 13,
    borderRadius: "8px",
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: REF.lineStrong },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: REF.primary },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: REF.primary, borderWidth: 1.5 },
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

const causeIconMap: Record<number, React.ReactNode> = {
    2: <HealingIcon sx={{ fontSize: 25, color: "primary.main" }} />,
    3: <WarningAmberIcon sx={{ fontSize: 25, color: "primary.main" }} />,
};

interface TreeNode {
    id: number;
    label: string;
    code?: string;
    standardMedicalExpenseId?: number;
    bodyPartId?: number;
    maximumLimit?: number;
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

const StepBadge: React.FC<{ n: number }> = ({ n }) => (
    <Box
        sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: REF.primary,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
        }}
    >
        {n}
    </Box>
);

const claimStepBoxSx = {
    border: "1px solid",
    borderColor: REF.line,
    borderRadius: 2,
    p: 2,
    mb: 2,
    bgcolor: "#fff",
};

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
    onSelectLeaf: (
        code: string,
        description: string,
        id: number,
        standardMedicalExpenseId?: number,
        bodyPartId?: number,
        maximumLimit?: number
    ) => void;
    selectedLeafId: number | null;
}) => {
    const isExpanded = expandedIds.includes(node.id);
    const hasChildren = node.children.length > 0;
    const match = node.label.match(/^([\d.]+)\s+(.+)$/);
    const code = match?.[1] ?? "";
    const description = match?.[2] ?? node.label;
    const isLeaf = !hasChildren;
    const isSelected = isLeaf && selectedLeafId === node.id;

    // ติ๊กเลือกได้เฉพาะ item ที่มี inputItemCode เท่านั้น
    const isSelectable = isLeaf && !!node.code;

    return (
        <>
            <Box
                onClick={() => {
                    if (hasChildren) {
                        onToggle(node.id);
                        return;
                    }
                    if (!isSelectable) return;
                    onSelectLeaf(
                        code,
                        description,
                        node.id,
                        node.standardMedicalExpenseId,
                        node.bodyPartId,
                        node.maximumLimit
                    );
                }}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pl: 1.5 + depth * 2,
                    pr: 1.5,
                    py: 0.8,
                    cursor: hasChildren || isSelectable ? "pointer" : "not-allowed",
                    mx: 0.5,
                    borderRadius: 1,
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    "&:hover": { bgcolor: hasChildren ? "grey.100" : isSelectable ? "primary.50" : "transparent" },
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
                ) : isSelectable ? (
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
                ) : (
                    <Box sx={{ mr: 0.75, display: "flex", color: "primary.main" }}>
                        <ChevronRightIcon sx={{ fontSize: 16 }} />
                    </Box>
                )}
                <Typography
                    variant="body2"
                    fontWeight={!isLeaf ? 600 : isSelectable && isSelected ? 600 : 400}
                    color="primary.main"
                >
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

const errorTooltipProps = {
    arrow: true,
    placement: "top" as const,
    slotProps: {
        tooltip: {
            sx: {
                bgcolor: "#fff",
                color: "#d32f2f",
                border: "1px solid #d32f2f",
                borderRadius: 1,
                boxShadow: "0 4px 12px rgba(0,0,0,.12)",
                fontSize: 12,
                fontWeight: 500,
                px: 1,
                py: 0.75,
            },
        },
        arrow: {
            sx: {
                color: "#fff",
                "&::before": {
                    border: "1px solid #d32f2f",
                    boxSizing: "border-box",
                },
            },
        },
    },
};

// ─── Main ─────────────────────────────────────────────────────────
interface ClaimSimulateProps {
    onNext?: () => void;
}

const ClaimSimulate: React.FC<ClaimSimulateProps> = ({ onNext }) => {
    const {
        // insured + header
        selectedInsured,
        header,
        claimCauseOptions,
        coverageTypeOptions,
        medicalTypeOptions,
        formatTypeOptions,
        causeOfIncidentOptions,
        isMedicalTypeVisible,
        isCauseOfIncidentVisible,
        isCauseOfIncidentLocked,
        isFormatTypeLocked,
        isMedicalTypeLocked,
        noClaimCauseMessage,
        noCoverageTypeMessage,
        handleOpenInsuredSearch,
        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
        handleSelectCauseOfIncident,
        handleSelectFormatType,
        // days
        formik,
        openConfirm,
        handleIpdDaysChange,
        handleIcuDaysChange,
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
        isNonCoveredReasonLoading,
        filteredCategories,
        isCategoryLoading,
        isFrequentLoading,
        discountError,
        notCoveredError,
        reasonError,
        hasDiscountError,
        hasNotCoveredError,
        // hasReasonError,
        hasAnyAmount,
        handleNext,
        isHeaderReady,
        validateHeaderAndFlagErrors,
    } = useClaimSimulatePage(onNext);

    const { claimContinueOptions, claimContinueLoading } = useGetDataFromApi(selectedInsured?.policyCode);

    const isAddPanelDisabled = isCategoryLoading || !isHeaderReady;

    useEffect(() => {
        if (isAddPanelDisabled) setShowAddPanel(false);
    }, [isAddPanelDisabled]);

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
                        icon={<PeopleAltOutlinedIcon sx={{ fontSize: 24, color: "primary.main" }} />}
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
                                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                        AppID : <b>{selectedInsured.policyCode}</b>
                                    </Typography>

                                    {selectedInsured.productName && (
                                        <Chip
                                            label={`แผน : ${selectedInsured.productName}`}
                                            size="small"
                                            color="primary"
                                            sx={{ height: 22 }}
                                        />
                                    )}
                                </Stack>

                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                    {selectedInsured.customerName}
                                </Typography>

                                <Stack direction="row" spacing={4} mt={0.5} flexWrap="wrap">
                                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                        ผลิตภัณฑ์ : <b>{selectedInsured.productTypeName || "-"}</b>
                                    </Typography>

                                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                        วันที่เริ่มคุ้มครอง :{" "}
                                        <b>
                                            {" "}
                                            {selectedInsured.coverageFrom
                                                ? formatDateString(
                                                      selectedInsured.coverageFrom.toString(),
                                                      "DD/MM/BBBB"
                                                  )
                                                : "-"}
                                        </b>
                                    </Typography>

                                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                        วันสิ้นสุด :{" "}
                                        <b>
                                            {selectedInsured.coverageTo
                                                ? formatDateString(selectedInsured.coverageTo.toString(), "DD/MM/BBBB")
                                                : "-"}
                                        </b>
                                    </Typography>
                                </Stack>
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
                        icon={<DescriptionOutlinedIcon sx={{ fontSize: 24, color: "primary.main" }} />}
                        title="รายละเอียดเคลม"
                        subtitle="ระบุเหตุของการเคลม ประเภทความคุ้มครอง และวันที่รักษา"
                    />

                    {!selectedInsured ? (
                        <Typography variant="body2" color="text.disabled">
                            ยังไม่ได้ค้นหาผู้เอาประกัน กรุณาค้นหาและเลือกผู้เอาประกันด้านบนก่อนระบุรายละเอียดเคลม
                        </Typography>
                    ) : (
                        <>
                            {/* 1) เหตุของการเคลม */}
                            <Box sx={claimStepBoxSx}>
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <StepBadge n={1} />
                                    <Typography variant="body2" fontWeight={700}>
                                        เหตุของการเคลม{" "}
                                        <Box component="span" color="error.main">
                                            *
                                        </Box>
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={1.25} flexWrap="wrap">
                                    {claimCauseOptions.map((opt) => {
                                        const isSelected = header.claimCause === opt.value;
                                        return (
                                            <Box
                                                key={opt.value}
                                                onClick={() => handleSelectClaimCause(opt.value)}
                                                role="button"
                                                tabIndex={0}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 0.75,
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                    // minWidth: 128,
                                                    border: "1px solid",
                                                    borderColor: isSelected ? REF.primary : REF.line,
                                                    borderRadius: "10px",
                                                    px: 2.25,
                                                    py: 1.1,
                                                    bgcolor: isSelected ? REF.soft : "#fff",
                                                    transition: "all .15s ease",
                                                    "&:hover": {
                                                        borderColor: REF.primary,
                                                        bgcolor: REF.soft,
                                                    },
                                                }}
                                            >
                                                <Box
                                                    display="flex"
                                                    sx={{
                                                        "& svg": {
                                                            fontSize: 18,
                                                            color: isSelected ? REF.primary : "text.secondary",
                                                        },
                                                    }}
                                                >
                                                    {causeIconMap[opt.value]}
                                                </Box>
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
                                    {!!selectedInsured && !header.claimCause && (
                                        <Typography
                                            variant="caption"
                                            color="error.main"
                                            sx={{ mt: 1, display: "block" }}
                                        >
                                            กรุณาเลือกเหตุของการเคลม
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* 2) ประเภทความคุ้มครอง */}
                            <Box sx={claimStepBoxSx}>
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <StepBadge n={2} />
                                    <Typography variant="body2" fontWeight={700}>
                                        ประเภทความคุ้มครอง{" "}
                                        <Box component="span" color="error.main">
                                            *
                                        </Box>
                                    </Typography>
                                </Box>
                                {!header.claimCause ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {noClaimCauseMessage}
                                    </Typography>
                                ) : (
                                    <Box display="flex" gap={1.25} flexWrap="wrap">
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
                                                        // minWidth: 128,
                                                        border: "1px solid",
                                                        borderColor: isSelected ? REF.primary : REF.line,
                                                        borderRadius: "10px",
                                                        px: 2.25,
                                                        py: 1.1,
                                                        bgcolor: isSelected ? REF.soft : "#fff",
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
                                )}
                                {!!header.claimCause && !header.coverageType && (
                                    <Typography
                                        variant="caption"
                                        color="error.main"
                                        sx={{ mt: 1, ml: 1, display: "block" }}
                                    >
                                        กรุณาเลือกประเภทความคุ้มครอง
                                    </Typography>
                                )}
                            </Box>

                            {/* 3) ประเภทรายการค่าใช้จ่าย */}
                            {!!header.coverageType && (
                                <Box sx={claimStepBoxSx}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <StepBadge n={3} />
                                        <Typography variant="body2" fontWeight={700}>
                                            ประเภทรายการค่าใช้จ่าย
                                        </Typography>
                                        <Box component="span" color="error.main">
                                            *
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={1.25} flexWrap="wrap">
                                        {formatTypeOptions.map((opt) => {
                                            const isSelected = header.formatTypeId === opt.value;
                                            return (
                                                <Box
                                                    key={opt.value}
                                                    onClick={() =>
                                                        !isFormatTypeLocked && handleSelectFormatType(opt.value)
                                                    }
                                                    role="button"
                                                    tabIndex={isFormatTypeLocked ? -1 : 0}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 0.75,
                                                        cursor: isFormatTypeLocked ? "default" : "pointer",
                                                        userSelect: "none",
                                                        // minWidth: 128,
                                                        border: "1px solid",
                                                        borderColor: isSelected ? REF.primary : REF.line,
                                                        borderRadius: "10px",
                                                        px: 2.25,
                                                        py: 1.1,
                                                        bgcolor: isSelected ? REF.soft : "#fff",
                                                        opacity: isFormatTypeLocked ? 0.85 : 1,
                                                        transition: "all .15s ease",
                                                        "&:hover": isFormatTypeLocked
                                                            ? undefined
                                                            : {
                                                                  borderColor: REF.primary,
                                                                  bgcolor: REF.soft,
                                                              },
                                                    }}
                                                >
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
                                    {!header.formatTypeId && (
                                        <Typography
                                            variant="caption"
                                            color="error.main"
                                            sx={{ mt: 1, ml: 1, display: "block" }}
                                        >
                                            กรุณาเลือกประเภทรายการค่าใช้จ่าย
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* 4) ประเภทการรักษา / สาเหตุของการเกิดเหตุ */}
                            <Box sx={claimStepBoxSx}>
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <StepBadge n={4} />
                                    <Typography variant="body2" fontWeight={700}>
                                        {isCauseOfIncidentVisible ? "สาเหตุของการเกิดเหตุ" : "ประเภทการรักษา"}{" "}
                                        <Box component="span" color="error.main">
                                            *
                                        </Box>
                                    </Typography>
                                </Box>
                                {!header.coverageType ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {noCoverageTypeMessage}
                                    </Typography>
                                ) : isMedicalTypeVisible ? (
                                    <Box display="flex" gap={1.25} flexWrap="wrap">
                                        {medicalTypeOptions.map((opt) => {
                                            const isSelected = header.medicalType === opt.value;
                                            return (
                                                <Box
                                                    key={opt.value}
                                                    onClick={() =>
                                                        !isMedicalTypeLocked && handleSelectMedicalType(opt.value)
                                                    }
                                                    role="button"
                                                    tabIndex={isMedicalTypeLocked ? -1 : 0}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: isMedicalTypeLocked ? "default" : "pointer",
                                                        userSelect: "none",
                                                        // minWidth: 128,
                                                        border: "1px solid",
                                                        borderColor: isSelected ? REF.primary : REF.line,
                                                        borderRadius: "10px",
                                                        px: 2,
                                                        py: 1,
                                                        bgcolor: isSelected ? REF.soft : "#fff",
                                                        opacity: isMedicalTypeLocked ? 0.85 : 1,
                                                        transition: "all .15s ease",
                                                        "&:hover": isMedicalTypeLocked
                                                            ? undefined
                                                            : {
                                                                  borderColor: REF.primary,
                                                                  bgcolor: REF.soft,
                                                              },
                                                    }}
                                                >
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
                                ) : isCauseOfIncidentVisible ? (
                                    <Box display="flex" gap={1.25} flexWrap="wrap">
                                        {causeOfIncidentOptions.map((opt) => {
                                            const isSelected = header.causeOfIncident === opt.value;
                                            return (
                                                <Box
                                                    key={opt.value}
                                                    onClick={() =>
                                                        !isCauseOfIncidentLocked &&
                                                        handleSelectCauseOfIncident(opt.value)
                                                    }
                                                    role="button"
                                                    tabIndex={isCauseOfIncidentLocked ? -1 : 0}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: isCauseOfIncidentLocked ? "default" : "pointer",
                                                        userSelect: "none",
                                                        // minWidth: 128,
                                                        border: "1px solid",
                                                        borderColor: isSelected ? REF.primary : REF.line,
                                                        borderRadius: "10px",
                                                        px: 2,
                                                        py: 1,
                                                        bgcolor: isSelected ? REF.soft : "#fff",
                                                        opacity: isCauseOfIncidentLocked ? 0.7 : 1,
                                                        transition: "all .15s ease",
                                                        "&:hover": isCauseOfIncidentLocked
                                                            ? undefined
                                                            : {
                                                                  borderColor: REF.primary,
                                                                  bgcolor: REF.soft,
                                                              },
                                                    }}
                                                >
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
                                ) : null}
                                {!!header.coverageType && isMedicalTypeVisible && !header.medicalType && (
                                    <Typography
                                        variant="caption"
                                        color="error.main"
                                        sx={{ mt: 1, ml: 1, display: "block" }}
                                    >
                                        กรุณาเลือกประเภทการรักษา
                                    </Typography>
                                )}
                                {!!header.coverageType && isCauseOfIncidentVisible && !header.causeOfIncident && (
                                    <Typography
                                        variant="caption"
                                        color="error.main"
                                        sx={{ mt: 1, ml: 1, display: "block" }}
                                    >
                                        กรุณาเลือกสาเหตุของการเกิดเหตุ
                                    </Typography>
                                )}
                            </Box>

                            {/* 5) วันที่ */}
                            <Box sx={claimStepBoxSx}>
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <StepBadge n={5} />
                                    <Typography variant="body2" fontWeight={700}>
                                        วันที่รักษา{" "}
                                        <Box component="span" color="error.main">
                                            *
                                        </Box>
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
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
                                <Grid container spacing={2} mt={2} mb={1}>
                                    <Grid item xs={12} sm={4}>
                                        <DaySummaryCard
                                            label="วัน IPD"
                                            value={formik.values.ipdDays || 0}
                                            color="primary"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <DaySummaryCard
                                            label="วัน ICU"
                                            value={formik.values.icuDays || 0}
                                            color="error"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <DaySummaryCard
                                            label="วันที่นอน"
                                            value={formik.values.bedDays || 0}
                                            color="success"
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="จำนวนวัน IPD"
                                            size="small"
                                            fullWidth
                                            type="number"
                                            value={formik.values.ipdDays}
                                            onChange={(e) => handleIpdDaysChange(toInteger(e.target.value))}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.ipdDays && !!formik.errors.ipdDays}
                                            helperText={formik.touched.ipdDays ? formik.errors.ipdDays : ""}
                                            inputProps={{ min: 0 }}
                                            sx={refInputSx}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="จำนวนวัน ICU"
                                            size="small"
                                            fullWidth
                                            type="number"
                                            value={formik.values.icuDays}
                                            onChange={(e) => handleIcuDaysChange(toInteger(e.target.value))}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.icuDays && !!formik.errors.icuDays}
                                            helperText={formik.touched.icuDays ? formik.errors.icuDays : ""}
                                            inputProps={{ min: 0 }}
                                            sx={refInputSx}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="จำนวนวันนอน"
                                            size="small"
                                            fullWidth
                                            type="number"
                                            value={formik.values.bedDays}
                                            onChange={(e) => handleIcuDaysChange(toInteger(e.target.value))}
                                            inputProps={{ min: 0 }}
                                            disabled
                                            sx={refInputSx}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* เคลมต่อเนื่อง */}
                            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                                <SectionTitle
                                    icon={<HistoryOutlinedIcon sx={{ fontSize: 24, color: "primary.main" }} />}
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
                                    <Grid item xs sm={7}>
                                        <FormikDropdown
                                            name="continuousFromClaimNo"
                                            label="เลือก ClaimNo"
                                            formik={formik}
                                            data={claimContinueOptions}
                                            isLoading={claimContinueLoading}
                                            firstItemText="-- เลือก --"
                                            displayFieldName="label"
                                            valueFieldName="claimId"
                                            fullWidth
                                            size="small"
                                            disabled={!formik.values.isContinuous}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}
                </Paper>

                {/* ── 3) รายการค่าใช้จ่าย + สรุปยอดเงิน (ซ่อนตอนเลือกอวัยวะที่สูญเสีย) ── */}
                {!selectedInsured ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="body2" color="text.disabled">
                            ยังไม่ได้ค้นหาผู้เอาประกัน กรุณาค้นหาและเลือกผู้เอาประกันด้านบนก่อนระบุรายการค่าใช้จ่าย
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={9}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                }}
                            >
                                <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
                                    <SectionTitle
                                        icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 24, color: "primary.main" }} />}
                                        title="รายการค่าใช้จ่าย"
                                        subtitle="ระบุรายละเอียดค่ารักษา แล้วระบบคำนวณยอดรวมให้อัตโนมัติ"
                                    />
                                </Box>
                                <Divider />

                                <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
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
                                                <PostAddOutlinedIcon sx={{ fontSize: 20, color: REF.primaryDark }} />
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
                                                        <TableCell sx={{ ...headCell, width: "11%" }}>
                                                            ยอดเบิก
                                                        </TableCell>
                                                        <TableCell sx={{ ...headCell, width: "11%" }}>ส่วนลด</TableCell>
                                                        <TableCell sx={{ ...headCell, width: "11%" }}>
                                                            ยอดไม่คุ้มครอง
                                                        </TableCell>
                                                        <TableCell sx={{ ...headCell, width: "15%" }}>
                                                            สาเหตุไม่คุ้มครอง
                                                        </TableCell>
                                                        <TableCell sx={{ ...headCell, width: "15%" }}>
                                                            หมายเหตุ
                                                        </TableCell>
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
                                                                sx={{
                                                                    textAlign: "center",
                                                                    py: 2,
                                                                    color: "text.disabled",
                                                                }}
                                                            >
                                                                ไม่พบรายการ
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filledItems.map((item) => {
                                                            const discountError =
                                                                Number(item.discount ?? 0) >
                                                                Number(item.claimAmount ?? 0);

                                                            const rowSumError = hasAmountSumError(item);
                                                            // const rowReasonError = hasMissingReasonError(item);

                                                            return (
                                                                <TableRow key={item.id}>
                                                                    <TableCell sx={bodyCell}>
                                                                        <Typography variant="body2" fontWeight={500}>
                                                                            {item.code} {item.description}
                                                                        </Typography>
                                                                    </TableCell>

                                                                    {/* Claim Amount */}
                                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                        <TextField
                                                                            size="small"
                                                                            fullWidth
                                                                            sx={tableInputSx}
                                                                            value={item.claimAmount ?? ""}
                                                                            onChange={(e) =>
                                                                                handleUpdateItem({
                                                                                    ...item,
                                                                                    claimAmount: toAmount(
                                                                                        e.target.value
                                                                                    ),
                                                                                })
                                                                            }
                                                                            type="number"
                                                                            inputProps={{ min: 0 }}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Discount */}
                                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                        <Tooltip
                                                                            title="ส่วนลดต้องไม่มากกว่ายอดเบิก"
                                                                            disableHoverListener={!discountError}
                                                                            {...errorTooltipProps}
                                                                        >
                                                                            <TextField
                                                                                size="small"
                                                                                fullWidth
                                                                                sx={tableInputSx}
                                                                                value={item.discount ?? ""}
                                                                                onChange={(e) =>
                                                                                    handleUpdateItem({
                                                                                        ...item,
                                                                                        discount: toAmount(
                                                                                            e.target.value
                                                                                        ),
                                                                                    })
                                                                                }
                                                                                type="number"
                                                                                error={discountError}
                                                                                inputProps={{ min: 0 }}
                                                                            />
                                                                        </Tooltip>
                                                                    </TableCell>

                                                                    {/* Not Covered */}
                                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                        <Tooltip
                                                                            title="ยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิก"
                                                                            {...errorTooltipProps}
                                                                            disableHoverListener={!rowSumError}
                                                                        >
                                                                            <TextField
                                                                                size="small"
                                                                                fullWidth
                                                                                sx={tableInputSx}
                                                                                value={item.notCovered ?? ""}
                                                                                onChange={(e) =>
                                                                                    handleUpdateItem({
                                                                                        ...item,
                                                                                        notCovered: toAmount(
                                                                                            e.target.value
                                                                                        ),
                                                                                    })
                                                                                }
                                                                                type="number"
                                                                                error={rowSumError}
                                                                                inputProps={{ min: 0 }}
                                                                            />
                                                                        </Tooltip>
                                                                    </TableCell>

                                                                    {/* Reason */}
                                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                                        {/* <Tooltip
                                                                            title="กรุณาเลือกสาเหตุไม่คุ้มครอง"
                                                                            {...errorTooltipProps}
                                                                            disableHoverListener={!rowReasonError}
                                                                        > */}
                                                                        <FormControl
                                                                            fullWidth
                                                                            size="small"
                                                                            // error={rowReasonError}
                                                                        >
                                                                            <Select
                                                                                displayEmpty
                                                                                value={item.reason ?? ""}
                                                                                sx={tableSelectSx}
                                                                                onChange={(e) =>
                                                                                    handleUpdateItem({
                                                                                        ...item,
                                                                                        reason:
                                                                                            e.target.value === ""
                                                                                                ? undefined
                                                                                                : Number(
                                                                                                      e.target.value
                                                                                                  ),
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
                                                                                        sx={{
                                                                                            fontSize: 13,
                                                                                        }}
                                                                                    >
                                                                                        {o.label}
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                        {/* </Tooltip> */}
                                                                    </TableCell>

                                                                    {/* Remark */}
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

                                                                    {/* Delete */}
                                                                    <TableCell
                                                                        sx={{
                                                                            ...bodyCell,
                                                                            textAlign: "center",
                                                                            p: 0.5,
                                                                        }}
                                                                    >
                                                                        <IconButton
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: "#fff1f0",
                                                                                color: "#d92d20",
                                                                                borderRadius: 6,
                                                                            }}
                                                                            onClick={() =>
                                                                                handleRemoveItem(item.id as number)
                                                                            }
                                                                        >
                                                                            <FontAwesomeIcon
                                                                                icon={"trash-can"}
                                                                                fontSize={19}
                                                                            />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })
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
                                                startIcon={
                                                    isCategoryLoading ? (
                                                        <CircularProgress size={16} color="inherit" />
                                                    ) : showAddPanel ? (
                                                        <RemoveCircleIcon />
                                                    ) : (
                                                        <AddCircleOutlineIcon />
                                                    )
                                                }
                                                disabled={isAddPanelDisabled}
                                                onClick={() => {
                                                    if (isAddPanelDisabled) return;
                                                    setShowAddPanel(!showAddPanel);
                                                }}
                                                sx={{ borderRadius: 1, fontWeight: 600, whiteSpace: "nowrap" }}
                                            >
                                                {isCategoryLoading
                                                    ? "กำลังโหลด..."
                                                    : showAddPanel
                                                    ? "ซ่อน"
                                                    : "เพิ่มรายการค่ารักษา"}
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

                                                        <Box sx={{ maxHeight: 581, overflowY: "auto" }}>
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
                                                                                mr: 1.25,
                                                                                color: REF.primaryDark,
                                                                                bgcolor: REF.soft,
                                                                                width: 36,
                                                                                height: 36,
                                                                                borderRadius: "10px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                flexShrink: 0,
                                                                            }}
                                                                        >
                                                                            {CATEGORY_ICON_MAP[cat.id] ?? (
                                                                                <MiscellaneousServicesOutlinedIcon
                                                                                    sx={{ fontSize: 18 }}
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
                                                            height: "auto",
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
                                                            fullWidth
                                                            multiline
                                                            minRows={1}
                                                            maxRows={4}
                                                            value={
                                                                selectedItem
                                                                    ? `${selectedItem.code} ${selectedItem.description}`
                                                                    : ""
                                                            }
                                                            InputProps={{ readOnly: true }}
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": {
                                                                    borderRadius: "8px",
                                                                    backgroundColor: "#fff",
                                                                    minHeight: 40,
                                                                    fontSize: 13,
                                                                    "& fieldset": { borderColor: REF.lineStrong },
                                                                    "&:hover fieldset": {
                                                                        borderColor: REF.primary,
                                                                    },
                                                                    "&.Mui-focused fieldset": {
                                                                        borderColor: REF.primary,
                                                                        borderWidth: 1.5,
                                                                    },
                                                                },
                                                                "& .MuiInputBase-input": {
                                                                    color: "primary.main",
                                                                },
                                                            }}
                                                        />

                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            type="number"
                                                            label="ยอดเบิก"
                                                            value={pendingAmount}
                                                            onChange={(e) =>
                                                                setPendingAmount(sanitizeDecimalInput(e.target.value))
                                                            }
                                                            disabled={!selectedItem}
                                                            sx={refInputSx}
                                                            inputProps={{ min: 0 }}
                                                        />

                                                        <Box display="flex" gap={1.25}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                type="number"
                                                                label="ส่วนลด"
                                                                value={pendingDiscount}
                                                                onChange={(e) =>
                                                                    setPendingDiscount(
                                                                        sanitizeDecimalInput(e.target.value)
                                                                    )
                                                                }
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
                                                                label="ยอดไม่คุ้มครอง"
                                                                value={pendingNotCovered}
                                                                onChange={(e) =>
                                                                    setPendingNotCovered(
                                                                        sanitizeDecimalInput(e.target.value)
                                                                    )
                                                                }
                                                                disabled={!selectedItem}
                                                                error={!!notCoveredError}
                                                                helperText={notCoveredError}
                                                                sx={refInputSx}
                                                                inputProps={{ min: 0 }}
                                                            />
                                                        </Box>

                                                        <FormControl
                                                            fullWidth
                                                            size="small"
                                                            error={!!reasonError}
                                                            disabled={!selectedItem || isNonCoveredReasonLoading}
                                                        >
                                                            <InputLabel id="not-covered-reason-label">
                                                                สาเหตุไม่คุ้มครอง
                                                            </InputLabel>

                                                            <Select
                                                                labelId="not-covered-reason-label"
                                                                label="สาเหตุไม่คุ้มครอง"
                                                                value={pendingReason}
                                                                onChange={(e) =>
                                                                    setPendingReason(
                                                                        e.target.value === ""
                                                                            ? undefined
                                                                            : Number(e.target.value)
                                                                    )
                                                                }
                                                                sx={formSelectSx}
                                                            >
                                                                {notCoveredReasonOptions.map((o) => (
                                                                    <MenuItem key={o.value} value={o.value}>
                                                                        {o.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>

                                                        {reasonError && (
                                                            <Typography variant="caption" color="error">
                                                                {reasonError}
                                                            </Typography>
                                                        )}
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            multiline
                                                            minRows={2}
                                                            label="หมายเหตุ"
                                                            disabled={!selectedItem}
                                                            sx={refTextAreaSx}
                                                        />

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            startIcon={<AddBoxOutlinedIcon />}
                                                            onClick={handleAddToTable}
                                                            disabled={!selectedItem || !pendingAmount}
                                                            sx={{ borderRadius: 1.5, fontWeight: 700, mt: "auto" }}
                                                            size="medium"
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
                        <Grid item xs={12} md={3}>
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
                                        px: 2,
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: REF.soft,
                                    }}
                                >
                                    <DescriptionOutlinedIcon sx={{ fontSize: 24, color: "primary.main" }} />
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
                                            bgcolor: REF.successSoft,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: REF.successLine,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mt: 2,
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <AttachMoneyIcon color="success" />
                                            <Typography variant="body2" fontWeight={700} color="success.main">
                                                ยอดสุทธิผู้เอาประกัน
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography
                                                variant="h5"
                                                fontWeight={800}
                                                color="success.main"
                                                lineHeight={1}
                                            >
                                                {fmt(netAmount)}
                                            </Typography>
                                            {/* <Typography variant="body2" color="text.secondary">
                                            บาท
                                        </Typography> */}
                                        </Box>
                                    </Paper>

                                    {/* {(hasDiscountError || hasNotCoveredError || hasReasonError) && (
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ display: "block", mt: 1.5, textAlign: "center" }}
                                    >
                                        {hasReasonError
                                            ? "กรุณาเลือกสาเหตุไม่คุ้มครองให้ครบทุกรายการที่มียอดไม่คุ้มครอง"
                                            : "กรุณาตรวจสอบยอดส่วนลด/ไม่คุ้มครองให้ไม่เกินยอดเบิก"}
                                    </Typography>
                                )} */}

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() => {
                                            if (!validateHeaderAndFlagErrors()) return;
                                            handleNext();
                                        }}
                                        fullWidth
                                        disabled={
                                            !hasAnyAmount ||
                                            hasDiscountError ||
                                            hasNotCoveredError ||
                                            // hasReasonError ||
                                            !selectedInsured
                                        }
                                        sx={{ mt: 2, borderRadius: 1, fontWeight: 700, boxShadow: 2 }}
                                    >
                                        ถัดไป
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
                <InsuredSearchModal />
                <ConfirmCalaulateModal open={openConfirm} onClose={handleCloseConfirm} onConfirm={handleConfirm} />
            </Box>
        </LocalizationProvider>
    );
};

export default ClaimSimulate;

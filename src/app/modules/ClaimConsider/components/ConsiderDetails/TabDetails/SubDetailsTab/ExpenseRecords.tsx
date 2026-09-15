import React, { useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Collapse,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
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
import { NumericFormat } from "react-number-format";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";

import { CATEGORY_ICON_MAP } from "../../../../../ClaimSimulate/components/CategoryIcon";
import { hasAmountSumError, hasMissingReasonError } from "../../../../../ClaimSimulate/store/Claimsimulateutils";
import useClaimExpenseDetailHook from "../../../../hooks/ClaimConsiderDetail/ClaimExpenseDetailHook";

// ─── Reference styles ──────────────────────────────────────────────
const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#eaf5ff",
    line: "#e3e9f0",
    lineStrong: "#c4d7ea",
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
    "& .MuiOutlinedInput-input": {
        lineHeight: 1.8,
        py: 1,
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
    "& .MuiOutlinedInput-input": {
        padding: "4px 8px",
        textAlign: "center" as const,
        lineHeight: 1.5,
    },
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

interface TreeNode {
    /** id สำหรับใช้เป็น React key + expand/select state เท่านั้น — สร้างขึ้นให้ไม่ซ้ำกันเสมอ ไม่ใช่ id จาก backend */
    id: number;
    label: string;
    code?: string;
    standardMedicalExpenseId?: number;
    /** ไว้ผูกกับรายการที่เลือก (เฉพาะ leaf) — คนละตัวกับ `id` ที่ใช้ทำ React key */
    inputToStandardMappingId?: number;
    bodyPartId?: number;
    maximumLimit?: number;
    children: TreeNode[];
}

// ─── Recursive tree (รองรับ 3 ชั้น: หมวด → กลุ่มย่อย → รายการเลือกได้) ──────
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
        inputToStandardMappingId?: number,
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
                        node.inputToStandardMappingId,
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
                // unmountOnExit: ไม่งั้น MUI Collapse จะ render children ลง DOM จริงตั้งแต่แรกทุกโหนด
                // (แค่ซ่อนด้วย height:0) ทั้งที่ expandedIds เริ่มต้นว่างเปล่า (พับหมดทุกโหนด) — ต้นไม้
                // 3 ชั้น (หมวด→กลุ่มย่อย→รายการ) เลยกลายเป็นต้อง mount ทุกโหนดทุกใบพร้อมกันตอนเปิดหน้า
                <Collapse in={isExpanded} unmountOnExit>
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
interface ExpenseRecordsProps {
    onNext?: () => void;
    expenseDetail: ReturnType<typeof useClaimExpenseDetailHook>;
}

// รับ expenseDetail (ผลลัพธ์จาก useClaimExpenseDetailHook) เป็น prop จากผู้เรียก (ExpenseDetails /
// TreatmentCostTable) แทนการเรียก hook เองที่นี่ — hook นี้หนัก (formik + query หลายตัว + effect sync ลง
// Redux) ผู้เรียกบางจุด (ExpenseDetails) ต้องใช้ผลลัพธ์บางส่วน (เช่น benefitName) ก่อนถึงจุดนี้อยู่แล้ว
// เรียกซ้ำอีกรอบในนี้จะยิง query/formik/effect ซ้ำสองชุดโดยไม่จำเป็น
const ExpenseRecords: React.FC<ExpenseRecordsProps> = ({ expenseDetail }) => {
    const {
        expenseItems: filledItems,
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
        pendingRemark,
        setPendingRemark,
        handleAddToTable,
        handleUpdateItem,
        handleRemoveItem,
        totalReceipt,
        totalDiscount,
        totalNotCovered,
        netClaimAmount,
        paymentAmount,
        amountReconciliation,
        notCoveredReasonOptions,
        isNonCoveredReasonLoading,
        insuranceCompanyOptions,
        insuranceCompanyLoading,
        filteredCategories,
        isCategoryLoading,
        discountError,
        notCoveredError,
        reasonError,
        isMedicalCoverage,
        pendingReceiptAmount,
        setPendingReceiptAmount,
    } = expenseDetail;

    // ── ส่วนเกินจากบริษัทประกัน (ยัง UI-only — ต่อ endpoint จริงเมื่อพร้อม) ──
    const [isExcessFromInsurance, setIsExcessFromInsurance] = React.useState(false);
    const [selectedInsuranceCompany, setSelectedInsuranceCompany] = React.useState("");

    const isAddPanelDisabled = isCategoryLoading;

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
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            {/* ── ตารางรายการค่ารักษา ── */}
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
                    <Typography fontWeight={700} color={REF.primaryDark} fontSize={14}>
                        รายการค่ารักษา(เบื้องต้น)
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                        {filledItems.length} รายการ
                    </Typography>
                </Box>

                <TableContainer>
                    <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...headCell, width: "30%", textAlign: "left" }}>
                                    รายการค่ารักษา
                                </TableCell>
                                {/* ★ ใหม่ */}
                                <TableCell sx={{ ...headCell, width: "10%" }}>ยอดเงินตามใบเสร็จ</TableCell>
                                <TableCell sx={{ ...headCell, width: "10%" }}>สิทธิ์เบิก</TableCell>
                                <TableCell sx={{ ...headCell, width: "10%" }}>ส่วนลด</TableCell>
                                <TableCell sx={{ ...headCell, width: "10%" }}>ยอดไม่คุ้มครอง</TableCell>
                                <TableCell sx={{ ...headCell, width: "15%" }}>สาเหตุไม่คุ้มครอง</TableCell>
                                <TableCell sx={{ ...headCell, width: "15%" }}>หมายเหตุ</TableCell>
                                <TableCell sx={{ ...headCell, width: 40 }}>ลบ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filledItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 2, color: "text.disabled" }}>
                                        ไม่พบรายการ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filledItems.map((item) => {
                                    const rowDiscountError = Number(item.discount ?? 0) > Number(item.claimAmount ?? 0);
                                    const rowSumError = hasAmountSumError(item);
                                    const rowReasonError = hasMissingReasonError(item);

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell sx={{ ...bodyCell, textAlign: "left" }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {item.code} {item.description}
                                                </Typography>
                                            </TableCell>
                                            {/* ยอดเงินตามใบเสร็จ */}
                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                <NumericFormat
                                                    customInput={TextField}
                                                    size="small"
                                                    fullWidth
                                                    sx={tableInputSx}
                                                    value={item.receiptAmount ?? ""}
                                                    onValueChange={(v) =>
                                                        handleUpdateItem({
                                                            ...item,
                                                            receiptAmount: v.floatValue ?? 0,
                                                        })
                                                    }
                                                    thousandSeparator
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    allowNegative={false}
                                                />
                                            </TableCell>
                                            {/* ยอดเบิก */}
                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                <NumericFormat
                                                    customInput={TextField}
                                                    size="small"
                                                    fullWidth
                                                    sx={tableInputSx}
                                                    value={item.claimAmount ?? ""}
                                                    onValueChange={(v) =>
                                                        handleUpdateItem({
                                                            ...item,
                                                            claimAmount: v.floatValue ?? 0,
                                                        })
                                                    }
                                                    thousandSeparator
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    allowNegative={false}
                                                />
                                            </TableCell>

                                            {/* ส่วนลด */}
                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                <Tooltip
                                                    title="ส่วนลดต้องไม่มากกว่ายอดเบิก"
                                                    disableHoverListener={!rowDiscountError}
                                                    {...errorTooltipProps}
                                                >
                                                    {/* NumericFormat เป็น function component ธรรมดา ไม่ forward ref
                                                        ต้องห่อด้วย Box (div) ให้ Tooltip attach ref ได้ */}
                                                    <Box>
                                                        <NumericFormat
                                                            customInput={TextField}
                                                            size="small"
                                                            fullWidth
                                                            sx={tableInputSx}
                                                            value={item.discount ?? ""}
                                                            onValueChange={(v) =>
                                                                handleUpdateItem({
                                                                    ...item,
                                                                    discount: v.floatValue ?? 0,
                                                                })
                                                            }
                                                            thousandSeparator
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                            allowNegative={false}
                                                            error={rowDiscountError}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>

                                            {/* ยอดไม่คุ้มครอง */}
                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                <Tooltip
                                                    title="ยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิก"
                                                    {...errorTooltipProps}
                                                    disableHoverListener={!rowSumError}
                                                >
                                                    {/* NumericFormat เป็น function component ธรรมดา ไม่ forward ref
                                                        ต้องห่อด้วย Box (div) ให้ Tooltip attach ref ได้ */}
                                                    <Box>
                                                        <NumericFormat
                                                            customInput={TextField}
                                                            size="small"
                                                            fullWidth
                                                            sx={tableInputSx}
                                                            value={item.notCovered ?? ""}
                                                            onValueChange={(v) =>
                                                                handleUpdateItem({
                                                                    ...item,
                                                                    notCovered: v.floatValue ?? 0,
                                                                })
                                                            }
                                                            thousandSeparator
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                            allowNegative={false}
                                                            error={rowSumError}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>

                                            {/* สาเหตุไม่คุ้มครอง */}
                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                <Tooltip
                                                    title="กรุณาเลือกสาเหตุไม่คุ้มครอง"
                                                    disableHoverListener={!rowReasonError}
                                                    {...errorTooltipProps}
                                                >
                                                    <FormControl fullWidth size="small" error={rowReasonError}>
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
                                                                            : Number(e.target.value),
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
                                                    </FormControl>
                                                </Tooltip>
                                            </TableCell>

                                            {/* หมายเหตุ */}
                                            <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    sx={tableInputSx}
                                                    value={item.remark ?? "-"}
                                                    placeholder="หมายเหตุ"
                                                    onChange={(e) =>
                                                        handleUpdateItem({ ...item, remark: e.target.value })
                                                    }
                                                />
                                            </TableCell>

                                            {/* ลบ */}
                                            <TableCell sx={{ ...bodyCell, textAlign: "center", p: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#fff1f0",
                                                        color: "#d92d20",
                                                        borderRadius: 6,
                                                    }}
                                                    onClick={() => handleRemoveItem(item.id as number)}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
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

            {/* ── สรุปยอดเงิน ── */}
            <Box
                sx={{
                    border: "1px solid",
                    borderColor: REF.line,
                    borderRadius: 1.5,
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 1.25,
                        bgcolor: REF.soft,
                        borderBottom: "1px solid",
                        borderColor: REF.line,
                    }}
                >
                    <DescriptionOutlinedIcon sx={{ fontSize: 20, color: REF.primary }} />
                    <Typography fontWeight={700} color={REF.primary} fontSize={14}>
                        สรุปยอดเงิน
                    </Typography>
                </Box>

                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gap: 1.5,
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(3, 1fr)",
                                md: "repeat(3, 1fr) auto",
                            },
                            alignItems: "stretch",
                        }}
                    >
                        {[
                            { label: "ยอดเงินตามใบเสร็จรวม", value: totalReceipt },
                            { label: "ส่วนลดรวม", value: totalDiscount },
                            { label: "ยอดไม่คุ้มครองรวม", value: totalNotCovered },
                        ].map((row) => (
                            <Box
                                key={row.label}
                                sx={{
                                    border: "1px solid",
                                    borderColor: REF.line,
                                    borderRadius: 1.5,
                                    px: 2,
                                    py: 1.5,
                                    bgcolor: "#fafcff",
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {row.label} :
                                </Typography>
                                <Typography fontWeight={700} color={REF.primaryDark} fontSize={17}>
                                    {fmt(row.value)}{" "}
                                    <Typography component="span" variant="caption" color="text.secondary">
                                        บาท
                                    </Typography>
                                </Typography>
                            </Box>
                        ))}

                        <Stack
                            spacing={1}
                            sx={{
                                minWidth: { md: 240 },
                                border: "1px solid",
                                borderColor: REF.line,
                                borderRadius: 1.5,
                                p: 1,
                                bgcolor: "#f7fafc",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1.5,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 1.25,
                                    bgcolor: "#f0f8f1",
                                    border: "1px solid",
                                    borderColor: "#cdeacf",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={0.75}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 16, color: "success.main" }} />
                                    <Typography
                                        variant="caption"
                                        color="success.main"
                                        fontWeight={600}
                                        whiteSpace="nowrap"
                                    >
                                        ยอดเงินสุทธิ :
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700} color="success.main" whiteSpace="nowrap">
                                    {fmt(netClaimAmount)}{" "}
                                    <Typography component="span" variant="caption">
                                        บาท
                                    </Typography>
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1.5,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 1.25,
                                    bgcolor: REF.soft,
                                    border: "1px solid",
                                    borderColor: "#c9e3f7",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={0.75}>
                                    <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16, color: REF.primary }} />
                                    <Typography
                                        variant="caption"
                                        color={REF.primary}
                                        fontWeight={600}
                                        whiteSpace="nowrap"
                                    >
                                        ยอดเงินโอน :
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700} color={REF.primary} whiteSpace="nowrap">
                                    {fmt(paymentAmount)}{" "}
                                    <Typography component="span" variant="caption">
                                        บาท
                                    </Typography>
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* ── ผลตรวจสอบยอดเงิน ClaimLine (ยอดที่จ่าย+ไม่คุ้มครอง เทียบใบเสร็จสุทธิ / เทียบสิทธิ์เบิก) ── */}
                    <Alert
                        severity={
                            amountReconciliation.status === "ok"
                                ? "success"
                                : amountReconciliation.status === "error"
                                ? "error"
                                : amountReconciliation.status === "pending"
                                ? "info"
                                : "warning"
                        }
                        sx={{ mt: 1.5 }}
                    >
                        {amountReconciliation.message}
                    </Alert>

                    <Divider sx={{ my: 2 }} />

                    {/* ── เป็นส่วนเกินจากบริษัทประกัน ── */}
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: isExcessFromInsurance ? REF.primary : REF.line,
                            borderRadius: 1.5,
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: isExcessFromInsurance ? REF.soft : "#fafcff",
                            transition: "background-color .15s ease, border-color .15s ease",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                alignItems: { xs: "stretch", md: "center" },
                                gap: { xs: 1.25, md: 2 },
                            }}
                        >
                            <Box
                                component="label"
                                htmlFor="excess-insurance-checkbox"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    cursor: "pointer",
                                    userSelect: "none",
                                    minWidth: { md: 220 },
                                }}
                            >
                                <Checkbox
                                    id="excess-insurance-checkbox"
                                    checked={isExcessFromInsurance}
                                    onChange={(e) => {
                                        setIsExcessFromInsurance(e.target.checked);
                                        if (!e.target.checked) setSelectedInsuranceCompany("");
                                    }}
                                    sx={{
                                        p: 0.5,
                                        color: "#b7c4d3",
                                        "&.Mui-checked": { color: REF.primary },
                                    }}
                                />
                                <Typography fontWeight={600} color={REF.primaryDark} fontSize={14}>
                                    เป็นส่วนเกินจากบริษัทประกัน
                                </Typography>
                            </Box>

                            <Collapse
                                in={isExcessFromInsurance}
                                orientation="horizontal"
                                sx={{ flex: 1, width: { xs: "100%", md: "auto" } }}
                            >
                                <FormControl fullWidth size="small">
                                    <Select
                                        displayEmpty
                                        fullWidth
                                        value={selectedInsuranceCompany}
                                        onChange={(e) => setSelectedInsuranceCompany(e.target.value)}
                                        sx={{
                                            bgcolor: "#fff",
                                            borderRadius: "8px",
                                            fontSize: 14,
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#c9d6e4" },
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em style={{ color: "#9aa5b1" }}>
                                                {insuranceCompanyLoading ? "กำลังโหลด..." : "---เลือกบริษัทประกัน---"}
                                            </em>
                                        </MenuItem>
                                        {insuranceCompanyOptions.map((name) => (
                                            <MenuItem key={name.value} value={name.value} sx={{ fontSize: 14 }}>
                                                {name.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Collapse>
                        </Box>

                        {isExcessFromInsurance && !selectedInsuranceCompany && (
                            <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
                                กรุณาเลือกบริษัทประกัน
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ── รายการค่ารักษาเพิ่มเติม — แสดงเฉพาะประเภทความคุ้มครอง = ค่ารักษา ── */}
            {isMedicalCoverage && (
                <Box
                    sx={{
                        mt: 2.5,
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
                            startIcon={showAddPanel ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
                            disabled={isAddPanelDisabled}
                            onClick={() => {
                                if (isAddPanelDisabled) return;
                                setShowAddPanel(!showAddPanel);
                            }}
                            sx={{ borderRadius: 1, fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                            {isCategoryLoading ? "กำลังโหลด..." : showAddPanel ? "ซ่อน" : "เพิ่มรายการค่ารักษา"}
                        </Button>
                    </Box>

                    {/* unmountOnExit: showAddPanel เริ่มต้นเป็น false เสมอ ถ้าไม่ unmount จะ render ต้นไม้หมวดหมู่
                        ทั้งก้อน (หมวด→กลุ่มย่อย→รายการ) ลง DOM จริงตั้งแต่เปิดหน้า ทั้งที่ผู้ใช้ยังไม่กดเปิด panel */}
                    <Collapse in={showAddPanel} unmountOnExit>
                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                                gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
                                alignItems: "start",
                            }}
                        >
                            {/* ── ฝั่งซ้าย: ค้นหา + tree หมวด ── */}
                            <Box
                                sx={{
                                    border: "1px solid",
                                    borderColor: REF.lineStrong,
                                    borderRadius: 1,
                                    overflow: "hidden",
                                }}
                            >
                                <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
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
                                                    <SearchIcon sx={{ fontSize: 20, color: REF.primary }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ maxHeight: { xs: 320, md: 420 }, overflowY: "auto" }}>
                                    {filteredCategories.length === 0 ? (
                                        <Box sx={{ py: 4, textAlign: "center" }}>
                                            <Typography variant="body2" color="text.disabled">
                                                ไม่พบรายการที่ค้นหา
                                            </Typography>
                                        </Box>
                                    ) : (
                                        filteredCategories.map((cat) => (
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
                                                        bgcolor: expandedIds.includes(cat.id) ? REF.soft : "white",
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
                                                            <MiscellaneousServicesOutlinedIcon sx={{ fontSize: 18 }} />
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
                                                        <ExpandLessIcon sx={{ fontSize: 18, color: REF.primaryDark }} />
                                                    ) : (
                                                        <ExpandMoreIcon sx={{ fontSize: 18, color: REF.primaryDark }} />
                                                    )}
                                                </Box>
                                                <Collapse in={expandedIds.includes(cat.id)} unmountOnExit>
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
                                        ))
                                    )}
                                </Box>
                            </Box>

                            {/* ── ฝั่งขวา: ฟอร์มเพิ่มรายการ ── */}
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
                                }}
                            >
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    รายการค่ารักษาที่เลือก
                                </Typography>

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={1}
                                    maxRows={4}
                                    value={selectedItem ? `${selectedItem.code} ${selectedItem.description}` : ""}
                                    placeholder="ยังไม่ได้เลือกรายการ — เลือกจากรายการทางซ้าย"
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px",
                                            backgroundColor: "#fff",
                                            minHeight: 40,
                                            fontSize: 13,
                                            "& fieldset": { borderColor: REF.lineStrong },
                                            "&:hover fieldset": { borderColor: REF.primary },
                                            "&.Mui-focused fieldset": {
                                                borderColor: REF.primary,
                                                borderWidth: 1.5,
                                            },
                                        },
                                        "& .MuiInputBase-input": { color: "primary.main" },
                                    }}
                                />
                                <NumericFormat
                                    customInput={TextField}
                                    size="small"
                                    fullWidth
                                    label="ยอดเงินตามใบเสร็จ"
                                    value={pendingReceiptAmount}
                                    onValueChange={(v) => setPendingReceiptAmount(v.value)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    disabled={!selectedItem}
                                    sx={refInputSx}
                                />
                                <NumericFormat
                                    customInput={TextField}
                                    size="small"
                                    fullWidth
                                    label="ยอดเบิก"
                                    value={pendingAmount}
                                    onValueChange={(v) => setPendingAmount(v.value)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    disabled={!selectedItem}
                                    sx={refInputSx}
                                />

                                <Box display="flex" gap={1.25} flexDirection={{ xs: "column", sm: "row" }}>
                                    <NumericFormat
                                        customInput={TextField}
                                        size="small"
                                        fullWidth
                                        label="ส่วนลด"
                                        value={pendingDiscount}
                                        onValueChange={(v) => setPendingDiscount(v.value)}
                                        thousandSeparator
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        disabled={!selectedItem}
                                        error={!!discountError}
                                        helperText={discountError}
                                        sx={refInputSx}
                                    />
                                    <NumericFormat
                                        customInput={TextField}
                                        size="small"
                                        fullWidth
                                        label="ยอดไม่คุ้มครอง"
                                        value={pendingNotCovered}
                                        onValueChange={(v) => setPendingNotCovered(v.value)}
                                        thousandSeparator
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        disabled={!selectedItem}
                                        error={!!notCoveredError}
                                        helperText={notCoveredError}
                                        sx={refInputSx}
                                    />
                                </Box>

                                <FormControl
                                    fullWidth
                                    size="small"
                                    disabled={!selectedItem || isNonCoveredReasonLoading}
                                    error={!!reasonError}
                                >
                                    <Select
                                        displayEmpty
                                        value={pendingReason ?? ""}
                                        onChange={(e) =>
                                            setPendingReason(e.target.value === "" ? undefined : Number(e.target.value))
                                        }
                                        sx={formSelectSx}
                                    >
                                        <MenuItem value="">
                                            <em style={{ color: "#9aa5b1" }}>สาเหตุไม่คุ้มครอง</em>
                                        </MenuItem>
                                        {notCoveredReasonOptions.map((o) => (
                                            <MenuItem key={o.value} value={o.value}>
                                                {o.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {reasonError && <FormHelperText>{reasonError}</FormHelperText>}
                                </FormControl>

                                <TextField
                                    size="small"
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    label="หมายเหตุ"
                                    value={pendingRemark}
                                    onChange={(e) => setPendingRemark(e.target.value)}
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
                        </Box>
                    </Collapse>
                </Box>
            )}
        </Box>
    );
};

export default ExpenseRecords;

import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
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
    Tooltip,
    Typography,
    Zoom,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

// ── Category icons ──
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

import { useNavigate } from "react-router-dom";
import { useClaimLineCalculate } from "../../hooks/ClaimSimulate/useClaimLineCalculate";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../_common/components/CustomComponent/CustomBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ClaimLineHeader from "./ClaimLineHeader";

// ─── Category icon map ────────────────────────────────────────────────────────
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
    "กลุ่มอุปกรณ์ / ห้อง / หัตถการ": <ContentCutOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มทันตกรรม: <LocalHospitalOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มบริการวิชาชีพและการดูแล: <AccessibilityNewOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มอุปกรณ์เฉพาะทาง: <DevicesOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มแพทย์ทางเลือก: <SpaOutlinedIcon sx={{ fontSize: 16 }} />,
    "กลุ่ม Package / Bundle": <CardGiftcardOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มค่าบริการโรงพยาบาล: <ApartmentOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มค่าแพทย์: <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มค่าห้องและสิ่งอำนวยความสะดวก: <HotelOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มขนส่งและบริการพิเศษ: <DirectionsCarOutlinedIcon sx={{ fontSize: 16 }} />,
    กลุ่มบริการทั่วไป: <MiscellaneousServicesOutlinedIcon sx={{ fontSize: 16 }} />,
};

// ─── Tree node type ───────────────────────────────────────────────────────────
interface TreeNode {
    id: number;
    label: string;
    children: TreeNode[];
}

// ─── Category skeleton while loading ─────────────────────────────────────────
const CategorySkeleton = () => (
    <Box>
        {Array.from({ length: 8 }).map((_, i) => (
            <Box
                key={i}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    gap: 1,
                }}
            >
                <Skeleton variant="circular" width={16} height={16} sx={{ flexShrink: 0 }} />
                <Skeleton variant="text" width={`${55 + (i % 4) * 10}%`} height={20} />
                <Skeleton variant="circular" width={14} height={14} sx={{ ml: "auto", flexShrink: 0 }} />
            </Box>
        ))}
    </Box>
);

// ─── Recursive tree ───────────────────────────────────────────────────────────
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
                    transition: "background 0.15s",
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    "&:hover": { bgcolor: isLeaf ? "primary.50" : "grey.100" },
                }}
            >
                {hasChildren ? (
                    <Box sx={{ mr: 0.75, display: "flex", alignItems: "center", color: "primary.main" }}>
                        {isExpanded ? (
                            <ExpandLessIcon sx={{ fontSize: 16 }} />
                        ) : (
                            <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        )}
                    </Box>
                ) : (
                    // ── วงกลม radio style ──
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
                            transition: "all 0.15s",
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const ClaimLineCalculate = () => {
    const navigate = useNavigate();
    const {
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
        handleNext,
        isFrequentLoading,
        discountError,
        notCoveredError,
        setDiscountError,
        setNotCoveredError,
        hasDiscountError,
        hasNotCoveredError,
        hasAnyAmount,
    } = useClaimLineCalculate(() => navigate("summary"));

    const fmt = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    // ── table styles ──────────────────────────────────────────────────────────
    const headCell = {
        fontWeight: 700,
        fontSize: 13,
        bgcolor: "primary.main",
        color: "white",
        whiteSpace: "nowrap" as const,
        py: 1,
        px: 1.5,
        borderRight: "1px solid rgba(255,255,255,0.2)",
        "&:last-child": { borderRight: "none" },
    };

    const bodyCell = {
        fontSize: 13,
        py: 0.75,
        px: 1,
        borderRight: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderRight: "none" },
    };

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Grid container spacing={2.5}>
                {/* ══ LEFT col ══════════════════════════════════════════════ */}
                <Grid item xs={12} md={8.5}>
                    {/* ── ข้อมูลผู้เอาประกัน ── */}
                    <CustomBox sx={{ mb: 2.5 }}>
                        <HeadingWithColor
                            text="รายการค่าใช้จ่าย"
                            color="blue"
                            icon={<FontAwesomeIcon icon={"file-circle-plus"} fontSize={22} />}
                        />
                        <ClaimLineHeader />
                    </CustomBox>

                    {/* ── รายการค่ารักษาที่ใช้บ่อย ── */}
                    <CustomBox sx={{ mb: 2.5 }}>
                        <Box sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                รายการค่ารักษาที่ใช้บ่อย
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                overflowX: "auto",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <TableContainer>
                                <Table
                                    size="small"
                                    sx={{
                                        minWidth: 620,
                                        "& tbody tr": {
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                        },
                                        "& tbody tr:last-child": {
                                            borderBottom: "none",
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ ...headCell, width: "34%" }}>รายการค่ารักษา</TableCell>
                                            <TableCell sx={{ ...headCell, width: "11%", textAlign: "center" }}>
                                                ยอดเบิก
                                            </TableCell>
                                            <TableCell sx={{ ...headCell, width: "10%", textAlign: "center" }}>
                                                ส่วนลด
                                            </TableCell>
                                            <TableCell sx={{ ...headCell, width: "11%", textAlign: "center" }}>
                                                ยอดไม่คุ้มครอง
                                            </TableCell>
                                            <TableCell sx={{ ...headCell, width: "15%", textAlign: "center" }}>
                                                สาเหตุไม่คุ้มครอง
                                            </TableCell>
                                            <TableCell sx={{ ...headCell, width: "13%", textAlign: "center" }}>
                                                หมายเหตุ
                                            </TableCell>
                                            <TableCell sx={{ ...headCell, width: 36, textAlign: "center" }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isFrequentLoading ? (
                                            // ── Skeleton rows ระหว่าง loading ──
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? "white" : "grey.50" }}>
                                                    <TableCell sx={bodyCell}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Skeleton variant="rounded" width={36} height={16} />
                                                            <Skeleton variant="text" width="60%" />
                                                        </Box>
                                                    </TableCell>
                                                    {[...Array(5)].map((_, j) => (
                                                        <TableCell key={j} sx={{ ...bodyCell, p: 0.5 }}>
                                                            <Skeleton variant="rounded" height={32} />
                                                        </TableCell>
                                                    ))}
                                                    <TableCell sx={{ ...bodyCell, textAlign: "center", p: 0.5 }}>
                                                        <Skeleton
                                                            variant="circular"
                                                            width={28}
                                                            height={28}
                                                            sx={{ mx: "auto" }}
                                                        />
                                                    </TableCell>
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
                                            filledItems.map((item, idx) => (
                                                <TableRow
                                                    key={item.id}
                                                    sx={{
                                                        bgcolor: idx % 2 === 0 ? "white" : "grey.50",
                                                        "&:hover": {
                                                            bgcolor: "primary.50",
                                                            transition: "background 0.15s",
                                                        },
                                                    }}
                                                >
                                                    <TableCell sx={bodyCell}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {item.code} {item.description}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                        <TextField
                                                            size="small"
                                                            value={item.claimAmount ?? ""}
                                                            onChange={(e) =>
                                                                handleUpdateItem({
                                                                    ...item,
                                                                    claimAmount: Number(e.target.value || 0),
                                                                })
                                                            }
                                                            type="number"
                                                            inputProps={{
                                                                min: 0,
                                                                style: { textAlign: "right", fontSize: 13 },
                                                            }}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                        <TextField
                                                            size="small"
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
                                                            inputProps={{
                                                                min: 0,
                                                                style: { textAlign: "right", fontSize: 13 },
                                                            }}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                        <TextField
                                                            size="small"
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
                                                            helperText={
                                                                Number(item.discount ?? 0) <=
                                                                    Number(item.claimAmount ?? 0) &&
                                                                Number(item.notCovered ?? 0) >
                                                                    Number(item.claimAmount ?? 0) -
                                                                        Number(item.discount ?? 0)
                                                                    ? "ไม่คุ้มครองต้องไม่มากกว่ายอดเบิกหลังหักส่วนลด"
                                                                    : ""
                                                            }
                                                            inputProps={{
                                                                min: 0,
                                                                style: { textAlign: "right", fontSize: 13 },
                                                            }}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                        <Select
                                                            size="small"
                                                            value={item.reason}
                                                            onChange={(e) =>
                                                                handleUpdateItem({ ...item, reason: e.target.value })
                                                            }
                                                            displayEmpty
                                                            fullWidth
                                                            sx={{ fontSize: 13 }}
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
                                                            value={item.remark}
                                                            onChange={(e) =>
                                                                handleUpdateItem({ ...item, remark: e.target.value })
                                                            }
                                                            inputProps={{ style: { fontSize: 13 } }}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ ...bodyCell, textAlign: "center", p: 0.5 }}>
                                                        <Tooltip
                                                            title="ลบ"
                                                            arrow
                                                            placement="top"
                                                            TransitionComponent={Zoom}
                                                            enterDelay={100}
                                                            leaveDelay={50}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleRemoveItem(item.id as number)}
                                                                sx={{
                                                                    bgcolor: "error.50",
                                                                    "&:hover": { bgcolor: "error.100" },
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon="trash-can" fontSize={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                        {/* {filledItems.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    sx={{ textAlign: "center", py: 4, color: "text.disabled" }}
                                                >
                                                    ยังไม่มีรายการ
                                                </TableCell>
                                            </TableRow>
                                        )} */}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </CustomBox>

                    {/* ── รายการค่ารักษาเพิ่มเติม + Tree ── */}
                    <Paper
                        elevation={0}
                        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 1,
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                    รายการค่ารักษาเพิ่มเติม
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    กรณีไม่มีในรายการที่ใช้บ่อย กรุณาเลือกหมวดและเพิ่มรายการลงในตาราง
                                </Typography>
                            </Box>
                            <Button
                                variant={showAddPanel ? "outlined" : "contained"}
                                color="primary"
                                size="small"
                                startIcon={showAddPanel ? <RemoveCircleIcon /> : <AddCircleOutlineIcon />}
                                onClick={() => setShowAddPanel(!showAddPanel)}
                                sx={{ borderRadius: 1, fontWeight: 600, whiteSpace: "nowrap" }}
                            >
                                {showAddPanel ? "ซ่อน" : "เพิ่มรายการค่ารักษา"}
                            </Button>
                        </Box>

                        <Collapse in={showAddPanel}>
                            <Divider />
                            <Grid container>
                                {/* ── Tree ── */}
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    sx={{ borderRight: { sm: "1px solid" }, borderColor: { sm: "divider" } }}
                                >
                                    {/* Search */}
                                    <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="ค้นหารายการค่ารักษา เช่น ยา , ค่าแพทย์ , ค่าห้อง"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        {isCategoryLoading ? (
                                                            <CircularProgress size={20} color="inherit" />
                                                        ) : (
                                                            <SearchIcon
                                                                sx={{ fontSize: 20, color: "text.secondary" }}
                                                            />
                                                        )}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                        />
                                    </Box>

                                    {/* Category list */}
                                    {isCategoryLoading ? (
                                        <CategorySkeleton />
                                    ) : filteredCategories.length === 0 ? (
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            py={6}
                                            gap={1}
                                        >
                                            <SearchIcon sx={{ fontSize: 32, color: "text.disabled" }} />
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
                                                        py: 0.9,
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid",
                                                        borderColor: "divider",
                                                        bgcolor: expandedIds.includes(cat.id) ? "primary.50" : "white",
                                                        "&:hover": { bgcolor: "primary.50" },
                                                        transition: "background 0.15s",
                                                        position: "sticky",
                                                        top: 0,
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            mr: 1,
                                                            color: "primary.main",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {CATEGORY_ICON_MAP[cat.label] ?? (
                                                            <MiscellaneousServicesOutlinedIcon sx={{ fontSize: 16 }} />
                                                        )}
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                        color="primary.main"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        หมวด : {cat.label}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            color: "primary.main",
                                                            display: "flex",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        {expandedIds.includes(cat.id) ? (
                                                            <ExpandLessIcon sx={{ fontSize: 16 }} />
                                                        ) : (
                                                            <ExpandMoreIcon sx={{ fontSize: 16 }} />
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* children scroll */}
                                                <Collapse in={expandedIds.includes(cat.id)}>
                                                    <Box
                                                        sx={{
                                                            bgcolor: "grey.50",
                                                            borderBottom: "1px solid",
                                                            borderColor: "divider",
                                                            maxHeight: 280,
                                                            overflowY: "auto",
                                                        }}
                                                    >
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
                                </Grid>

                                {/* ── Form กรอกยอด ── */}
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    sx={{
                                        bgcolor: "grey.50",
                                        borderTop: { xs: "1px solid", sm: "none" },
                                        borderColor: "divider",
                                    }}
                                >
                                    <Box sx={{ p: 2, position: { sm: "sticky" }, top: { sm: 0 } }}>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                                            รายการค่ารักษาที่เลือก
                                        </Typography>

                                        {selectedItem ? (
                                            <Chip
                                                label={`${selectedItem.code} ${selectedItem.description}`}
                                                color="primary"
                                                size="small"
                                                sx={{
                                                    mb: 2,
                                                    maxWidth: "100%",
                                                    height: "auto",
                                                    "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    mb: 2,
                                                    p: 1,
                                                    borderRadius: 1,
                                                    border: "1px dashed",
                                                    borderColor: "divider",
                                                    bgcolor: "white",
                                                }}
                                            >
                                                <Typography variant="caption" color="text.disabled">
                                                    กรุณาเลือกรายการจากรายการด้านซ้าย
                                                </Typography>
                                            </Box>
                                        )}

                                        <Grid container spacing={1.5}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    size="small"
                                                    label="ยอดเบิก"
                                                    fullWidth
                                                    type="number"
                                                    value={pendingAmount}
                                                    onChange={(e) => {
                                                        setPendingAmount(e.target.value);
                                                        if (Number(pendingDiscount) <= Number(e.target.value))
                                                            setDiscountError("");
                                                        if (
                                                            Number(pendingNotCovered) <=
                                                            Number(e.target.value) - Number(pendingDiscount)
                                                        )
                                                            setNotCoveredError("");
                                                    }}
                                                    disabled={!selectedItem}
                                                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    size="small"
                                                    label="ส่วนลด"
                                                    fullWidth
                                                    type="number"
                                                    value={pendingDiscount ?? ""}
                                                    onChange={(e) => {
                                                        setPendingDiscount(e.target.value);
                                                        if (Number(e.target.value) > Number(pendingAmount)) {
                                                            setDiscountError("ส่วนลดต้องไม่มากกว่ายอดเบิก");
                                                        } else {
                                                            setDiscountError("");
                                                        }
                                                    }}
                                                    disabled={!selectedItem}
                                                    error={!!discountError}
                                                    helperText={discountError}
                                                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    size="small"
                                                    label="ยอดไม่คุ้มครอง"
                                                    fullWidth
                                                    type="number"
                                                    value={pendingNotCovered ?? ""}
                                                    onChange={(e) => {
                                                        setPendingNotCovered(e.target.value);
                                                        if (
                                                            Number(e.target.value) >
                                                            Number(pendingAmount) - Number(pendingDiscount)
                                                        ) {
                                                            setNotCoveredError(
                                                                "ยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิกหลังหักส่วนลด"
                                                            );
                                                        } else {
                                                            setNotCoveredError("");
                                                        }
                                                    }}
                                                    disabled={!selectedItem}
                                                    error={!!notCoveredError}
                                                    helperText={notCoveredError}
                                                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sx={{ mt: discountError || notCoveredError ? 4 : 0 }}>
                                                <Select
                                                    size="small"
                                                    fullWidth
                                                    value={pendingReason}
                                                    onChange={(e) => setPendingReason(e.target.value)}
                                                    disabled={!selectedItem}
                                                    displayEmpty
                                                    sx={{ fontSize: 13 }}
                                                >
                                                    <MenuItem value="">
                                                        <em>สาเหตุไม่คุ้มครอง</em>
                                                    </MenuItem>
                                                    {notCoveredReasonOptions.map((o) => (
                                                        <MenuItem key={o.value} value={o.value} sx={{ fontSize: 15 }}>
                                                            {o.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    size="medium"
                                                    startIcon={<AddBoxOutlinedIcon />}
                                                    onClick={handleAddToTable}
                                                    disabled={
                                                        !selectedItem ||
                                                        !pendingAmount ||
                                                        !!discountError ||
                                                        !!notCoveredError
                                                    }
                                                    sx={{ borderRadius: 2, fontWeight: 600, mt: 1 }}
                                                >
                                                    เพิ่มลงในตาราง
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3.5}>
                    <CustomBox sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
                        <HeadingWithColor
                            text="สรุปยอดเงิน"
                            color="green"
                            icon={<RequestQuoteIcon sx={{ fontSize: 27 }} />}
                            sx={{ mx: 0, borderRadius: 0, mb: 0 }}
                        />
                        <Box sx={{ p: 2 }}>
                            <Stack spacing={0}>
                                {[
                                    { label: "ยอดเบิกรวม", value: fmt(totalClaim) },
                                    { label: "ส่วนลดรวม", value: fmt(totalDiscount) },
                                    { label: "ยอดไม่คุ้มครองรวม", value: fmt(totalNotCovered) },
                                ].map((row, i, arr) => (
                                    <Box key={row.label}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.label} :
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color={
                                                    row.label === "ยอดไม่คุ้มครองรวม" ? "error.main" : "text.primary"
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
                                <Box display="flex" alignItems="center" gap={1}>
                                    <AttachMoneyIcon sx={{ color: "success.main", fontSize: 24 }} />
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        ยอดเงินสุทธิ
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="h5" fontWeight={800} color="success.main" lineHeight={1}>
                                        {fmt(netAmount)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        บาท
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* ปุ่มถัดไป */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                onClick={handleNext}
                                fullWidth
                                disabled={!hasAnyAmount || hasDiscountError || hasNotCoveredError}
                                sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    boxShadow: 2,
                                    "&:hover": { boxShadow: 4 },
                                }}
                            >
                                ถัดไป
                            </Button>
                        </Box>
                    </CustomBox>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClaimLineCalculate;

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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClaimLineCalculate } from "../../hooks/ClaimSimulate/useClaimLineCalculate";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../_common/components/CustomComponent/CustomBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ClaimLineHeader from "../ClaimLine/ClaimLineHeader";

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
                    // ── parent node: expand/collapse ──
                    <Box sx={{ mr: 0.75, display: "flex", alignItems: "center", color: "primary.main" }}>
                        {isExpanded ? (
                            <ExpandLessIcon sx={{ fontSize: 16 }} />
                        ) : (
                            <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        )}
                    </Box>
                ) : (
                    // ── leaf node: วงกลม radio style ──
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
const ClaimLineCalculatePage = () => {
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
        initItems,
        handleNext,
    } = useClaimLineCalculate(() => navigate("summary"));

    useEffect(() => {
        initItems();
    }, []);

    const fmt = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2 });

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
                <Grid item xs={12} md={8}>
                    {/* ── รายการค่ารักษาที่ใช้บ่อย ── */}
                    <CustomBox sx={{ mb: 2.5 }}>
                        <HeadingWithColor text="รายการค่าใช้จ่าย" color="blue" />
                        <ClaimLineHeader />
                    </CustomBox>
                    <CustomBox sx={{ mb: 2.5 }}>
                        <Box sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                รายการค่ารักษาที่ใช้บ่อย
                            </Typography>
                        </Box>
                        <Box sx={{ overflowX: "auto" }}>
                            <TableContainer>
                                <Table size="small" sx={{ minWidth: 620 }}>
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
                                        {filledItems.map((item, idx) => (
                                            <TableRow
                                                key={item.id}
                                                sx={{ bgcolor: idx % 2 === 0 ? "white" : "grey.50" }}
                                            >
                                                <TableCell sx={bodyCell}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.code} {item.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                                    <TextField
                                                        size="small"
                                                        value={item.claimAmount}
                                                        onChange={(e) =>
                                                            handleUpdateItem({ ...item, claimAmount: e.target.value })
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
                                                        value={item.discount}
                                                        onChange={(e) =>
                                                            handleUpdateItem({ ...item, discount: e.target.value })
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
                                                        value={item.notCovered}
                                                        onChange={(e) =>
                                                            handleUpdateItem({ ...item, notCovered: e.target.value })
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
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            sx={{
                                                                bgcolor: "error.50",
                                                                "&:hover": { bgcolor: "error.100" },
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-can" fontSize={14} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filledItems.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    sx={{ textAlign: "center", py: 4, color: "text.disabled" }}
                                                >
                                                    ยังไม่มีรายการ
                                                </TableCell>
                                            </TableRow>
                                        )}
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
                                sx={{ borderRadius: 2, fontWeight: 600, whiteSpace: "nowrap" }}
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
                                                        <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                        />
                                    </Box>

                                    {/* Loading */}
                                    {isCategoryLoading ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                                            <CircularProgress size={28} />
                                        </Box>
                                    ) : filteredCategories.length === 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                                            <Typography variant="body2" color="text.disabled">
                                                ไม่พบรายการที่ค้นหา
                                            </Typography>
                                        </Box>
                                    ) : (
                                        /* หัวหมวดทุกอันอยู่นอก scroll
                                           children ที่ expand อยู่ใน scroll ใต้หัวนั้นๆ */
                                        filteredCategories.map((cat) => (
                                            <Box key={cat.id}>
                                                {/* ── หัวหมวด: sticky ── */}
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

                                                {/* ── children: scroll ได้เฉพาะส่วนนี้ ── */}
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
                                                    p: 1.5,
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
                                                    onChange={(e) => setPendingAmount(e.target.value)}
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
                                                    value={pendingDiscount}
                                                    onChange={(e) => setPendingDiscount(e.target.value)}
                                                    disabled={!selectedItem}
                                                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    size="small"
                                                    label="ยอดไม่คุ้มครอง"
                                                    fullWidth
                                                    type="number"
                                                    value={pendingNotCovered}
                                                    onChange={(e) => setPendingNotCovered(e.target.value)}
                                                    disabled={!selectedItem}
                                                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
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
                                                        <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>
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
                                                    disabled={!selectedItem || !pendingAmount}
                                                    sx={{ borderRadius: 2, fontWeight: 600 }}
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

                {/* ══ RIGHT col: สรุปยอดเงิน ════════════════════════════════ */}
                <Grid item xs={12} md={4}>
                    <CustomBox sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
                        <HeadingWithColor
                            text="สรุปยอดเงิน"
                            color="green"
                            icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />}
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
                                            <Typography variant="body2" fontWeight={600}>
                                                {row.value}
                                            </Typography>
                                        </Box>
                                        {i < arr.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            {/* ยอดสุทธิ */}
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
                                    <AttachMoneyIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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

export default ClaimLineCalculatePage;

import React, { useState, useMemo } from "react";
import {
    Box,
    Button,
    Checkbox,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
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
    Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

// ─── Reference styles ──────────────────────────────────────────────
const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#eaf5ff",
    line: "#e3e9f0",
};

const tableInputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "6px",
        backgroundColor: "#fff",
        height: 32,
        fontSize: 13,
    },
    "& .MuiOutlinedInput-input": { padding: "4px 8px", textAlign: "center" as const },
};

const tableSelectSx = {
    height: 32,
    fontSize: 13,
    borderRadius: "6px",
    bgcolor: "#fff",
};

// ─── Mock data (แทน useClaimSimulatePage) ─────────────────────────
interface ExpenseItem {
    id: number;
    code: string;
    description: string;
    receiptAmount: number; // ยอดเงินตามใบเสร็จ
    eligibleAmount: number; // สิทธิ์เบิก
    discount: number; // ส่วนลด
    notCovered: number; // ยอดไม่คุ้มครอง
    reason?: number; // สาเหตุไม่คุ้มครอง
    remark: string;
}

const MOCK_REASON_OPTIONS = [
    { value: 1, label: "เกินวงเงินความคุ้มครอง" },
    { value: 2, label: "ไม่อยู่ในเงื่อนไขกรมธรรม์" },
    { value: 3, label: "ค่าใช้จ่ายส่วนเกิน" },
];

const MOCK_ITEMS: ExpenseItem[] = [
    {
        id: 1,
        code: "1.1.10(1)",
        description: "ยาอื่น",
        receiptAmount: 0,
        eligibleAmount: 0,
        discount: 0,
        notCovered: 0,
        remark: "",
    },
    {
        id: 2,
        code: "1.2.1(1)",
        description: "บัญชีเวชภัณฑ์ 1",
        receiptAmount: 0,
        eligibleAmount: 0,
        discount: 0,
        notCovered: 0,
        remark: "",
    },
    {
        id: 3,
        code: "1.2.2(1)",
        description: "บัญชีเวชภัณฑ์ 2",
        receiptAmount: 0,
        eligibleAmount: 0,
        discount: 0,
        notCovered: 0,
        remark: "",
    },
    {
        id: 4,
        code: "1.26(1)",
        description: "ค่าบริการชุดเหมาจ่ายการรักษาพยาบาล",
        receiptAmount: 0,
        eligibleAmount: 0,
        discount: 0,
        notCovered: 0,
        remark: "",
    },
    {
        id: 5,
        code: "1.4.1(1)",
        description: "ค่าตรวจวินิจฉัยทางห้องปฏิบัติการ",
        receiptAmount: 550,
        eligibleAmount: 550,
        discount: 0,
        notCovered: 0,
        remark: "",
    },
];

// ─── Mock category tree สำหรับ "รายการค่ารักษาเพิ่มเติม" ──────────
interface TreeLeaf {
    id: number;
    code: string;
    description: string;
    children?: TreeLeaf[];
}

interface CategoryNode {
    id: number;
    label: string;
    children: TreeLeaf[];
}

const MOCK_CATEGORY_ICON_MAP: Record<number, React.ReactNode> = {
    1: <RestaurantOutlinedIcon sx={{ fontSize: 18 }} />,
    2: <LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />,
    3: <ScienceOutlinedIcon sx={{ fontSize: 18 }} />,
};

const MOCK_CATEGORIES: CategoryNode[] = [
    {
        id: 1,
        label: "ค่าอาหาร",
        children: [
            {
                id: 11,
                code: "",
                description: "อาหารผู้ป่วยในปกติ",
                children: [{ id: 111, code: "2.4", description: "ค่าอาหารเพื่อวัตถุประสงค์อื่น" }],
            },
            {
                id: 12,
                code: "",
                description: "อาหารทางการแพทย์ - ICU",
                children: [{ id: 121, code: "2.3.2", description: "อาหารทางการแพทย์" }],
            },
            {
                id: 13,
                code: "",
                description: "อาหารที่มีวัตถุประสงค์พิเศษอื่นๆ - ICU",
                children: [{ id: 131, code: "2.5", description: "ค่าผลิตภัณฑ์เสริมอาหาร" }],
            },
        ],
    },
    {
        id: 2,
        label: "การพยาบาล",
        children: [
            {
                id: 21,
                code: "",
                description: "ค่าบริการทางการพยาบาล",
                children: [
                    { id: 211, code: "3.1.1", description: "ค่าบริการพยาบาลทั่วไป" },
                    { id: 212, code: "3.1.2", description: "ค่าบริการพยาบาลพิเศษ" },
                ],
            },
        ],
    },
    {
        id: 3,
        label: "การรักษาโดยการผ่าตัด",
        children: [
            {
                id: 31,
                code: "",
                description: "ค่าผู้ประกอบวิชาชีพเวชกรรม ทำศัลยกรรมและหัตถการ",
                children: [{ id: 311, code: "4.1.1", description: "ค่าแพทย์ผ่าตัด" }],
            },
            {
                id: 32,
                code: "",
                description: "ค่าเครื่องมือแพทย์ในห้องผ่าตัด",
                children: [{ id: 321, code: "4.2.1", description: "ค่าเครื่องมือและอุปกรณ์การผ่าตัด" }],
            },
            {
                id: 33,
                code: "",
                description: "ค่าห้องผ่าตัดและห้องคลอด",
                children: [{ id: 331, code: "4.3.1", description: "ค่าห้องผ่าตัด" }],
            },
            {
                id: 34,
                code: "",
                description: "ค่าผู้ประกอบวิชาชีพเวชกรรม วิสัญญีแพทย์",
                children: [{ id: 341, code: "4.4.1", description: "ค่าแพทย์วิสัญญี" }],
            },
        ],
    },
];

// ─── Recursive tree row (รองรับ children ซ้อนได้หลายชั้น) ──────────
const TreeNodeRow: React.FC<{
    node: TreeLeaf;
    depth?: number;
    expandedIds: number[];
    onToggle: (id: number) => void;
    onSelectLeaf: (leaf: TreeLeaf) => void;
    selectedLeafId: number | null;
}> = ({ node, depth = 0, expandedIds, onToggle, onSelectLeaf, selectedLeafId }) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expandedIds.includes(node.id);
    const isSelected = !hasChildren && selectedLeafId === node.id;

    return (
        <>
            <Box
                onClick={() => (hasChildren ? onToggle(node.id) : onSelectLeaf(node))}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pl: 1.5 + depth * 2,
                    pr: 1.5,
                    py: 0.9,
                    cursor: "pointer",
                    mx: 0.5,
                    my: 0.25,
                    borderRadius: 1,
                    bgcolor: isSelected ? REF.soft : "transparent",
                    "&:hover": { bgcolor: isSelected ? REF.soft : "grey.100" },
                }}
            >
                {hasChildren ? (
                    <Box sx={{ mr: 0.75, display: "flex", color: REF.primary }}>
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
                            borderColor: isSelected ? REF.primary : "grey.400",
                            bgcolor: isSelected ? REF.primary : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {isSelected && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />}
                    </Box>
                )}
                <Typography
                    variant="body2"
                    fontWeight={hasChildren ? 700 : 400}
                    color={hasChildren ? REF.primaryDark : REF.primary}
                >
                    {hasChildren ? node.description : `${node.code}  ${node.description}`}
                </Typography>
            </Box>

            {hasChildren && (
                <Collapse in={isExpanded}>
                    {node.children!.map((child) => (
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

const MOCK_REASON_LIST_FOR_ADD = [
    { value: 1, label: "เกินวงเงินความคุ้มครอง" },
    { value: 2, label: "ไม่อยู่ในเงื่อนไขกรมธรรม์" },
];

const refInputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: "#fff",
        fontSize: 14,
        "& fieldset": { borderColor: "#c9d6e4" },
        "&:hover fieldset": { borderColor: REF.primary },
        "&.Mui-focused fieldset": { borderColor: REF.primary, borderWidth: 1.5 },
    },
};

const formSelectSx = {
    fontSize: 14,
    borderRadius: "8px",
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#c9d6e4" },
};

const MOCK_INSURANCE_COMPANIES = [
    "บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)",
    "บริษัท คุ้มภัยประกันภัย จำกัด มหาชน",
    "บริษัท ชับบ์สามัคคีประกันภัย จำกัด (มหาชน)",
    "บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)",
    "บริษัท วิริยะประกันภัย จำกัด (มหาชน)",
    "บริษัท เออร์โกประกันภัย (ประเทศไทย) จำกัด (มหาชน)",
    "บริษัท เอไอจี ประกันภัย (ประเทศไทย) จำกัด (มหาชน)",
    "รออนุมัติ",
];

const fmt = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2 });

const headCell = {
    fontWeight: 700,
    fontSize: 13,
    bgcolor: REF.soft,
    color: REF.primaryDark,
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
    py: 1.25,
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

// ─── Main ─────────────────────────────────────────────────────────
const ExpenseRecords: React.FC = () => {
    const [items, setItems] = useState<ExpenseItem[]>(MOCK_ITEMS);
    const [isExcessFromInsurance, setIsExcessFromInsurance] = useState(false);
    const [selectedInsuranceCompany, setSelectedInsuranceCompany] = useState("");

    // ── รายการค่ารักษาเพิ่มเติม ──
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([1, 2, 3, 11, 12, 13]);
    const [selectedLeaf, setSelectedLeaf] = useState<TreeLeaf | null>(null);
    const [pendingAmount, setPendingAmount] = useState("");
    const [pendingDiscount, setPendingDiscount] = useState("");
    const [pendingNotCovered, setPendingNotCovered] = useState("");
    const [pendingReason, setPendingReason] = useState<number | "">("");
    const [pendingRemark, setPendingRemark] = useState("");

    const handleUpdateItem = (updated: ExpenseItem) => {
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    };

    const handleRemoveItem = (id: number) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const handleToggleExpand = (id: number) => {
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSelectLeaf = (leaf: TreeLeaf) => {
        setSelectedLeaf(leaf);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason("");
        setPendingRemark("");
    };

    // กรอง tree แบบ recursive — เก็บกิ่งไว้ถ้าตัวมันเองหรือลูกหลานตรงกับคำค้นหา
    const filterTree = (nodes: TreeLeaf[], q: string): TreeLeaf[] =>
        nodes.reduce<TreeLeaf[]>((filtered, node) => {
            const selfMatch = node.description.toLowerCase().includes(q) || node.code.toLowerCase().includes(q);
            const filteredChildren = node.children ? filterTree(node.children, q) : undefined;
            if (selfMatch || (filteredChildren && filteredChildren.length > 0)) {
                filtered.push({ ...node, children: selfMatch ? node.children : filteredChildren });
            }
            return filtered;
        }, []);

    const filteredCategories = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return MOCK_CATEGORIES;
        return MOCK_CATEGORIES.map((cat) => ({
            ...cat,
            children: filterTree(cat.children, q),
        })).filter((cat) => cat.label.toLowerCase().includes(q) || cat.children.length > 0);
    }, [searchText]);

    // ตอนค้นหา ให้ auto-expand ทุกกิ่งที่มีผลลัพธ์ ผู้ใช้ไม่ต้องกดเปิดเอง
    const autoExpandedIds = useMemo(() => {
        if (!searchText.trim()) return expandedIds;
        const ids: number[] = [];
        const collect = (nodes: TreeLeaf[]) => {
            nodes.forEach((n) => {
                if (n.children?.length) {
                    ids.push(n.id);
                    collect(n.children);
                }
            });
        };
        filteredCategories.forEach((cat) => {
            ids.push(cat.id);
            collect(cat.children);
        });
        return ids;
    }, [searchText, filteredCategories, expandedIds]);

    const pendingDiscountError =
        pendingDiscount && pendingAmount && Number(pendingDiscount) > Number(pendingAmount)
            ? "ส่วนลดต้องไม่มากกว่ายอดเบิก"
            : "";
    const pendingNotCoveredError =
        pendingNotCovered && pendingAmount && Number(pendingNotCovered) > Number(pendingAmount)
            ? "ยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิก"
            : "";

    const handleAddToTable = () => {
        if (!selectedLeaf || !pendingAmount) return;
        if (pendingDiscountError || pendingNotCoveredError) return;

        const newItem: ExpenseItem = {
            id: Date.now(),
            code: selectedLeaf.code,
            description: selectedLeaf.description,
            receiptAmount: Number(pendingAmount) || 0,
            eligibleAmount: Number(pendingAmount) || 0,
            discount: Number(pendingDiscount) || 0,
            notCovered: Number(pendingNotCovered) || 0,
            reason: pendingReason === "" ? undefined : Number(pendingReason),
            remark: pendingRemark,
        };
        setItems((prev) => [...prev, newItem]);
        setSelectedLeaf(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason("");
        setPendingRemark("");
    };

    const totals = useMemo(() => {
        const totalReceipt = items.reduce((s, i) => s + Number(i.receiptAmount || 0), 0);
        const totalDiscount = items.reduce((s, i) => s + Number(i.discount || 0), 0);
        const totalNotCovered = items.reduce((s, i) => s + Number(i.notCovered || 0), 0);
        const netAmount = totalReceipt - totalDiscount - totalNotCovered;
        // ยอดเงินโอน = ผลรวมสิทธิ์เบิก หักส่วนลด/ไม่คุ้มครอง (mock logic ตามภาพตัวอย่าง)
        const totalEligible = items.reduce((s, i) => s + Number(i.eligibleAmount || 0), 0);
        const transferAmount = totalEligible - totalDiscount - totalNotCovered;
        return { totalReceipt, totalDiscount, totalNotCovered, netAmount, transferAmount };
    }, [items]);

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Typography fontWeight={700} color={REF.primaryDark} fontSize={16} mb={1.5}>
                รายการค่ารักษา(เบื้องต้น)
            </Typography>

            <TableContainer
                sx={{
                    border: "1px solid",
                    borderColor: REF.line,
                    borderRadius: 1.5,
                    maxHeight: 460,
                }}
            >
                <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headCell, width: "24%", textAlign: "left" }}>รายการค่ารักษา</TableCell>
                            <TableCell sx={{ ...headCell, width: "12%" }}>ยอดเงินตามใบเสร็จ</TableCell>
                            <TableCell sx={{ ...headCell, width: "12%" }}>สิทธิ์เบิก</TableCell>
                            <TableCell sx={{ ...headCell, width: "10%" }}>ส่วนลด</TableCell>
                            <TableCell sx={{ ...headCell, width: "12%" }}>ยอดไม่คุ้มครอง</TableCell>
                            <TableCell sx={{ ...headCell, width: "16%" }}>สาเหตุไม่คุ้มครอง</TableCell>
                            <TableCell sx={{ ...headCell, width: "14%" }}>หมายเหตุ</TableCell>
                            <TableCell sx={{ ...headCell, width: 40 }}>ลบ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} sx={{ textAlign: "center", py: 2, color: "text.disabled" }}>
                                    ไม่พบรายการ
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ ...bodyCell, textAlign: "left" }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {item.code} {item.description}
                                        </Typography>
                                    </TableCell>

                                    {/* ยอดเงินตามใบเสร็จ */}
                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={tableInputSx}
                                            value={item.receiptAmount || ""}
                                            placeholder="0.00"
                                            type="number"
                                            onChange={(e) =>
                                                handleUpdateItem({
                                                    ...item,
                                                    receiptAmount: Number(e.target.value),
                                                })
                                            }
                                            inputProps={{ min: 0 }}
                                        />
                                    </TableCell>

                                    {/* สิทธิ์เบิก */}
                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={tableInputSx}
                                            value={item.eligibleAmount || ""}
                                            placeholder="0.00"
                                            type="number"
                                            onChange={(e) =>
                                                handleUpdateItem({
                                                    ...item,
                                                    eligibleAmount: Number(e.target.value),
                                                })
                                            }
                                            inputProps={{ min: 0 }}
                                        />
                                    </TableCell>

                                    {/* ส่วนลด */}
                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={tableInputSx}
                                            value={item.discount || ""}
                                            placeholder="0.00"
                                            type="number"
                                            onChange={(e) =>
                                                handleUpdateItem({
                                                    ...item,
                                                    discount: Number(e.target.value),
                                                })
                                            }
                                            inputProps={{ min: 0 }}
                                        />
                                    </TableCell>

                                    {/* ยอดไม่คุ้มครอง */}
                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            sx={tableInputSx}
                                            value={item.notCovered || ""}
                                            placeholder="0.00"
                                            type="number"
                                            onChange={(e) =>
                                                handleUpdateItem({
                                                    ...item,
                                                    notCovered: Number(e.target.value),
                                                })
                                            }
                                            inputProps={{ min: 0 }}
                                        />
                                    </TableCell>

                                    {/* สาเหตุไม่คุ้มครอง */}
                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                        <Select
                                            displayEmpty
                                            fullWidth
                                            value={item.reason ?? ""}
                                            sx={tableSelectSx}
                                            onChange={(e) =>
                                                handleUpdateItem({
                                                    ...item,
                                                    reason: e.target.value === "" ? undefined : Number(e.target.value),
                                                })
                                            }
                                        >
                                            <MenuItem value="">
                                                <em style={{ color: "#9aa5b1" }}>สาเหตุไม่คุ้มครอง</em>
                                            </MenuItem>
                                            {MOCK_REASON_OPTIONS.map((o) => (
                                                <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>
                                                    {o.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>

                                    {/* หมายเหตุ */}
                                    <TableCell sx={{ ...bodyCell, p: 0.5 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="หมายเหตุ"
                                            sx={tableInputSx}
                                            value={item.remark}
                                            onChange={(e) => handleUpdateItem({ ...item, remark: e.target.value })}
                                        />
                                    </TableCell>

                                    {/* ลบ */}
                                    <TableCell sx={{ ...bodyCell, textAlign: "center", p: 0.5 }}>
                                        <IconButton
                                            size="small"
                                            sx={{ bgcolor: "#fff1f0", color: "#d92d20", borderRadius: 6 }}
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── สรุปยอดเงิน ── */}
            <Box
                sx={{
                    mt: 2.5,
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
                    {/* แถวตัวเลขสรุป: responsive grid — พับเป็นคอลัมน์เดียวบนจอเล็ก */}
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
                            { label: "ยอดเงินตามใบเสร็จรวม", value: totals.totalReceipt },
                            { label: "ส่วนลดรวม", value: totals.totalDiscount },
                            { label: "ยอดไม่คุ้มครองรวม", value: totals.totalNotCovered },
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

                        {/* กลุ่มยอดเงินสุทธิ / ยอดเงินโอน — เน้นด้วยสี ให้แยกจากตัวเลขทั่วไปชัดเจน */}
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
                                    {fmt(totals.netAmount)}{" "}
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
                                    {fmt(totals.transferAmount)}{" "}
                                    <Typography component="span" variant="caption">
                                        บาท
                                    </Typography>
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

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
                                            <em style={{ color: "#9aa5b1" }}>---เลือกบริษัทประกัน---</em>
                                        </MenuItem>
                                        {MOCK_INSURANCE_COMPANIES.map((name) => (
                                            <MenuItem key={name} value={name} sx={{ fontSize: 14 }}>
                                                {name}
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

            {/* ── รายการค่ารักษาเพิ่มเติม (แสดงตลอด ไม่ต้องเปิด/ปิด) ── */}
            <Box
                sx={{
                    mt: 2.5,
                    border: "1px solid",
                    borderColor: REF.line,
                    borderRadius: 1.5,
                    p: { xs: 1.5, sm: 2 },
                    boxShadow: "0 2px 8px rgba(31,64,104,.06)",
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
                        onClick={() => setShowAddPanel((v) => !v)}
                        sx={{ borderRadius: 1, fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                        {showAddPanel ? "ซ่อน" : "เพิ่มรายการค่ารักษา"}
                    </Button>
                </Box>

                <Collapse in={showAddPanel}>
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
                                borderColor: REF.line,
                                borderRadius: 1.5,
                                overflow: "hidden",
                            }}
                        >
                            <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="ค้นหารายการค่ารักษา เช่น ยา, ค่าแพทย์, ค่าห้อง"
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
                                                    bgcolor: autoExpandedIds.includes(cat.id) ? REF.soft : "white",
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
                                                    {MOCK_CATEGORY_ICON_MAP[cat.id] ?? (
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
                                                {autoExpandedIds.includes(cat.id) ? (
                                                    <ExpandLessIcon sx={{ fontSize: 18, color: REF.primaryDark }} />
                                                ) : (
                                                    <ExpandMoreIcon sx={{ fontSize: 18, color: REF.primaryDark }} />
                                                )}
                                            </Box>
                                            <Collapse in={autoExpandedIds.includes(cat.id)}>
                                                <Box sx={{ bgcolor: "grey.50" }}>
                                                    {cat.children.map((child) => (
                                                        <TreeNodeRow
                                                            key={child.id}
                                                            node={child}
                                                            depth={0}
                                                            expandedIds={autoExpandedIds}
                                                            onToggle={handleToggleExpand}
                                                            onSelectLeaf={handleSelectLeaf}
                                                            selectedLeafId={selectedLeaf?.id ?? null}
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
                                borderColor: REF.line,
                                borderRadius: 1.5,
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
                                value={selectedLeaf ? `${selectedLeaf.code}  ${selectedLeaf.description}` : ""}
                                placeholder="ยังไม่ได้เลือกรายการ — เลือกจากรายการทางซ้าย"
                                InputProps={{ readOnly: true }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                        backgroundColor: "#fff",
                                        minHeight: 40,
                                        fontSize: 13,
                                        "& fieldset": { borderColor: "#c9d6e4" },
                                    },
                                    "& .MuiInputBase-input": { color: REF.primary },
                                }}
                            />

                            <TextField
                                size="small"
                                fullWidth
                                type="number"
                                label="ยอดเบิก"
                                value={pendingAmount}
                                onChange={(e) => setPendingAmount(e.target.value)}
                                disabled={!selectedLeaf}
                                sx={refInputSx}
                                inputProps={{ min: 0 }}
                            />

                            <Box display="flex" gap={1.25} flexDirection={{ xs: "column", sm: "row" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
                                    label="ส่วนลด"
                                    value={pendingDiscount}
                                    onChange={(e) => setPendingDiscount(e.target.value)}
                                    disabled={!selectedLeaf}
                                    error={!!pendingDiscountError}
                                    helperText={pendingDiscountError}
                                    sx={refInputSx}
                                    inputProps={{ min: 0 }}
                                />
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
                                    label="ยอดไม่คุ้มครอง"
                                    value={pendingNotCovered}
                                    onChange={(e) => setPendingNotCovered(e.target.value)}
                                    disabled={!selectedLeaf}
                                    error={!!pendingNotCoveredError}
                                    helperText={pendingNotCoveredError}
                                    sx={refInputSx}
                                    inputProps={{ min: 0 }}
                                />
                            </Box>

                            <FormControl fullWidth size="small" disabled={!selectedLeaf}>
                                <InputLabel id="add-reason-label">สาเหตุไม่คุ้มครอง</InputLabel>
                                <Select
                                    labelId="add-reason-label"
                                    label="สาเหตุไม่คุ้มครอง"
                                    value={pendingReason}
                                    onChange={(e) =>
                                        setPendingReason(e.target.value === "" ? "" : Number(e.target.value))
                                    }
                                    sx={formSelectSx}
                                >
                                    <MenuItem value="">
                                        <em>-</em>
                                    </MenuItem>
                                    {MOCK_REASON_LIST_FOR_ADD.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>
                                            {o.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                                label="หมายเหตุ"
                                value={pendingRemark}
                                onChange={(e) => setPendingRemark(e.target.value)}
                                disabled={!selectedLeaf}
                                sx={refInputSx}
                            />

                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<AddBoxOutlinedIcon />}
                                onClick={handleAddToTable}
                                disabled={
                                    !selectedLeaf ||
                                    !pendingAmount ||
                                    !!pendingDiscountError ||
                                    !!pendingNotCoveredError
                                }
                                sx={{ borderRadius: 1.5, fontWeight: 700, mt: "auto" }}
                                size="medium"
                            >
                                เพิ่มลงในตาราง
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </Box>
        </Box>
    );
};

export default ExpenseRecords;

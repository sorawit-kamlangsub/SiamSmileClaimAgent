import React, { useMemo, useState } from "react";
import {
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type ExclusionType = "GENERAL" | "WAITING_120";

type ExclusionItem = {
    id: number;
    name: string;
    type: ExclusionType;
};

type FilterValue = "ALL" | ExclusionType;

type Props = {
    open: boolean;
    onClose: () => void;
    productTypeLabel?: string; // e.g. "PH" | "PA"
};

const EXCLUSION_TYPE_LABEL: Record<ExclusionType, string> = {
    GENERAL: "โรคยกเว้นทั่วไป",
    WAITING_120: "โรคยกเว้น120วัน",
};

const EXCLUSION_TYPE_COLOR: Record<ExclusionType, { bg: string; color: string }> = {
    GENERAL: { bg: "#eaf5ff", color: "#1a5da8" },
    WAITING_120: { bg: "#fff6e0", color: "#e8971f" },
};

// mock data
const MOCK_EXCLUSIONS: ExclusionItem[] = [
    {
        id: 1,
        name: "การกระทำที่หวังผลต่อความสวยงาม เช่น แพ้เครื่องสำอาง แพ้ยาจากการฉีดยาสลายไขมัน / ศัลยกรรม",
        type: "GENERAL",
    },
    { id: 2, name: "การก่อการร้าย", type: "GENERAL" },
    {
        id: 3,
        name: "การฆ่าตัวตาย การพยายามฆ่าตัวตาย การทำร้ายร่างกายตนเอง หรือการพยายามทำร้ายร่างกายตนเองไม่ว่าจะเป็นการกระทำโดยเจตนาหรือไม่ก็ตาม",
        type: "GENERAL",
    },
    {
        id: 4,
        name: "การตรวจรักษา หรือการป้องกัน การใช้ยาหรือสารต่างๆ เพื่อชะลอการเสื่อมของวัย หรือการให้ฮอร์โมนทดแทนในวัยใกล้หมดหรือหมดระดู",
        type: "GENERAL",
    },
    {
        id: 5,
        name: "การรักษาโรคเกี่ยวกับสายตา การใส่แว่นตา หรือการรักษาความผิดปกติของสายตาด้วยเลเซอร์",
        type: "GENERAL",
    },
    { id: 6, name: "การรักษาฟันและการทำฟัน ยกเว้นการรักษาที่จำเป็นอันเนื่องมาจากอุบัติเหตุ", type: "GENERAL" },
    { id: 7, name: "ริดสีดวงทวาร (เว้นแต่กรณีฉุกเฉิน) ต้อเนื้อ หรือต้อลม นิ่วทุกชนิด", type: "WAITING_120" },
    { id: 8, name: "เนื้องอกทุกชนิด ถุงน้ำ หรือมะเร็งทุกชนิด", type: "WAITING_120" },
    { id: 9, name: "การตัดทอนซิล หรืออดีนอยด์ ต่อมทอนซิลอักเสบเรื้อรัง", type: "WAITING_120" },
    { id: 10, name: "เยื่อบุโพรงมดลูกเจริญผิดที่ ถุงน้ำในรังไข่ เนื้องอกในมดลูก", type: "WAITING_120" },
    { id: 11, name: "การบาดเจ็บจากกีฬาอันตราย เช่น ปีนเขา ดำน้ำลึก แข่งรถ", type: "GENERAL" },
    { id: 12, name: "ไส้เลื่อนทุกชนิด", type: "WAITING_120" },
    { id: 13, name: "การใช้ยาเสพติดให้โทษ หรือสารออกฤทธิ์ต่อจิตประสาท", type: "GENERAL" },
    { id: 14, name: "นิ่วในถุงน้ำดี นิ่วในไต นิ่วในกระเพาะปัสสาวะ", type: "WAITING_120" },
];

const ROWS_PER_PAGE = 10;

const PolicyConditionExclusionModal: React.FC<Props> = ({ open, onClose, productTypeLabel = "PH" }) => {
    const [keyword, setKeyword] = useState("");
    const [filter, setFilter] = useState<FilterValue>("ALL");
    const [page, setPage] = useState(1);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const counts = useMemo(
        () => ({
            ALL: MOCK_EXCLUSIONS.length,
            GENERAL: MOCK_EXCLUSIONS.filter((item) => item.type === "GENERAL").length,
            WAITING_120: MOCK_EXCLUSIONS.filter((item) => item.type === "WAITING_120").length,
        }),
        []
    );

    const filteredItems = useMemo(() => {
        const trimmedKeyword = keyword.trim();
        return MOCK_EXCLUSIONS.filter((item) => {
            const matchType = filter === "ALL" || item.type === filter;
            const matchKeyword = !trimmedKeyword || item.name.includes(trimmedKeyword);
            return matchType && matchKeyword;
        });
    }, [keyword, filter]);

    const pageCount = Math.max(1, Math.ceil(filteredItems.length / ROWS_PER_PAGE));
    const pagedItems = filteredItems.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
    const rangeStart = filteredItems.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
    const rangeEnd = Math.min(page * ROWS_PER_PAGE, filteredItems.length);

    const handleFilterChange = (value: FilterValue) => {
        setFilter(value);
        setPage(1);
    };

    const handleKeywordChange = (value: string) => {
        setKeyword(value);
        setPage(1);
    };

    const handleClose = () => {
        setKeyword("");
        setFilter("ALL");
        setPage(1);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
            <DialogTitle sx={{ pb: 1.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6" fontWeight={700}>
                                เงื่อนไขและข้อยกเว้นของกรมธรรม์
                            </Typography>
                            <Chip
                                label={productTypeLabel}
                                size="small"
                                sx={{ bgcolor: "#eaf5ff", color: "#1a5da8", fontWeight: 700 }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" mt={0.25}>
                            รายการโรคยกเว้นตามกรมธรรม์ ({productTypeLabel})
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ bgcolor: "#eaf5ff", borderRadius: 1.5, p: 1.5, mb: 2 }}
                >
                    <InfoOutlinedIcon sx={{ color: "#1a5da8", fontSize: 20 }} />
                    <Typography variant="caption" color="#1a5da8">
                        หมายเหตุ: รายการนี้ใช้ประกอบการตรวจสอบสิทธิ์เบื้องต้น
                        กรุณาพิจารณาร่วมกับเงื่อนไขกรมธรรม์และข้อมูลวันที่เริ่มคุ้มครอง
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    size="small"
                    placeholder="ค้นหาชื่อโรค อาการ หรือคำสำคัญ..."
                    value={keyword}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="disabled" />
                            </InputAdornment>
                        ),
                        endAdornment: keyword && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => handleKeywordChange("")}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <FilterButton
                        label="ทั้งหมด"
                        count={counts.ALL}
                        isSelected={filter === "ALL"}
                        onClick={() => handleFilterChange("ALL")}
                    />
                    <FilterButton
                        label={EXCLUSION_TYPE_LABEL.GENERAL}
                        count={counts.GENERAL}
                        isSelected={filter === "GENERAL"}
                        onClick={() => handleFilterChange("GENERAL")}
                    />
                    <FilterButton
                        label={EXCLUSION_TYPE_LABEL.WAITING_120}
                        count={counts.WAITING_120}
                        isSelected={filter === "WAITING_120"}
                        onClick={() => handleFilterChange("WAITING_120")}
                    />
                </Box>

                <TableContainer sx={{ maxHeight: 360, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, width: 72 }}>ลำดับ</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>รายการโรค / เงื่อนไขยกเว้น</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: 160 }}>ประเภท</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pagedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        ไม่พบข้อมูลที่ค้นหา
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagedItems.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{(page - 1) * ROWS_PER_PAGE + index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={EXCLUSION_TYPE_LABEL[item.type]}
                                                size="small"
                                                sx={{
                                                    bgcolor: EXCLUSION_TYPE_COLOR[item.type].bg,
                                                    color: EXCLUSION_TYPE_COLOR[item.type].color,
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        แสดง {rangeStart} - {rangeEnd} จาก {filteredItems.length} รายการ
                    </Typography>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        size="small"
                        shape="rounded"
                    />
                </Box>
            </DialogContent>

            {/* <Box display="flex" justifyContent="flex-end" px={3} pb={2.5}>
                <Chip
                    label="ปิด"
                    onClick={handleClose}
                    sx={{
                        bgcolor: "#1a5da8",
                        color: "#fff",
                        fontWeight: 600,
                        px: 2,
                        height: 34,
                        borderRadius: 1,
                        "&:hover": { bgcolor: "#154a8a" },
                    }}
                />
            </Box> */}
        </Dialog>
    );
};

type FilterButtonProps = {
    label: string;
    count: number;
    isSelected: boolean;
    onClick: () => void;
};

const FilterButton: React.FC<FilterButtonProps> = ({ label, count, isSelected, onClick }) => (
    <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            cursor: "pointer",
            userSelect: "none",
            border: "1px solid",
            borderColor: isSelected ? "primary.main" : "divider",
            borderRadius: "10px",
            px: 1.75,
            py: 0.75,
            bgcolor: isSelected ? "#eaf5ff" : "background.paper",
            transition: "all .15s ease",
            "&:hover": { borderColor: "primary.main", bgcolor: "#eaf5ff" },
        }}
    >
        <Typography
            variant="body2"
            fontWeight={isSelected ? 700 : 600}
            color={isSelected ? "primary.main" : "text.secondary"}
        >
            {label}
        </Typography>
        <Chip
            label={count}
            size="small"
            sx={{
                height: 20,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: isSelected ? "primary.main" : "action.selected",
                color: isSelected ? "#fff" : "text.secondary",
            }}
        />
    </Box>
);

export default PolicyConditionExclusionModal;


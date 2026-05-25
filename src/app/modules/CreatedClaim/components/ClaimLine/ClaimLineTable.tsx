import React, { memo, useCallback } from "react";
import {
    Box,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAppDispatch } from "../../../../../redux";
import { ClaimLineItem, updateItem } from "../../store/claimLineSlice";
import { useClaimLineFilter } from "../../hooks/ClaimLine/useClaimLineFilter";

interface Props {
    items: ClaimLineItem[];
    reasonOptions: { value: string; label: string }[];
    onlineClaimAmount: number;
}

const ROW_BORDER_COLORS: Record<string, string> = {
    "#FFD6D6": "#e57373",
    "#FFFACC": "#ffd54f",
    "#EDD6FF": "#ba68c8",
    "#D6FFE0": "#66bb6a",
    "#E0E0E0": "#9e9e9e",
    "#D6F5FF": "#4fc3f7",
};

// ── CellInput ───────────────────────────────────────────────────────────────
const CellInput = memo(
    ({
        id,
        field,
        value,
        disabled,
    }: {
        id: number;
        field: "claimAmount" | "discount" | "notCovered" | "remark";
        value: number | string | undefined;
        disabled: boolean | undefined;
    }) => {
        const dispatch = useAppDispatch();

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                dispatch(updateItem({ id, field, value: e.target.value }));
            },
            [id, field, dispatch]
        );

        return (
            <TextField
                value={value ?? ""}
                onChange={handleChange}
                disabled={disabled ?? false}
                size="small"
                variant="outlined"
                inputProps={{
                    style: { padding: "4px 8px", fontSize: 13, textAlign: field === "remark" ? "left" : "right" },
                    inputMode: "decimal",
                    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (field === "remark") return;
                        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
                        const cur = e.currentTarget.value;
                        const hasDecimal = cur.includes(".");
                        const [, dec] = cur.split(".");
                        if (allowed.includes(e.key)) return;
                        if (e.key === "." && !hasDecimal) return;
                        if (/^\d$/.test(e.key)) {
                            if (hasDecimal && dec?.length >= 2) {
                                e.preventDefault();
                                return;
                            }
                            return;
                        }
                        e.preventDefault();
                    },
                    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                        if (field === "remark") return;
                        const num = parseFloat(e.target.value);
                        if (!isNaN(num)) dispatch(updateItem({ id, field, value: num.toFixed(2) }));
                        // dispatch(calculateSummary());  //automatic calculate
                    },
                }}
                sx={{
                    width: field === "remark" ? "100%" : 90,
                    "& .MuiOutlinedInput-root": {
                        bgcolor: disabled ? "#e0e0e0" : "#fff",
                        "& fieldset": { borderColor: "#bbb" },
                    },
                }}
            />
        );
    },
    (prev, next) => prev.id === next.id && prev.value === next.value && prev.disabled === next.disabled
);

// ── CellSelect ───────────────────────────────────────────────────────────────
const CellSelect = memo(
    ({
        id,
        value,
        disabled,
        options,
    }: {
        id: number;
        value: number | undefined;
        disabled: boolean | undefined;
        options: { value: string; label: string }[];
    }) => {
        const dispatch = useAppDispatch();
        const handleChange = useCallback(
            (e: any) => {
                dispatch(updateItem({ id, field: "reason", value: e.target.value }));
            },
            [id, dispatch]
        );

        return (
            <Select
                value={value ?? ""}
                onChange={handleChange}
                disabled={disabled ?? false}
                size="small"
                sx={{
                    width: 170,
                    fontSize: 13,
                    height: 29,
                    mt: "3px",
                    bgcolor: disabled ? "#e0e0e0" : "#fff",
                    "& .MuiSelect-select": { py: "2px", px: "6px" },
                }}
            >
                {options.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>
                        {o.label}
                    </MenuItem>
                ))}
            </Select>
        );
    },
    (prev, next) => prev.id === next.id && prev.value === next.value && prev.disabled === next.disabled
);

const ClaimLineTable: React.FC<Props> = ({ reasonOptions, onlineClaimAmount }) => {
    const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    const { pagedItems, totalItems, totalAllItems, page, setPage, totalPages, searchText, handleSearch, PAGE_SIZE } =
        useClaimLineFilter();

    const headerSx = {
        bgcolor: "#1a6ba0",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        py: 1,
        px: 1,
        whiteSpace: "nowrap" as const,
        borderRight: "1px solid #ffffff44",
    };

    return (
        <Paper variant="outlined">
            <Box
                px={1.5}
                py={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "#fff" }}
            >
                <TextField
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="ค้นหาเลขที่หรือรายการ..."
                    size="small"
                    sx={{ width: 400, ml: 1, bgcolor: "#fff" }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Typography variant="body2" color="text.secondary">
                    แสดง {pagedItems.length} รายการ
                    {searchText ? ` (กรองจาก ${totalItems})` : ""} / ทั้งหมด {totalAllItems} รายการ
                </Typography>
            </Box>

            {/* ── Table ── */}
            <TableContainer sx={{ maxHeight: "58vh", overflow: "auto" }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerSx, width: 100 }}>เลขที่</TableCell>
                            <TableCell sx={{ ...headerSx, minWidth: 300 }}>รายการ</TableCell>
                            <TableCell sx={{ ...headerSx, width: 100, textAlign: "center" }}>ยอดเบิก</TableCell>
                            <TableCell sx={{ ...headerSx, width: 100, textAlign: "center" }}>ส่วนลด</TableCell>
                            <TableCell sx={{ ...headerSx, width: 110, textAlign: "center" }}>ยอดไม่คุ้มครอง</TableCell>
                            <TableCell sx={{ ...headerSx, width: 170, textAlign: "center" }}>สาเหตุ</TableCell>
                            <TableCell sx={{ ...headerSx, minWidth: 200, textAlign: "center" }}>หมายเหตุ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pagedItems.map((item) => (
                            <TableRow
                                key={item.id} // ← key = item.id (index จริง) ไม่ใช่ loop index
                                sx={{
                                    bgcolor: item.color ?? "#fff",
                                    "& td": {
                                        borderBottom: `1px solid ${ROW_BORDER_COLORS[item.color ?? ""] ?? "#ccc"}50`,
                                    },
                                    "& td:first-of-type": {
                                        borderLeft: `4px solid ${ROW_BORDER_COLORS[item.color ?? ""] ?? "#ccc"}`,
                                    },
                                }}
                            >
                                <TableCell sx={{ fontSize: 13, py: 0.5, px: 1, fontWeight: 600 }}>
                                    {item.code}
                                </TableCell>
                                <TableCell sx={{ fontSize: 13, py: 0.5, px: 1 }}>{item.description}</TableCell>
                                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                                    <CellInput
                                        id={item.id}
                                        field="claimAmount"
                                        value={item.claimAmount}
                                        disabled={item.disabled}
                                    />
                                </TableCell>
                                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                                    <CellInput
                                        id={item.id}
                                        field="discount"
                                        value={item.discount}
                                        disabled={item.disabled}
                                    />
                                </TableCell>
                                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                                    <CellInput
                                        id={item.id}
                                        field="notCovered"
                                        value={item.notCovered}
                                        disabled={item.disabled}
                                    />
                                </TableCell>
                                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                                    <CellSelect
                                        id={item.id}
                                        value={item.reason}
                                        disabled={item.disabled}
                                        options={reasonOptions}
                                    />
                                </TableCell>
                                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                                    <CellInput
                                        id={item.id}
                                        field="remark"
                                        value={item.remark}
                                        disabled={item.disabled}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                    {/* ── Footer ── */}
                    <TableFooter>
                        <TableRow
                            sx={{
                                position: "sticky",
                                bottom: 0,
                                bgcolor: "#fff",
                                borderTop: "2px solid #1a6ba0",
                                zIndex: 2,
                            }}
                        >
                            <TableCell colSpan={2} sx={{ py: 1, px: 1 }}>
                                <Typography fontSize={14} color="text.secondary" fontWeight={600}>
                                    ยอดโอนเงิน
                                </Typography>
                            </TableCell>
                            <TableCell colSpan={5} sx={{ py: 1, px: 1 }}>
                                <Typography fontSize={14} fontWeight="bold" color="primary">
                                    {fmt(onlineClaimAmount ?? 0)}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                py={1}
                sx={{ borderTop: "1px solid #e0e0e0" }}
            >
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(_, p) => setPage(p - 1)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                />
                <Typography variant="caption" color="text.secondary" ml={2} mr={2}>
                    หน้า {page + 1} / {totalPages} ({PAGE_SIZE} รายการ/หน้า)
                </Typography>
            </Box>
        </Paper>
    );
};

export default ClaimLineTable;

import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
    Box,
    ListItemText,
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
    Autocomplete,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { ClaimLineItem, updateItem } from "../../store/claimLineSlice";
import { useClaimLineFilter } from "../../hooks/ClaimLine/useClaimLineFilter";
import { ClaimLineSearchOption, useClaimLineItemFilter } from "../../hooks/ClaimLine/useClaimLineItemFilter";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { useState } from "react";

interface Props {
    items: ClaimLineItem[];
    reasonOptions: { value: string; label: string }[];
    onlineClaimAmount: number;
    formatTypeId?: number;
    patientTypeId?: number;
}

const ROW_BORDER_COLORS: Record<string, string> = {
    "#FFD6D6": "#e57373",
    "#FFFACC": "#ffd54f",
    "#EDD6FF": "#ba68c8",
    "#D6FFE0": "#66bb6a",
    "#E0E0E0": "#9e9e9e",
    "#D6F5FF": "#4fc3f7",
};

// ── CellInput ────────────────────────────────────────────────────────────────
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
                    style: {
                        padding: "4px 8px",
                        fontSize: 13,
                        textAlign: field === "remark" ? "left" : "right",
                    },
                    inputMode: field === "remark" ? "text" : "decimal",
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
                        if (!isNaN(num)) {
                            dispatch(updateItem({ id, field, value: num.toFixed(2) }));
                        }
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

const SearchAutocomplete: React.FC<{
    onSelect: (option: ClaimLineSearchOption | null) => void;
}> = ({ onSelect }) => {
    const [inputValue, setInputValue] = useState("");

    const { data: options, isLoading } = useClaimLineItemFilter(inputValue);

    return (
        <Autocomplete
            options={options ?? []}
            getOptionLabel={(o) => `${o.code} - ${o.description}`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            loading={isLoading}
            loadingText="กำลังค้นหา..."
            noOptionsText="ไม่พบรายการ"
            onInputChange={(_, val, reason) => {
                setInputValue(val);
                if (reason === "clear" || val === "") onSelect(null);
            }}
            onChange={(_, val) => onSelect(val)}
            filterOptions={(x) => x}
            sx={{ width: 420 }}
            renderInput={(params) => (
                <TextField {...params} placeholder="ค้นหาเลขที่หรือรายการ..." size="small" sx={{ bgcolor: "#fff" }} />
            )}
            renderOption={(props, option) => {
                const { key, ...liProps } = props as any;
                return (
                    <li key={option.id} {...liProps}>
                        <ListItemText
                            primary={option.description}
                            secondary={option.code}
                            primaryTypographyProps={{ fontSize: 13 }}
                            secondaryTypographyProps={{ fontSize: 11 }}
                        />
                    </li>
                );
            }}
        />
    );
};

// ── ClaimLineTable ────────────────────────────────────────────────────────────
const ClaimLineTable: React.FC<Props> = ({ reasonOptions, onlineClaimAmount }) => {
    const renderStartRef = useRef(0);

    renderStartRef.current = performance.now();

    const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    const allItems = useAppSelector((s) => s.claimline.items);

    const { pagedItems, totalAllItems, page, setPage, totalPages, PAGE_SIZE, handleSearch, isPending } =
        useClaimLineFilter();

    useEffect(() => {
        const duration = performance.now() - renderStartRef.current;

        console.log(`[ClaimLineTable] render + commit: ${duration.toFixed(2)}ms | rows=${pagedItems.length}`);
    });

    const handleSelect = (option: ClaimLineSearchOption | null) => {
        if (!option) {
            handleSearch("");
            return;
        }
        handleSearch(option.code);

        const idx = allItems.findIndex((i) => i.id === option.id);
        if (idx !== -1) {
            setPage(Math.floor(idx / PAGE_SIZE));
        }
    };

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

    const rows = useMemo(() => {
        console.time("[ClaimLineTable] build rows");

        const mappedRows = pagedItems.map((item) => (
            <TableRow
                key={item.id}
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
                <TableCell sx={{ fontSize: 13, py: 0.5, px: 1, fontWeight: 600 }}>{item.code}</TableCell>
                <TableCell sx={{ fontSize: 13, py: 0.5, px: 1 }}>{item.description}</TableCell>
                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                    <CellInput id={item.id} field="claimAmount" value={item.claimAmount} disabled={item.disabled} />
                </TableCell>
                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                    <CellInput id={item.id} field="discount" value={item.discount} disabled={item.disabled} />
                </TableCell>
                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                    <CellInput id={item.id} field="notCovered" value={item.notCovered} disabled={item.disabled} />
                </TableCell>
                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                    <CellSelect id={item.id} value={item.reason} disabled={item.disabled} options={reasonOptions} />
                </TableCell>
                <TableCell sx={{ py: 0.5, px: 0.5 }}>
                    <CellInput id={item.id} field="remark" value={item.remark} disabled={item.disabled} />
                </TableCell>
            </TableRow>
        ));

        console.timeEnd("[ClaimLineTable] build rows");

        return mappedRows;
    }, [pagedItems, reasonOptions]);

    return (
        <Paper variant="outlined">
            {/* ── Search bar ── */}
            <Box
                px={1.5}
                py={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "#fff" }}
            >
                <SearchAutocomplete onSelect={handleSelect} />
                <Typography variant="body2" color="text.secondary">
                    แสดง {pagedItems.length} รายการ / ทั้งหมด {totalAllItems} รายการ
                </Typography>
            </Box>

            {/* ── Table ── */}
            <LinearLoading isLoading={isPending}>
                <TableContainer sx={{ maxHeight: "58vh", overflow: "auto" }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...headerSx, width: 100 }}>เลขที่</TableCell>
                                <TableCell sx={{ ...headerSx, minWidth: 300 }}>รายการ</TableCell>
                                <TableCell sx={{ ...headerSx, width: 100, textAlign: "center" }}>ยอดเบิก</TableCell>
                                <TableCell sx={{ ...headerSx, width: 100, textAlign: "center" }}>ส่วนลด</TableCell>
                                <TableCell sx={{ ...headerSx, width: 110, textAlign: "center" }}>
                                    ยอดไม่คุ้มครอง
                                </TableCell>
                                <TableCell sx={{ ...headerSx, width: 170, textAlign: "center" }}>สาเหตุ</TableCell>
                                <TableCell sx={{ ...headerSx, minWidth: 200, textAlign: "center" }}>หมายเหตุ</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {pagedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 1, color: "text.secondary" }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <Typography fontSize={15} fontWeight={600}>
                                                ไม่พบข้อมูล
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows
                            )}
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
            </LinearLoading>

            {/* ── Pagination ── */}
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
                    disabled={isPending}
                />
                <Typography variant="caption" color="text.secondary" ml={2} mr={2}>
                    หน้า {page + 1} / {totalPages} ({PAGE_SIZE} รายการ/หน้า)
                </Typography>
            </Box>
        </Paper>
    );
};

export default ClaimLineTable;

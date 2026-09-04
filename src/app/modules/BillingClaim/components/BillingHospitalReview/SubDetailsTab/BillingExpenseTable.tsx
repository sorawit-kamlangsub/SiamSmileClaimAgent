import { useState } from "react";
import { Box, Button, FormControl, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    handleFloatingInputChange,
    numberWithCommas,
} from "../../../../../functionHelpers";
import { useGetNonCoveredReason } from "../../../../../api/coreClaimMastersApi";
import { buildNewExpenseFormItem } from "../../../store/billingMappers";
import { BillingExpenseFormItem, BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingExpenseTableProps = {
    readOnly?: boolean;
};

/** Step 2 : ตารางรายการค่ารักษา — bind `values.expenses` (`BillingExpenseDto[]`, hospital-billing-fe.md ข้อ 5) */
const BillingExpenseTable = ({ readOnly = false }: BillingExpenseTableProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const items = formik.values.expenses;

    const { data: nonCoveredReasonData, isLoading: nonCoveredReasonLoading } = useGetNonCoveredReason();
    const nonCoveredReasonOptions = nonCoveredReasonData?.data ?? [];

    const [newExpenseId, setNewExpenseId] = useState("");
    const [newExpenseName, setNewExpenseName] = useState("");

    const updateItem = (rowKey: string, patch: Partial<BillingExpenseFormItem>) => {
        formik.setFieldValue(
            "expenses",
            items.map((item) => (item._rowKey === rowKey ? { ...item, ...patch } : item))
        );
    };

    /**
     * เพิ่มรายการใหม่ — API master ค่ารักษา (`useGetSimB`) ถูก gate ด้วย `productTypeId` ที่ Billing
     * detail ไม่มีให้ (endpoint นี้คืนแค่ insured ขั้นต่ำ) จึงให้ผู้ตรวจระบุ `standardMedicalExpenseId`
     * ตรง ๆ — `itemName` เป็นแค่ label ช่วยจำฝั่ง FE เท่านั้น BE จะเลือกชื่อจาก master ใหม่ตอน Submit
     * (handoff ข้อ 5) ไม่มีผลต่อข้อมูลจริง
     */
    const handleAdd = () => {
        const id = Number(newExpenseId);
        if (!id) return;
        formik.setFieldValue("expenses", [...items, buildNewExpenseFormItem(id, newExpenseName || `รายการ #${id}`)]);
        setNewExpenseId("");
        setNewExpenseName("");
    };

    const removeItem = (rowKey: string) => {
        formik.setFieldValue(
            "expenses",
            items.filter((item) => item._rowKey !== rowKey)
        );
    };

    const numberField = (value: number | undefined, onChange: (value: number) => void) => (
        <TextField
            size="small"
            value={value || ""}
            disabled={readOnly}
            onInput={handleFloatingInputChange}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
            sx={{ minWidth: 110 }}
        />
    );

    const columns: MUIDataTableColumn[] = [
        {
            name: "itemName",
            label: "รายการ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (value) => value ?? "-",
            },
        },
        {
            name: "claimAmount",
            label: "ยอดเบิก",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    return numberField(row.claimAmount, (v) => updateItem(row._rowKey, { claimAmount: v }));
                },
            },
        },
        {
            name: "discountAmount",
            label: "ส่วนลด",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    const exceeds = (row.discountAmount || 0) > (row.claimAmount || 0);
                    return (
                        <Box>
                            {numberField(row.discountAmount, (v) => updateItem(row._rowKey, { discountAmount: v }))}
                            {exceeds && (
                                <Typography variant="caption" color="error" display="block">
                                    ต้องไม่เกินยอดเบิก
                                </Typography>
                            )}
                        </Box>
                    );
                },
            },
        },
        {
            name: "nonCoveredAmount",
            label: "ยอดไม่คุ้มครอง",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    return numberField(row.nonCoveredAmount, (v) => updateItem(row._rowKey, { nonCoveredAmount: v }));
                },
            },
        },
        {
            name: "nonCoveredReasonId",
            label: "สาเหตุไม่คุ้มครอง",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    const required = (row.nonCoveredAmount || 0) > 0;
                    return (
                        <FormControl size="small" error={required && !row.nonCoveredReasonId} sx={{ minWidth: 200 }}>
                            <Select
                                displayEmpty
                                disabled={readOnly || nonCoveredReasonLoading}
                                value={row.nonCoveredReasonId ?? ""}
                                onChange={(e) =>
                                    updateItem(row._rowKey, {
                                        nonCoveredReasonId: (e.target.value as number) || undefined,
                                    })
                                }
                            >
                                <MenuItem value="">
                                    <em>{required ? "กรุณาเลือกสาเหตุ" : "-"}</em>
                                </MenuItem>
                                {nonCoveredReasonOptions.map((option) => (
                                    <MenuItem key={option.nonCoveredReasonId} value={option.nonCoveredReasonId}>
                                        {option.nonCoveredReasonName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    );
                },
            },
        },
        {
            name: "note",
            label: "หมายเหตุ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    return (
                        <TextField
                            size="small"
                            value={row.note ?? ""}
                            disabled={readOnly}
                            placeholder="ระบุหมายเหตุ"
                            onChange={(e) => updateItem(row._rowKey, { note: e.target.value })}
                            sx={{ minWidth: 180 }}
                        />
                    );
                },
            },
        },
        {
            name: "_delete",
            label: " ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    // ห้ามลบแถวเดิม (มี caseItemId จาก BE) — ลบได้เฉพาะแถวที่เพิ่งเพิ่มเอง (handoff ข้อ 5)
                    if (!row._isNew || readOnly) return null;
                    return (
                        <Tooltip title="ลบรายการ">
                            <IconButton size="small" color="error" onClick={() => removeItem(row._rowKey)}>
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    );
                },
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />} text="รายการค่ารักษา" color="blue" />

            <StandardDataTable
                name="billingExpenseTable"
                title=""
                data={items}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                displayFooter={false}
                options={defaultOptionStandardDataTable}
            />

            {!readOnly && (
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 2 }}>
                    <TextField
                        size="small"
                        label="รหัสรายการค่ารักษา"
                        value={newExpenseId}
                        onInput={handleFloatingInputChange}
                        onChange={(e) => setNewExpenseId(e.target.value)}
                        sx={{ width: 180 }}
                    />
                    <TextField
                        size="small"
                        label="คำอธิบาย (แสดงผลชั่วคราว)"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                        sx={{ minWidth: 240 }}
                    />
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        disabled={!newExpenseId}
                        onClick={handleAdd}
                    >
                        เพิ่มรายการค่ารักษาเพิ่มเติม
                    </Button>
                </Box>
            )}

            <Box sx={{ display: "flex", gap: 3, justifyContent: "flex-end", flexWrap: "wrap", mt: 2, px: 1 }}>
                <Typography variant="body2">
                    ยอดเบิกรวม :{" "}
                    <Typography component="span" fontWeight={700}>
                        {numberWithCommas(items.reduce((s, i) => s + (i.claimAmount || 0), 0))}
                    </Typography>
                </Typography>
                <Typography variant="body2">
                    ส่วนลดรวม :{" "}
                    <Typography component="span" fontWeight={700}>
                        {numberWithCommas(items.reduce((s, i) => s + (i.discountAmount || 0), 0))}
                    </Typography>
                </Typography>
                <Typography variant="body2">
                    ยอดไม่คุ้มครองรวม :{" "}
                    <Typography component="span" fontWeight={700} color="#B32615">
                        {numberWithCommas(items.reduce((s, i) => s + (i.nonCoveredAmount || 0), 0))}
                    </Typography>
                </Typography>
            </Box>
        </CustomPaper>
    );
};

export default BillingExpenseTable;

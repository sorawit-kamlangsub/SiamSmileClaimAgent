import React, { useMemo, useState } from "react";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import PersonIcon from "@mui/icons-material/Person";
import { useFormik } from "formik";
import { MUIDataTableColumn } from "mui-datatables";
import { PaginationSortableDto, PaginationResultDto } from "../../../_common";

export type HoldStatus = "normal" | "hold" | "userManaged";
export type ResultType = "autoPayDelay" | "holdPending" | "userManaged";

export interface HospitalPaySettingRow {
    hospitalId: string;
    hospitalName: string;
    isAutoPay: boolean;
    delayDays: number;
    holdStatus: HoldStatus;
    resultType: ResultType;
    updatedDate: string;
}

export interface UseHospitalPaySettingsTableHookProps {
    initialRows: HospitalPaySettingRow[];
    onSaveRow: (row: HospitalPaySettingRow) => void;
    onToggleHold: (hospitalId: string) => void;
    renderHistory: (hospitalId: string) => React.ReactNode;
}

const HoldStatusButton = ({ holdStatus, onClick }: { holdStatus: HoldStatus; onClick: () => void }) => {
    if (holdStatus === "userManaged") {
        return (
            <Box
                sx={{
                    backgroundColor: "#EAF4FC",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    color: "#455A64",
                }}
            >
                ปกติ
            </Box>
        );
    }

    const isHeld = holdStatus === "hold";

    return (
        <Box
            onClick={onClick}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                padding: "8px 12px",
                border: `1px solid ${isHeld ? "#E53935" : "#90CAF9"}`,
                backgroundColor: isHeld ? "#FDECEA" : "#EAF4FC",
                color: isHeld ? "#C62828" : "#1565C0",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
            }}
        >
            {isHeld ? <PauseCircleIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
            {isHeld ? "Hold — กดเพื่อปลด" : "ปกติ — กดเพื่อ Hold"}
        </Box>
    );
};

const ResultPill = ({ resultType, delayDays }: { resultType: ResultType; delayDays: number }) => {
    if (resultType === "autoPayDelay") {
        return (
            <Box
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                }}
            >
                <BoltIcon sx={{ fontSize: 16 }} />
                จ่ายอัตโนมัติหลัง {delayDays} วัน
            </Box>
        );
    }
    if (resultType === "holdPending") {
        return (
            <Box
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#FDECEA",
                    color: "#C62828",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                }}
            >
                <PauseCircleFilledIcon sx={{ fontSize: 16 }} />
                ระงับการจ่าย
            </Box>
        );
    }
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                padding: "6px 12px",
                backgroundColor: "#ECEFF1",
                color: "#607D8B",
                fontSize: "0.85rem",
                fontWeight: 600,
            }}
        >
            <PersonIcon sx={{ fontSize: 16 }} />
            ผู้ใช้งานดำเนินการเอง
        </Box>
    );
};

const useHospitalManagementDataTableHook = ({
    initialRows,
    onSaveRow,
    onToggleHold,
    renderHistory,
}: UseHospitalPaySettingsTableHookProps) => {
    // Controls which rows mui-datatables considers "expanded" — driven only
    // by the "ประวัติ" button in the last column, not the library's default
    // arrow column (hidden via CSS in the component, since the design has
    // no arrow column).
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });

    const formik = useFormik<{ rows: HospitalPaySettingRow[] }>({
        initialValues: { rows: initialRows },
        enableReinitialize: true,
        onSubmit: () => {},
    });

    const rows = formik.values.rows;

    // A row's "บันทึก" re-disables itself automatically if the user edits a
    // value then changes it back to what the API originally returned —
    // live comparison against initialRows, not a manual "touched" flag.
    const dirtyMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        rows.forEach((row) => {
            const original = initialRows.find((r) => r.hospitalId === row.hospitalId);
            map[row.hospitalId] =
                !!original && (original.isAutoPay !== row.isAutoPay || original.delayDays !== row.delayDays);
        });
        return map;
    }, [rows, initialRows]);

    const handleToggleAutoPay = (index: number, checked: boolean) => {
        formik.setFieldValue(`rows.${index}.isAutoPay`, checked);
    };

    const handleDelayDaysChange = (index: number, value: string) => {
        if (value !== "" && !/^\d*$/.test(value)) return;
        formik.setFieldValue(`rows.${index}.delayDays`, value === "" ? 0 : Number(value));
    };

    const handleToggleHistory = (index: number) => {
        setExpandedIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    const paginationResult: PaginationResultDto = {
        totalAmountRecords: rows.length,
        totalAmountPages: 1,
        currentPage: paginated.page,
        recordsPerPage: paginated.recordsPerPage,
        pageIndex: paginated.page ?? 0 - 1,
    };

    const columns: MUIDataTableColumn[] = [
        { name: "hospitalName", label: "สถานพยาบาล", options: { sort: false, filter: false } },
        {
            name: "isAutoPay",
            label: "จ่ายเงินอัตโนมัติ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Switch
                            checked={rows[rowIndex].isAutoPay}
                            onChange={(e) => handleToggleAutoPay(rowIndex, e.target.checked)}
                        />
                        <Typography sx={{ fontSize: "0.85rem", color: "#607D8B" }}>
                            {rows[rowIndex].isAutoPay ? "เปิด" : "ปิด"}
                        </Typography>
                    </Box>
                ),
            },
        },
        {
            name: "delayDays",
            label: "Delay (วัน)",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <TextField
                            size="small"
                            value={rows[rowIndex].delayDays}
                            onChange={(e) => handleDelayDaysChange(rowIndex, e.target.value)}
                            sx={{ width: "70px" }}
                            inputProps={{ style: { textAlign: "center" } }}
                        />
                        <Typography sx={{ fontSize: "0.85rem", color: "#607D8B" }}>วัน</Typography>
                    </Box>
                ),
            },
        },
        {
            name: "holdStatus",
            label: "สถานะ Hold",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => (
                    <HoldStatusButton
                        holdStatus={rows[rowIndex].holdStatus}
                        onClick={() => onToggleHold(rows[rowIndex].hospitalId)}
                    />
                ),
            },
        },
        {
            name: "resultType",
            label: "ผลการตั้งค่า",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => (
                    <ResultPill resultType={rows[rowIndex].resultType} delayDays={rows[rowIndex].delayDays} />
                ),
            },
        },
        {
            name: "updatedDate",
            label: "อัปเดตล่าสุด",
            options: { sort: false, filter: false },
        },
        {
            name: "",
            label: "บันทึกการตั้งค่า",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const row = rows[rowIndex];
                    return (
                        <Box sx={{ display: "flex", gap: "8px" }}>
                            <Button
                                size="small"
                                variant="outlined"
                                disabled={!dirtyMap[row.hospitalId]}
                                onClick={() => onSaveRow(row)}
                                sx={{ textTransform: "none" }}
                            >
                                บันทึก
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleToggleHistory(rowIndex)}
                                sx={{
                                    textTransform: "none",
                                    borderColor: "#1565C0",
                                    color: "#1565C0",
                                    fontWeight: 700,
                                }}
                            >
                                ประวัติ
                            </Button>
                        </Box>
                    );
                },
            },
        },
    ];

    const renderExpandableRow = (rowData: any, rowMeta: { dataIndex: number }) => {
        const colSpan = rowData.length + 1;
        return (
            <tr>
                <td colSpan={colSpan} style={{ backgroundColor: "#F5F8FC", padding: "16px 24px" }}>
                    {renderHistory(rows[rowMeta.dataIndex].hospitalId)}
                </td>
            </tr>
        );
    };

    return {
        rows,
        columns,
        paginated: paginationResult,
        setPaginated,
        expandedIndexes,
        renderExpandableRow,
    };
};

export default useHospitalManagementDataTableHook;

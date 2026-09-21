import React, { useMemo, useState } from "react";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import { useFormik } from "formik";
import { MUIDataTableColumn } from "mui-datatables";
import dayjs from "dayjs";

// Confirmed: holdStatusId 1 = normal, 2 = hold.
const HOLD_STATUS_ID_NORMAL = 1;
const HOLD_STATUS_ID_HOLD = 2;

export interface HospitalPaySettingRow {
    hospitalPaymentSettingId: string;
    hospitalName: string;
    isAutoPay: boolean | undefined;
    delayDays: number;
    holdStatusId: number | undefined;
    holdStatusName: string | undefined;
    updatedDate: string | undefined;
}

export interface UseHospitalPaySettingsTableHookProps {
    initialRows: HospitalPaySettingRow[];
    onSaveRow: (row: HospitalPaySettingRow) => void;
    renderHistory: (hospitalPaymentSettingId: string, hospitalName: string) => React.ReactNode;
}

const isHeld = (row: HospitalPaySettingRow) => row.holdStatusId === HOLD_STATUS_ID_HOLD;

const HoldStatusButton = ({ row, onClick }: { row: HospitalPaySettingRow; onClick: () => void }) => {
    const held = isHeld(row);

    return (
        <Box
            onClick={onClick}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                padding: "8px 12px",
                border: `1px solid ${held ? "#E53935" : "#90CAF9"}`,
                backgroundColor: held ? "#FDECEA" : "#EAF4FC",
                color: held ? "#C62828" : "#1565C0",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
            }}
        >
            {held ? <PauseCircleIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
            {held ? "Hold — กดเพื่อปลด" : "ปกติ — กดเพื่อ Hold"}
        </Box>
    );
};

// "ผลการตั้งค่า" isn't a field the API returns — derived here from
// isAutoPay + holdStatusId. Held always wins (regardless of isAutoPay);
// otherwise auto-pay-on shows the delay countdown, auto-pay-off falls
// back to "manual". The dedicated "ผู้ใช้งานดำเนินการเอง"-with-locked-Hold-
// button case from the screenshot is dropped per your confirmation —
// isAutoPay=false is just rendered as the manual-payment pill here, with
// the Hold button still interactive like every other row.
const ResultPill = ({ row }: { row: HospitalPaySettingRow }) => {
    if (isHeld(row)) {
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

    if (row.isAutoPay) {
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
                จ่ายอัตโนมัติหลัง {row.delayDays} วัน
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
            ผู้ใช้งานดำเนินการเอง
        </Box>
    );
};

const useHospitalManagementDataTableHook = ({
    initialRows,
    onSaveRow,
    renderHistory,
}: UseHospitalPaySettingsTableHookProps) => {
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

    const formik = useFormik<{ rows: HospitalPaySettingRow[] }>({
        initialValues: { rows: initialRows },
        enableReinitialize: true,
        onSubmit: () => {},
    });

    const rows = formik.values.rows;

    const dirtyMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        rows.forEach((row) => {
            const original = initialRows.find((r) => r.hospitalPaymentSettingId === row.hospitalPaymentSettingId);
            map[row.hospitalPaymentSettingId] =
                !!original &&
                (original.isAutoPay !== row.isAutoPay ||
                    original.delayDays !== row.delayDays ||
                    original.holdStatusId !== row.holdStatusId);
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

    // Local edit only — flips between normal/hold in formik state, same as
    // isAutoPay/delayDays. It's picked up by dirtyMap and only actually
    // persists when "บันทึก" is clicked and onSaveRow fires, not immediately.
    // Switching TO hold also forces isAutoPay off, since auto-pay can't run
    // while a hospital is held.
    const handleToggleHold = (index: number) => {
        const current = rows[index];
        const willBeHeld = !isHeld(current);
        const nextHoldStatusId = willBeHeld ? HOLD_STATUS_ID_HOLD : HOLD_STATUS_ID_NORMAL;

        formik.setFieldValue(`rows.${index}.holdStatusId`, nextHoldStatusId);
        if (willBeHeld) {
            formik.setFieldValue(`rows.${index}.isAutoPay`, false);
        }
    };

    const handleToggleHistory = (index: number) => {
        setExpandedIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
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
                            checked={!!rows[rowIndex].isAutoPay}
                            disabled={isHeld(rows[rowIndex])}
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
            name: "holdStatusId",
            label: "สถานะ Hold",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => (
                    <HoldStatusButton row={rows[rowIndex]} onClick={() => handleToggleHold(rowIndex)} />
                ),
            },
        },
        {
            name: "result",
            label: "ผลการตั้งค่า",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => <ResultPill row={rows[rowIndex]} />,
            },
        },
        {
            name: "updatedDate",
            label: "อัปเดตล่าสุด",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = rows?.[rowIndex]?.updatedDate
                        ? dayjs(rows?.[rowIndex]?.updatedDate).format("DD/MM/YYYY HH:mm")
                        : "-";
                    return formatDate;
                },
            },
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
                                disabled={!dirtyMap[row.hospitalPaymentSettingId]}
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
                    {renderHistory(
                        rows[rowMeta.dataIndex].hospitalPaymentSettingId,
                        rows[rowMeta.dataIndex].hospitalName
                    )}
                </td>
            </tr>
        );
    };

    return {
        rows,
        columns,
        expandedIndexes,
        renderExpandableRow,
    };
};

export default useHospitalManagementDataTableHook;

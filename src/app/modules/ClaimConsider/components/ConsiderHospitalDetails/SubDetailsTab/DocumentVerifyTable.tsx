import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Visibility } from "@mui/icons-material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";
import { useState } from "react";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable } from "../../../../../functionHelpers";
import {
    DOCUMENT_CHECK_RESULTS,
    DOCUMENT_CHECK_RESULT_OPTIONS,
    DocumentCheckResult,
    DocumentCheckRow,
} from "../mock/hospitalConsiderMock";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";
import DocumentFileViewer from "./DocumentFileViewer";

type DocumentVerifyTableProps = {
    onChange: <TField extends keyof DocumentCheckRow>(
        rowIndex: number,
        field: TField,
        value: DocumentCheckRow[TField]
    ) => void;
};

/** หมายเหตุบังคับกรอกเมื่อผลการตรวจเป็น ไม่ผ่าน หรือ รอเอกสารเพิ่มเติม */
const isRemarkRequired = (result: DocumentCheckResult | "") =>
    result === DOCUMENT_CHECK_RESULTS.failed || result === DOCUMENT_CHECK_RESULTS.waiting;

const DocumentVerifyTable = ({ onChange }: DocumentVerifyTableProps) => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const rows = formik.values.documentChecks;

    /** รายการเอกสารที่กำลังเปิดดูไฟล์อยู่ (undefined = ปิดหน้าต่าง) */
    const [viewingRowIndex, setViewingRowIndex] = useState<number>();
    const viewingRow = viewingRowIndex === undefined ? undefined : rows[viewingRowIndex];

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentName",
            label: "รายการเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "",
            label: "สแกนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: () => (
                    <Button size="small" variant="contained" sx={{ width: 150 }}>
                        สแกนเอกสาร
                    </Button>
                ),
            },
        },
        {
            name: "files",
            label: "จำนวนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: DocumentCheckRow["files"]) => value.length,
            },
        },
        {
            name: "",
            label: "รายละเอียด",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];

                    const hasFile = row.files.length > 0;

                    return (
                        <Tooltip title={hasFile ? "ดูรายละเอียด" : "ยังไม่มีเอกสาร"} arrow placement="top">
                            <span>
                                <IconButton
                                    size="small"
                                    sx={{ backgroundColor: "#E2F2FF" }}
                                    disabled={!hasFile}
                                    onClick={() => setViewingRowIndex(tableMeta.rowIndex)}
                                >
                                    <Visibility color={hasFile ? "primary" : "disabled"} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    );
                },
            },
        },
        {
            name: "checkResult",
            label: "ผลการตรวจ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];

                    return (
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={row.checkResult}
                            onChange={(_event, value: DocumentCheckResult | null) =>
                                onChange(tableMeta.rowIndex, "checkResult", value ?? "")
                            }
                            sx={{
                                gap: 1,
                                // แสดงเป็นปุ่มแยกกัน ไม่ใช่ปุ่มติดกันแบบค่าเริ่มต้นของ ToggleButtonGroup
                                "& .MuiToggleButtonGroup-grouped": {
                                    border: "1px solid #DDE3EA",
                                    borderRadius: "8px !important",
                                    marginLeft: 0,
                                },
                            }}
                        >
                            {DOCUMENT_CHECK_RESULT_OPTIONS.map((option) => (
                                <ToggleButton
                                    key={option.value}
                                    value={option.value}
                                    disableRipple
                                    sx={{
                                        px: 2,
                                        py: 0.75,
                                        whiteSpace: "nowrap",
                                        textTransform: "none",
                                        fontSize: 14,
                                        color: "#5A6B7B",
                                        bgcolor: "#fff",
                                        "&:hover": { bgcolor: `${option.color}12` },
                                        "&.Mui-selected": {
                                            color: "#fff",
                                            bgcolor: option.color,
                                            borderColor: option.color,
                                            fontWeight: 700,
                                            "&:hover": { bgcolor: option.color },
                                        },
                                    }}
                                >
                                    {option.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    );
                },
            },
        },
        {
            name: "remark",
            label: "หมายเหตุ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];
                    const required = isRemarkRequired(row.checkResult);

                    return (
                        <TextField
                            size="small"
                            fullWidth
                            value={row.remark}
                            placeholder="ระบุหมายเหตุ"
                            // บังคับกรอกเมื่อผลการตรวจเป็น ไม่ผ่าน หรือ รอเอกสารเพิ่มเติม
                            error={required && !row.remark}
                            onChange={(event) => onChange(tableMeta.rowIndex, "remark", event.target.value)}
                            sx={{
                                minWidth: 240,
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "#F4F7FA",
                                    borderRadius: 2,
                                    "& fieldset": { borderColor: "#E4EAF0" },
                                    "&:hover fieldset": { borderColor: "#C9D4DF" },
                                },
                            }}
                        />
                    );
                },
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<FactCheckIcon sx={{ fontSize: 27 }} />} text="ตรวจสอบเอกสาร" color="blue" />

            <Box>
                <StandardDataTable
                    name="documentVerifyTable"
                    title=""
                    data={rows}
                    columns={columns}
                    color="primary"
                    columnHeaderAlign="center"
                    displayToolbar={false}
                    displayFooter={false}
                    options={defaultOptionStandardDataTable}
                />
            </Box>

            <Dialog
                open={viewingRow !== undefined}
                onClose={() => setViewingRowIndex(undefined)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>{`เอกสาร : ${viewingRow?.documentName ?? ""}`}</Box>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => setViewingRowIndex(undefined)}
                    >
                        กลับ
                    </Button>
                </DialogTitle>
                <DialogContent dividers>
                    <DocumentFileViewer key={viewingRow?.documentId} files={viewingRow?.files ?? []} />
                </DialogContent>
            </Dialog>
        </CustomPaper>
    );
};

export default DocumentVerifyTable;

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormHelperText,
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
import { cellAlignOptions, defaultOptionStandardDataTable, handleClickLink } from "../../../../../functionHelpers";
import { DOC_STORAGE_URL } from "../../../../../../Const";
import {
    DOCUMENT_CHECK_RESULTS,
    DocumentCheckResult,
    DocumentCheckResultOption,
    DocumentCheckRow,
} from "../mock/hospitalConsiderMock";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";
import { DocStorageDocInfo } from "../../../hooks/ClaimConsiderHospital/HospitalDocumentVerifyHook";
import DocumentFileViewer from "./DocumentFileViewer";

/** ค่าเริ่มต้นเมื่อยังไม่มีข้อมูล DocStorage ของ documentId นั้น */
const EMPTY_DOC_INFO: DocStorageDocInfo = {
    documentName: "-",
    fileCount: 0,
    documentCode: "",
    mainIndex: "",
    searchIndex: "",
};

type DocumentVerifyTableProps = {
    onChange: <TField extends keyof DocumentCheckRow>(
        rowIndex: number,
        field: TField,
        value: DocumentCheckRow[TField]
    ) => void;
    /** สแกน/ค้นหาเอกสารแถวนั้นใหม่ : ล้างผลตรวจเดิมเฉพาะแถวนั้น (CR Ver2 ข้อ 4) */
    onScan?: (rowIndex: number) => void;
    /** ตัวเลือกผลการตรวจเอกสาร จาก Master API (/api/Masters/document/review/status) */
    options: DocumentCheckResultOption[];
    /**
     * ข้อมูลเอกสารจริงใน DocStorage ต่อ documentId (GET /document/documentid/list)
     * ใช้แสดงคอลัมน์ "รายการเอกสาร" (documentTypeName) + "จำนวนเอกสาร" (fileCount)
     * และ fileCount เป็นเงื่อนไขเปิด modal ดูรายละเอียด (0 = เปิดไม่ได้)
     */
    documentInfoByDocumentId: Record<string, DocStorageDocInfo>;
    /** โหมดดูอย่างเดียว : แก้ผลการตรวจและหมายเหตุไม่ได้ แต่ยังกดดูเอกสารได้ */
    readOnly?: boolean;
};

/** หมายเหตุบังคับกรอกเมื่อผลการตรวจเป็น ไม่ผ่าน หรือ รอเอกสารเพิ่มเติม */
const isRemarkRequired = (result: DocumentCheckResult | "") =>
    result === DOCUMENT_CHECK_RESULTS.failed || result === DOCUMENT_CHECK_RESULTS.waiting;

const DocumentVerifyTable = ({
    onChange,
    onScan,
    options,
    documentInfoByDocumentId,
    readOnly = false,
}: DocumentVerifyTableProps) => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const rows = formik.values.documentChecks;

    /** ข้อมูล DocStorage ของแถวนั้น (ไม่มีใน map = ยังไม่มีเอกสารแนบ) */
    const getDocInfo = (documentId: string) => documentInfoByDocumentId[documentId] ?? EMPTY_DOC_INFO;

    /**
     * ปุ่ม "สแกนเอกสาร" : เปิดหน้า DocStorage เพื่อแนบเอกสารของ documentId นั้น (เหมือน DocumentScanTable)
     * แล้วล้างผลการตรวจของแถวนั้นให้ตรวจซ้ำ — พฤติกรรมเดิม (CR Ver2 ข้อ 4) ยังคงไว้
     */
    const handleScan = (rowIndex: number) => {
        const row = rows[rowIndex];
        const info = getDocInfo(row.documentId);
        if (info.documentCode) {
            const url =
                `${DOC_STORAGE_URL}/document/scan?documentId=${row.documentId}` +
                `&documentCode=${info.documentCode}` +
                `&documentSubType=${row.documentSubTypeId ?? ""}` +
                `&mainIndex=${info.mainIndex}` +
                `&searchIndex=${info.searchIndex}`;
            handleClickLink(url);
        }
        onScan?.(rowIndex);
    };

    /** error ระดับฟอร์ม : หมายเหตุยังไม่ครบสำหรับเอกสารที่ผล ไม่ผ่าน / รอเอกสารเพิ่มเติม */
    const { error: documentChecksError, touched: documentChecksTouched } =
        formik.getFieldMeta<DocumentCheckRow[]>("documentChecks");
    const showRequiredError = !!documentChecksTouched && typeof documentChecksError === "string";

    /** รายการเอกสารที่กำลังเปิดดูไฟล์อยู่ (undefined = ปิดหน้าต่าง) */
    const [viewingRowIndex, setViewingRowIndex] = useState<number>();
    const viewingRow = viewingRowIndex === undefined ? undefined : rows[viewingRowIndex];

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentName",
            label: "รายการเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                // ชื่อจาก useGetDocumentByCaseId (claimDocumentTypeName) เป็นหลัก, fallback = DocStorage
                customBodyRender: (value: DocumentCheckRow["documentName"], tableMeta) =>
                    value || documentInfoByDocumentId[rows[tableMeta.rowIndex].documentId]?.documentName || "-",
            },
        },
        {
            name: "",
            label: "สแกนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => (
                    <Tooltip title="แนบเอกสารที่ DocStorage" arrow placement="top">
                        <Button
                            size="small"
                            variant="contained"
                            disabled={readOnly}
                            sx={{ width: 150 }}
                            onClick={() => handleScan(tableMeta.rowIndex)}
                        >
                            สแกนเอกสาร
                        </Button>
                    </Tooltip>
                ),
            },
        },
        {
            name: "documentId",
            label: "จำนวนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: DocumentCheckRow["documentId"]) => getDocInfo(value).fileCount,
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

                    // เปิด modal ได้เฉพาะเมื่อ documentId นั้นมีไฟล์แนบใน DocStorage
                    const hasFile = getDocInfo(row.documentId).fileCount > 0;

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
                            {options.map((option) => (
                                <ToggleButton
                                    key={option.value}
                                    value={option.value}
                                    disableRipple
                                    disabled={readOnly}
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
                            disabled={readOnly}
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

            <Box data-field-name="documentChecks">
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
                {showRequiredError && (
                    <FormHelperText error sx={{ mt: 1, ml: 1.5 }}>
                        {documentChecksError}
                    </FormHelperText>
                )}
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
                    <DocumentFileViewer key={viewingRow?.documentId} documentId={viewingRow?.documentId} />
                </DialogContent>
            </Dialog>
        </CustomPaper>
    );
};

export default DocumentVerifyTable;

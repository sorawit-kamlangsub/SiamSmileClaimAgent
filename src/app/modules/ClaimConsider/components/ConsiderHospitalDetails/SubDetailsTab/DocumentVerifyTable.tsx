import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
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
import { DocumentCheckRow } from "../mock/hospitalConsiderMock";
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
    /**
     * ข้อมูลเอกสารจริงใน DocStorage ต่อ documentId (GET /document/documentid/list)
     * ใช้แสดงคอลัมน์ "รายการเอกสาร" (documentTypeName) + "จำนวนเอกสาร" (fileCount)
     * และ fileCount เป็นเงื่อนไขเปิด modal ดูรายละเอียด (0 = เปิดไม่ได้)
     */
    documentInfoByDocumentId: Record<string, DocStorageDocInfo>;
    /** โหมดดูอย่างเดียว : สแกนเอกสารไม่ได้ แต่ยังกดดูเอกสารได้ */
    readOnly?: boolean;
};

/**
 * ตาราง "ตรวจสอบเอกสาร" ของหน้าพิจารณาเคลมโรงพยาบาล
 * RC-005 5.7 ตัดคอลัมน์ "ผลการตรวจ" และ "หมายเหตุ" ออกแล้ว — เหลือ รายการเอกสาร / สแกน / จำนวน / รายละเอียด
 */
const DocumentVerifyTable = ({ documentInfoByDocumentId, readOnly = false }: DocumentVerifyTableProps) => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const rows = formik.values.documentChecks;

    /** ข้อมูล DocStorage ของแถวนั้น (ไม่มีใน map = ยังไม่มีเอกสารแนบ) */
    const getDocInfo = (documentId: string) => documentInfoByDocumentId[documentId] ?? EMPTY_DOC_INFO;

    /** ปุ่ม "สแกนเอกสาร" : เปิดหน้า DocStorage เพื่อแนบเอกสารของ documentId นั้น (เหมือน DocumentScanTable) */
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
    };

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

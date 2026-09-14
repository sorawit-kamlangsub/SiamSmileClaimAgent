import { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import { MUIDataTableColumn } from "mui-datatables";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable } from "../../../../../functionHelpers";
import DocumentFileViewer from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/DocumentFileViewer";
import { PENDING_BE_TOOLTIP } from "../../../store/billingPendingFields";

export type BillingStep3DocumentRow = {
    documentCode: string;
    documentSubTypeName: string;
    documentId?: string;
    fileCount: number;
};

type BillingScanDocumentTableProps = {
    rows: BillingStep3DocumentRow[];
};

/**
 * Step 3 : "สแกนเอกสาร" — ตารางเอกสารประกอบการพิจารณาเคลม (คนละตารางกับ Step 1 "ตรวจสอบเอกสาร")
 * สเปคระบุชัดว่า "ไม่ต้องส่งกลับไปอัปเดตที่ SmileConnect" — เป็น audit view ล้วน
 *
 * PENDING-BE: PENDING_BE_FIELDS.scanDocumentStep3 — `BillingDetailDto` ยังไม่มีรายการเอกสารชุดนี้ให้ bind
 * (`rows` จึงว่างเสมอในตอนนี้ — ปุ่มสแกนใช้ tooltip PENDING_BE แทนการเปิด DocStorage จริง)
 */
const BillingScanDocumentTable = ({ rows }: BillingScanDocumentTableProps) => {
    const [viewingRowIndex, setViewingRowIndex] = useState<number>();
    const viewingRow = viewingRowIndex === undefined ? undefined : rows[viewingRowIndex];

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentCode",
            label: "รหัสเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "documentSubTypeName",
            label: "ประเภทเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "_scan",
            label: "สแกนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: () => (
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <span>
                            <Button size="small" variant="contained" disabled sx={{ width: 140 }}>
                                สแกนเอกสาร
                            </Button>
                        </span>
                    </Tooltip>
                ),
            },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "_view",
            label: "รายละเอียด",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const hasFile = (rows[tableMeta.rowIndex]?.fileCount ?? 0) > 0;
                    return (
                        <Tooltip title={hasFile ? "ดูรายละเอียด" : "ยังไม่มีเอกสาร"} arrow>
                            <span>
                                <IconButton
                                    size="small"
                                    sx={{ backgroundColor: "#E2F2FF" }}
                                    disabled={!hasFile}
                                    onClick={() => setViewingRowIndex(tableMeta.rowIndex)}
                                >
                                    <VisibilityIcon color={hasFile ? "primary" : "disabled"} fontSize="small" />
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
            <HeadingWithColor icon={<DocumentScannerIcon sx={{ fontSize: 27 }} />} text="สแกนเอกสาร" color="blue" />
            <StandardDataTable
                name="billingScanDocumentTable"
                title=""
                data={rows}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                displayFooter={false}
                options={defaultOptionStandardDataTable}
            />

            <Dialog
                open={viewingRow !== undefined}
                onClose={() => setViewingRowIndex(undefined)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>{`เอกสาร : ${viewingRow?.documentSubTypeName ?? ""}`}</Box>
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

export default BillingScanDocumentTable;

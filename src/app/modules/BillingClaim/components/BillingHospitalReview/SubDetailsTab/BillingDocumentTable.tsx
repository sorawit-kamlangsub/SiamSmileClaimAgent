import { useState } from "react";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable, handleClickLink } from "../../../../../functionHelpers";
import { DOC_STORAGE_URL } from "../../../../../../Const";
import { useGetDocumentReviewStatus } from "../../../../../api/coreClaimMastersApi";
import DocumentFileViewer from "../../../../ClaimConsider/components/ConsiderHospitalDetails/SubDetailsTab/DocumentFileViewer";
import useBillingDocumentHook from "../../../hooks/BillingHospitalReview/BillingDocumentHook";
import {
    BILLING_DOCUMENT_REVIEW_STATUS,
    BillingDocumentFormItem,
    BillingReviewFormValues,
} from "../../../store/billingClaim.types";

type BillingDocumentTableProps = {
    /** subtype ที่ BE บังคับต้องมีเอกสารครบ (`detail.requiredDocumentSubTypeIds`) — ใช้แสดง badge เตือนเท่านั้น */
    requiredDocumentSubTypeIds: number[];
    readOnly?: boolean;
};

/** หมายเหตุบังคับกรอกเมื่อผลการตรวจเป็น ไม่ผ่าน หรือ รอเอกสารเพิ่มเติม */
const isNoteRequired = (resultId: number | undefined) =>
    resultId === BILLING_DOCUMENT_REVIEW_STATUS.failed || resultId === BILLING_DOCUMENT_REVIEW_STATUS.waiting;

/**
 * Step 1 : "ตรวจสอบเอกสาร" — bind `documents[]`
 *
 * แก้ได้เฉพาะ `reviewStatusId` / `note` ต่อแถว (handoff ข้อ 5) แต่มีปุ่ม "สแกนเอกสาร" (เปิดหน้า DocStorage
 * ให้แนบเอกสารของแถวนั้นเพิ่ม — enable เฉพาะแถวที่มีเอกสารแนบมาจาก SmileConnect อยู่แล้ว ยืนยันกับ BA ตามข้อ 7.3)
 * และปุ่ม "รายละเอียด" เปิด modal ดูไฟล์จริงจาก DocStorage (`documentId` + `fileCount` มีอยู่แล้วใน DTO)
 */
const BillingDocumentTable = ({ requiredDocumentSubTypeIds, readOnly = false }: BillingDocumentTableProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const rows = formik.values.documents;

    const { data: reviewStatusRaw, isLoading: reviewStatusLoading } = useGetDocumentReviewStatus();
    const reviewStatusOptions = [...(reviewStatusRaw?.data ?? [])].sort((a, b) => (a.indexId ?? 0) - (b.indexId ?? 0));

    const { getDocInfo, getFileCount } = useBillingDocumentHook(rows);

    const { error: documentsError, touched: documentsTouched } =
        formik.getFieldMeta<BillingDocumentFormItem[]>("documents");
    const showRequiredError = !!documentsTouched && typeof documentsError === "string";

    /** แถวที่กำลังเปิดดูไฟล์อยู่ (undefined = ปิดหน้าต่าง) */
    const [viewingRowIndex, setViewingRowIndex] = useState<number>();
    const viewingRow = viewingRowIndex === undefined ? undefined : rows[viewingRowIndex];

    const handleChange = <TField extends keyof BillingDocumentFormItem>(
        rowIndex: number,
        field: TField,
        value: BillingDocumentFormItem[TField]
    ) => {
        const next = rows.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row));
        formik.setFieldValue("documents", next);
    };

    /**
     * ปุ่ม "สแกนเอกสาร" : เปิดหน้า DocStorage เพื่อแนบเอกสารของ documentId นั้นเพิ่ม แล้วล้างผลการตรวจของ
     * แถวนั้นให้ตรวจซ้ำ (สเปค : เอกสารที่แนบเพิ่มหลังส่งแก้ไขต้องล้างผลตรวจ — ฝั่ง FE ล้างทันทีที่กด, ฝั่ง BE
     * เป็นคนล้างจริงตอน sync รอบใหม่)
     */
    const handleScan = (rowIndex: number) => {
        const row = rows[rowIndex];
        const info = getDocInfo(row.documentId);
        if (row.documentId && info.documentCode) {
            const url =
                `${DOC_STORAGE_URL}/document/scan?documentId=${row.documentId}` +
                `&documentCode=${info.documentCode}` +
                `&documentSubType=${row.documentSubTypeId ?? ""}` +
                `&mainIndex=${info.mainIndex}` +
                `&searchIndex=${info.searchIndex}`;
            handleClickLink(url);
        }
        handleChange(rowIndex, "reviewStatusId", undefined);
    };

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentName",
            label: "รายการเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];
                    const isRequired =
                        !!row.documentSubTypeId && requiredDocumentSubTypeIds.includes(row.documentSubTypeId);
                    return `${row.documentName ?? "-"}${isRequired ? " *" : ""}`;
                },
            },
        },
        {
            name: "_scan",
            label: "สแกนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];
                    // เปิดสแกนเพิ่มได้เฉพาะแถวที่มีเอกสารแนบมาจาก SmileConnect อยู่แล้ว (มี documentId + documentCode)
                    const canScan = !readOnly && !!row.documentId && !!getDocInfo(row.documentId).documentCode;
                    return (
                        <Tooltip title={canScan ? "แนบเอกสารเพิ่มที่ DocStorage" : "ไม่มีเอกสารให้แนบเพิ่ม"} arrow>
                            <span>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={!canScan}
                                    sx={{ width: 140 }}
                                    onClick={() => handleScan(tableMeta.rowIndex)}
                                >
                                    สแกนเอกสาร
                                </Button>
                            </span>
                        </Tooltip>
                    );
                },
            },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => getFileCount(rows[tableMeta.rowIndex]),
            },
        },
        {
            name: "_view",
            label: "รายละเอียด",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];
                    const hasFile = getFileCount(row) > 0;
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
        {
            name: "reviewStatusId",
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
                            disabled={readOnly || reviewStatusLoading}
                            value={row.reviewStatusId ?? null}
                            onChange={(_event, value: number | null) =>
                                handleChange(tableMeta.rowIndex, "reviewStatusId", value ?? undefined)
                            }
                            sx={{
                                gap: 1,
                                "& .MuiToggleButtonGroup-grouped": {
                                    border: "1px solid #DDE3EA",
                                    borderRadius: "8px !important",
                                    marginLeft: 0,
                                },
                            }}
                        >
                            {reviewStatusOptions.map((option) => (
                                <ToggleButton
                                    key={option.documentReviewStatusId}
                                    value={option.documentReviewStatusId ?? 0}
                                    disableRipple
                                    sx={{ px: 2, py: 0.75, whiteSpace: "nowrap", textTransform: "none", fontSize: 14 }}
                                >
                                    {option.documentReviewStatusName}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
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
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];
                    const required = isNoteRequired(row.reviewStatusId);
                    return (
                        <TextField
                            size="small"
                            fullWidth
                            disabled={readOnly}
                            value={row.note ?? ""}
                            placeholder="ระบุหมายเหตุ"
                            error={required && !row.note}
                            inputProps={{ maxLength: 1000 }}
                            onChange={(event) => handleChange(tableMeta.rowIndex, "note", event.target.value)}
                            sx={{ minWidth: 220 }}
                        />
                    );
                },
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<FactCheckIcon sx={{ fontSize: 27 }} />} text="ตรวจสอบเอกสาร" color="blue" />
            <Box data-field-name="documents">
                <StandardDataTable
                    name="billingDocumentTable"
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
                        {documentsError}
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

export default BillingDocumentTable;

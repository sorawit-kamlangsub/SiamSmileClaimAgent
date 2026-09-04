import { Box, FormHelperText, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable } from "../../../../../functionHelpers";
import { useGetDocumentReviewStatus } from "../../../../../api/coreClaimMastersApi";
import { BillingDocumentFormItem, BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingDocumentTableProps = {
    /** subtype ที่ BE บังคับต้องมีเอกสารครบ (`detail.requiredDocumentSubTypeIds`) — ใช้แสดง badge เตือนเท่านั้น */
    requiredDocumentSubTypeIds: number[];
    readOnly?: boolean;
};

/**
 * Step 1 : "ตรวจสอบเอกสาร" — bind `documents[]`
 *
 * แก้ได้เฉพาะ `reviewStatusId` / `note` ต่อแถว (handoff ข้อ 5) — API ไม่คืน URL ไฟล์ จึงไม่มีปุ่ม preview
 * (ห้ามสร้าง URL จาก documentId เอง) `fileCount: null` = ไม่ทราบจำนวน ไม่ใช่ 0
 */
const BillingDocumentTable = ({ requiredDocumentSubTypeIds, readOnly = false }: BillingDocumentTableProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const rows = formik.values.documents;

    const { data: reviewStatusRaw, isLoading: reviewStatusLoading } = useGetDocumentReviewStatus();
    const reviewStatusOptions = [...(reviewStatusRaw?.data ?? [])].sort((a, b) => (a.indexId ?? 0) - (b.indexId ?? 0));

    const { error: documentsError, touched: documentsTouched } =
        formik.getFieldMeta<BillingDocumentFormItem[]>("documents");
    const showRequiredError = !!documentsTouched && typeof documentsError === "string";

    const handleChange = <TField extends keyof BillingDocumentFormItem>(
        rowIndex: number,
        field: TField,
        value: BillingDocumentFormItem[TField]
    ) => {
        const next = rows.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row));
        formik.setFieldValue("documents", next);
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
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: number | null | undefined) => (value == null ? "ไม่ทราบจำนวนไฟล์" : value),
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
                    return (
                        <TextField
                            size="small"
                            fullWidth
                            disabled={readOnly}
                            value={row.note ?? ""}
                            placeholder="ระบุหมายเหตุ"
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
        </CustomPaper>
    );
};

export default BillingDocumentTable;

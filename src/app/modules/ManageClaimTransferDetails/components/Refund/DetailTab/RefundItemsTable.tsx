import { useMemo } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../../../functionHelpers";
import { StandardDataTable } from "../../../../_common";

export interface RefundItemRow {
    caseId: string;
    customerName: string;
    coverageTypeNameTH: string;
    caseNo: string;
    totalNetPaidAmount: number;
    additionalAmount: number;
}

export interface RefundItemsFormValues {
    items: RefundItemRow[];
}

export interface RefundItemsTableProps<T extends RefundItemsFormValues> {
    formik: FormikProps<T>;
}

const DOUBLE_INPUT_REGEX = /^\d*\.?\d{0,2}$/;

const formatWithCommas = (value: string): string => {
    if (!value) return "";
    const [intPart, decimalPart] = value.split(".");
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart !== undefined ? `${intWithCommas}.${decimalPart}` : intWithCommas;
};

const RefundItemsTable = <T extends RefundItemsFormValues>({ formik }: RefundItemsTableProps<T>) => {
    const totalAdditionalAmount = useMemo(
        () => formik.values.items.reduce((sum, item) => sum + (Number(item.additionalAmount) || 0), 0),
        [formik.values.items]
    );

    const handleAmountChange = (index: number, rawValue: string) => {
        let value = rawValue.replace(/,/g, "").replace(/^0+(?=\d)/, "");
        if (value !== "" && !DOUBLE_INPUT_REGEX.test(value)) {
            return;
        }
        formik.setFieldValue(`items.${index}.additionalAmount`, value ?? 0);
    };

    const columns: MUIDataTableColumn[] = useMemo(
        () => [
            {
                name: "index",
                label: "ลำดับ",
                options: {
                    filter: false,
                    sort: false,
                    customBodyRenderLite: (dataIndex) => (
                        <Box sx={{ textAlign: "center" }}>{dataIndex + 1}</Box>
                    ),
                },
            },
            {
                name: "customerName",
                label: "ชื่อ-นามสกุล ผู้เอาประกัน",
                options: { filter: false, sort: false },
            },
            {
                name: "coverageTypeNameTH",
                label: "ประเภทความคุ้มครอง",
                options: { filter: false, sort: false },
            },
            {
                name: "caseNo",
                label: "เลขที่เคส (CC)",
                options: { filter: false, sort: false },
            },
            {
                name: "totalNetPaidAmount",
                label: "จำนวนเงินที่โอนแล้ว",
                options: {
                    filter: false,
                    sort: false,
                    setCellProps: () => ({ style: { minWidth: 220 } }),
                    setCellHeaderProps: () => ({ align: "right" as const }),
                    customBodyRenderLite: (dataIndex) => {
                        const amount = formik.values.items?.[dataIndex]?.totalNetPaidAmount ?? 0;
                        return <Box sx={{ textAlign: "end" }}>{numberWithCommas(amount)}</Box>;
                    },
                },
            },
            {
                name: "additionalAmount",
                label: "ยอดเงินที่ต้องการโอนคืน",
                options: {
                    filter: false,
                    sort: false,
                    setCellHeaderProps: () => ({ align: "right" as const }),
                    customBodyRenderLite: (dataIndex) => {
                        const item = formik.values.items?.[dataIndex];
                        return (
                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <TextField
                                    size="small"
                                    type="text"
                                    placeholder="0.00"
                                    value={formatWithCommas(String(item?.additionalAmount ?? ""))}
                                    onChange={(e) => handleAmountChange(dataIndex, e.target.value)}
                                    inputProps={{
                                        inputMode: "decimal",
                                        min: 0,
                                        style: { textAlign: "right" },
                                    }}
                                    sx={{ width: "110px" }}
                                />
                            </Box>
                        );
                    },
                },
            },
        ],
        [formik.values.items]
    );

    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E0E0E0",
                overflow: "hidden",
                p: 1,
            }}
        >
            <Box sx={{ padding: "16px 24px" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#212121" }}>
                    รายการ
                </Typography>
            </Box>

            <StandardDataTable
                name="refundItems"
                title=""
                data={formik.values.items}
                columns={columns}
                color="primary"
                displayToolbar={false}
                displayFooter={false}
                paginated={{
                    totalAmountRecords: formik.values.items.length,
                    currentPage: 1,
                    recordsPerPage: formik.values.items.length,
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "baseline",
                    gap: "8px",
                    padding: "14px 24px",
                    borderTop: "1px solid #EEEEEE",
                }}
            >
                <Typography sx={{ fontWeight: 700, color: "#212121" }}>โอนคืนรวม :</Typography>
                <Typography sx={{ fontWeight: 700, color: "#2E7D32" }}>
                    {numberWithCommas(totalAdditionalAmount ?? 0)} บาท
                </Typography>
            </Box>
        </Box>
    );
};

export default RefundItemsTable;
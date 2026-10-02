import { useMemo } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { FormikProps } from "formik";
import { numberWithCommas } from "../../../../../functionHelpers";

export interface TransferItemRow {
    caseId: string;
    customerName: string;
    coverageTypeNameTH: string;
    caseNo: string;
    totalNetPaidAmount: number;
    additionalAmount: number;
}

export interface TransferItemsFormValues {
    items: TransferItemRow[];
}

export interface TransferItemsTableProps<T extends TransferItemsFormValues> {
    formik: FormikProps<T>;
}

const DOUBLE_INPUT_REGEX = /^\d*\.?\d{0,2}$/;

const TransferItemsTable = <T extends TransferItemsFormValues>({ formik }: TransferItemsTableProps<T>) => {
    const totalAdditionalAmount = useMemo(
        () => formik.values.items.reduce((sum, item) => sum + (Number(item.additionalAmount) || 0), 0),
        [formik.values.items]
    );

    const handleAmountChange = (index: number, rawValue: string) => {
        const value = rawValue.replace(/,/g, "");
        if (value !== "" && !DOUBLE_INPUT_REGEX.test(value)) {
            return;
        }
        formik.setFieldValue(`items.${index}.additionalAmount`, value ?? 0);
    };

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

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#00569D" }}>
                            <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>ลำดับ</TableCell>
                            <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>ชื่อ-นามสกุล ผู้เอาประกัน</TableCell>
                            <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>ประเภทความคุ้มครอง</TableCell>
                            <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>เลขที่เคส (CC)</TableCell>
                            <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }} align="right">
                                จำนวนเงินที่โอนแล้ว
                            </TableCell>
                            <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }} align="right">
                                ยอดเงินที่ต้องการโอนเพิ่ม
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formik.values.items.map((item, index) => (
                            <TableRow key={item.caseId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item?.customerName ?? "-"}</TableCell>
                                <TableCell>{item.coverageTypeNameTH ?? "-"}</TableCell>
                                <TableCell>{item.caseNo ?? "-"}</TableCell>
                                <TableCell align="right">{numberWithCommas(item.totalNetPaidAmount ?? 0)}</TableCell>
                                <TableCell align="right" sx={{ width: "180px" }}>
                                    <TextField
                                        size="small"
                                        type="text"
                                        placeholder="0.00"
                                        value={item.additionalAmount || ""}
                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                        inputProps={{
                                            inputMode: "decimal",
                                            min: 0,
                                            style: { textAlign: "right" },
                                        }}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                <Typography sx={{ fontWeight: 700, color: "#212121" }}>โอนเพิ่มรวม :</Typography>
                <Typography sx={{ fontWeight: 700, color: "#2E7D32" }}>
                    {numberWithCommas(totalAdditionalAmount ?? 0)} บาท
                </Typography>
            </Box>
        </Box>
    );
};

export default TransferItemsTable;

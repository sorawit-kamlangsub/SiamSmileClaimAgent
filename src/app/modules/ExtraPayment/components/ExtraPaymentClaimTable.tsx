import React, { useMemo, useState } from "react";
import { Box, TableCell, TableFooter, TableRow, TextField } from "@mui/material";
import { MUIDataTableColumnDef } from "mui-datatables";
import { ExtraPaymentClaimItem } from "../store/ExtraPayment.types";
import { StandardDataTable } from "../../_common";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    // handleFloatingInputChange,
    numberWithCommas,
    // smallSizeFooter,
} from "../../../functionHelpers";

interface ExtraPaymentClaimTableProps {
    claimItems: ExtraPaymentClaimItem[];
    onChangeExtraTransferAmount: (claimOnLineId: number, amount: number | null) => void;
}

export const ExtraPaymentClaimTable: React.FC<ExtraPaymentClaimTableProps> = ({
    claimItems,
    onChangeExtraTransferAmount,
}) => {
    const [editingAmounts, setEditingAmounts] = useState<Record<number, string>>({});
    const totalExtraTransfer = useMemo(
        () => claimItems.reduce((sum, item) => sum + (item.extraTransferAmount ?? 0), 0),
        [claimItems]
    );

    const columns: MUIDataTableColumnDef[] = [
        {
            name: "no",
            label: "ลำดับ",
            options: {
                sort: false,
                filter: false,
                ...cellAlignOptions(),
                customBodyRenderLite: (dataIndex) => dataIndex + 1,
            },
        },
        {
            name: "insuredName",
            label: "ชื่อ-นามสกุล ผู้เอาประกัน",
            ...cellAlignOptions(),
            options: { sort: false, filter: false },
        },
        {
            name: "coverageTypeName",
            label: "ประเภทความคุ้มครอง",
            ...cellAlignOptions(),
            options: { sort: false, filter: false },
        },
        {
            name: "claimNo",
            label: "เลขที่เคลม",
            ...cellAlignOptions(),
            options: { sort: false, filter: false },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (value: number) => value.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "extraTransferAmount",
            label: "ยอดเงินโอนเพิ่ม",
            options: {
                sort: false,
                filter: false,
                ...cellAlignOptions({ align: "center", maxWidth: "180px" }),

                customBodyRenderLite: (dataIndex) => {
                    const row = claimItems[dataIndex];
                    const inputValue =
                        editingAmounts[row.claimOnLineId] ??
                        (row.extraTransferAmount != null ? row.extraTransferAmount.toString() : "");

                    return (
                        <TextField
                            size="small"
                            sx={{ width: "100%", ml: "auto", display: "block" }}
                            value={inputValue}
                            onChange={(e) => {
                                const input = e.target.value;
                                const sanitized = input
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/\.{2,}/g, ".")
                                    .replace(/^(\d*)(\.\d{0,2})?.*$/, "$1$2");

                                setEditingAmounts((prev) => ({
                                    ...prev,
                                    [row.claimOnLineId]: sanitized,
                                }));

                                const numericValue = sanitized === "" || sanitized === "." ? null : Number(sanitized);
                                onChangeExtraTransferAmount(row.claimOnLineId, numericValue);
                            }}
                            inputProps={{
                                inputMode: "decimal",
                                pattern: "\\d*(\\.\\d{0,2})?",
                                style: { textAlign: "right" },
                            }}
                            fullWidth
                        />
                    );
                },
            },
        },
    ];

    return (
        <Box>
            <StandardDataTable
                name="extra-payment-claim-table"
                data={claimItems}
                columns={columns}
                displayToolbar={false}
                disableToolbarSelect
                color="primary"
                columnHeaderAlign="center"
                rowHover={false}
                options={{
                    ...defaultOptionStandardDataTable,
                    setTableProps: () => {
                        return {
                            size: "small",
                        };
                    },
                    print: true,
                    download: true,
                    customFooter: () => <></>,
                    customTableBodyFooterRender: (options) => {
                        return (
                            <>
                                {options.data.length > 0 && (
                                    <TableFooter>
                                        <TableRow>
                                            {options.columns.map((_col, index) => {
                                                if (index === 4) {
                                                    return (
                                                        <TableCell
                                                            key={index as number}
                                                            sx={{
                                                                fontSize: 14,
                                                                fontWeight: "bold",
                                                                color: "#007AC1",
                                                                p: 2,
                                                                textAlign: "right",
                                                            }}
                                                        >
                                                            จำนวนเงินรวม :
                                                        </TableCell>
                                                    );
                                                } else if (index === 5) {
                                                    return (
                                                        <TableCell
                                                            key={index as number}
                                                            sx={{
                                                                fontSize: 14,
                                                                fontWeight: "bold",
                                                                color: "#007AC1",
                                                                textAlign: "right",
                                                            }}
                                                        >
                                                            {numberWithCommas(
                                                                totalExtraTransfer.toLocaleString("th-TH", {
                                                                    minimumFractionDigits: 2,
                                                                })
                                                            )}
                                                        </TableCell>
                                                    );
                                                } else {
                                                    return <TableCell key={index as number} />;
                                                }
                                            })}
                                        </TableRow>
                                    </TableFooter>
                                )}
                            </>
                        );
                    },
                }}
            />
        </Box>
    );
};

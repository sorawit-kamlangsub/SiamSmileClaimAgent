import { Box, Button, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable, numberWithCommas } from "../../../../../functionHelpers";
import { useGetNonCoveredReason } from "../../../../../api/coreClaimMastersApi";
import { PENDING_BE, PENDING_BE_TOOLTIP } from "../../../store/billingPendingFields";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingExpenseTableProps = {
    /** [B, C] แสดงตัวเลือก "ประเภทรายการค่าใช้จ่าย" Sim B1/B2 เหนือตาราง */
    showSimBSelector?: boolean;
};

/**
 * Step 2 : "รายการค่ารักษา(เบื้องต้น)" — Read-only ทั้งหมดตามสเปค (ข้อมูลจาก SmileConnect)
 *
 * `claimAmount` bind กับคอลัมน์ "ยอดเงินตามใบเสร็จ" (ยอดที่โรงพยาบาลเรียกเก็บของรายการนั้น เป็นฟิลด์จริง
 * ใน `BillingExpenseDto` อยู่แล้ว) ส่วน "สิทธิ์เบิก" ต้องคำนวณจาก Benefit ที่ยังไม่มี endpoint (PENDING_BE)
 */
const BillingExpenseTable = ({ showSimBSelector = false }: BillingExpenseTableProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const items = formik.values.expenses;

    const { data: nonCoveredReasonData } = useGetNonCoveredReason();
    const nonCoveredReasonOptions = nonCoveredReasonData?.data ?? [];
    const nonCoveredReasonName = (id: number | undefined) =>
        id ? nonCoveredReasonOptions.find((o) => o.nonCoveredReasonId === id)?.nonCoveredReasonName ?? "-" : "-";

    const money = (value: number | undefined) => numberWithCommas(value ?? 0, 2);

    const columns: MUIDataTableColumn[] = [
        {
            name: "itemName",
            label: "รายการค่ารักษา",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (v) => v ?? "-",
            },
        },
        {
            name: "claimAmount",
            label: "ยอดเงินตามใบเสร็จ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "right" }), customBodyRender: money },
        },
        {
            name: "_entitlementAmount",
            label: "สิทธิ์เบิก",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                // PENDING-BE: PENDING_BE_FIELDS.entitlementAmountPerItem — ต้องคำนวณจาก Benefit
                customBodyRender: (v: number | undefined) => (v !== undefined ? money(v) : PENDING_BE),
            },
        },
        {
            name: "discountAmount",
            label: "ส่วนลด",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    const exceeds = (row.discountAmount || 0) > (row.claimAmount || 0);
                    return (
                        <Box>
                            {money(row.discountAmount)}
                            {exceeds && (
                                <Typography variant="caption" color="error" display="block">
                                    เกินยอดเบิก — ตรวจสอบกับ SmileConnect
                                </Typography>
                            )}
                        </Box>
                    );
                },
            },
        },
        {
            name: "nonCoveredAmount",
            label: "ยอดไม่คุ้มครอง",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "right" }), customBodyRender: money },
        },
        {
            name: "nonCoveredReasonId",
            label: "สาเหตุไม่คุ้มครอง",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (_value, tableMeta) => {
                    const row = items[tableMeta.rowIndex];
                    const missing = (row.nonCoveredAmount || 0) > 0 && !row.nonCoveredReasonId;
                    return (
                        <Typography color={missing ? "error" : "inherit"} variant="body2">
                            {missing ? "ไม่ระบุสาเหตุ" : nonCoveredReasonName(row.nonCoveredReasonId)}
                        </Typography>
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
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (value) => value || "-",
            },
        },
        ...(showSimBSelector
            ? ([
                  {
                      name: "_insuranceExcess",
                      label: "เป็นส่วนเกินจากบริษัทประกัน",
                      options: {
                          filter: false,
                          sort: false,
                          ...cellAlignOptions({ align: "center" }),
                          // PENDING-BE: PENDING_BE_FIELDS.insuranceExcess
                          customBodyRender: (_value, tableMeta: { rowIndex: number }) =>
                              items[tableMeta.rowIndex]._isInsuranceExcess ? "ใช่" : "ไม่ใช่",
                      },
                  },
                  {
                      name: "_insuranceCompanyName",
                      label: "บริษัทประกัน",
                      options: {
                          filter: false,
                          sort: false,
                          ...cellAlignOptions({ align: "left" }),
                          customBodyRender: (_value, tableMeta: { rowIndex: number }) =>
                              items[tableMeta.rowIndex]._insuranceCompanyName || PENDING_BE,
                      },
                  },
              ] as MUIDataTableColumn[])
            : []),
        {
            name: "_delete",
            label: " ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: () => (
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <span>
                            <Button
                                size="small"
                                color="error"
                                disabled
                                startIcon={<DeleteOutlineIcon fontSize="small" />}
                            >
                                ลบ
                            </Button>
                        </span>
                    </Tooltip>
                ),
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />}
                text="รายการค่ารักษา(เบื้องต้น)"
                color="blue"
            />

            {showSimBSelector && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        ประเภทรายการค่าใช้จ่าย
                    </Typography>
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <span>
                            <ToggleButtonGroup exclusive size="small" value={formik.values.simBCategory} disabled>
                                <ToggleButton value="SimB1">Sim B1</ToggleButton>
                                <ToggleButton value="SimB2">Sim B2</ToggleButton>
                            </ToggleButtonGroup>
                        </span>
                    </Tooltip>
                </Box>
            )}

            <StandardDataTable
                name="billingExpenseTable"
                title=""
                data={items}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                displayFooter={false}
                options={defaultOptionStandardDataTable}
            />

            <Box sx={{ mt: 2 }}>
                <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                    <span>
                        <Button size="small" variant="outlined" disabled startIcon={<AddCircleOutlineIcon />}>
                            เพิ่มรายการค่ารักษา
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </CustomPaper>
    );
};

export default BillingExpenseTable;

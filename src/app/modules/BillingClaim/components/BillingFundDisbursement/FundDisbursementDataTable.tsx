import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { MUIDataTableColumn } from "mui-datatables";
import { PaginationResultDto, PaginationSortableDto, StandardDataTable } from "../../../_common";
import { defaultOptionStandardDataTable, numberWithCommas } from "../../../../functionHelpers";
import { FundDisbursementItem } from "../../store/fundDisbursement.types";
import { PENDING_BE_TOOLTIP } from "../../store/billingPendingFields";

type FundDisbursementDataTableProps = {
    hasClaimType: boolean;
    column: MUIDataTableColumn[];
    rows: FundDisbursementItem[];
    isLoading: boolean;
    pagination: PaginationResultDto;
    setPaginated: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
    selectedIndexes: number[];
    onRowSelected: (current: unknown[], all: unknown[], rowsSelected?: number[]) => void;
    selectedCount: number;
    selectedAmount: number;
};

/**
 * ตาราง + แถบ "ยืนยันตั้งเบิก" ของหน้าตั้งเบิกกองทุน
 *
 * ก่อนเลือกประเภทการเคลม (`hasClaimType` false) แสดงข้อความให้เลือกก่อนตามสเปค เลือกแล้วถึงต่อกับตาราง
 * จริง — ตารางใช้ checkbox ซ้าย (built-in `selectableRows: "multiple"` ของ mui-datatables) แทนคอลัมน์
 * checkbox แยกต่างหาก ปุ่ม "ยืนยันตั้งเบิก" ยัง disabled เสมอวันนี้ (ไม่มี endpoint ตั้งเบิกจริง —
 * ดู useFundDisbursementList.ts)
 */
const FundDisbursementDataTable = ({
    hasClaimType,
    column,
    rows,
    isLoading,
    pagination,
    setPaginated,
    selectedIndexes,
    onRowSelected,
    selectedCount,
    selectedAmount,
}: FundDisbursementDataTableProps) => {
    if (!hasClaimType) {
        return (
            <Box
                sx={{
                    p: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    border: "1px dashed #E0E0E0",
                    borderRadius: 3,
                }}
            >
                <Typography>กรุณาเลือกประเภทการเคลมก่อน ระบบจึงจะแสดงข้อมูลในตาราง</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <StandardDataTable
                name="fundDisbursementTable"
                title=""
                data={rows}
                columns={column}
                isLoading={isLoading}
                color="primary"
                columnHeaderAlign="center"
                paginated={pagination}
                setPaginated={setPaginated}
                rowsSelected={selectedIndexes}
                onRowSelectedIndex={onRowSelected}
                options={{ ...defaultOptionStandardDataTable, selectableRows: "multiple" }}
            />

            <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 2, p: 2, border: "1px solid #E0E0E0", borderRadius: 2, bgcolor: "#FBFDFF" }}
                spacing={1}
            >
                <Grid item>
                    <Typography sx={{ fontWeight: 600 }}>
                        เลือกแล้ว {selectedCount} รายการ — รวม {numberWithCommas(selectedAmount, 2)} บาท
                    </Typography>
                </Grid>
                <Grid item>
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <span>
                            <Button variant="contained" startIcon={<CheckCircleIcon />} disabled>
                                ยืนยันตั้งเบิก
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FundDisbursementDataTable;

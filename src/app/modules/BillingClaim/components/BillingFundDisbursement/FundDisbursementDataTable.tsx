import { Backdrop, Box, Button, CircularProgress, Grid, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { MUIDataTableColumn } from "mui-datatables";
import {
    PaginationResultDto,
    PaginationSortableDto,
    StandardDataTable,
    swalConfirm,
    swalError,
    swalSuccess,
} from "../../../_common";
import { defaultOptionStandardDataTable, numberWithCommas } from "../../../../functionHelpers";
import { PENDING_BE_TOOLTIP } from "../../store/billingPendingFields";
import { HospitalBillingClaimFundMonitorDto } from "../../../../api/claimBillingApi.client";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useCreateHospitalBilling } from "../../billingClaimHospitalApi";

type FundDisbursementDataTableProps = {
    hasClaimType: boolean;
    column: MUIDataTableColumn[];
    rows: HospitalBillingClaimFundMonitorDto[];
    isLoading: boolean;
    pagination: PaginationResultDto;
    setPaginated: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
    selectedIndexes: number[];
    onRowSelected: (current: unknown[], all: unknown[], rowsSelected?: number[]) => void;
    selectedCount: number;
    selectedAmount: number;
    selectedData: any[];
};

const SummaryCard = ({
    icon,
    iconBgColor,
    label,
    value,
}: {
    icon: React.ReactNode;
    iconBgColor: string;
    label: string;
    value: React.ReactNode;
}) => (
    <Box
        sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            height: "100%",
        }}
    >
        <Box
            sx={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: "10px",
                backgroundColor: iconBgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography sx={{ fontSize: "0.8rem", color: "#607D8B" }}>{label}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#212121" }}>{value}</Typography>
        </Box>
    </Box>
);

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
    selectedData,
}: FundDisbursementDataTableProps) => {
    const handleSuccess = (res: any) => {
        swalSuccess("ทำรายการสำเร็จ", res?.message ?? "");
    };

    const handleError = (error: string) => {
        swalError("แจ้งเตือน", error);
    };

    const handleMutate = () => {
        swalConfirm("ยืนยันทำรายการ", "", "ยืนยัน", "ยกเลิก").then((res) => {
            if (res.isConfirmed) {
                mutate({ billingDetailIds: selectedData.map((item) => item.billingDetailId) });
            }
        });
    };

    const { mutate, isLoading: isCreateHospitalLoading } = useCreateHospitalBilling(handleSuccess, handleError);

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
        <Box sx={{ mt: 2, p: 2, border: "1px solid #E0E0E0", borderRadius: 2, bgcolor: "#FBFDFF" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                รายการที่เลือกสำหรับวางบิล
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                    <SummaryCard
                        icon={<ChecklistRtlIcon sx={{ color: "#00ACC1", fontSize: 22 }} />}
                        iconBgColor="#E0F7FA"
                        label="จำนวนรายการที่เลือก"
                        value={`${selectedCount} รายการ`}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <SummaryCard
                        icon={<AccountBalanceWalletIcon sx={{ color: "#7E57C2", fontSize: 22 }} />}
                        iconBgColor="#EDE7F6"
                        label="จำนวนเงินตามรายการที่เลือก"
                        value={`${numberWithCommas(selectedAmount)} บาท`}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
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
                        displayToolbar={false}
                    />
                </Grid>
            </Grid>

            <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 2, p: 2, border: "1px solid #E0E0E0", borderRadius: 2, bgcolor: "#FBFDFF" }}
                spacing={1}
            >
                <Grid item></Grid>
                <Grid item>
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <span>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => {
                                    handleMutate();
                                    console.log({ billingDetailIds: selectedData.map((item) => item.billingDetailId) });
                                }}
                            >
                                ยืนยันตั้งเบิก
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
            <Backdrop open={isCreateHospitalLoading} style={{ zIndex: 9999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default FundDisbursementDataTable;

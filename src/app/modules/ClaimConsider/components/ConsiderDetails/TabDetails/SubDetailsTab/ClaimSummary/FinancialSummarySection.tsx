import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import { Box, Checkbox, Divider, FormControlLabel, Grid, Paper, Typography } from "@mui/material";
import { useMemo } from "react";
import { MUIDataTableColumn } from "mui-datatables";
import { CalculateCaseClaimDtoResponse } from "../../../../../../../api/coreClaimApi.client";
import { StandardDataTable } from "../../../../../../_common";
import { HeadingWithColor } from "../../../../../../_common/components/CustomComponent/HeadingWithColor";
import { fmt } from "../../../../../../CreatedClaim/components/CreateClaim/ClaimHistoryCard";
import { calculateSummary } from "../../../../../../ClaimSimulate/components/ConfirmCalaulateModal";
import { cellAlignOptions } from "../../../../../../../functionHelpers";
import SummaryLine from "./SummaryLine";

type FinancialSummarySectionProps = {
    calculateResult: CalculateCaseClaimDtoResponse | null;
    isCombinedWithMedicalAll: boolean;
    onCombinedWithMedicalAllChange: (isCombined: boolean) => void;
};

const tableSx = {
    "& td, & th": { fontSize: "15px !important", py: "5px !important", px: "9px !important" },
    "& td": {
        borderRight: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        "&:last-child": { borderRight: "none" },
    },
    "& th": { borderRight: "1px solid #ffffff44" },
    "& .MuiTableBody-root .MuiTableRow-root:only-child td": {
        bgcolor: "#fff !important",
        color: "text.secondary",
        fontWeight: 400,
        textAlign: "center",
        borderRight: "none",
    },
    "& tbody tr:last-child:not(:only-child) td": {
        bgcolor: "#3d3d3d !important",
        color: "#fff !important",
        fontWeight: "700 !important",
        borderRight: "1px solid #555 !important",
        borderBottom: "none !important",
        "&:last-child": { borderRight: "none !important" },
    },
    "& table": { borderCollapse: "collapse" },
};

const tableOptions = {
    serverSide: false,
    pagination: false,
    selectableRows: "none" as const,
    search: false,
    filter: false,
    download: false,
    print: false,
    viewColumns: false,
};

const FinancialSummarySection = ({
    calculateResult,
    isCombinedWithMedicalAll,
    onCombinedWithMedicalAllChange,
}: FinancialSummarySectionProps) => {
    const mergeOption = isCombinedWithMedicalAll ? "single" : null;
    const summary = useMemo(
        () =>
            calculateSummary(
                {
                    compensateNet: calculateResult?.compensateNet ?? 0,
                    compensateInclude: calculateResult?.compensateInclude ?? 0,
                    compensateRemain: calculateResult?.compensateRemain ?? 0,
                    medicalNet: calculateResult?.medicalNet ?? 0,
                    medicalCoverPay: calculateResult?.medicalCoverPay ?? 0,
                    medicalCompensateInclude: calculateResult?.medicalCompensateInclude ?? 0,
                    medicalPay: calculateResult?.medicalPay ?? 0,
                    medicalUnpay: calculateResult?.medicalUnpay ?? 0,
                },
                mergeOption
            ),
        [calculateResult, mergeOption]
    );

    const medicalExpenseRows = calculateResult?.medicalExpense ?? [];
    const compensationRows = calculateResult?.compensateExpense ?? [];
    const totalCoveredAmount = medicalExpenseRows.reduce((sum, row) => sum + (row.cover ?? 0), 0);
    const treatmentTableData = [
        ...medicalExpenseRows.map((item) => ({
            benefitName: item.benefitName ?? "-",
            coveredAmount: item.cover ?? 0,
            nonCoveredAmount: item.unCover ?? 0,
            unPayAmount: item.unPay ?? 0,
            payAmount: item.pay ?? 0,
        })),
        {
            groupName: "รวมทั้งหมด",
            benefitName: "",
            coveredAmount: totalCoveredAmount,
            nonCoveredAmount: medicalExpenseRows.reduce((sum, row) => sum + (row.unCover ?? 0), 0),
            unPayAmount: medicalExpenseRows.reduce((sum, row) => sum + (row.unPay ?? 0), 0),
            payAmount: medicalExpenseRows.reduce((sum, row) => sum + (row.pay ?? 0), 0),
        },
    ];
    const compensationTableData = [
        ...compensationRows.map((item) => ({ description: item.benefitName ?? "-", amount: item.pay ?? 0 })),
        { description: "รวมทั้งหมด", amount: compensationRows.reduce((sum, row) => sum + (row.pay ?? 0), 0) },
    ];

    const treatmentColumns: MUIDataTableColumn[] = [
        { name: "benefitName", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        {
            name: "coveredAmount",
            label: "รายการเบิก",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (value) => fmt(value) },
        },
        {
            name: "payAmount",
            label: "สิทธิ์เบิกตามความคุ้มครอง",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (value) => fmt(value) },
        },
        {
            name: "unPayAmount",
            label: "ส่วนเกินสิทธิ์",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (value) => fmt(value) },
        },
    ];
    const compensationColumns: MUIDataTableColumn[] = [
        { name: "description", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
        {
            name: "amount",
            label: "สิทธิ์เบิกตามความคุ้มครอง",
            options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (value) => fmt(value) },
        },
    ];
    const getRowStyle = (index: number, rowCount: number) => ({
        backgroundColor: index === rowCount - 1 ? "#3d3d3d" : index % 2 === 0 ? "#ffffff" : "#f9f9f9",
    });

    return (
        <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
                <HeadingWithColor
                    text="รายการค่ารักษา"
                    color="blue"
                    icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{ mb: 1 }}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <StandardDataTable
                        name="TreatmentSummaryTable"
                        title=""
                        data={treatmentTableData}
                        isLoading={false}
                        columns={treatmentColumns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={{
                            ...tableOptions,
                            setRowProps: (_row, _dataIndex, index) => ({
                                style: getRowStyle(index, treatmentTableData.length),
                            }),
                        }}
                        sx={tableSx}
                    />
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <HeadingWithColor
                    text="ค่าชดเชย"
                    color="blue"
                    icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{ mb: 1 }}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <StandardDataTable
                        name="CompensationTable"
                        title=""
                        data={compensationTableData}
                        isLoading={false}
                        columns={compensationColumns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={{
                            ...tableOptions,
                            setRowProps: (_row, _dataIndex, index) => ({
                                style: getRowStyle(index, compensationTableData.length),
                            }),
                        }}
                        sx={tableSx}
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <HeadingWithColor
                    text="สรุปค่าชดเชย"
                    color="blue"
                    icon={<SummarizeOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{ mb: 1 }}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Box px={1.5} py={0.5} bgcolor="#f8f9fa">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={mergeOption === "single"}
                                    onChange={(_event, isChecked) => onCombinedWithMedicalAllChange(isChecked)}
                                    color="primary"
                                />
                            }
                            label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา</Typography>}
                            sx={{ m: 0, display: "flex", py: 0.5 }}
                        />
                        <Divider />
                    </Box>
                    <Divider />
                    <SummaryLine label="ค่าชดเชยรวม" value={fmt(summary.compensateNet)} />
                    <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(summary.compensateInclude)} />
                    <SummaryLine
                        label="ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)"
                        value={fmt(summary.compensateRemain)}
                        bold
                        color="#15803d"
                        bg="#F7FEE7"
                        noDivider
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <HeadingWithColor
                    text="สรุปค่าใช้จ่ายโรงพยาบาล"
                    color="blue"
                    icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{ mb: 1 }}
                />
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <SummaryLine label="ยอดเบิกรวม" value={fmt(totalCoveredAmount)} />
                    <SummaryLine label="สิทธิ์ความคุ้มครอง" value={fmt(summary.medicalCoverPay)} />
                    <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(summary.compensateInclude)} />
                    <SummaryLine
                        label="สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท"
                        value={fmt(summary.medicalPay)}
                        bold
                        color="#1a5da8"
                        bg="#e8f0fb"
                    />
                    <SummaryLine
                        label="ส่วนเกิน (ลูกค้าจ่าย)"
                        value={fmt(summary.medicalUnpay)}
                        bold
                        color="#FF6467"
                        bg="#FEF2F2"
                        noDivider
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default FinancialSummarySection;

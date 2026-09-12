import { Box, TableCell, TableFooter, TableRow, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import PaidIcon from "@mui/icons-material/Paid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import { StandardDataTable } from "../../../../_common";
import CardClaimInfo from "../../_common/CardClaimInfo";
import usePaymentHistoryTab from "../../../hooks/ClaimConsiderDetail/usePaymentHistoryTab";
import { cellAlignOptions, formatDateString } from "../../../../../functionHelpers";

const fmtBaht = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type PaymentHistoryTabProps = {
    /** applicationCode (policyCode) ของผู้เอาประกันของเคสที่กำลังพิจารณาอยู่ — ใช้ยิง useGetDCR */
    applicationCode?: string;
};

const PaymentHistoryTab = ({ applicationCode }: PaymentHistoryTabProps) => {
    const { items, summary, isLoading, pagination, setPaginated, filteredTotalBilledAmount, filteredTotalPaidAmount } =
        usePaymentHistoryTab(applicationCode);

    const columns: MUIDataTableColumn[] = [
        {
            name: "period",
            label: "งวดความคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => formatDateString(value?.toString(), "D/M/BBBB HH:mm:ss"),
            },
        },
        {
            name: "insuredCompanyName",
            label: "บริษัทประกัน",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        {
            name: "productName",
            label: "แผนความคุ้มครอง",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        {
            name: "premiumDept",
            label: "ตั้งหนี้",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: number) => fmtBaht(value ?? 0),
            },
        },
        {
            name: "premiumRecieve",
            label: "ชำระแล้ว",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: number) => fmtBaht(value ?? 0),
            },
        },
        {
            name: "paymentType",
            label: "วิธีการชำระ",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: string) =>
                    value ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccountBalanceIcon fontSize="small" color="primary" />
                            <Typography variant="body2" color="primary" noWrap>
                                {value}
                            </Typography>
                        </Box>
                    ) : (
                        "-"
                    ),
            },
        },
        {
            // BE ยังไม่ส่งรหัสการยืนยันมาให้ที่ endpoint นี้
            name: "confirmationCode",
            label: "รหัสการยืนยัน",
            options: { ...cellAlignOptions({ align: "center" }), customBodyRender: () => "-" },
        },
        {
            // BE ยังไม่ส่งข้อมูลคืนเงินมาให้ที่ endpoint นี้
            name: "refundAmount",
            label: "คืนเงิน",
            options: { ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }), customBodyRender: () => "-" },
        },
        {
            // BE ยังไม่ส่งรหัสคืนเงินมาให้ที่ endpoint นี้
            name: "refundCode",
            label: "รหัสคืนเงิน",
            options: { ...cellAlignOptions({ align: "center" }), customBodyRender: () => "-" },
        },
        {
            name: "policyNo",
            label: "เลขกรมธรรม์",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: string) => value ?? "-",
            },
        },
        {
            name: "bankTransactionDatetime",
            label: "วันที่ชำระเงิน",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value.toString(), "D/M/BBBB HH:mm:ss") : "-"),
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<PaymentsIcon sx={{ fontSize: 27 }} />} text="ประวัติการชำระเงิน" color="blue" />
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
                    gap: 2,
                    mb: 2.5,
                }}
            >
                <CardClaimInfo
                    icon={<ReceiptLongIcon />}
                    label="จำนวนงวด"
                    value={`${summary.totalPeriods} งวด`}
                    iconColor="#1a5da8"
                    iconBgColor="#e8f0fb"
                />
                <CardClaimInfo
                    icon={<RequestQuoteIcon />}
                    label="ตั้งหนี้รวม"
                    value={`${fmtBaht(summary.totalBilledAmount)} บาท`}
                    iconColor="#0B7FC7"
                    iconBgColor="#EAF5FF"
                />
                <CardClaimInfo
                    icon={<PaidIcon />}
                    label="ชำระแล้วรวม"
                    value={`${fmtBaht(summary.totalPaidAmount)} บาท`}
                    iconColor="#0F9D58"
                    iconBgColor="#E6F6EC"
                />
                <CardClaimInfo
                    icon={<CheckCircleIcon />}
                    label="งวดที่ชำระแล้ว"
                    value={`${summary.paidPeriodCount} งวด`}
                    iconColor="#0B7FC7"
                    iconBgColor="#EAF5FF"
                />
                <CardClaimInfo
                    icon={<PendingActionsIcon />}
                    label="งวดค้างชำระ"
                    value={`${summary.unpaidPeriodCount} งวด`}
                    iconColor="#C79207"
                    iconBgColor="#FFF3CD"
                />
            </Box>

            <LoadingOverlay isLoading={isLoading} minHeight={300}>
                {!isLoading && items.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <PaymentsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                        <Typography color="text.disabled">ไม่พบข้อมูลการชำระเงิน</Typography>
                    </Box>
                ) : (
                    <StandardDataTable
                        name="paymentHistoryTable"
                        title=""
                        data={items}
                        isLoading={isLoading}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        paginated={pagination}
                        setPaginated={setPaginated}
                        rowsPerPage={[10, 15, 25, 50]}
                        displayToolbar={false}
                        options={{
                            customTableBodyFooterRender: () => (
                                <TableFooter>
                                    <TableRow sx={{ "& td": { fontWeight: 700, bgcolor: "#F5F8FC" } }}>
                                        <TableCell colSpan={3}>Total:</TableCell>
                                        <TableCell align="right">{fmtBaht(filteredTotalBilledAmount)}</TableCell>
                                        <TableCell align="right">{fmtBaht(filteredTotalPaidAmount)}</TableCell>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                </TableFooter>
                            ),
                        }}
                    />
                )}
            </LoadingOverlay>
        </CustomPaper>
    );
};

export default PaymentHistoryTab;

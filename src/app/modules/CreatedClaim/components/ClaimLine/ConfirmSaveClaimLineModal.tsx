// import React, { useState } from "react";
// import {
//     Avatar,
//     Box,
//     Button,
//     Checkbox,
//     Dialog,
//     DialogContent,
//     DialogTitle,
//     Divider,
//     FormControlLabel,
//     Grid,
//     IconButton,
//     Paper,
//     Typography,
// } from "@mui/material";
// import SaveIcon from "@mui/icons-material/Save";
// import CloseIcon from "@mui/icons-material/Close";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
// import { MUIDataTableColumn } from "mui-datatables";
// import { useAppSelector } from "../../../../../redux";
// import { StandardDataTable } from "../../../_common";
// import { cellAlignOptions } from "../../../../functionHelpers";

// interface Props {
//     open: boolean;
//     onClose: () => void;
//     onConfirm: () => void;
// }

// interface SummaryGroup {
//     groupName: string;
//     claimAmount: number;
//     rightAmount: number;
//     netAmount: number;
// }

// interface CompensationItem {
//     description: string;
//     days: number;
//     ratePerDay: number;
//     amount: number;
// }

// const MOCK_COMPENSATION: CompensationItem[] = [
//     { description: "ค่าชดเชยการนอนรักษาพยาบาลเป็นผู้ป่วยใน", days: 0, ratePerDay: 0, amount: 0 },
// ];

// const ConfirmSaveClaimLineModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
//     const { summary, items } = useAppSelector((s) => s.claimline);
//     const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

//     // ── checkbox เลือกได้แค่อันเดียว ──────────────────────────────────────────
//     const [mergeOption, setMergeOption] = useState<"single" | "all" | null>(null);

//     // ── คำนวณยอดต่อกลุ่มสี ───────────────────────────────────────────────────
//     const sumByColor = (colors: string[]) =>
//         items
//             .filter((i) => colors.includes(i.color) && !i.disabled)
//             .reduce((s, i) => s + (parseFloat(i.claimAmount) || 0), 0);

//     const groupRows: SummaryGroup[] = [
//         {
//             groupName: "ค่าห้องค่าอาหาร และการพยาบาลผู้ป่วยปกติ",
//             claimAmount: sumByColor(["pink"]),
//             rightAmount: 0,
//             netAmount: 0,
//         },
//         {
//             groupName: "ค่าห้องค่าอาหาร และการพยาบาลผู้ป่วยหนัก ICU",
//             claimAmount: sumByColor(["cyan"]),
//             rightAmount: 0,
//             netAmount: 0,
//         },
//         {
//             groupName: "ค่ารักษาพยาบาล และค่าบริการทั่วไป",
//             claimAmount: sumByColor(["yellow"]),
//             rightAmount: 0,
//             netAmount: 0,
//         },
//         { groupName: "การรักษาโดยการผ่าตัด", claimAmount: sumByColor(["purple"]), rightAmount: 0, netAmount: 0 },
//         { groupName: "การดูแลโดยแพทย์ (ค่าแพทย์เยี่ยมไข้ ผู้ป่วยใน)", claimAmount: 0, rightAmount: 0, netAmount: 0 },
//         {
//             groupName: "ค่าบริการอื่นๆ / ค่าใช้จ่ายอื่นที่ไม่ใช่การรักษาพยาบาล",
//             claimAmount: sumByColor(["green"]),
//             rightAmount: 0,
//             netAmount: 0,
//         },
//     ];

//     const totalClaim = groupRows.reduce((s, r) => s + r.claimAmount, 0);
//     const totalRight = groupRows.reduce((s, r) => s + r.rightAmount, 0);
//     const totalNet = groupRows.reduce((s, r) => s + r.netAmount, 0);

//     const treatmentTableData = [
//         ...groupRows,
//         { groupName: "Totals:", claimAmount: totalClaim, rightAmount: totalRight, netAmount: totalNet },
//     ];

//     // ── ค่าชดเชย ─────────────────────────────────────────────────────────────
//     const compensationTotal = MOCK_COMPENSATION.reduce((s, i) => s + i.amount, 0);
//     const compensationInCoverage = 0; // TODO: API
//     const compensationRemaining = compensationTotal - compensationInCoverage;

//     const compensationTableData = [
//         ...MOCK_COMPENSATION,
//         {
//             description: "Total :",
//             days: MOCK_COMPENSATION.reduce((s, i) => s + i.days, 0),
//             ratePerDay: 0,
//             amount: compensationTotal,
//         },
//     ];

//     // ── สรุปค่าใช้จ่ายโรงพยาบาล ──────────────────────────────────────────────
//     const totalExpense = summary.coveredAmount;
//     const coverageRight = 0; // TODO: API
//     const compensation = compensationInCoverage;
//     const totalCoverage = coverageRight + compensation;
//     const customerPay = Math.max(totalExpense - totalCoverage, 0);

//     // ── columns: รายการค่ารักษา ───────────────────────────────────────────────
//     const treatmentColumns: MUIDataTableColumn[] = [
//         { name: "groupName", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
//         {
//             name: "claimAmount",
//             label: "รายการเบิก",
//             options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
//         },
//         {
//             name: "rightAmount",
//             label: "สิทธิ์เบิก",
//             options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
//         },
//         {
//             name: "netAmount",
//             label: "ส่วนเกินสิทธิ์",
//             options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
//         },
//     ];

//     // ── columns: ค่าชดเชย ────────────────────────────────────────────────────
//     const compensationColumns: MUIDataTableColumn[] = [
//         { name: "description", label: "รายการ", options: { ...cellAlignOptions({ align: "left" }) } },
//         { name: "days", label: "จำนวนวัน", options: { ...cellAlignOptions({ align: "center" }) } },
//         {
//             name: "ratePerDay",
//             label: "อัตราต่อวัน",
//             options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
//         },
//         {
//             name: "amount",
//             label: "จำนวนเงิน",
//             options: { ...cellAlignOptions({ align: "right" }), customBodyRender: (v) => fmt(v) },
//         },
//     ];

//     // ── shared table sx ───────────────────────────────────────────────────────
//     const tableSx = {
//         "& td, & th": { fontSize: "13px !important", py: "4px !important", px: "8px !important" },
//         "& td": {
//             borderRight: "1px solid #e0e0e0",
//             borderBottom: "1px solid #e0e0e0",
//             "&:last-child": { borderRight: "none" },
//         },
//         "& th": { borderRight: "1px solid #ffffff44" },
//         "& tbody tr:last-child td": {
//             bgcolor: "#4a4a4a !important",
//             color: "#fff !important",
//             fontWeight: "700 !important",
//             borderRight: "1px solid #666 !important",
//             borderBottom: "none !important",
//             "&:last-child": { borderRight: "none !important" },
//         },
//         "& table": { borderCollapse: "collapse" },
//     };

//     const tableOptions = {
//         serverSide: false,
//         pagination: false,
//         selectableRows: "none" as const,
//         search: false,
//         filter: false,
//         download: false,
//         print: false,
//         viewColumns: false,
//     };

//     // ── SectionTitle ──────────────────────────────────────────────────────────
//     const SectionTitle = ({ text }: { text: string }) => (
//         <Typography fontWeight={700} fontSize={14} sx={{ textDecoration: "underline", mb: 1, color: "text.primary" }}>
//             {text}
//         </Typography>
//     );

//     // ── SummaryLine ───────────────────────────────────────────────────────────
//     const SummaryLine = ({
//         label,
//         value,
//         bold = false,
//         highlight = false,
//     }: {
//         label: string;
//         value: string;
//         bold?: boolean;
//         highlight?: boolean;
//     }) => (
//         <>
//             <Box display="flex" justifyContent="space-between" alignItems="center" py={0.6} px={1.5}>
//                 <Typography
//                     variant="body2"
//                     fontWeight={bold ? 700 : 400}
//                     color={highlight ? "error.main" : "text.primary"}
//                 >
//                     {label}
//                 </Typography>
//                 <Typography
//                     variant="body2"
//                     fontWeight={bold ? 700 : 400}
//                     color={highlight ? "error.main" : "text.primary"}
//                     minWidth={100}
//                     textAlign="right"
//                 >
//                     {value}
//                 </Typography>
//             </Box>
//             <Divider />
//         </>
//     );

//     return (
//         <Dialog open={open} maxWidth="md" fullWidth>
//             <DialogTitle sx={{ pb: 0 }}>
//                 <Grid container alignItems="center" justifyContent="space-between">
//                     <Box display="flex" alignItems="center" gap={1}>
//                         <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
//                             <ReceiptLongIcon sx={{ fontSize: 24, color: "primary.main" }} />
//                         </Avatar>
//                         <Typography fontWeight="bold" fontSize={18}>
//                             สรุปรายการค่าใช้จ่าย
//                         </Typography>
//                     </Box>
//                     <IconButton
//                         onClick={onClose}
//                         size="small"
//                         sx={{
//                             bgcolor: "error.main",
//                             color: "common.white",
//                             width: 25,
//                             height: 25,
//                             "&:hover": { bgcolor: "error.dark" },
//                         }}
//                     >
//                         <CloseIcon sx={{ fontSize: 23 }} />
//                     </IconButton>
//                 </Grid>
//                 <Divider sx={{ mt: 1.5 }} />
//             </DialogTitle>

//             <DialogContent sx={{ pt: 1.5 }}>
//                 <Grid container spacing={2}>
//                     {/* ── ตารางรายการค่ารักษา ── */}
//                     <Grid item xs={12}>
//                         <SectionTitle text="รายการค่ารักษา" />
//                         <StandardDataTable
//                             name="TreatmentSummaryTable"
//                             title=""
//                             data={treatmentTableData}
//                             isLoading={false}
//                             columns={treatmentColumns}
//                             color="primary"
//                             columnHeaderAlign="center"
//                             displayToolbar={false}
//                             displayFooter={false}
//                             options={{
//                                 ...tableOptions,
//                                 setRowProps: (_r, _d, i) => ({
//                                     style:
//                                         i === treatmentTableData.length - 1
//                                             ? { backgroundColor: "#4a4a4a" }
//                                             : i % 2 === 0
//                                             ? { backgroundColor: "#ffffff" }
//                                             : { backgroundColor: "#f5f5f5" },
//                                 }),
//                             }}
//                             sx={tableSx}
//                         />
//                     </Grid>

//                     {/* ── ตารางค่าชดเชย ── */}
//                     <Grid item xs={12}>
//                         <SectionTitle text="ค่าชดเชย" />
//                         <StandardDataTable
//                             name="CompensationTable"
//                             title=""
//                             data={compensationTableData}
//                             isLoading={false}
//                             columns={compensationColumns}
//                             color="primary"
//                             columnHeaderAlign="center"
//                             displayToolbar={false}
//                             displayFooter={false}
//                             options={{
//                                 ...tableOptions,
//                                 setRowProps: (_r, _d, i) => ({
//                                     style:
//                                         i === compensationTableData.length - 1
//                                             ? { backgroundColor: "#4a4a4a" }
//                                             : i % 2 === 0
//                                             ? { backgroundColor: "#ffffff" }
//                                             : { backgroundColor: "#f5f5f5" },
//                                 }),
//                             }}
//                             sx={tableSx}
//                         />
//                     </Grid>

//                     {/* ── สรุปค่าชดเชย ── */}
//                     <Grid item xs={12} md={6}>
//                         <SectionTitle text="สรุปค่าชดเชย" />
//                         <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
//                             {/* Checkbox 2 อัน เลือกได้แค่อันเดียว */}
//                             <Box px={1.5} py={1} display="flex" flexDirection="column" gap={0.5} bgcolor="#fafafa">
//                                 <FormControlLabel
//                                     control={
//                                         <Checkbox
//                                             size="small"
//                                             checked={mergeOption === "single"}
//                                             onChange={() => setMergeOption(mergeOption === "single" ? null : "single")}
//                                         />
//                                     }
//                                     label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา</Typography>}
//                                     sx={{ m: 0 }}
//                                 />
//                                 <FormControlLabel
//                                     control={
//                                         <Checkbox
//                                             size="small"
//                                             checked={mergeOption === "all"}
//                                             onChange={() => setMergeOption(mergeOption === "all" ? null : "all")}
//                                         />
//                                     }
//                                     label={<Typography variant="body2">โอนค่าชดเชยรวมกับค่ารักษา (ทั้งหมด)</Typography>}
//                                     sx={{ m: 0 }}
//                                 />
//                             </Box>
//                             <Divider />
//                             <SummaryLine label="ค่าชดเชยรวม" value={fmt(compensationTotal)} />
//                             <SummaryLine
//                                 label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)"
//                                 value={fmt(compensationInCoverage)}
//                             />
//                             <Box
//                                 display="flex"
//                                 justifyContent="space-between"
//                                 alignItems="center"
//                                 py={0.6}
//                                 px={1.5}
//                                 sx={{ bgcolor: "#f5f5f5" }}
//                             >
//                                 <Typography variant="body2" fontWeight={700}>
//                                     ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)
//                                 </Typography>
//                                 <Typography
//                                     variant="body2"
//                                     fontWeight={700}
//                                     color="primary"
//                                     minWidth={100}
//                                     textAlign="right"
//                                 >
//                                     {fmt(compensationRemaining)}
//                                 </Typography>
//                             </Box>
//                         </Paper>
//                     </Grid>

//                     {/* ── สรุปค่าใช้จ่ายโรงพยาบาล ── */}
//                     <Grid item xs={12} md={6}>
//                         <SectionTitle text="สรุปค่าใช้จ่ายโรงพยาบาล" />
//                         <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
//                             <SummaryLine label="ค่าใช้จ่ายทั้งสิ้น" value={fmt(totalExpense)} />
//                             <SummaryLine label="สิทธิ์ความคุ้มครอง" value={fmt(coverageRight)} />
//                             <SummaryLine label="ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง)" value={fmt(compensation)} />
//                             <Box display="flex" justifyContent="space-between" alignItems="center" py={0.6} px={1.5}>
//                                 <Typography variant="body2" fontWeight={700}>
//                                     สิทธิ์โรงพยาบาล
//                                 </Typography>
//                                 <Typography
//                                     variant="body2"
//                                     fontWeight={700}
//                                     color="primary"
//                                     minWidth={100}
//                                     textAlign="right"
//                                 >
//                                     {fmt(totalCoverage)}
//                                 </Typography>
//                             </Box>
//                             <Divider />
//                             <Box
//                                 display="flex"
//                                 justifyContent="space-between"
//                                 alignItems="center"
//                                 py={0.6}
//                                 px={1.5}
//                                 sx={{ bgcolor: "#fdf5f5" }}
//                             >
//                                 <Typography variant="body2" fontWeight={700} color="error.main">
//                                     ส่วนเกิน
//                                 </Typography>
//                                 <Typography
//                                     variant="body2"
//                                     fontWeight={700}
//                                     color="error.main"
//                                     minWidth={100}
//                                     textAlign="right"
//                                 >
//                                     {fmt(customerPay)}
//                                 </Typography>
//                             </Box>
//                         </Paper>
//                     </Grid>

//                     {/* ── Warning ── */}
//                     <Grid item xs={12}>
//                         <Box
//                             sx={{
//                                 bgcolor: "#fdf6e3",
//                                 borderLeft: "4px solid #c8a415",
//                                 px: 2,
//                                 py: 1,
//                                 borderRadius: "0 4px 4px 0",
//                             }}
//                         >
//                             <Typography fontSize={13} fontWeight={600} color="#c8a415">
//                                 กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการบันทึก
//                             </Typography>
//                         </Box>
//                     </Grid>

//                     {/* ── ปุ่มยืนยัน ── */}
//                     <Grid item xs={12}>
//                         <Grid container justifyContent="center">
//                             <Grid item xs={12} sm={6} md={4} lg={3}>
//                                 <Button
//                                     variant="contained"
//                                     color="success"
//                                     fullWidth
//                                     size="medium"
//                                     startIcon={<SaveIcon />}
//                                     onClick={onConfirm}
//                                 >
//                                     ยืนยันการบันทึก
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default ConfirmSaveClaimLineModal;

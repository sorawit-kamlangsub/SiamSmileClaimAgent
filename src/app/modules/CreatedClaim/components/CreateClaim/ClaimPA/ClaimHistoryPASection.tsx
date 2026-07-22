// import React from "react";
// import { Box, Typography, Divider, Button, Chip } from "@mui/material";
// import HistoryIcon from "@mui/icons-material/History";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
// import { useClaimHistory } from "../../../hooks/Monitor/useClaimHistory";
// import { formatDateString } from "../../../../../functionHelpers";
// import { backgroundColor, colorLine } from "../../../../_common/components/CustomComponent/HeadingWithColor";

// const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const ClaimHistoryPASection: React.FC = () => {
//     const { claimHistoryData } = useClaimHistory();

//     return (
//         <CustomBox sx={{ minHeight: 284 }}>
//             <Box
//                 sx={{
//                     bgcolor: backgroundColor.blue,
//                     borderLeft: "4px solid " + colorLine.blue,
//                     px: 2,
//                     py: 1,
//                     mb: 2,
//                     borderRadius: "0 4px 4px 0",
//                     justifyContent: "space-between",
//                     display: "flex",
//                     alignItems: "center",
//                     fontSize: 27,
//                 }}
//             >
//                 <Box display="flex" alignItems="center" gap={1}>
//                     <HistoryIcon sx={{ fontSize: 27, color: colorLine.blue }} />
//                     <Typography fontSize={16} fontWeight="bold" color={colorLine.blue}>
//                         ประวัติการเคลม
//                     </Typography>
//                 </Box>

//                 <Box display="flex" alignItems="center" gap={1}>
//                     <Chip
//                         label={`${claimHistoryData?.data?.[0]?.totalCount ?? 0} รายการ`}
//                         size="small"
//                         sx={{
//                             bgcolor: "#d9ecfb",
//                             color: "primary.dark",
//                             fontWeight: "bold",
//                             fontSize: 13,
//                         }}
//                     />
//                     <Button
//                         variant="outlined"
//                         size="small"
//                         startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
//                         sx={{
//                             bgcolor: "background.paper",
//                             borderRadius: 2,
//                             textTransform: "none",
//                             fontWeight: "bold",
//                             fontSize: 13,
//                         }}
//                     >
//                         ดูรายการทั้งหมด
//                     </Button>
//                 </Box>
//             </Box>

//             {/* Cards */}
//             {claimHistoryData?.data?.length === 0 ? (
//                 <Box textAlign="center" py={4} color="text.secondary">
//                     <Typography fontSize={14}>ไม่มีประวัติการเคลม</Typography>
//                 </Box>
//             ) : (
//                 claimHistoryData?.data?.map((item, idx) => (
//                     <Box
//                         key={idx}
//                         sx={{
//                             border: "1px solid",
//                             borderColor: "divider",
//                             borderRadius: 3,
//                             mb: 1.5,
//                             overflow: "hidden",
//                             transition: "all 0.2s",
//                             "&:hover": {
//                                 borderColor: "primary.light",
//                                 boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//                             },
//                         }}
//                     >
//                         {/* 1. เลขที่เคลม + badge สถานะ */}
//                         <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pt={2} pb={1.5}>
//                             <Box>
//                                 <Typography fontSize={12} color="text.secondary">
//                                     เลขที่เคลม
//                                 </Typography>
//                                 <Typography
//                                     fontSize={16}
//                                     fontWeight="bold"
//                                     color="primary.main"
//                                     sx={{ textDecoration: "underline", cursor: "pointer" }}
//                                     onClick={() => handleDetailClick(item)}
//                                 >
//                                     {item.claimNo}
//                                 </Typography>
//                             </Box>

//                             {/* TODO: ยังไม่มี field สถานะจริง (เช่น item.claimStatus) จึงใช้ static ไปก่อน */}
//                             <Box
//                                 display="flex"
//                                 alignItems="center"
//                                 gap={0.75}
//                                 sx={{
//                                     border: "1px solid",
//                                     borderColor: "divider",
//                                     px: 1.5,
//                                     py: 0.5,
//                                     borderRadius: 5,
//                                 }}
//                             >
//                                 <Box
//                                     display="flex"
//                                     alignItems="center"
//                                     justifyContent="center"
//                                     sx={{
//                                         width: 20,
//                                         height: 20,
//                                         borderRadius: "50%",
//                                         bgcolor: "text.secondary",
//                                     }}
//                                 >
//                                     <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />
//                                 </Box>
//                                 <Typography fontSize={13} fontWeight="bold" color="text.secondary">
//                                     เคลมปกติ
//                                 </Typography>
//                             </Box>
//                         </Box>

//                         {/* {true && (
//                             <Box
//                                 mx={2}
//                                 mb={1.5}
//                                 display="flex"
//                                 alignItems="center"
//                                 gap={1}
//                                 sx={{
//                                     border: "1px dashed",
//                                     borderColor: "divider",
//                                     borderRadius: 2,
//                                     px: 1.5,
//                                     py: 1,
//                                 }}
//                             >
//                                 <Box
//                                     display="flex"
//                                     alignItems="center"
//                                     justifyContent="center"
//                                     sx={{
//                                         width: 20,
//                                         height: 20,
//                                         borderRadius: "50%",
//                                         bgcolor: "text.secondary",
//                                         flexShrink: 0,
//                                     }}
//                                 >
//                                     <InfoOutlinedIcon sx={{ fontSize: 13, color: "#fff" }} />
//                                 </Box>
//                                 <Typography fontSize={13} color="text.secondary">
//                                     เคยเบิกสูญเสียอวัยวะแล้ว
//                                 </Typography>
//                             </Box>
//                         )} */}

//                         <Box
//                             display="flex"
//                             flexWrap="wrap"
//                             justifyContent="space-between"
//                             alignItems="flex-start"
//                             columnGap={3}
//                             rowGap={1.5}
//                             px={2}
//                             pb={2}
//                         >
//                             <Box>
//                                 <Typography fontSize={12} color="text.secondary">
//                                     วันที่เกิดเหตุ
//                                 </Typography>
//                                 <Typography fontSize={14} fontWeight="600" color="text.primary">
//                                     {item.incidentDate
//                                         ? formatDateString(item.incidentDate.toString(), "DD/MM/BBBB")
//                                         : "-"}
//                                 </Typography>
//                             </Box>

//                             <Box sx={{ flex: 1, minWidth: 160 }}>
//                                 <Typography fontSize={12} color="text.secondary">
//                                     อาการสำคัญ
//                                 </Typography>
//                                 <Typography fontSize={14} fontWeight="600" color="text.primary">
//                                     {item.chiefComplaintDetail}
//                                 </Typography>
//                             </Box>

//                             <Box textAlign="right">
//                                 <Typography fontSize={12} color="text.secondary">
//                                     ยอดเบิกรวม
//                                 </Typography>
//                                 <Typography fontSize={15} fontWeight="bold" color="primary.main">
//                                     {fmt(item.caseAmount ?? 0)}
//                                 </Typography>
//                             </Box>

//                             <Box textAlign="right">
//                                 <Typography fontSize={12} color="text.secondary">
//                                     ยอดจ่ายรวม
//                                 </Typography>
//                                 <Typography fontSize={15} fontWeight="bold" color="success.main">
//                                     {fmt(item.totalPaidAmount ?? 0)}
//                                 </Typography>
//                             </Box>
//                         </Box>

//                         {/* 4. กล่องล่างสุด: ลิงก์ดูเคสย่อย + จำนวนเคส (ซ้าย) / ปุ่มดูรายละเอียด (ขวา) */}
//                         <Box px={2} pb={2}>
//                             <Box
//                                 display="flex"
//                                 alignItems="center"
//                                 justifyContent="space-between"
//                                 sx={{
//                                     border: "1px solid",
//                                     borderColor: "primary.light",
//                                     borderRadius: 2,
//                                     px: 2,
//                                     py: 1.25,
//                                 }}
//                             >
//                                 <Box>
//                                     <Box
//                                         display="flex"
//                                         alignItems="center"
//                                         gap={0.75}
//                                         sx={{ cursor: "pointer" }}
//                                         onClick={() => handleDetailClick(item)}
//                                     >
//                                         <ReceiptLongIcon sx={{ fontSize: 18, color: "primary.main" }} />
//                                         <Typography fontSize={13} fontWeight="600" color="primary.main">
//                                             ดูรายละเอียดเคสในเคลมนี้
//                                         </Typography>
//                                     </Box>
//                                     {/* TODO: ยังไม่มี field จำนวนเคสจริง (เช่น item.caseCount) จึงใช้ static ไปก่อน */}
//                                     <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
//                                         ทั้งหมด 1 เคส
//                                     </Typography>
//                                 </Box>

//                                 <Button
//                                     variant="contained"
//                                     color="primary"
//                                     startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
//                                     sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
//                                     onClick={() => handleDetailClick(item)}
//                                 >
//                                     ดูรายละเอียด
//                                 </Button>
//                             </Box>
//                         </Box>
//                     </Box>
//                 ))
//             )}
//         </CustomBox>
//     );
// };

// export default ClaimHistoryPASection;

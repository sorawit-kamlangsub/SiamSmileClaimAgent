import { Box, Chip, IconButton, Pagination, Paper, Stack, Tooltip, Typography } from "@mui/material";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import AssignmentReturnedOutlinedIcon from "@mui/icons-material/AssignmentReturnedOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReplyAllOutlinedIcon from "@mui/icons-material/ReplyAllOutlined";
import useClaimTransactionHook from "../../../hooks/ClaimConsiderDetail/ClaimTransactionHook";
import {
    backgroundColorMapDecision,
    colorMapDecision,
    formatDateString,
    numberWithCommas,
} from "../../../../../functionHelpers";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import { useAppDispatch } from "../../../../../../redux";
import { setViewingDraft } from "../../../store/claimConsiderSlice";
type TransactionLogVisual = {
    icon: React.ElementType;
    bgcolor: string;
    color: string;
};

const transactionLogVisualMap: Record<number, TransactionLogVisual> = {
    0: { icon: HistoryOutlinedIcon, bgcolor: "#9E9E9E", color: "#FFFFFF" }, // ไม่ทราบประเภท / ยังไม่รองรับ
    1: { icon: NoteAddOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // สร้างรายการเคลม
    2: { icon: FolderOpenOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // สร้างรายการเคส
    3: { icon: SmsOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // ส่ง SMS สำเร็จ
    4: { icon: CheckCircleOutlineIcon, bgcolor: "#2E9E5B", color: "#FFFFFF" }, // โอนสำเร็จ
    5: { icon: ErrorOutlineIcon, bgcolor: "#D32F2F", color: "#FFFFFF" }, // โอนไม่สำเร็จ
    6: { icon: HourglassEmptyOutlinedIcon, bgcolor: "#C79207", color: "#FFFFFF" }, // อยู่ระหว่างการพิจารณา
    7: { icon: TaskAltIcon, bgcolor: "#2E9E5B", color: "#FFFFFF" }, // บันทึกผลพิจารณา (อนุมัติ)
    8: { icon: HighlightOffIcon, bgcolor: "#D32F2F", color: "#FFFFFF" }, // บันทึกผลพิจารณา (ปฏิเสธ)
    9: { icon: CancelOutlinedIcon, bgcolor: "#B71C1C", color: "#FFFFFF" }, // บันทึกผลพิจารณา (ยกเลิก)
    10: { icon: AddCardOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // โอนเพิ่ม
    11: { icon: ReplayOutlinedIcon, bgcolor: "#C79207", color: "#FFFFFF" }, // คืนเงิน
    12: { icon: AssignmentReturnedOutlinedIcon, bgcolor: "#2E9E5B", color: "#FFFFFF" }, // คืนเงินสำเร็จ
    13: { icon: LocalHospitalOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // แจ้งเข้ารับการรักษา
    14: { icon: MeetingRoomOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // Discharge
    15: { icon: DraftsOutlinedIcon, bgcolor: "#757575", color: "#FFFFFF" }, // บันทึกแบบร่าง
    16: { icon: NotificationsActiveOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // แจ้งผลการโอนเงิน
    23: { icon: LocalHospitalOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // Admission (จาก SmileConnect)
    24: { icon: MeetingRoomOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // Discharge (จาก SmileConnect)
    25: { icon: ReplyOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // ตอบกลับผลพิจารณา
    26: { icon: ReceiptLongOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // รับผลวางบิล
    27: { icon: ReplyAllOutlinedIcon, bgcolor: "#0B79D0", color: "#FFFFFF" }, // ตอบกลับผลวางบิล
};

/** ประเภทรายการที่ถือเป็นผลพิจารณา (อยู่ระหว่างพิจารณา/อนุมัติ/ปฏิเสธ/ยกเลิก) — โชว์ chip decisionName */
const DECISION_CHIP_TRANSACTION_LOG_TYPE_IDS = [6, 7, 8, 9];
/** ประเภทรายการแจ้งผลการโอนเงิน — โชว์ chip paymentStatusNameTH */
const PAYMENT_STATUS_CHIP_TRANSACTION_LOG_TYPE_ID = 16;

const DRAFT_CHIP_TRANSACTION_LOG_TYPE_ID = 15;

const getTransactionVisual = (typeId?: number): TransactionLogVisual => {
    return transactionLogVisualMap[typeId ?? 0] ?? transactionLogVisualMap[0];
};
const getStatus = (status?: string | number) => {
    switch (status) {
        case 2:
            return {
                sx: {
                    bgcolor: "#FFF1CD",
                    color: "#a56e07",
                },
            };

        case 3:
            return {
                sx: {
                    bgcolor: "#D4EDBC",
                    color: "#11734B",
                },
            };

        case 4:
            return {
                sx: {
                    bgcolor: "#FFCFC9",
                    color: "#B32615",
                },
            };
        case 5:
            return {
                sx: {
                    bgcolor: "#FFCFC9",
                    color: "#B32615",
                },
            };

        default:
            return {
                sx: {
                    bgcolor: "#ffff",
                    color: "#ffff",
                },
            };
    }
};
type ClaimTransactionTabProps = {
    /** ให้ parent (HeaderDetails) สลับไปแท็บ "ข้อมูลการเคลม" — ข้อมูลของแบบร่างเอง dispatch ลง Redux เอง */
    onViewDraft?: () => void;
};

const ClaimTransactionTab = ({ onViewDraft }: ClaimTransactionTabProps) => {
    const dispatch = useAppDispatch();
    const { transaction, transactionLoading, pagination, setPaginated } = useClaimTransactionHook();

    const transactionList = transaction?.data ?? [];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<HistoryIcon sx={{ fontSize: 27 }} />} text="ประวัติการทำรายการ" color="blue" />

            <LoadingOverlay isLoading={transactionLoading} minHeight={300}>
                {!transactionLoading && transactionList.length === 0 && (
                    <Box
                        py={8}
                        px={2}
                        textAlign="center"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={1.5}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                bgcolor: "#F0F0F0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <HistoryOutlinedIcon sx={{ fontSize: 32, color: "#9E9E9E" }} />
                        </Box>

                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            ไม่พบประวัติการทำรายการ
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                            เมื่อมีการทำรายการเกี่ยวกับเคลมนี้ ประวัติจะแสดงที่นี่
                        </Typography>
                    </Box>
                )}

                {/* Timeline */}
                {transactionList.length > 0 && (
                    <Box
                        sx={{
                            px: { xs: 2, md: 3 },
                            py: 3,
                        }}
                    >
                        {transactionList.map((item, index) => {
                            const isLast = index === transactionList.length - 1;
                            const status = getStatus(item.paymentStatusId);
                            const {
                                icon: TransactionIcon,
                                bgcolor,
                                color,
                            } = getTransactionVisual(item.transactionLogTypeId);
                            const transactionLogDetail =
                                item.transactionLogTypeId === 1 //สร้างรายการเคลม
                                    ? item.claimNo
                                    : item.transactionLogTypeId === 2 //สร้างรายการเคส
                                    ? item.caseNo
                                    : item.transactionLogTypeId === PAYMENT_STATUS_CHIP_TRANSACTION_LOG_TYPE_ID //แจ้งผลการโอนเงิน
                                    ? `จำนวนเงิน ${numberWithCommas(item.totalAmount?.toString() ?? "0", 2)} บาท`
                                    : item.transactionLogTypeId === DRAFT_CHIP_TRANSACTION_LOG_TYPE_ID //บันทึกแบบร่าง
                                    ? item.transactionLogRemark ?? ""
                                    : "";
                            // referenceId ของแถวบันทึกแบบร่าง = draftRevisionId ที่ใช้ยิง
                            // useGetClaimEditDraftRevision — แถวประเภทอื่นกดดวงตาแล้วไม่มีอะไรเกิด (ตามที่ตกลง)
                            const isDraftRow =
                                item.transactionLogTypeId === DRAFT_CHIP_TRANSACTION_LOG_TYPE_ID && !!item.referenceId;
                            const handleViewDraft = () => {
                                if (!item.referenceId) return;
                                dispatch(
                                    setViewingDraft({
                                        draftRevisionId: item.referenceId,
                                        createdDate: item.createdDate?.toString(),
                                        employeeName: item.employeeName,
                                        transactionLogRemark: item.transactionLogRemark,
                                    })
                                );
                                onViewDraft?.();
                            };

                            return (
                                <Box
                                    key={item.transactionLogId ?? index}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "48px minmax(0, 1fr)",
                                            md: "64px minmax(0, 1fr)",
                                        },
                                        columnGap: 1,
                                    }}
                                >
                                    {/* Timeline */}
                                    <Box
                                        sx={{
                                            position: "relative",
                                            display: "flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {!isLast && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 48,
                                                    bottom: -24,
                                                    width: 2,
                                                    bgcolor: "divider",
                                                }}
                                            />
                                        )}

                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: "50%",
                                                bgcolor: bgcolor,
                                                color: color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                zIndex: 1,
                                            }}
                                        >
                                            <TransactionIcon />
                                        </Box>
                                    </Box>

                                    {/* Content */}
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            mb: 3,
                                            p: {
                                                xs: 1.5,
                                                md: 2,
                                            },
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Stack
                                            direction={{
                                                xs: "column",
                                                sm: "row",
                                            }}
                                            justifyContent="space-between"
                                            spacing={1}
                                        >
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {item.transactionLogTypeName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {transactionLogDetail}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={2} alignItems="center" flexShrink={0}>
                                                {/* แสดงเฉพาะรายการที่เป็นผลพิจารณา (6 อยู่ระหว่างพิจารณา, 7 อนุมัติ,
                                                8 ปฏิเสธ, 9 ยกเลิก) — วางตำแหน่งเดียวกับ chip paymentStatusNameTH
                                                เพราะทั้งคู่สื่อ "สถานะ" ของรายการนี้ */}
                                                {DECISION_CHIP_TRANSACTION_LOG_TYPE_IDS.includes(
                                                    item.transactionLogTypeId ?? 0
                                                ) &&
                                                    item.decisionName && (
                                                        <Chip
                                                            label={item.decisionName}
                                                            size="medium"
                                                            sx={{
                                                                borderRadius: "16px",
                                                                fontWeight: 600,
                                                                bgcolor:
                                                                    backgroundColorMapDecision[item.decisionId ?? 0],
                                                                color: colorMapDecision[item.decisionId ?? 0],
                                                            }}
                                                        />
                                                    )}

                                                {/* แสดงเฉพาะ transactionLogTypeId = 16 (แจ้งผลการโอนเงิน) เท่านั้น */}
                                                {item.transactionLogTypeId ===
                                                    PAYMENT_STATUS_CHIP_TRANSACTION_LOG_TYPE_ID && (
                                                    <Chip
                                                        label={item.paymentStatusNameTH}
                                                        size="medium"
                                                        sx={{
                                                            borderRadius: "16px",
                                                            fontWeight: 600,
                                                            ...status.sx,
                                                        }}
                                                    />
                                                )}
                                                {item.transactionLogTypeId === DRAFT_CHIP_TRANSACTION_LOG_TYPE_ID && (
                                                    <Chip
                                                        label="Draft"
                                                        size="medium"
                                                        sx={{
                                                            borderRadius: "16px",
                                                            fontWeight: 600,
                                                            bgcolor: "#FFF1CD",
                                                            color: "#a56e07",
                                                        }}
                                                    />
                                                )}

                                                <Tooltip title={isDraftRow ? "ดูข้อมูลแบบร่าง" : "ดูรายละเอียด"}>
                                                    <IconButton
                                                        onClick={isDraftRow ? handleViewDraft : undefined}
                                                        sx={{
                                                            bgcolor: "#E2F2FF",
                                                            "&:hover": { bgcolor: "#d4ecff" },
                                                            borderColor: "#a8d6fc",
                                                        }}
                                                    >
                                                        <VisibilityIcon color="primary"></VisibilityIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        {/* Footer */}
                                        <Stack
                                            direction={{
                                                xs: "column",
                                                sm: "row",
                                            }}
                                            spacing={{
                                                xs: 0.5,
                                                sm: 2,
                                            }}
                                            sx={{
                                                mt: 2,
                                                pt: 1.5,
                                                borderTop: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDateString(
                                                    item?.createdDate?.toString() ?? "",
                                                    "DD/MM/BBBB HH:mm"
                                                ) ?? "-"}
                                            </Typography>

                                            <Typography variant="caption" color="text.secondary">
                                                {item.employeeName ?? "-"}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                <Box display="flex" justifyContent="center" pb={3}>
                    <Pagination
                        page={pagination.currentPage}
                        count={Math.ceil((pagination.totalAmountRecords ?? 1) / (pagination.recordsPerPage ?? 10))}
                        color="primary"
                        onChange={(_, page) =>
                            setPaginated((prev: any) => ({
                                ...prev,
                                page,
                            }))
                        }
                    />
                </Box>
            </LoadingOverlay>
        </CustomPaper>
    );
};

export default ClaimTransactionTab;

import type { ReactNode } from "react";
import { Box, Button, Chip, MenuItem, TextField, Typography } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import SaveIcon from "@mui/icons-material/Save";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import FormikDatePicker from "../../../../_common/components/CustomFormik/FormikDatePicker";
import { DECISION_ID } from "../../../store/claimConsider.constants";
import { CaseDocumentV2Request } from "../../../../../api/coreClaimApi.client";
import {
    DEATH_DISABILITY_IN_PROGRESS_DECISION_ID,
    DeathDisabilityConsiderValues,
} from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityConsiderHook";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";

type ReasonOption = { id?: number; name?: string };

type StatusOption = {
    decisionId: number;
    label: string;
    /** หัวข้อการ์ดรายละเอียด เช่น "รอแก้ไขเคลม" */
    title: string;
    /** chip มุมขวาของการ์ดรายละเอียด */
    subheaderLabel: string;
    icon: ReactNode;
    color: string;
    /** สีพื้นปุ่มตอนยังไม่ได้เลือก — mockup ปุ่มยกเลิกมีพื้นชมพูอ่อน ปุ่มอื่นพื้นขาว */
    idleBgColor: string;
    softColor: string;
    reason?: { label: string; detailLabel: string };
};

// ใช้สีชุดเดียวกับ ConsiderSection (รอแก้ไข/ปฏิเสธ/ยกเลิก) — เพิ่ม "กำลังพิจารณา" และ "อนุมัติ" ตาม mockup
const STATUS_OPTIONS: StatusOption[] = [
    {
        decisionId: DEATH_DISABILITY_IN_PROGRESS_DECISION_ID,
        label: "กำลังพิจารณา",
        title: "กำลังพิจารณาเคลม",
        subheaderLabel: "บันทึกหมายเหตุ",
        icon: <HourglassBottomIcon fontSize="small" />,
        color: "#B8860B",
        idleBgColor: "#fff",
        softColor: "#FFF8E8",
    },
    {
        decisionId: DECISION_ID.REVISION,
        label: "รอแก้ไข",
        title: "รอแก้ไขเคลม",
        subheaderLabel: "ขอแก้ไข/ขอเอกสาร",
        icon: <EditNoteIcon fontSize="small" />,
        color: "#806033",
        idleBgColor: "#fff",
        softColor: "#FAF7F2",
        reason: { label: "สาเหตุรอแก้ไข", detailLabel: "รายละเอียดการรอแก้ไข" },
    },
    {
        decisionId: DECISION_ID.REJECTED,
        label: "ปฏิเสธ",
        title: "ปฏิเสธเคลม",
        subheaderLabel: "ปิดผลเป็นปฏิเสธ",
        icon: <BlockIcon fontSize="small" />,
        color: "#D76451",
        idleBgColor: "#fff",
        softColor: "#FFF4F1",
        reason: { label: "สาเหตุการปฏิเสธ", detailLabel: "รายละเอียดการปฏิเสธ" },
    },
    {
        decisionId: DECISION_ID.CANCELLED,
        label: "ยกเลิก",
        title: "ยกเลิกเคลม",
        subheaderLabel: "ยกเลิกรายการเคลม",
        icon: <CancelIcon fontSize="small" />,
        color: "#D92D2D",
        idleBgColor: "#FFF1F1",
        softColor: "#FFF4F4",
        reason: { label: "สาเหตุการยกเลิก", detailLabel: "รายละเอียดการยกเลิก" },
    },
    {
        decisionId: DECISION_ID.APPROVED,
        label: "อนุมัติ",
        title: "อนุมัติเคลม",
        subheaderLabel: "พร้อมยืนยันผล",
        icon: <CheckCircleIcon fontSize="small" />,
        color: "#1B8A3A",
        idleBgColor: "#fff",
        softColor: "#EEF8F0",
    },
];

type DeathDisabilityConsiderSectionProps = {
    claimNo: string;
    totalTransferAmount: number;
    /** ใช้กับตารางเอกสารประกอบการปฏิเสธ (DocumentScanTable) เหมือน ConsiderSection ของเคลมลูกค้า */
    productTypeId: number | undefined;
    aplicationCode: string | undefined;
    revisionReasonOptions: ReasonOption[];
    revisionReasonLoading: boolean;
    rejectReasonOptions: ReasonOption[];
    rejectReasonLoading: boolean;
    cancelReasonOptions: ReasonOption[];
    cancelReasonLoading: boolean;
    /** กด "ยืนยันบันทึก" — validate + ยิง API อยู่ที่ parent */
    onConfirm: () => void;
    isSubmitting: boolean;
    /** เอกสารที่แนบไฟล์แล้วในตาราง "เอกสารประกอบการปฏิเสธ" — parent เก็บไว้ส่งไปกับผลพิจารณา */
    onRejectDocumentsChange: (docs: CaseDocumentV2Request[]) => void;
};

/**
 * Section "ผลการพิจารณา" ของเคลม Death & Disability
 * แยกจาก ConsiderSection เพราะชุดปุ่มต่างกัน (มี กำลังพิจารณา/อนุมัติ, ไม่มี รอเอกสาร), มีช่องวันที่เอกสารครบ
 * และปุ่มยืนยันอยู่ในการ์ดเดียวกัน — ส่วนหน้าตาปุ่ม/การ์ดรายละเอียดยึดแบบเดียวกับ ConsiderSection
 */
const DeathDisabilityConsiderSection = ({
    claimNo,
    totalTransferAmount,
    productTypeId,
    aplicationCode,
    revisionReasonOptions,
    revisionReasonLoading,
    rejectReasonOptions,
    rejectReasonLoading,
    cancelReasonOptions,
    cancelReasonLoading,
    onConfirm,
    isSubmitting,
    onRejectDocumentsChange,
}: DeathDisabilityConsiderSectionProps) => {
    const formik = useFormikContext<DeathDisabilityConsiderValues>();
    const selected = STATUS_OPTIONS.find((status) => status.decisionId === formik.values.considerResult);

    const reasonByDecisionId: Record<number, { options: ReasonOption[]; loading: boolean }> = {
        [DECISION_ID.REVISION]: { options: revisionReasonOptions, loading: revisionReasonLoading },
        [DECISION_ID.REJECTED]: { options: rejectReasonOptions, loading: rejectReasonLoading },
        [DECISION_ID.CANCELLED]: { options: cancelReasonOptions, loading: cancelReasonLoading },
    };
    const reasonSource = selected ? reasonByDecisionId[selected.decisionId] : undefined;

    const reasonMeta = formik.getFieldMeta<number | undefined>("decisionReasonId");
    const remarkMeta = formik.getFieldMeta<string>("remark");
    const reasonHasError = !!reasonMeta.touched && !!reasonMeta.error;
    const detailMeta = formik.getFieldMeta<string>("decisionReasonDetail");
    const detailHasError = !!detailMeta.touched && !!detailMeta.error;
    // รายละเอียดบังคับเฉพาะ รอแก้ไข (ปฏิเสธ/ยกเลิก ไม่บังคับ)
    const isDetailRequired = formik.values.considerResult === DECISION_ID.REVISION;
    const remarkHasError = !!remarkMeta.touched && !!remarkMeta.error;

    const selectStatus = (status: StatusOption) => {
        // กดปุ่มที่เลือกอยู่ซ้ำ = ยกเลิกเลือก (ปิดการ์ดรายละเอียด) โดยไม่ต้องไปกดปุ่มสถานะอื่น
        const isDeselect = status.decisionId === formik.values.considerResult;
        // อัปเดตทีเดียวแล้ว validate ใหม่ — ไม่งั้น error "กรุณาเลือกผลการพิจารณา" จากการกดยืนยันรอบก่อนจะค้าง
        // (ช่องสาเหตุ/หมายเหตุ ล้าง touched ไว้ จึงยังไม่โชว์ error จนกว่าผู้ใช้จะแตะช่องหรือกดยืนยัน)
        formik.setTouched({}, false);
        formik.setValues(
            {
                ...formik.values,
                considerResult: isDeselect ? undefined : status.decisionId,
                decisionReasonId: undefined,
                decisionReasonDetail: "",
                remark: "",
            },
            true
        );
    };

    return (
        <CustomPaper>
            <HeadingWithColor icon={<FactCheckIcon sx={{ fontSize: 27 }} />} text="ผลการพิจารณา" color="blue" />
            <Box
                sx={{
                    mt: 2,
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                }}
            >
                <Box
                    role="radiogroup"
                    aria-label="เลือกผลการพิจารณา"
                    // ปุ่มกว้างเท่ากันเต็มแถว — จอเล็ก 2 คอลัมน์, sm 3 คอลัมน์, md ขึ้นไปครบ 5 ปุ่มในแถวเดียว
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
                        gap: { xs: 1.25, sm: 2 },
                    }}
                >
                    {STATUS_OPTIONS.map((status) => {
                        const isSelected = status.decisionId === formik.values.considerResult;
                        return (
                            <Button
                                key={status.decisionId}
                                role="radio"
                                aria-checked={isSelected}
                                color="inherit"
                                startIcon={status.icon}
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => selectStatus(status)}
                                sx={{
                                    minWidth: 0,
                                    // ขนาดเดียวกับปุ่มสถานะใน ConsiderSection ของเคลมลูกค้า
                                    minHeight: { xs: 48, sm: 54 },
                                    borderRadius: 3,
                                    borderColor: status.color,
                                    color: isSelected ? "#fff" : status.color,
                                    bgcolor: isSelected ? status.color : status.idleBgColor,
                                    fontSize: { xs: 14, sm: 16 },
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    "&:hover": {
                                        borderColor: status.color,
                                        bgcolor: isSelected ? status.color : status.softColor,
                                    },
                                }}
                            >
                                {status.label}
                            </Button>
                        );
                    })}
                </Box>
                {formik.submitCount > 0 && formik.errors.considerResult && (
                    <Typography role="alert" color="error" variant="body2" textAlign="center" mt={1}>
                        {formik.errors.considerResult}
                    </Typography>
                )}

                <Box
                    sx={{
                        mt: 2.5,
                        mx: "auto",
                        maxWidth: 670,
                        p: 2,
                        border: "1px solid #DCE8F4",
                        borderRadius: 3,
                        bgcolor: "#F2F7FC",
                        display: "flex",
                        // จอเล็ก: label อยู่บน input — จอ sm ขึ้นไปวางข้างกันตาม mockup
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: { xs: 1, sm: 2 },
                    }}
                >
                    <Typography sx={{ minWidth: { sm: 190 }, fontSize: 14 }}>
                        วันที่เอกสารครบ{" "}
                        <Typography component="span" color="error">
                            *
                        </Typography>
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} data-field-name="documentCompleteDate">
                        <FormikDatePicker formik={formik} name="documentCompleteDate" disableFuture />
                    </Box>
                </Box>

                {selected && (
                    <Box
                        sx={{
                            mt: 2.5,
                            mx: "auto",
                            maxWidth: 980,
                            overflow: "hidden",
                            // จางแบบ ConsiderSection ของเคลมลูกค้า — สีสถานะที่ความทึบ ~20%
                            border: `1px solid ${selected.color}33`,
                            borderRadius: 3,
                            bgcolor: "#fff",
                            boxShadow: "0 2px 8px rgba(13, 92, 158, 0.08)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                gap: 1.25,
                                px: { xs: 2, sm: 2.5 },
                                py: 1.75,
                                // สีเดียวกับปุ่มสถานะที่เลือก — เชื่อมปุ่มกับการ์ดให้เห็นว่าเป็นของสถานะไหน
                                color: selected.color,
                                bgcolor: selected.softColor,
                            }}
                        >
                            {/* หัวการ์ด 2 บรรทัดแบบ ConsiderSection ของเคลมลูกค้า: ชื่อสถานะเด่น + คำอธิบายเป็นบรรทัดรอง,
                                เลขที่ CL เป็น chip สีกลางมุมขวา (ไม่ใช้สีสถานะ เพราะไม่ได้เปลี่ยนตามผลพิจารณา) */}
                            <Box sx={{ display: "flex", "& svg": { fontSize: { xs: 24, sm: 28 } } }}>
                                {selected.icon}
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: { xs: 17, sm: 18 }, fontWeight: 700, lineHeight: 1.3 }}>
                                    {selected.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        mt: 0.25,
                                        color: "text.secondary",
                                        fontSize: { xs: 12, sm: 13 },
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {selected.subheaderLabel}
                                </Typography>
                            </Box>
                            <Chip
                                label={claimNo}
                                size="small"
                                variant="outlined"
                                sx={{
                                    ml: "auto",
                                    bgcolor: "#fff",
                                    color: "text.primary",
                                    borderColor: "divider",
                                    fontWeight: 600,
                                    // จอเล็ก: container เป็น flexWrap — chip ตกลงบรรทัดใหม่ได้ ไม่เบียดชื่อสถานะ
                                    maxWidth: "100%",
                                }}
                            />
                        </Box>

                        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                            {selected.reason && reasonSource && (
                                <>
                                    <Box data-field-name="decisionReasonId">
                                        <TextField
                                            select
                                            required
                                            fullWidth
                                            label={reasonSource.loading ? "กำลังโหลด..." : selected.reason.label}
                                            value={formik.values.decisionReasonId || ""}
                                            onChange={(event) =>
                                                formik.setFieldValue("decisionReasonId", Number(event.target.value))
                                            }
                                            onBlur={() => formik.setFieldTouched("decisionReasonId", true)}
                                            error={reasonHasError}
                                            helperText={reasonHasError ? reasonMeta.error : undefined}
                                        >
                                            {reasonSource.options.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                    <Box data-field-name="decisionReasonDetail">
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            required={isDetailRequired}
                                            sx={{ mt: 2 }}
                                            label={selected.reason.detailLabel}
                                            placeholder={selected.reason.detailLabel}
                                            value={formik.values.decisionReasonDetail}
                                            onChange={(event) =>
                                                formik.setFieldValue("decisionReasonDetail", event.target.value)
                                            }
                                            onBlur={() => formik.setFieldTouched("decisionReasonDetail", true)}
                                            error={detailHasError}
                                            helperText={detailHasError ? detailMeta.error : undefined}
                                        />
                                    </Box>
                                </>
                            )}

                            {selected.decisionId === DEATH_DISABILITY_IN_PROGRESS_DECISION_ID && (
                                <Box data-field-name="remark">
                                    <TextField
                                        required
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        label="หมายเหตุ"
                                        placeholder="ระบุหมายเหตุระหว่างการพิจารณา"
                                        value={formik.values.remark}
                                        onChange={(event) => formik.setFieldValue("remark", event.target.value)}
                                        onBlur={() => formik.setFieldTouched("remark", true)}
                                        error={remarkHasError}
                                        helperText={remarkHasError ? remarkMeta.error : undefined}
                                    />
                                </Box>
                            )}

                            {selected.decisionId === DECISION_ID.APPROVED && (
                                <>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        label="หมายเหตุการอนุมัติ"
                                        placeholder="หมายเหตุการอนุมัติ"
                                        value={formik.values.remark}
                                        onChange={(event) => formik.setFieldValue("remark", event.target.value)}
                                    />
                                    <Box
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            border: "1px solid #E3E8EE",
                                            borderRadius: 2,
                                            bgcolor: "#F7F9FB",
                                        }}
                                    >
                                        <Typography fontWeight={600} fontSize={14}>
                                            จำนวนเงินโอนรวม :{" "}
                                            {totalTransferAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{" "}
                                            บาท
                                        </Typography>
                                        <Typography color="text.secondary" mt={0.5}>
                                            ตรวจสอบผู้รับผลประโยชน์และบัญชีรับสินไหมก่อนยืนยัน
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            {selected.decisionId === DECISION_ID.REJECTED && (
                                <DocumentScanTable
                                    disablePaper
                                    productTypeId={productTypeId ?? 0}
                                    documentType="ใบแจ้งปฏิเสธสินไหม"
                                    aplicationCode={aplicationCode ?? ""}
                                    Header="เอกสารประกอบการปฏิเสธ"
                                    onAttachedDocumentsChange={onRejectDocumentsChange}
                                    // documentCode ที่ endpoint คืนผูกกับเคสนี้โดยเฉพาะ ต้องไม่ cache ข้ามเคส
                                    // เหมือน ConsiderSection ของเคลมลูกค้า
                                    alwaysFreshMasterList
                                />
                            )}
                        </Box>
                    </Box>
                )}

                <Box
                    sx={{
                        mt: 3,
                        pt: 3,
                        borderTop: "1px dashed #DCE8F4",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        sx={{ minWidth: 190, minHeight: 40, fontWeight: 600, width: { xs: "100%", sm: "auto" } }}
                    >
                        ยืนยันบันทึก
                    </Button>
                </Box>
            </Box>
        </CustomPaper>
    );
};

export default DeathDisabilityConsiderSection;

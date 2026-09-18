import { useRef } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InfoIcon from "@mui/icons-material/Info";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import { FormikDropdown, FormikTextField } from "../../../../_common";
import useChangeTransferAccountHook, {
    ACCOUNT_TYPE_OPTIONS,
    ChangeTransferAccountValues,
    TRANSFER_ACCOUNT_FILE_ACCEPT,
    TransferAccountChange,
} from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import {
    DIALOG_BORDER as BORDER,
    DIALOG_PRIMARY as PRIMARY,
    DialogHeader,
    SectionRow,
    SummaryStrip,
    dialogActionButtonSx,
    dialogActionsSx,
} from "./DialogParts";

const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ChangeTransferAccountDialogProps = {
    open: boolean;
    onClose: () => void;
    /** เรียกหลังบันทึกสำเร็จ (validate ผ่าน) — parent เก็บผลไว้แสดง section รายละเอียดการเปลี่ยนบัญชี แล้วปิด dialog */
    onSaved: (change: TransferAccountChange) => void;
    claimNo: string;
    customerName: string;
    amount: number;
    /** ค่าเริ่มต้นของฟอร์ม — mockup เติมบัญชีเดิมของผู้รับผลประโยชน์ไว้ให้ */
    initialValues: Partial<ChangeTransferAccountValues>;
};

type ChangeTransferAccountFormProps = Omit<ChangeTransferAccountDialogProps, "open">;

/**
 * เนื้อหา dialog แยก component เพื่อให้ form (useFormik) ถูกสร้างใหม่ทุกครั้งที่เปิด dialog —
 * MUI Dialog unmount children ตอนปิด จึงไม่ต้อง resetForm เอง และไม่มีค่าที่กรอกค้างจากรอบก่อน
 */
const ChangeTransferAccountForm = ({
    onClose,
    onSaved,
    claimNo,
    customerName,
    amount,
    initialValues,
}: ChangeTransferAccountFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { formik, bankOptions, bankLoading } = useChangeTransferAccountHook({ initialValues, onSaved });
    const attachmentError = formik.errors.attachment;

    const summaryItems = [
        { icon: <DescriptionIcon />, label: "เลขที่ CL", value: claimNo },
        { icon: <PersonSearchIcon />, label: "ชื่อ - สกุลผู้เอาประกัน", value: customerName },
        { icon: <AccountBalanceWalletIcon />, label: "จำนวนเงิน", value: `${formatAmount(amount)} บาท` },
    ];

    return (
        <>
            <DialogHeader
                icon={<CurrencyExchangeIcon />}
                title="เปลี่ยนบัญชีปลายทางการโอนเงิน"
                subtitle="กรุณากรอกข้อมูลบัญชีใหม่เพื่อใช้ในการโอนเงิน สามารถปรับใช้กับกรณีเงินสดมอบหน้างานได้"
                onClose={onClose}
            />

            <DialogContent dividers>
                <SummaryStrip items={summaryItems} />

                <Box
                    sx={{
                        mt: 2.5,
                        p: 2,
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                        border: `1px dashed ${BORDER}`,
                        borderRadius: 3,
                        bgcolor: "#F5F9FD",
                    }}
                >
                    <InfoIcon fontSize="small" sx={{ color: PRIMARY, mt: 0.25 }} />
                    <Typography variant="body2">
                        กรณีต้องการโอนเงินไปยังบัญชีบุคคลอื่นที่ไม่ใช่ผู้รับผลประโยชน์ หรือเป็นกรณี เงินสดมอบหน้างาน
                        กรุณาระบุเหตุผล และกรอกรายละเอียดบัญชีรับเงินใหม่ให้ครบถ้วนก่อนบันทึก
                    </Typography>
                </Box>

                <SectionRow icon={<EditNoteIcon />}>
                    <FormikTextField
                        formik={formik}
                        name="reason"
                        label="เหตุผลการเปลี่ยนแปลง"
                        multiline
                        rows={3}
                        fullWidth
                        required
                    />
                </SectionRow>

                <SectionRow icon={<AccountBalanceIcon />}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormikDropdown
                                formik={formik}
                                name="bankId"
                                label="ธนาคาร"
                                data={bankOptions}
                                isLoading={bankLoading}
                                valueFieldName="organizeId"
                                displayFieldName="organizeName"
                                firstItemText="---เลือก---"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikDropdown
                                formik={formik}
                                name="accountTypeId"
                                label="ประเภทบัญชี"
                                data={ACCOUNT_TYPE_OPTIONS}
                                valueFieldName="value"
                                displayFieldName="label"
                                firstItemText="---เลือก---"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikTextField
                                formik={formik}
                                name="accountNo"
                                label="เลขที่บัญชี"
                                inputProps={{ inputMode: "numeric", maxLength: 15 }}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormikTextField formik={formik} name="accountName" label="ชื่อบัญชี" fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormikTextField
                                formik={formik}
                                name="payeeName"
                                label="ชื่อผู้รับเงินแทน"
                                fullWidth
                                required
                            />
                        </Grid>
                    </Grid>
                </SectionRow>

                <SectionRow icon={<UploadFileIcon />}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        เอกสารประกอบการเปลี่ยนบัญชี (ถ้ามี)
                    </Typography>
                    {/* TODO(death-disability-api): ยังไม่อัปโหลดจริง — เก็บ File ไว้ใน form เพื่อส่งตอนต่อ API */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept={TRANSFER_ACCOUNT_FILE_ACCEPT}
                        onChange={(event) => {
                            formik.setFieldValue("attachment", event.target.files?.[0]);
                            event.target.value = "";
                        }}
                    />
                    <Box
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
                        }}
                        sx={{
                            p: 3,
                            textAlign: "center",
                            cursor: "pointer",
                            border: `2px dashed ${attachmentError ? "#D32F2F" : BORDER}`,
                            borderRadius: 3,
                            "&:hover, &:focus-visible": { bgcolor: "#F5F9FD", outline: "none" },
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 40, color: "#1E5BD8" }} />
                        <Typography variant="body2" color={PRIMARY}>
                            {formik.values.attachment?.name ?? "อัปโหลดเอกสาร"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1.5}>
                            รองรับไฟล์ .jpg, .jpeg, .png, .pdf ขนาดไม่เกิน 10MB
                        </Typography>
                    </Box>
                    {attachmentError && (
                        <Typography variant="caption" color="error">
                            {attachmentError}
                        </Typography>
                    )}
                </SectionRow>
            </DialogContent>

            <DialogActions sx={dialogActionsSx}>
                <Button variant="outlined" color="inherit" onClick={onClose} sx={dialogActionButtonSx}>
                    ยกเลิก
                </Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => formik.handleSubmit()}
                    sx={{ ...dialogActionButtonSx, fontWeight: 600 }}
                >
                    บันทึกการเปลี่ยนบัญชี
                </Button>
            </DialogActions>
        </>
    );
};

/** Dialog "เปลี่ยนบัญชีปลายทางการโอนเงิน" — เปิดจากปุ่ม "เงินสดมอบหน้างาน" ในส่วนผู้รับผลประโยชน์ */
const ChangeTransferAccountDialog = ({ open, ...formProps }: ChangeTransferAccountDialogProps) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Dialog open={open} onClose={formProps.onClose} fullScreen={fullScreen} fullWidth maxWidth="lg">
            <ChangeTransferAccountForm {...formProps} />
        </Dialog>
    );
};

export default ChangeTransferAccountDialog;

import { useState } from "react";
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
import PersonIcon from "@mui/icons-material/Person";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import { FormikDropdown, FormikTextField } from "../../../../_common";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import { CaseDocumentV2Request } from "../../../../../api/coreClaimApi.client";
import useChangeTransferAccountHook, {
    TRANSFER_ACCOUNT_DOCUMENT_TYPE,
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
    /** ใช้กับตารางสแกนเอกสารประกอบการเปลี่ยนบัญชี (DocumentScanTable) */
    productTypeId: number | undefined;
    aplicationCode: string | undefined;
    /** แก้ไขรายการเดิม — เติมค่าเดิมในฟอร์ม (ไม่ส่ง = เพิ่มใหม่) */
    initialChange?: TransferAccountChange;
    /** ปุ่มบันทึกแสดง loading ระหว่างยิง API */
    isSaving?: boolean;
    /** แก้ไขรายการที่บันทึกแล้ว — ดึงเอกสารประกอบการเปลี่ยนบัญชีที่ผูกกับเคสมาแสดงในตาราง (ไม่ส่ง = ไม่ดึง) */
    caseId?: string;
    claimSourceId?: number;
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
    productTypeId,
    aplicationCode,
    initialChange,
    isSaving = false,
    caseId,
    claimSourceId,
}: ChangeTransferAccountFormProps) => {
    const [attachedDocuments, setAttachedDocuments] = useState<CaseDocumentV2Request[]>([]);
    const { formik, bankOptions, bankLoading, titleOptions, titleLoading } = useChangeTransferAccountHook({
        onSaved,
        attachedDocuments,
        initialChange,
    });

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

                <SectionRow icon={<PersonIcon />}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={3}>
                            {/* ไม่ใช้ TitlePersonDropdown เพราะ label ตายตัว "คำนำหน้าชื่อ" — ใช้ master ชุดเดียวกัน (personTypeId = 2) */}
                            <FormikDropdown
                                formik={formik}
                                name="payeeTitleId"
                                label="คำนำหน้าผู้รับเงินแทน"
                                data={titleOptions}
                                isLoading={titleLoading}
                                valueFieldName="titleId"
                                displayFieldName="titleName"
                                firstItemText="---เลือก---"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={8} md={4.5}>
                            <FormikTextField
                                formik={formik}
                                name="payeeFirstName"
                                label="ชื่อผู้รับเงินแทน"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4.5}>
                            <FormikTextField
                                formik={formik}
                                name="payeeLastName"
                                label="นามสกุลผู้รับเงินแทน"
                                fullWidth
                                required
                            />
                        </Grid>
                    </Grid>
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
                            <FormikTextField
                                formik={formik}
                                name="accountNo"
                                label="เลขที่บัญชี"
                                inputProps={{ inputMode: "numeric", maxLength: 15 }}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormikTextField formik={formik} name="accountName" label="ชื่อบัญชี" fullWidth required />
                        </Grid>
                    </Grid>
                </SectionRow>

                <SectionRow icon={<UploadFileIcon />}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        เอกสารประกอบการเปลี่ยนบัญชี (ถ้ามี)
                    </Typography>
                    {/* ไม่ใช้ alwaysFreshMasterList — ให้ section หลังบันทึกได้ documentCode/documentId ชุดเดียวกันจาก cache
                        (หน้า ConsiderDeathDisabilityDetailPage ล้าง cache นี้ตอนออกจากหน้า กันค้างข้ามเคส) */}
                    <DocumentScanTable
                        disablePaper
                        productTypeId={productTypeId ?? 0}
                        documentType={TRANSFER_ACCOUNT_DOCUMENT_TYPE}
                        aplicationCode={aplicationCode ?? ""}
                        onAttachedDocumentsChange={setAttachedDocuments}
                        caseId={caseId}
                        claimSourceId={claimSourceId}
                        filterCaseDocumentsByType
                    />
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
                    disabled={isSaving}
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
        <Dialog
            open={open}
            onClose={formProps.onClose}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="lg"
            // ให้เลื่อนเฉพาะ DialogContent — กัน scrollbar ซ้อนที่ขอบ dialog
            PaperProps={{ sx: { overflowY: "hidden" } }}
        >
            <ChangeTransferAccountForm {...formProps} />
        </Dialog>
    );
};

export default ChangeTransferAccountDialog;

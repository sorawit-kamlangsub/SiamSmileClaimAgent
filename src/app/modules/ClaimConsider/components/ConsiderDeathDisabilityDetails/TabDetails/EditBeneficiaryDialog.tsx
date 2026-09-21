import { Box, Button, Dialog, DialogActions, DialogContent, Grid, useMediaQuery, useTheme } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import ShieldIcon from "@mui/icons-material/Shield";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PhoneIcon from "@mui/icons-material/Phone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SaveIcon from "@mui/icons-material/Save";
import { FormikDropdown, FormikTextField, FormikTextMaskPhone, FormikTextNumber } from "../../../../_common";
import FormikTextMaskCardId from "../../../../_common/components/CustomFormik/FormikTextMaskCardId";
import RelationTypeDropdown from "../../../../_common/components/ClaimAgent/CustomDropdown/RelationTypeDropdown";
import TitlePersonDropdown from "../../../../_common/components/ClaimAgent/CustomDropdown/TitlePersonDropdown";
import useEditBeneficiaryHook, {
    EditBeneficiaryValues,
} from "../../../hooks/ClaimConsiderDeathDisabilityDetail/EditBeneficiaryHook";
import { DialogHeader, SectionRow, SummaryStrip, dialogActionButtonSx, dialogActionsSx } from "./DialogParts";

type EditBeneficiaryDialogProps = {
    open: boolean;
    onClose: () => void;
    order: number;
    claimNo: string;
    customerName: string;
    initialValues: Partial<EditBeneficiaryValues>;
};

type EditBeneficiaryFormProps = Omit<EditBeneficiaryDialogProps, "open">;

/** แยก component เพื่อให้ form ถูกสร้างใหม่ทุกครั้งที่เปิด dialog (เหมือน ChangeTransferAccountDialog) */
const EditBeneficiaryForm = ({ onClose, order, claimNo, customerName, initialValues }: EditBeneficiaryFormProps) => {
    const { formik, bankOptions, bankLoading } = useEditBeneficiaryHook({ initialValues, onSaved: onClose });
    const amountPreview = (formik.values.amount ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <>
            <DialogHeader
                icon={<GroupsIcon />}
                title="แก้ไขข้อมูลผู้รับผลประโยชน์"
                subtitle="ปรับข้อมูลผู้รับผลประโยชน์ บัญชีรับสินไหม และจำนวนเงินให้ถูกต้องก่อนบันทึก"
                onClose={onClose}
            />

            <DialogContent dividers>
                <SummaryStrip
                    items={[
                        {
                            icon: <ShieldIcon />,
                            label: "ผู้รับผลประโยชน์",
                            value: `ลำดับที่ ${order}`,
                        },
                        { icon: <DescriptionIcon />, label: "เลขที่ CL", value: claimNo },
                        { icon: <PersonIcon />, label: "ชื่อผู้เอาประกัน", value: customerName },
                    ]}
                />

                <SectionRow icon={<FamilyRestroomIcon />}>
                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid item xs={12} md={5}>
                            <RelationTypeDropdown formik={formik} name="relationTypeId" required />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <FormikTextMaskCardId
                                formik={formik}
                                name="documentNo"
                                label="เลขบัตรประชาชน"
                                fullWidth
                                required
                            />
                        </Grid>
                    </Grid>
                </SectionRow>

                <SectionRow icon={<PersonIcon />}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={3}>
                            <TitlePersonDropdown formik={formik} name="titleId" required />
                        </Grid>
                        <Grid item xs={12} sm={8} md={4.5}>
                            <FormikTextField formik={formik} name="firstName" label="ชื่อ" fullWidth required />
                        </Grid>
                        <Grid item xs={12} md={4.5}>
                            <FormikTextField formik={formik} name="lastName" label="นามสกุล" fullWidth required />
                        </Grid>
                    </Grid>
                </SectionRow>

                <SectionRow icon={<PhoneIcon />}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormikTextMaskPhone
                                formik={formik}
                                name="phoneNumber"
                                label="เบอร์โทรศัพท์"
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

                <SectionRow icon={<MonetizationOnIcon />}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormikTextNumber
                                formik={formik}
                                name="amount"
                                label="จำนวนเงิน"
                                decimalScale={2}
                                fixedDecimalScale
                                thousandSeparator
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                aria-label="ตัวอย่างจำนวนเงินโอน"
                                sx={{
                                    py: 1.75,
                                    textAlign: "center",
                                    border: "1px solid #9FE0B5",
                                    borderRadius: 3,
                                    bgcolor: "#EFFBF2",
                                    color: "#1B7F3B",
                                    fontWeight: 600,
                                }}
                            >
                                {amountPreview} บาท
                            </Box>
                        </Grid>
                    </Grid>
                </SectionRow>
            </DialogContent>

            <DialogActions sx={dialogActionsSx}>
                <Button variant="outlined" color="inherit" onClick={onClose} sx={dialogActionButtonSx}>
                    ยกเลิก
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={() => formik.handleSubmit()}
                    sx={{ ...dialogActionButtonSx, fontWeight: 600 }}
                >
                    บันทึกข้อมูล
                </Button>
            </DialogActions>
        </>
    );
};

/** Dialog "แก้ไขข้อมูลผู้รับผลประโยชน์" — เปิดจากปุ่ม "แก้ไขข้อมูล" ของการ์ดผู้รับผลประโยชน์แต่ละคน */
const EditBeneficiaryDialog = ({ open, ...formProps }: EditBeneficiaryDialogProps) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Dialog open={open} onClose={formProps.onClose} fullScreen={fullScreen} fullWidth maxWidth="lg">
            <EditBeneficiaryForm {...formProps} />
        </Dialog>
    );
};

export default EditBeneficiaryDialog;

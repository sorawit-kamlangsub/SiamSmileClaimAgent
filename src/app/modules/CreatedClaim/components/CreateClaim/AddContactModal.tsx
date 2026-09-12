import React from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { addContact, ContactInfo } from "../../store/claimPHSlice";
import { FormikTextField, FormikTextMaskPhone } from "../../../_common";
import ContactPersonTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/ContactPersonTypeDropDown";

interface Props {
    open: boolean;
    onClose: () => void;
    onAdd?: (contact: ContactInfo) => void;
    productTypeId?: number;
}

// ─── id ของ "อื่นๆ" ตาม API ──────────────────────────────────────────────────
const OTHER_CONTACT_TYPE_ID = 13;

interface AddContactFormValues {
    relationship: number | undefined;
    relationship_selectedText: string; // set โดย FormikDropdown อัตโนมัติ
    name: string;
    phone: string;
    otherNote: string;
}

const FieldIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Avatar
        sx={{
            width: 40,
            height: 40,
            bgcolor: "#f3fafe",
            border: "1px solid #e3f0f6",
            mt: 1,
            flexShrink: 0,
            borderRadius: 2,
        }}
        variant="square"
    >
        <Box sx={{ color: "primary.main", display: "flex" }}>{children}</Box>
    </Avatar>
);

const AddContactModal: React.FC<Props> = ({ open, onClose, onAdd, productTypeId }) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const formik = useFormik<AddContactFormValues>({
        initialValues: {
            relationship: undefined,
            relationship_selectedText: "",
            name: "",
            phone: "",
            otherNote: "",
        },
        validate: (v) => {
            const e: Partial<Record<keyof AddContactFormValues, string>> = {};
            if (!v.relationship) e.relationship = "โปรดระบุ";
            if (!v.phone) e.phone = "โปรดระบุ";
            if (!v.name.trim()) e.name = "โปรดระบุ";
            // ถ้าเลือก "อื่นๆ" (id=12) ต้องกรอก otherNote
            if (v.relationship === OTHER_CONTACT_TYPE_ID && !v.otherNote.trim()) e.otherNote = "โปรดระบุ";
            return e;
        },
        onSubmit: (values, { resetForm }) => {
            const contact: ContactInfo = {
                id: `manual-${Date.now()}`,
                contactPersonTypeId: values.relationship ?? 0,
                contactPersonTypeName:
                    values.relationship === OTHER_CONTACT_TYPE_ID ? values.otherNote : values.relationship_selectedText,
                contactPhoneNo: values.phone,
                contactName: values.name,
                isDefault: false,
            };

            if (onAdd) {
                onAdd(contact);
            } else {
                dispatch(addContact(contact));
            }

            resetForm();
            onClose();
        },
    });

    const isOther = formik.values.relationship === OTHER_CONTACT_TYPE_ID;

    return (
        <Dialog open={open} maxWidth="sm" fullScreen={fullScreen} fullWidth>
            <DialogTitle>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <ContactPhoneIcon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight={700}>เพิ่มข้อมูลผู้ติดต่อ</Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "common.white",
                            width: 25,
                            height: 25,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 23 }} />
                    </IconButton>
                </Grid>
                <Divider sx={{ mt: 1.5 }} />
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={2}>
                    {/* ── ประเภทผู้ติดต่อ ── */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <FieldIcon>
                                <GroupIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <ContactPersonTypeDropDown
                                    name="relationship"
                                    formik={formik}
                                    firstItemText="--- โปรดระบุ ---"
                                    fullWidth
                                    size="small"
                                    required
                                    productTypeId={productTypeId}
                                    // FormikDropdown set relationship_selectedText อัตโนมัติ
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── ระบุเพิ่มเติม เฉพาะ "อื่นๆ" (id=12) ── */}
                    {isOther && (
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <FieldIcon>
                                    <GroupIcon sx={{ fontSize: 25 }} />
                                </FieldIcon>
                                <Box flex={1}>
                                    <FormikTextField
                                        name="otherNote"
                                        label="โปรดระบุ"
                                        formik={formik}
                                        size="small"
                                        fullWidth
                                        required
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* ── ชื่อผู้ติดต่อ ── */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <FieldIcon>
                                <PersonIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <FormikTextField
                                    name="name"
                                    label="ชื่อผู้ติดต่อ"
                                    formik={formik}
                                    size="small"
                                    fullWidth
                                    onChange={(e) => {
                                        if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value))
                                            formik.setFieldValue("name", e.target.value);
                                    }}
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── เบอร์โทรผู้ติดต่อ ── */}
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <FieldIcon>
                                <PhoneIcon sx={{ fontSize: 25 }} />
                            </FieldIcon>
                            <Box flex={1}>
                                <FormikTextMaskPhone
                                    name="phone"
                                    label="เบอร์โทรศัพท์ผู้ติดต่อ"
                                    formik={formik}
                                    size="small"
                                    fullWidth
                                    required
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* ── Warning ── */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                bgcolor: "#fdf6e3",
                                borderLeft: "4px solid #c8a415",
                                px: 2,
                                py: 1,
                                borderRadius: "0 4px 4px 0",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Typography fontSize={15} fontWeight={700}>
                                กรุณาตรวจสอบข้อมูลเบอร์ติดต่อ เนื่องจากใช้ในการส่ง SMS
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* ── Submit ── */}
                <Grid container mt={2} justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Button variant="contained" color="success" fullWidth onClick={() => formik.handleSubmit()}>
                            บันทึก
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default AddContactModal;

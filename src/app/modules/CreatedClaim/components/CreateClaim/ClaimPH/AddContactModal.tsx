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
} from "@mui/material";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../../redux";
import { addContact } from "../../../store/claimPHSlice";
import { FormikDropdown, FormikTextField, FormikTextMaskPhone } from "../../../../_common";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    open: boolean;
    onClose: () => void;
}

const RELATIONSHIP_OPTIONS = [
    { name: "ผู้ชำระเบี้ย" },
    { name: "ผู้เอาประกัน" },
    { name: "ผู้รับผลประโยชน์" },
    { name: "อื่นๆ" },
];

const AddContactModal: React.FC<Props> = ({ open, onClose }) => {
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: { relationship: "", phone: "", name: "", otherNote: "" },
        validate: (v) => {
            const e: any = {};
            if (!v.relationship) e.relationship = "โปรดระบุ";
            if (!v.phone) e.phone = "โปรดระบุ";
            if (!v.name.trim()) e.name = "โปรดระบุ";
            if (v.relationship === "อื่นๆ" && !v.otherNote.trim()) e.otherNote = "โปรดระบุ";
            return e;
        },
        onSubmit: (values, { resetForm }) => {
            dispatch(
                addContact({
                    id: Date.now().toString(),
                    relationship: values.relationship === "อื่นๆ" ? values.otherNote : values.relationship,
                    phone: values.phone,
                    name: values.name,
                    isDefault: false,
                    isFromMock: false,
                })
            );
            resetForm();
            onClose();
        },
    });

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
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
                        aria-label="close"
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
                    {/* ความสัมพันธ์ */}
                    <Grid item xs={12}>
                        <FormikDropdown
                            name="relationship"
                            label="ความสัมพันธ์"
                            formik={formik}
                            data={RELATIONSHIP_OPTIONS}
                            firstItemText="-- เลือก --"
                            displayFieldName="name"
                            valueFieldName="name"
                            fullWidth
                            size="small"
                            required
                        />
                    </Grid>

                    {/* โปรดระบุ (เฉพาะอื่นๆ) */}
                    {formik.values.relationship === "อื่นๆ" && (
                        <Grid item xs={12}>
                            <FormikTextField
                                name="otherNote"
                                label="โปรดระบุ"
                                formik={formik}
                                size="small"
                                required
                                fullWidth
                            />
                        </Grid>
                    )}

                    {/* เบอร์โทรผู้ติดต่อ */}
                    <Grid item xs={12}>
                        <FormikTextMaskPhone
                            name="phone"
                            label="เบอร์โทรผู้ติดต่อ"
                            formik={formik}
                            size="small"
                            required
                            fullWidth
                        />
                    </Grid>

                    {/* ชื่อผู้ติดต่อ */}
                    <Grid item xs={12}>
                        <FormikTextField
                            name="name"
                            label="ชื่อผู้ติดต่อ"
                            formik={formik}
                            size="small"
                            onChange={(e) => {
                                if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value))
                                    formik.setFieldValue("name", e.target.value);
                            }}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                bgcolor: "#fdf6e3",
                                borderLeft: "4px solid " + "#c8a415",
                                px: 2,
                                py: 1,
                                mb: 2,
                                mt: 2,
                                borderRadius: "0 4px 4px 0",
                                justifyContent: "center",
                                display: "flex",
                            }}
                        >
                            <Typography fontSize={15} fontWeight={700}>
                               กรณาตรวจสอบข้อมูลเบอร์ติดต่อ เนื่องจากใช้ในการส่ง SMS
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container mt={1} display="flex" justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Button variant="contained" onClick={() => formik.handleSubmit()} color="success" fullWidth>
                            บันทึก
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default AddContactModal;

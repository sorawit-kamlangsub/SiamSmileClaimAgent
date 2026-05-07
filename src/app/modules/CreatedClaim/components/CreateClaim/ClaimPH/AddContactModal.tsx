import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, TextField, Typography } from "@mui/material";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../../redux";
import { addContact } from "../../../store/claimPHSlice";

interface Props {
    open: boolean;
    onClose: () => void;
}

const RELATIONSHIP_OPTIONS = ["ผู้ชำระเบี้ย", "ผู้เอาประกัน", "ผู้รับผลประโยชน์", "อื่นๆ"];

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
                })
            );
            resetForm();
            onClose();
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <ContactPhoneIcon color="primary" />
                    <Typography fontWeight={700}>เพิ่มข้อมูลผู้ติดต่อ</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={formik.handleSubmit} pt={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="ความสัมพันธ์ *"
                                name="relationship"
                                value={formik.values.relationship}
                                onChange={formik.handleChange}
                                error={formik.touched.relationship && !!formik.errors.relationship}
                                helperText={formik.touched.relationship && formik.errors.relationship}
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                            >
                                <option value="">-- เลือก --</option>
                                {RELATIONSHIP_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        {formik.values.relationship === "อื่นๆ" && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="โปรดระบุ *"
                                    name="otherNote"
                                    value={formik.values.otherNote}
                                    onChange={formik.handleChange}
                                    error={formik.touched.otherNote && !!formik.errors.otherNote}
                                    helperText={formik.touched.otherNote && formik.errors.otherNote}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                label="เบอร์โทรผู้ติดต่อ *"
                                name="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                error={formik.touched.phone && !!formik.errors.phone}
                                helperText={formik.touched.phone && formik.errors.phone}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                label="ชื่อผู้ติดต่อ *"
                                name="name"
                                value={formik.values.name}
                                onChange={(e) => {
                                    if (/^[ก-๙a-zA-Z\s]*$/.test(e.target.value)) formik.handleChange(e);
                                }}
                                error={formik.touched.name && !!formik.errors.name}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button type="submit" variant="contained">
                                    บันทึก
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddContactModal;

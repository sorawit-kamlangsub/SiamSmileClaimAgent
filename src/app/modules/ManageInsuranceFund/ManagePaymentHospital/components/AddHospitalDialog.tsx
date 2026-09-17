import { Box, Dialog } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { setDialogOpen } from "../store/managePaymentHospitalSlice";
import { useEffect } from "react";

const AddHospitalDialog = () => {
    const { addDialog } = useAppSelector((s) => s.managePaymentHospital);
    const dispatch = useAppDispatch();
    const handleClose = () => {
        dispatch(setDialogOpen({ isOpen: false }));
    };

    useEffect(() => {
        return () => {
            dispatch(setDialogOpen({ isOpen: false }));
        };
    }, []);

    return (
        <Dialog open={addDialog.isOpen} onClose={handleClose} maxWidth={"md"} sx={{ borderRadius: "12px" }}>
            <Box>test</Box>
        </Dialog>
    );
};

export default AddHospitalDialog;

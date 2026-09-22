import { Grid } from "@mui/material";
import SearchTransferByStatusHook from "../hooks/SearchTransferByStatus";
import SearchTransferByStatus from "../components/SearchTransferByStatus";
import SelectStatusButton from "../components/SelectStatusButton";

const ManageTransferHospital = () => {
    const { formik } = SearchTransferByStatusHook();
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchTransferByStatus formik={formik} />
                </Grid>
                {!formik.values.statusId && (
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <SelectStatusButton formik={formik} />
                    </Grid>
                )}
            </Grid>
        </>
    );
};

export default ManageTransferHospital;

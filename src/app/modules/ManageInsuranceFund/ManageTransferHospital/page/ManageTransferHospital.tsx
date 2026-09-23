import { Grid } from "@mui/material";
import useSearchTransferByStatusHook from "../hooks/SearchTransferByStatusHook";
import SearchTransferByStatus, { statusMock } from "../components/SearchTransferByStatus";
import SelectStatusButton from "../components/SelectStatusButton";
import GenerateGroupTable from "../components/GenerateGroupTable";
import GenerateDialogConfirm from "../components/GenerateDialogConfirm";

const ManageTransferHospital = () => {
    const { formik } = useSearchTransferByStatusHook();

    const handleSelectStatusFromEmptyState = (value: number | undefined) => {
        formik.setFieldValue("statusId", value);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchTransferByStatus formik={formik} />
                </Grid>
                {!formik.values.statusId && (
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <SelectStatusButton
                            onSelectStatus={handleSelectStatusFromEmptyState}
                            statusOptions={statusMock}
                        />
                    </Grid>
                )}
                {formik.values.statusId === 1 ? (
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <GenerateGroupTable
                            statusId={formik.values.statusId}
                            searchDetail={formik.values.searchDetail}
                        />{" "}
                    </Grid>
                ) : null}
                <GenerateDialogConfirm />
            </Grid>
        </>
    );
};

export default ManageTransferHospital;

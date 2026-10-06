import { Grid } from "@mui/material";
import useSearchTransferByStatusHook from "../hooks/SearchTransferByStatusHook";
import SearchTransferByStatus, { statusMock } from "../components/SearchTransferByStatus";
import SelectStatusButton from "../components/SelectStatusButton";
import GenerateGroupTable from "../components/GenerateGroupTable";
import GenerateDialogConfirm from "../components/GenerateDialogConfirm";
import GenerateDialogSuccess from "../components/GenerateDialogSuccess";
import PendingTransferTable from "../components/PendingTransferTable";
import TransferSuccessTable from "../components/TransferSuccessTable";

const ManageTransferHospital = () => {
    const { formik, submittedSearch } = useSearchTransferByStatusHook();

    const handleSelectStatusFromEmptyState = (value: number | undefined) => {
        formik.setFieldValue("statusId", value);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <form onSubmit={formik.handleSubmit}>
                        <SearchTransferByStatus formik={formik} />
                    </form>
                </Grid>
                {!formik.values.statusId && (
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <SelectStatusButton
                            onSelectStatus={handleSelectStatusFromEmptyState}
                            statusOptions={statusMock}
                        />
                    </Grid>
                )}
                {formik.values.statusId ? (
                    submittedSearch?.values.statusId === 1 ? (
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <GenerateGroupTable
                                key={submittedSearch.requestId}
                                statusId={submittedSearch.values.statusId}
                                searchDetail={submittedSearch.values.searchDetail}
                            />{" "}
                        </Grid>
                    ) : submittedSearch?.values?.statusId === 2 ? (
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <PendingTransferTable
                                key={submittedSearch.requestId}
                                statusId={submittedSearch.values.statusId}
                                searchDetail={submittedSearch.values.searchDetail}
                            />
                        </Grid>
                    ) : submittedSearch?.values?.statusId === 3 || submittedSearch?.values?.statusId === 5 ? (
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <TransferSuccessTable
                                key={submittedSearch.requestId}
                                statusId={submittedSearch.values.statusId}
                                searchDetail={submittedSearch.values.searchDetail}
                            />
                        </Grid>
                    ) : null
                ) : null}

                <GenerateDialogConfirm />
                <GenerateDialogSuccess />
            </Grid>
        </>
    );
};

export default ManageTransferHospital;

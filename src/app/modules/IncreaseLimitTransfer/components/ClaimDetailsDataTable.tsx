import { Grid } from "@mui/material";
import useClaimCpgTransferDataTableHook from "../hooks/ClaimDetailsDataTableHook";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import { useState } from "react";

const ClaimDetailsDataTable = () => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });
    const { columns, dataMock } = useClaimCpgTransferDataTableHook();

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <StandardDataTable
                        name="cpgTransfer"
                        title=""
                        data={dataMock ?? []}
                        columns={columns}
                        paginated={paginated}
                        setPaginated={setPaginated}
                        color="primary"
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default ClaimDetailsDataTable;

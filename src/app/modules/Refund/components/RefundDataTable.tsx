import { Grid, Paper } from "@mui/material";
import useRefundDataTableHook from "../hooks/RefundDataTableHook";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import { useState } from "react";

const RefundDataTable = () => {
    const { columns, dataMock } = useRefundDataTableHook();
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });
    return (
        <>
            <Grid container>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <StandardDataTable
                            name="refund"
                            columns={columns}
                            data={dataMock ?? []}
                            color="primary"
                            paginated={paginated}
                            setPaginated={setPaginated}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default RefundDataTable;

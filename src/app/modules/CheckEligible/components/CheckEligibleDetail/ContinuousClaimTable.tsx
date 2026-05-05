// components/CheckEligible/ContinuousClaimTable.tsx
import React, { useState } from "react";
import { ContinuousClaimRow } from "../../store/checkeligibleSlice";
import { smallSizeFooter } from "../../../../functionHelpers";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { StandardDataTable } from "../../../_common";
import useContinuousClaimTable from "../../hooks/CheckEligibleDetail/useContinuousClaimTable";

type Props = {
    rows: ContinuousClaimRow[];
    selected: string[];
    onToggle: (claimCode: string) => void;
};

const ContinuousClaimTable: React.FC<Props> = () => {
    const { isLoading, data, paginated, setPaginated, columns } = useContinuousClaimTable();
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);
    const handleDataSelected = (data: any) => {
        setRowsSelected(data?.lastRowSelectedIndex);
    };
    return (
        <LinearLoading isLoading={isLoading}>
            <StandardDataTable
                name="continuous-claim-table"
                title=""
                data={data || []}
                isLoading={isLoading}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                setPaginated={setPaginated}
                paginated={paginated}
                displayToolbar={false}
                sx={smallSizeFooter}
                options={{
                    setTableProps: () => {
                        return {
                            size: "small",
                        };
                    },
                    selectableRows: "single",
                    selectableRowsOnClick: true,
                    disableToolbarSelect: true,
                    customToolbarSelect: () => <></>,
                    onRowSelectionChange: (currentRowsSelected: any[], allRowsSelected: any[], rowsSelected?: any) => {
                        handleDataSelected({
                            lastRowSelectedIndex: rowsSelected,
                            lastRowSelectedData: {
                                index: currentRowsSelected,
                                data: data?.[rowsSelected],
                            },
                            allRowsSelectedIndex: allRowsSelected,
                            allRowsSelectedData: allRowsSelected?.map((item) => data?.[item.index]),
                        });
                    },
                }}
            />
        </LinearLoading>
    );
};

export default ContinuousClaimTable;

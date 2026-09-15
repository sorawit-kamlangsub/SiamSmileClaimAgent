import { MUIDataTableColumn } from "mui-datatables";
import { StandardDataTable } from "../../../_common";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { BillingListItemDto } from "../../../../api/coreClaimApi.client";

type BillingHospitalDataTableProps = {
    column: MUIDataTableColumn[];
    rows: BillingListItemDto[];
    isLoading: boolean;
    pagination: PaginationResultDto;
    setPaginated: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
};

/** Query อยู่ที่ page (ใช้ผลเดียวกันทั้ง Header ที่นับ counts และตารางนี้) — component นี้แค่ render */
const BillingHospitalDataTable = ({
    column,
    rows,
    isLoading,
    pagination,
    setPaginated,
}: BillingHospitalDataTableProps) => {
    return (
        <StandardDataTable
            name="dataTableBillingHospital"
            columns={column}
            data={rows}
            isLoading={isLoading}
            color="primary"
            setPaginated={setPaginated}
            paginated={pagination}
            columnHeaderAlign="center"
        />
    );
};

export default BillingHospitalDataTable;

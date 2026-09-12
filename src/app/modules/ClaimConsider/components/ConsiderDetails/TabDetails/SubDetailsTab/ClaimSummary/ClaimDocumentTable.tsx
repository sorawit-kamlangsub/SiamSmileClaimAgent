import { Visibility } from "@mui/icons-material";
import { Grid, IconButton, Tooltip } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { StandardDataTable } from "../../../../../../_common";
import { DOC_STORAGE_URL } from "../../../../../../../../Const";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    handleClickLink,
} from "../../../../../../../functionHelpers";

export type ClaimDocumentRow = {
    documentId: string | undefined;
    documentCode: string | undefined;
    documentSubTypeName: string | undefined;
    fileCount: number;
};

type ClaimDocumentTableProps = {
    rows: ClaimDocumentRow[];
};

const ClaimDocumentTable = ({ rows }: ClaimDocumentTableProps) => {
    const columns: MUIDataTableColumn[] = [
        {
            name: "documentCode",
            label: "รหัสเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentSubTypeName",
            label: "ประเภทเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentId",
            label: "รายละเอียด",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: string | undefined) => (
                    <Grid container alignItems="center" justifyContent="center">
                        <Tooltip title="ดูรายละเอียด" arrow placement="top" enterDelay={100} leaveDelay={50}>
                            <IconButton
                                aria-label="preview"
                                size="small"
                                sx={{ backgroundColor: "#E2F2FF" }}
                                onClick={() => handleClickLink(`${DOC_STORAGE_URL}/document/${value}/preview`)}
                            >
                                <Visibility color="primary" />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                ),
            },
        },
    ];

    return (
        <StandardDataTable
            name="claimSummaryDocumentTable"
            title=""
            data={rows}
            isLoading={false}
            columns={columns}
            color="primary"
            columnHeaderAlign="center"
            displayToolbar={false}
            displayFooter={false}
            options={defaultOptionStandardDataTable}
        />
    );
};

export default ClaimDocumentTable;

import { Button, Grid, IconButton, Tooltip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import { MUIDataTableColumn } from "mui-datatables";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable } from "../../../../../functionHelpers";
import { DeathDisabilityDocument } from "../mock/deathDisabilityConsiderMock";

type DeathDisabilityDocumentTableProps = {
    name: string;
    rows: DeathDisabilityDocument[];
    /** ซ่อนคอลัมน์รหัสเอกสาร (ตารางเอกสารประกอบการปฏิเสธไม่มีรหัส) */
    hideDocumentCode?: boolean;
};

/**
 * ตารางเอกสาร (รหัส/ประเภท/ปุ่มสแกน/จำนวน/ดูรายละเอียด) แบบ presentational
 * ไม่ใช้ DocumentScanTable ของหน้าแจ้งเคลมเพราะผูก master + redux ของ claimPH
 * TODO(death-disability-api): ปุ่มสแกน/ดูรายละเอียดยังไม่มี action
 */
const DeathDisabilityDocumentTable = ({ name, rows, hideDocumentCode }: DeathDisabilityDocumentTableProps) => {
    const columns: MUIDataTableColumn[] = [
        ...(hideDocumentCode
            ? []
            : [
                  {
                      name: "documentCode",
                      label: "รหัสเอกสาร",
                      options: { sort: false, ...cellAlignOptions({ align: "center" }) },
                  },
              ]),
        {
            name: "documentTypeName",
            label: "ประเภทเอกสาร",
            options: { sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentId",
            label: "สแกนเอกสาร",
            options: {
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: () => (
                    <Button variant="contained" size="small" startIcon={<DocumentScannerIcon />}>
                        สแกนเอกสาร
                    </Button>
                ),
            },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: { sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentId",
            label: "รายละเอียด",
            options: {
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: () => (
                    <Grid container justifyContent="center">
                        <Tooltip title="ดูรายละเอียด" arrow placement="top">
                            <IconButton aria-label="preview" size="small" sx={{ backgroundColor: "#E2F2FF" }}>
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
            name={name}
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

export default DeathDisabilityDocumentTable;

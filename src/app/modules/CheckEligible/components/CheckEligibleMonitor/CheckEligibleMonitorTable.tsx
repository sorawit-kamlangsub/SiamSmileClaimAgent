import { MUIDataTableColumn } from "mui-datatables";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { useCheckEligibleMonitorTable } from "../../hooks";
import { Grid, IconButton, Tooltip, Zoom } from "@mui/material";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";

const CheckEligibleMonitorTable = () => {
    const { data, isLoading, paginated, setPaginated } = useCheckEligibleMonitorTable();

    const columns: MUIDataTableColumn[] = [
        {
            name: "",
            label: "",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (_value, tableMeta) => {
                    const { appId } = data?.[tableMeta.rowIndex] ?? {};
                    return (
                        <Grid container direction="row" alignItems="center">
                            <Grid item xs={12}>
                                <Tooltip
                                    title="ดูรายละเอียด"
                                    arrow
                                    placement="top"
                                    TransitionComponent={Zoom}
                                    enterDelay={100}
                                    leaveDelay={50}
                                >
                                    <IconButton
                                        aria-label="delete"
                                        size="small"
                                        sx={{ backgroundColor: "#E2F2FF" }}
                                        onClick={() => {
                                            window.open(
                                                `/checkeligible/detail/${btoa(appId)}/${btoa(appId)}`,
                                                "_blank"
                                            );
                                        }}
                                    >
                                        <ContentPasteSearchIcon color="primary" />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    );
                },
            },
        },
        {
            name: "appId",
            label: "AppID",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productName",
            label: "ผลิตภัณฑ์",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productCategoryName",
            label: "แผน",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "startCoverDate",
            label: "วันที่เริ่มคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => {
                    return formatDateString(value?.toString(), `DD/MM/BBBB`);
                },
            },
        },
        {
            name: "endCoverDate",
            label: "วันที่สิ้นสุดความคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => {
                    return formatDateString(value?.toString(), `DD/MM/BBBB`);
                },
            },
        },
    ];

    return (
        <LinearLoading isLoading={isLoading}>
            <StandardDataTable
                name="BeneficiaryAccountTable"
                title=""
                data={data || []}
                isLoading={isLoading}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                setPaginated={setPaginated}
                paginated={paginated}
                displayToolbar={false}
                options={defaultOptionStandardDataTable}
                sx={smallSizeFooter}
            />
        </LinearLoading>
    );
};

export default CheckEligibleMonitorTable;

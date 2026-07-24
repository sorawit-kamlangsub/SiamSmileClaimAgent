import React from "react";
import { MUIDataTableColumn } from "mui-datatables";
import { Button, Link } from "@mui/material";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { useMonitorTable } from "../../hooks/Monitor/useMonitorTable";
const MonitorTable: React.FC = () => {
    const { data, isLoading, paginated, setPaginated, selectedRowIndex, handleSelect, search } = useMonitorTable();
    const isPH = data?.data?.some((item) => item.productTypeId === 6);
    const columns: MUIDataTableColumn[] = [
        {
            name: "",
            label: "",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (_value, tableMeta) => (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: "#02579B", minWidth: 60 }}
                        onClick={() => handleSelect(tableMeta.rowIndex)}
                    >
                        เลือก
                    </Button>
                ),
            },
        },
        {
            name: "policyCode",
            label: "AppID",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value, tableMeta) => {
                    const item = data?.data?.[tableMeta.rowIndex] || {};
                    return (
                        <>
                            <Link
                                href={item?.id ? `/checkeligible/detail/${btoa(item.id.toString())}` : ""}
                                target="_blank"
                                underline="hover"
                            >
                                {value}
                            </Link>
                        </>
                    );
                },
            },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productTypeName",
            label: "ผลิตภัณฑ์",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productName",
            label: "แผน",
            options: { display: isPH, filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "productCategoryName",
            label: "แผน",
            options: { display: !isPH, filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "coverageFrom",
            label: "วันที่เริ่มคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => formatDateString(value?.toString(), "DD/MM/BBBB"),
            },
        },
        {
            name: "coverageTo",
            label: "วันที่สิ้นสุดความคุ้มครอง",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value?.toString(), "DD/MM/BBBB") : "-"),
            },
        },
    ];

    const options = {
        ...defaultOptionStandardDataTable,
        setRowProps: (_row: any, dataIndex: number) => ({
            style: {
                backgroundColor: dataIndex === selectedRowIndex ? "#EEF9FF" : undefined,
            },
        }),
    };

    return (
        <LinearLoading isLoading={isLoading && !!search.searchDetail}>
            <StandardDataTable
                name="MonitorTable"
                title=""
                data={data?.data || []}
                isLoading={isLoading}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                setPaginated={setPaginated}
                paginated={paginated}
                displayToolbar={false}
                options={options}
                sx={smallSizeFooter}
            />
        </LinearLoading>
    );
};

export default MonitorTable;

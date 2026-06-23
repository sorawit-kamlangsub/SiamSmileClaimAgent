import { Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";

const useGetPaymentDataHook = () => {
    const data = [
        {
            claimNo: "CL6804000123",
            customerName: "นายกรภัทร วรวงศ์คุณากร",
            transactionAmount: 1200.0,
            narrative: "Krungthai Corporate Online",
            approvedAmount: 1200.0,
        },
    ];
    const column: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "Claim No.",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    },
                }),
                customHeadRender: (columnMeta) => (
                    <th
                        key={columnMeta.index}
                        style={{
                            background: "linear-gradient(to right, #0458AD, #1565C0)",
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            padding: "8px",
                            textAlign: "left",
                        }}
                    >
                        {columnMeta.label}
                    </th>
                ),
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <>
                            <Typography>{data?.[rowIndex]?.claimNo}</Typography>
                        </>
                    );
                },
            },
        },
        {
            name: "customerName",
            label: "Customer Name",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    },
                }),
                customHeadRender: (columnMeta) => (
                    <th
                        key={columnMeta.index}
                        style={{
                            background: "#1565C0",
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            padding: "8px",
                            textAlign: "left",
                        }}
                    >
                        {columnMeta.label}
                    </th>
                ),
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <>
                            <Typography>{data?.[rowIndex]?.customerName}</Typography>
                        </>
                    );
                },
            },
        },
        {
            name: "transactionAmount",
            label: "Transaction Amount",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    },
                }),
                customHeadRender: (columnMeta) => (
                    <th
                        key={columnMeta.index}
                        style={{
                            background: "linear-gradient(to right,#1565C0 2%, #2B96EC 25%,#2B96EC 75%,#1565C0 98% )",
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            padding: "8px",
                            textAlign: "right",
                        }}
                    >
                        {columnMeta.label}
                    </th>
                ),
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <>
                            <Typography>{data?.[rowIndex]?.transactionAmount}</Typography>
                        </>
                    );
                },
            },
        },
        {
            name: "narrative",
            label: "Narrative",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    },
                }),
                customHeadRender: (columnMeta) => (
                    <th
                        key={columnMeta.index}
                        style={{
                            background: "#1565C0",
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            padding: "8px",
                            textAlign: "left",
                        }}
                    >
                        {columnMeta.label}
                    </th>
                ),
            },
        },
        {
            name: "approvedAmount",
            label: "Approved Amount",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    },
                }),
                customHeadRender: (columnMeta) => (
                    <th
                        key={columnMeta.index}
                        style={{
                            background: "linear-gradient(to right, #1565C0, #0458AD)",
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            padding: "8px",
                            textAlign: "right",
                        }}
                    >
                        {columnMeta.label}
                    </th>
                ),
            },
        },
    ];
    return { column, data };
};

export default useGetPaymentDataHook;

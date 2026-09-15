import { Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import StatusPill from "../../components/common/StatusPill";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import dayjs from "dayjs";

const useAutoTransferDataTableHook = (data: any) => {
    const columns: MUIDataTableColumn[] = [
        {
            name: "createdByUser",
            label: "ผู้ดำเนินการ",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <>
                            <Typography sx={{ fontSize: "0.85rem" }}>{data?.[rowIndex]?.createdByUser}</Typography>

                            <Typography
                                sx={{
                                    fontSize: "0.8rem",
                                    color: "#9E9E9E",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                }}
                            >
                                <AccountBoxIcon sx={{ color: "#9E9E9E", fontSize: 14 }} />
                                {data?.[rowIndex]?.employeeCode}
                            </Typography>
                        </>
                    );
                },
            },
        },
        {
            name: "createdDate",
            label: "วันที่ เปิด/ปิด",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    const createdDate = data?.[rowIndex]?.createdDate
                        ? dayjs(data?.[rowIndex]?.createdDate).format("DD/MM/YYYY hh:mm:ss")
                        : "-";
                    return <Typography sx={{ color: "#01579B", fontSize: "0.85rem" }}>{createdDate}</Typography>;
                },
            },
        },
        {
            name: "isAutoTransfer",
            label: "สถานะ",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    return <StatusPill status={data?.[rowIndex]?.isAutoTransfer} />;
                },
            },
        },
    ];

    return { columns };
};

export default useAutoTransferDataTableHook;

import { Box, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { StandardDataTable } from "../../../_common";
import useAutoTransferDataTableHook from "../../hooks/ManageTransferHook/AutoTransferDataTableHook";

type AutoTransferHistoryProps = {
    data: any;
    isLoading: boolean;
};

const AutoTransferHistory = ({ data, isLoading }: AutoTransferHistoryProps) => {
    const { columns } = useAutoTransferDataTableHook(data);

    return (
        <>
            <Box
                sx={{
                    borderRadius: "12px",
                    border: "1px solid #FFFFFF",
                    backgroundColor: "#FFFFFF",
                    height: "auto",
                    maxHeight: "auto",
                    overflow: "auto",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        borderRadius: "12px",
                        background: `#FFFFFF`,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <AccessTimeIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700 }}>ประวัติการเปลี่ยนแปลง</Typography>
                </Box>
                <StandardDataTable
                    name="autoTransferHistory"
                    title=""
                    data={data ?? []}
                    isLoading={isLoading}
                    columns={columns}
                    displayFooter={false}
                    color="background"
                    options={{
                        tableBodyHeight: "600px",
                        fixedHeader: true,
                    }}
                />
            </Box>
        </>
    );
};

export default AutoTransferHistory;

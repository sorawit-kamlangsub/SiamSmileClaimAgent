import React from "react";
import {
    Avatar,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import CloseIcon from "@mui/icons-material/Close";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { StandardDataTable } from "../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable } from "../../../functionHelpers";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";

type WaitingPeriod120Item = {
    id: number;
    name: string;
    detail?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
};

// mock data
const MOCK_WAITING_120_ITEMS: WaitingPeriod120Item[] = [
    { id: 1, name: "ต้อเนื้อ หรือต้อกระจก" },
    { id: 2, name: "นิ่วทุกชนิด" },
    { id: 3, name: "ริดสีดวงทวาร", detail: "ฝีที่ทวารหนัก / ขี้เนื้อหรือติ่งเนื้อที่รูทวารหนัก" },
    { id: 4, name: "เส้นเลือดขอดที่ขา" },
    { id: 5, name: "การตัดทอนซิล หรืออะดีนอยด์" },
    { id: 6, name: "เยื่อบุโพรงมดลูกเจริญผิดที่" },
    { id: 7, name: "เนื้องอก ถุงน้ำ หรือมะเร็งทุกชนิด" },
    { id: 8, name: "ไส้เลื่อนทุกชนิด" },
];

const columns: MUIDataTableColumn[] = [
    {
        name: "id",
        label: "ลำดับ",
        options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
    },
    {
        name: "name",
        label: "รายการโรค / เงื่อนไข",
        options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
    },
    {
        name: "detail",
        label: "รายละเอียดโรคหรือเงื่อนไขเพิ่มเติม",
        options: {
            filter: false,
            sort: false,
            ...cellAlignOptions({ align: "left" }),
            customBodyRender: (value) => value ?? "-",
        },
    },
];

// const tableOptions = {
//     serverSide: false,
//     pagination: false,
//     search: false,
//     filter: false,
//     viewColumns: false,
//     selectableRows: "none" as const,
// };

const tableSx = {
    "& .MuiPaper-root": {
        boxShadow: "none",
        borderRadius: 0,
    },
    "& .MuiTableCell-root": {
        fontSize: 13.5,
    },
    "& .MuiTableRow-root:nth-of-type(even)": {
        bgcolor: "#f7f9fb",
    },
    "& .MuiTableFooter-root .MuiToolbar-root": {
        minHeight: "40px",
        padding: "0px 14px",
    },
    "& .MuiTableFooter-root .MuiTableCell-root": {
        padding: "0px 16px",
    },
};

const WaitingPeriod120DetailModal: React.FC<Props> = ({ open, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "visible",
                },
            }}
            fullScreen={fullScreen}
        >
            <DialogTitle
                sx={{
                    bgcolor: "#fff",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 2,
                    px: 3,
                }}
            >
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.25}>
                        <Avatar sx={{ bgcolor: "#eaf5ff", width: 34, height: 34 }}>
                            <HealthAndSafetyIcon sx={{ color: "#1a5da8", fontSize: 27 }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={700} color="#16324f">
                            รายละเอียดโรคที่อยู่ในระยะรอคอย 120 วัน
                        </Typography>
                    </Box>
                    {/* ปุ่มปิดลอยที่มุมขวาบน */}
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflow: "hidden", borderRadius: "0 0 12px 12px" }}>
                <CustomPaper>
                    <StandardDataTable
                        name="waitingPeriod120DetailTable"
                        data={MOCK_WAITING_120_ITEMS}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        // setPaginated={setPaginated}
                        // paginated={pagination}
                        displayToolbar={false}
                        options={defaultOptionStandardDataTable}
                        sx={tableSx}
                    />
                </CustomPaper>
            </DialogContent>
        </Dialog>
    );
};

export default WaitingPeriod120DetailModal;


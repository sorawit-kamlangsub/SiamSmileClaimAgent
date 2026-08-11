import { IconButton, Tooltip, Grid } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";

const useDataTableConsiderCustomerHook = () => {
    const mockData = [
        {
            transferDate: "2026-08-01",
            claimCode: "CLM-2026-0001",
            schoolName: "โรงเรียนสาธิตมหาวิทยาลัยเกษตรศาสตร์",
            customerName: "นายสมชาย ใจดี",
            idCard: "1103700123456",
            amount: 15000,
            statusName: "โอนเงินสำเร็จ",
        },
        {
            transferDate: "2026-08-02",
            claimCode: "CLM-2026-0002",
            schoolName: "โรงเรียนสวนกุหลาบวิทยาลัย",
            customerName: "นางสาวสุดา รักเรียน",
            idCard: "1103700654321",
            amount: 25000,
            statusName: "รอโอนเงิน",
        },
        {
            transferDate: "2026-08-03",
            claimCode: "CLM-2026-0003",
            schoolName: "โรงเรียนเทพศิรินทร์",
            customerName: "นายกิตติพงษ์ มีสุข",
            idCard: "1103700789123",
            amount: 18000,
            statusName: "โอนเงินสำเร็จ",
        },
        {
            transferDate: "2026-08-04",
            claimCode: "CLM-2026-0004",
            schoolName: "โรงเรียนกรุงเทพคริสเตียนวิทยาลัย",
            customerName: "นางสาวพิมพ์ชนก แสงทอง",
            idCard: "1103700456789",
            amount: 32000,
            statusName: "ไม่สำเร็จ",
        },
        {
            transferDate: "2026-08-05",
            claimCode: "CLM-2026-0005",
            schoolName: "โรงเรียนอัสสัมชัญ",
            customerName: "นายธนกร วัฒนชัย",
            idCard: "1103700234567",
            amount: 12500,
            statusName: "กำลังดำเนินการ",
        },
        {
            transferDate: "2026-08-06",
            claimCode: "CLM-2026-0006",
            schoolName: "โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี)",
            customerName: "นางสาวชลธิชา สุขใจ",
            idCard: "1103700890123",
            amount: 45000,
            statusName: "โอนเงินสำเร็จ",
        },
        {
            transferDate: "2026-08-07",
            claimCode: "CLM-2026-0007",
            schoolName: "โรงเรียนหอวัง",
            customerName: "นายณัฐวุฒิ เจริญสุข",
            idCard: "1103700345678",
            amount: 20000,
            statusName: "รอโอนเงิน",
        },
        {
            transferDate: "2026-08-08",
            claimCode: "CLM-2026-0008",
            schoolName: "โรงเรียนเตรียมอุดมศึกษา",
            customerName: "นางสาวศิริพร ตั้งใจ",
            idCard: "1103700567890",
            amount: 27500,
            statusName: "โอนเงินสำเร็จ",
        },
        {
            transferDate: "2026-08-09",
            claimCode: "CLM-2026-0009",
            schoolName: "โรงเรียนสามเสนวิทยาลัย",
            customerName: "นายพีรพล เกียรติชัย",
            idCard: "1103700678901",
            amount: 15500,
            statusName: "ไม่สำเร็จ",
        },
        {
            transferDate: "2026-08-10",
            claimCode: "CLM-2026-0010",
            schoolName: "โรงเรียนราชวินิตบางแก้ว",
            customerName: "นางสาววราภรณ์ ใจงาม",
            idCard: "1103700789012",
            amount: 30000,
            statusName: "กำลังดำเนินการ",
        },
    ];
    const column: MUIDataTableColumn[] = [
        {
            name: "transferDate",
            label: "วันที่โอนเงิน",
            options: { sort: false },
        },
        {
            name: "claimCode",
            label: "ClaimCode",
            options: { sort: false },
        },
        {
            name: "schoolName",
            label: "ชื่อสถานศึกษา",
            options: { sort: false },
        },
        {
            name: "customerName",
            label: "ชื่อ-สกุลผู้เอาประกัน",
            options: { sort: false },
        },
        {
            name: "idCard",
            label: "เลขบัตรประชาชน",
            options: { sort: false },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: { sort: false },
        },
        {
            name: "statusName",
            label: "สถานะรายการ",
            options: { sort: false },
        },
        {
            name: "_option",
            label: " ",
            options: {
                sort: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <>
                            <Grid container sx={{ gap: 1.5 }}>
                                <Tooltip title="พิจารณาเคลม">
                                    <IconButton
                                        sx={{
                                            backgroundColor: "#FFF263",
                                            ":hover": {
                                                backgroundColor: "#FBC02D",
                                            },
                                        }}
                                    >
                                        <FactCheckIcon sx={{ color: "#C49000" }}></FactCheckIcon>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="พิจารณาเคลม">
                                    <IconButton
                                        sx={{
                                            backgroundColor: "#D4EDFF",
                                            ":hover": {
                                                backgroundColor: "#0288D1",
                                            },
                                        }}
                                    >
                                        <VisibilityIcon sx={{ color: "#002F6C" }}></VisibilityIcon>
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </>
                    );
                },
            },
        },
    ];
    return { column, mockData };
};

export default useDataTableConsiderCustomerHook;

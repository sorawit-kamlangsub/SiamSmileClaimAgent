import { Alert, Box, Grid } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { TransferAccountChange } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import DeathDisabilityDocumentTable from "./DeathDisabilityDocumentTable";

/**
 * Section "รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน" — แสดงหลังบันทึกใน dialog เงินสดมอบหน้างาน
 * TODO(death-disability-api): ตอนนี้แสดงจากค่าที่กรอกใน dialog — เมื่อต่อ API ให้แสดงจากข้อมูลที่บันทึกแล้วของเคส
 * (รหัสเอกสาร/จำนวนไฟล์จาก document service จริง)
 */
const TransferAccountChangeSection = ({ change }: { change: TransferAccountChange }) => (
    <CustomPaper>
        <HeadingWithColor
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 27 }} />}
            text="รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน"
            color="blue"
        />
        <Grid container spacing={2} p={2}>
            <CustomDisplayText label="เหตุผลการเปลี่ยนบัญชีรับสินไหม" value={change.reason} md={4} />
            <CustomDisplayText label="ชื่อผู้รับเงินแทน" value={change.payeeName} md={4} />
            <CustomDisplayText
                label="บัญชีรับสินไหมใหม่"
                value={`${change.bankName} (${change.accountTypeName}) ${change.accountNo} ${change.accountName}`}
                md={4}
            />
        </Grid>
        <Box sx={{ px: 2 }}>
            <Alert severity="warning" sx={{ display: "inline-flex", borderRadius: 2, border: "1px solid #F3D19E" }}>
                เคสนี้เป็นการเปลี่ยนบัญชีรับโอนเคสพิเศษ ไม่อิงข้อมูลเลขบัตรประชาชนผู้รับผลประโยชน์
            </Alert>
        </Box>
        <Box sx={{ p: 2 }}>
            <DeathDisabilityDocumentTable
                name="deathDisabilityTransferAccountDocumentTable"
                rows={[
                    {
                        documentId: "mock-transfer-account-doc",
                        documentCode: "-",
                        documentTypeName: "เอกสารประกอบการเปลี่ยนบัญชี",
                        fileCount: change.attachmentName ? 1 : 0,
                    },
                ]}
            />
        </Box>
    </CustomPaper>
);

export default TransferAccountChangeSection;

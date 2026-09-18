import { useState } from "react";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { DeathDisabilityBeneficiary } from "../mock/deathDisabilityConsiderMock";
import ChangeTransferAccountDialog from "./ChangeTransferAccountDialog";
import EditBeneficiaryDialog from "./EditBeneficiaryDialog";
import { TransferAccountChange } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";

const CARD_BORDER = "#D6E6F5";

const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type DeathDisabilityBeneficiarySectionProps = {
    beneficiaries: DeathDisabilityBeneficiary[];
    claimNo: string;
    customerName: string;
    /** บันทึกใน dialog เปลี่ยนบัญชีสำเร็จ — parent (tab) เก็บไว้แสดง section รายละเอียดการเปลี่ยนบัญชี */
    onTransferAccountChanged: (change: TransferAccountChange) => void;
};

/**
 * Section "ผู้รับผลประโยชน์" (read-only + ปุ่ม)
 * ปุ่ม "เงินสดมอบหน้างาน" เปิด dialog เปลี่ยนบัญชีปลายทางการโอนเงิน
 * ปุ่ม "แก้ไขข้อมูล" เปิด dialog แก้ไขข้อมูลผู้รับผลประโยชน์ของการ์ดนั้น
 */
const DeathDisabilityBeneficiarySection = ({
    beneficiaries,
    claimNo,
    customerName,
    onTransferAccountChanged,
}: DeathDisabilityBeneficiarySectionProps) => {
    const [changeAccountOpen, setChangeAccountOpen] = useState(false);
    // แยก open ออกจาก editingOrder — ตอนปิดยังคงผู้รับฯ เดิมไว้ ไม่ให้ข้อมูลใน dialog กลายเป็นว่างระหว่าง animation ปิด
    const [editOpen, setEditOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<number>();
    const editingBeneficiary = beneficiaries.find((item) => item.order === editingOrder);
    const totalAmount = beneficiaries.reduce((sum, item) => sum + item.amount, 0);
    // mockup เติมบัญชีเดิมของผู้รับผลประโยชน์ลำดับแรกไว้ให้ — ธนาคาร/ประเภทบัญชีรอ id จริงจาก API
    const firstBeneficiary = beneficiaries[0];
    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<PeopleIcon sx={{ fontSize: 27 }} />}
                text="ผู้รับผลประโยชน์"
                color="blue"
                sx={{ flexWrap: "wrap", gap: 1 }}
                button={
                    <Button
                        variant="outlined"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => setChangeAccountOpen(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        เงินสดมอบหน้างาน
                    </Button>
                }
            />
            <ChangeTransferAccountDialog
                open={changeAccountOpen}
                onClose={() => setChangeAccountOpen(false)}
                onSaved={(change) => {
                    onTransferAccountChanged(change);
                    setChangeAccountOpen(false);
                }}
                claimNo={claimNo}
                customerName={customerName}
                amount={totalAmount}
                initialValues={{
                    accountNo: firstBeneficiary?.accountNo ?? "",
                    accountName: firstBeneficiary?.fullName ?? "",
                    payeeName: firstBeneficiary?.fullName ?? "",
                }}
            />
            {/* TODO(death-disability-api): ความสัมพันธ์/คำนำหน้า/ธนาคาร ยังไม่มี id จาก mock — เติมเมื่อต่อ API */}
            <EditBeneficiaryDialog
                open={editOpen && !!editingBeneficiary}
                onClose={() => setEditOpen(false)}
                order={editingBeneficiary?.order ?? 0}
                isFromSystem={!!editingBeneficiary?.isFromSystem}
                claimNo={claimNo}
                customerName={customerName}
                initialValues={{
                    documentNo: editingBeneficiary?.idCardNo ?? "",
                    firstName: editingBeneficiary?.firstName ?? "",
                    lastName: editingBeneficiary?.lastName ?? "",
                    phoneNumber: editingBeneficiary?.phoneNumber.replace(/-/g, "") ?? "",
                    accountNo: editingBeneficiary?.accountNo ?? "",
                    accountName: editingBeneficiary?.fullName ?? "",
                    amount: editingBeneficiary?.amount,
                }}
            />
            {beneficiaries.map((beneficiary) => (
                <Box
                    key={beneficiary.order}
                    sx={{ mt: 2, p: 2, border: `1px solid ${CARD_BORDER}`, borderRadius: 3, bgcolor: "#F7FAFD" }}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                        <Typography fontWeight={700}>ผู้รับผลประโยชน์ ลำดับที่ {beneficiary.order}</Typography>
                        {beneficiary.isFromSystem && (
                            <Chip
                                label="ข้อมูลจากระบบ"
                                size="small"
                                sx={{ bgcolor: "#D4EDBC", color: "#1B7F3B", fontWeight: 600 }}
                            />
                        )}
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => {
                                setEditingOrder(beneficiary.order);
                                setEditOpen(true);
                            }}
                            sx={{ ml: "auto", borderRadius: 2 }}
                        >
                            แก้ไขข้อมูล
                        </Button>
                    </Box>
                    <Grid container spacing={2} mt={0}>
                        <CustomDisplayText label="ความสัมพันธ์" value={beneficiary.relationship} md={4} />
                        <CustomDisplayText label="เลขบัตรประชาชน" value={beneficiary.idCardNo} md={4} />
                        <CustomDisplayText label="ชื่อ-นามสกุล" value={beneficiary.fullName} md={4} />
                        <CustomDisplayText label="เบอร์โทรศัพท์" value={beneficiary.phoneNumber} md={4} />
                        <CustomDisplayText label="บัญชีรับสินไหม" value={beneficiary.bankAccount} md={4} />
                        <CustomDisplayText label="จำนวนเงิน" value={formatAmount(beneficiary.amount)} md={4} />
                    </Grid>
                </Box>
            ))}
            <Box sx={{ mt: 2, py: 1.5, borderRadius: 2, bgcolor: "#EAF3FC", textAlign: "center" }}>
                <Typography fontWeight={600} color="#0D5C9E">
                    จำนวนเงินโอนรวม : {formatAmount(totalAmount)} บาท
                </Typography>
            </Box>
        </CustomPaper>
    );
};

export default DeathDisabilityBeneficiarySection;

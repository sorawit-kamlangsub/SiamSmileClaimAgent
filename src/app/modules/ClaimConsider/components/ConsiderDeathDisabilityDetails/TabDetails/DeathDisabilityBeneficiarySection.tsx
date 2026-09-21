import { useState } from "react";
import { Box, Button, Grid, Skeleton, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { GetDeathAndDisabilityBeneficiaryDtoResponse } from "../../../../../api/coreClaimApi.client";
import ChangeTransferAccountDialog from "./ChangeTransferAccountDialog";
import EditBeneficiaryDialog from "./EditBeneficiaryDialog";
import { TransferAccountChange } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";

const CARD_BORDER = "#D6E6F5";

const formatAmount = (value?: number) =>
    (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ต่อข้อความที่มีค่า — API อาจส่ง null/ว่างมา ถ้าไม่เหลืออะไรเลยแสดง "-" */
const joinText = (parts: (string | null | undefined)[], separator = " ") => {
    const text = parts.filter((part) => part && part.trim() !== "").join(separator);
    return text || "-";
};
const getFullName = (item?: GetDeathAndDisabilityBeneficiaryDtoResponse) =>
    joinText([joinText([item?.titleName, item?.firstName], ""), item?.lastName].filter((part) => part !== "-"));

type DeathDisabilityBeneficiarySectionProps = {
    beneficiaries: GetDeathAndDisabilityBeneficiaryDtoResponse[];
    isLoading: boolean;
    /** ผลรวม payoutAmount ของผู้รับผลประโยชน์ทุกคน */
    totalAmount: number;
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
    isLoading,
    totalAmount,
    claimNo,
    customerName,
    onTransferAccountChanged,
}: DeathDisabilityBeneficiarySectionProps) => {
    const [changeAccountOpen, setChangeAccountOpen] = useState(false);
    // แยก open ออกจาก editingOrder — ตอนปิดยังคงผู้รับฯ เดิมไว้ ไม่ให้ข้อมูลใน dialog กลายเป็นว่างระหว่าง animation ปิด
    const [editOpen, setEditOpen] = useState(false);
    // ลำดับที่ = ตำแหน่งในรายการที่ API ส่งมา (เริ่มที่ 1)
    const [editingIndex, setEditingIndex] = useState<number>();
    const editingBeneficiary = editingIndex !== undefined ? beneficiaries[editingIndex] : undefined;
    // เติมบัญชีเดิมของผู้รับผลประโยชน์ลำดับแรกไว้ให้ใน dialog เงินสดมอบหน้างาน
    const firstBeneficiary = beneficiaries[0];
    const firstBeneficiaryName = firstBeneficiary ? getFullName(firstBeneficiary) : "-";
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
                    accountNo: firstBeneficiary?.bankAccountNo ?? "",
                    accountName: firstBeneficiary?.bankAccountName ?? "",
                    payeeName: firstBeneficiaryName === "-" ? "" : firstBeneficiaryName,
                }}
            />
            <EditBeneficiaryDialog
                open={editOpen && !!editingBeneficiary}
                onClose={() => setEditOpen(false)}
                order={(editingIndex ?? 0) + 1}
                claimNo={claimNo}
                customerName={customerName}
                initialValues={{
                    relationTypeId: editingBeneficiary?.relationId ?? undefined,
                    documentNo: editingBeneficiary?.idCard?.replace(/\D/g, "") ?? "",
                    // DTO ส่ง titleId เป็น string แต่ dropdown ใช้ number
                    titleId: editingBeneficiary?.titleId ? Number(editingBeneficiary.titleId) : undefined,
                    firstName: editingBeneficiary?.firstName ?? "",
                    lastName: editingBeneficiary?.lastName ?? "",
                    phoneNumber: editingBeneficiary?.phoneNo?.replace(/\D/g, "") ?? "",
                    bankId: editingBeneficiary?.bankId ?? undefined,
                    accountNo: editingBeneficiary?.bankAccountNo ?? "",
                    accountName: editingBeneficiary?.bankAccountName ?? "",
                    amount: editingBeneficiary?.payoutAmount ?? undefined,
                }}
            />
            {isLoading && <Skeleton variant="rounded" sx={{ mt: 2, height: 140 }} />}
            {!isLoading && beneficiaries.length === 0 && (
                <Typography color="text.secondary" textAlign="center" sx={{ mt: 2, py: 3 }}>
                    ไม่พบข้อมูลผู้รับผลประโยชน์
                </Typography>
            )}
            {beneficiaries.map((beneficiary, index) => (
                <Box
                    key={beneficiary.beneficiaryId ?? index}
                    sx={{ mt: 2, p: 2, border: `1px solid ${CARD_BORDER}`, borderRadius: 3, bgcolor: "#F7FAFD" }}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                        <Typography fontWeight={700}>ผู้รับผลประโยชน์ ลำดับที่ {index + 1}</Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => {
                                setEditingIndex(index);
                                setEditOpen(true);
                            }}
                            sx={{ ml: "auto", borderRadius: 2 }}
                        >
                            แก้ไขข้อมูล
                        </Button>
                    </Box>
                    <Grid container spacing={2} mt={0}>
                        <CustomDisplayText
                            label="ความสัมพันธ์"
                            value={joinText([beneficiary.relationTypeName])}
                            md={4}
                        />
                        <CustomDisplayText label="เลขบัตรประชาชน" value={joinText([beneficiary.idCard])} md={4} />
                        <CustomDisplayText label="ชื่อ-นามสกุล" value={getFullName(beneficiary)} md={4} />
                        <CustomDisplayText label="เบอร์โทรศัพท์" value={joinText([beneficiary.phoneNo])} md={4} />
                        <CustomDisplayText
                            label="บัญชีรับสินไหม"
                            value={joinText([
                                beneficiary.bankName,
                                beneficiary.bankAccountNo,
                                beneficiary.bankAccountName,
                            ])}
                            md={4}
                        />
                        <CustomDisplayText label="จำนวนเงิน" value={formatAmount(beneficiary.payoutAmount)} md={4} />
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

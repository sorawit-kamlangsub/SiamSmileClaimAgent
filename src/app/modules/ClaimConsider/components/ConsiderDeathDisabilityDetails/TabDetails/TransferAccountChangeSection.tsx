import { useState } from "react";
import { Alert, Box, Button, Grid } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import { swalConfirm, swalError } from "../../../../_common";
import { useUpdateBeneficiary } from "../../../../../api/coreClaimApi";
import { CaseDocumentV2Request, UpdateBeneficiaryDtoRequest } from "../../../../../api/coreClaimApi.client";
import {
    TRANSFER_ACCOUNT_DOCUMENT_TYPE,
    TransferAccountChange,
} from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import { BENEFICIARY_TYPE_ID } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityBeneficiaryHook";
import ChangeTransferAccountDialog from "./ChangeTransferAccountDialog";

type TransferAccountChangeSectionProps = {
    change: TransferAccountChange;
    productTypeId: number | undefined;
    aplicationCode: string | undefined;
    /** ผูกตารางเอกสารกับเคส — โหลดเอกสารที่บันทึกไว้แล้วของเคสมาแสดง */
    claimId: string | undefined;
    caseId: string | undefined;
    claimSourceId: number | undefined;
    claimNo: string;
    customerName: string;
    /** จำนวนเงินโอนรวม — payoutAmount ของผู้รับเงินตามบัญชีที่เปลี่ยน */
    amount: number;
    /** แก้ไข/ลบรายการที่ยังไม่บันทึก (ไม่มี beneficiaryId) — เก็บไว้ที่ parent ส่งตอนบันทึกผลพิจารณา, undefined = ลบ */
    onUnsavedChange: (change: TransferAccountChange | undefined) => void;
    /** เอกสารที่แนบตอนแก้ไขรายการที่บันทึกแล้ว — parent ส่งไปผูกกับเคสตอนบันทึกผลพิจารณา */
    onSavedChangeDocuments: (docs: CaseDocumentV2Request[]) => void;
};

/**
 * Section "รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน"
 * - รายการที่บันทึกแล้วของเคส (beneficiaryTypeId = 3): แก้ไข/ลบผ่าน POST /beneficiary/update ทันที
 * - รายการที่เพิ่งกรอกใน dialog (ยังไม่บันทึก): แก้ไข/ลบเฉพาะในหน้า — ส่งไปพร้อมบันทึกผลพิจารณา
 * ตารางเอกสารใช้ DocumentScanTable ประเภทเดียวกับใน dialog — ได้ documentCode/ไฟล์ชุดเดียวกันจาก cache
 */
const TransferAccountChangeSection = ({
    change,
    productTypeId,
    aplicationCode,
    claimId,
    caseId,
    claimSourceId,
    claimNo,
    customerName,
    amount,
    onUnsavedChange,
    onSavedChangeDocuments,
}: TransferAccountChangeSectionProps) => {
    const [editOpen, setEditOpen] = useState(false);
    const updateBeneficiary = useUpdateBeneficiary(undefined, (error) => swalError("ไม่สำเร็จ", error));

    const toUpdateRequest = (item: TransferAccountChange): UpdateBeneficiaryDtoRequest => ({
        beneficiaryId: item.beneficiaryId,
        claimId,
        caseId,
        titleId: item.payeeTitleId?.toString(),
        firstName: item.payeeFirstName || undefined,
        lastName: item.payeeLastName || undefined,
        bankId: item.bankId,
        bankName: item.bankName,
        bankAccountNo: item.accountNo,
        bankAccountName: item.accountName,
        payoutAmount: amount,
        changeReasonRemark: item.reason,
        beneficiaryTypeId: BENEFICIARY_TYPE_ID.TRANSFER_ACCOUNT,
    });

    const handleSaved = async (updated: TransferAccountChange) => {
        if (!updated.beneficiaryId) {
            onUnsavedChange(updated);
            setEditOpen(false);
            return;
        }
        const response = await updateBeneficiary.mutateAsync(toUpdateRequest(updated)).catch(() => undefined);
        if (!response?.isSuccess) return; // แจ้ง error แล้ว — ไม่ปิด dialog ให้แก้แล้วบันทึกใหม่ได้
        onSavedChangeDocuments(updated.attachedDocuments);
        setEditOpen(false);
    };

    const handleDelete = async () => {
        const { isConfirmed } = await swalConfirm(
            "ยืนยันการลบ",
            "ต้องการลบรายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงินใช่หรือไม่",
            "ลบ",
            "ยกเลิก"
        );
        if (!isConfirmed) return;
        if (!change.beneficiaryId) {
            onUnsavedChange(undefined);
            return;
        }
        await updateBeneficiary
            .mutateAsync({ ...toUpdateRequest(change), isDeleteBeneficiary: true })
            .catch(() => undefined);
    };

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<AccountBalanceWalletIcon sx={{ fontSize: 27 }} />}
                text="รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน"
                color="blue"
                sx={{ flexWrap: "wrap", gap: 1 }}
                button={
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setEditOpen(true)}
                            disabled={updateBeneficiary.isLoading}
                            sx={{ borderRadius: 2, bgcolor: "#fff" }}
                        >
                            แก้ไข
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            disabled={updateBeneficiary.isLoading}
                            sx={{ borderRadius: 2, bgcolor: "#fff" }}
                        >
                            ลบ
                        </Button>
                    </Box>
                }
            />
            <ChangeTransferAccountDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSaved={handleSaved}
                claimNo={claimNo}
                customerName={customerName}
                amount={amount}
                productTypeId={productTypeId}
                aplicationCode={aplicationCode}
                initialChange={change}
                isSaving={updateBeneficiary.isLoading}
                // รายการที่บันทึกแล้วดึงเอกสารของเคสมาด้วย — รายการที่ยังไม่บันทึกใช้เอกสารจาก cache ของตาราง
                caseId={change.beneficiaryId ? caseId : undefined}
                claimSourceId={claimSourceId}
            />
            <Grid container spacing={2} p={2}>
                <CustomDisplayText label="เหตุผลการเปลี่ยนบัญชีรับสินไหม" value={change.reason} md={4} />
                <CustomDisplayText label="ชื่อผู้รับเงินแทน" value={change.payeeName} md={4} />
                <CustomDisplayText
                    label="บัญชีรับสินไหมใหม่"
                    value={`${change.bankName} ${change.accountNo} ${change.accountName}`}
                    md={4}
                />
            </Grid>
            <Box sx={{ px: 2 }}>
                <Alert severity="warning" sx={{ display: "inline-flex", borderRadius: 2, border: "1px solid #F3D19E" }}>
                    เคสนี้เป็นการเปลี่ยนบัญชีรับโอนเคสพิเศษ ไม่อิงข้อมูลเลขบัตรประชาชนผู้รับผลประโยชน์
                </Alert>
            </Box>
            <Box sx={{ p: 2 }}>
                <DocumentScanTable
                    disablePaper
                    productTypeId={productTypeId ?? 0}
                    documentType={TRANSFER_ACCOUNT_DOCUMENT_TYPE}
                    aplicationCode={aplicationCode ?? ""}
                    caseId={caseId}
                    claimSourceId={claimSourceId}
                    filterCaseDocumentsByType
                />
            </Box>
        </CustomPaper>
    );
};

export default TransferAccountChangeSection;

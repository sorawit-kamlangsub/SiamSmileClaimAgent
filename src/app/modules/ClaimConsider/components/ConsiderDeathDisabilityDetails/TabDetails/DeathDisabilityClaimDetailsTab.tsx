import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { FormikProvider } from "formik";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import useDeathDisabilityBeneficiaryHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityBeneficiaryHook";
import useDeathDisabilityExpenseHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityExpenseHook";
import useDeathDisabilityConsiderHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityConsiderHook";
import { TransferAccountChange } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import {
    GetCustomerDetailByIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import DeathDisabilityClaimInfoSection from "./DeathDisabilityClaimInfoSection";
import DeathDisabilityExpenseSection from "./DeathDisabilityExpenseSection";
import DeathDisabilityBeneficiarySection from "./DeathDisabilityBeneficiarySection";
import DeathDisabilityConsiderSection from "./DeathDisabilityConsiderSection";
import TransferAccountChangeSection from "./TransferAccountChangeSection";

type DeathDisabilityClaimDetailsTabProps = {
    /** รายละเอียดเคลม Death & Disability (GetDeathAndDisabilityClaimDetailConsider) */
    detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined;
    detailLoading: boolean;
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
};

/**
 * Tab "ข้อมูลการเคลม" ของหน้าพิจารณาเคลม - Death & Disability
 * - รายละเอียดเคลม: GetDeathAndDisabilityClaimDetailConsider
 * - รายละเอียดค่าใช้จ่าย: GetStandardMedicalExpenseByCase (เหมือนเคลมลูกค้า)
 * - สแกนเอกสาร: DocumentScanTable ตัวเดียวกับ ClaimDetailsTab (ดึงเอกสารที่แนบไว้ของ caseId จริง)
 * - ผู้รับผลประโยชน์: GetDeathAndDisabilityBeneficiary
 */
const DeathDisabilityClaimDetailsTab = ({
    detail,
    detailLoading,
    customerDetail,
}: DeathDisabilityClaimDetailsTabProps) => {
    const { expenseItems, expenseLoading } = useDeathDisabilityExpenseHook(detail, customerDetail);
    const {
        beneficiaries,
        beneficiaryLoading,
        totalPayoutAmount,
        editedIndexes,
        editedBeneficiaries,
        updateBeneficiary,
    } = useDeathDisabilityBeneficiaryHook(detail);
    const {
        formik,
        revisionReasonOptions,
        revisionReasonLoading,
        rejectReasonOptions,
        rejectReasonLoading,
        cancelReasonOptions,
        cancelReasonLoading,
    } = useDeathDisabilityConsiderHook({ documentCompleteDate: detail?.documentCompleteDate });
    // ข้อมูลผู้รับผลประโยชน์ที่แก้ไว้ยังไม่ถูกบันทึกจนกว่าจะกดยืนยันบันทึก — เตือนก่อนปิด/รีเฟรชหน้า
    // TODO(death-disability-api): ส่ง editedBeneficiaries ไปกับ request บันทึกผลพิจารณา (DeathDisabilityConsiderHook onSubmit)
    const hasPendingBeneficiaryEdits = editedBeneficiaries.length > 0;
    useEffect(() => {
        if (!hasPendingBeneficiaryEdits) return undefined;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasPendingBeneficiaryEdits]);
    // ผลการเปลี่ยนบัญชีจาก dialog เงินสดมอบหน้างาน — มีค่าแล้วจึงแสดง section รายละเอียดต่อจากผู้รับผลประโยชน์
    const [transferAccountChange, setTransferAccountChange] = useState<TransferAccountChange>();
    const claimNo = detail?.claimNo ?? "-";
    const customerName = customerDetail?.customerName ?? "-";

    return (
        <FormikProvider value={formik}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <DeathDisabilityClaimInfoSection info={detail} isLoading={detailLoading} />
                </Grid>
                <Grid item xs={12}>
                    <DeathDisabilityExpenseSection items={expenseItems} isLoading={expenseLoading} />
                </Grid>
                <Grid item xs={12}>
                    <DeathDisabilityBeneficiarySection
                        beneficiaries={beneficiaries}
                        isLoading={beneficiaryLoading}
                        totalAmount={totalPayoutAmount}
                        editedIndexes={editedIndexes}
                        onBeneficiaryEdited={updateBeneficiary}
                        claimNo={claimNo}
                        customerName={customerName}
                        onTransferAccountChanged={setTransferAccountChange}
                    />
                </Grid>
                {transferAccountChange && (
                    <Grid item xs={12}>
                        <TransferAccountChangeSection change={transferAccountChange} />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <DocumentScanTable
                        productTypeId={customerDetail?.productTypeId ?? 0}
                        Header="สแกนเอกสาร"
                        aplicationCode={customerDetail?.policyCode ?? ""}
                        documentType="เอกสารประกอบการพิจารณาเคลม"
                        caseId={detail?.caseId}
                        claimSourceId={detail?.claimSourceId}
                    />
                </Grid>
                <Grid item xs={12}>
                    <DeathDisabilityConsiderSection
                        claimNo={claimNo}
                        totalTransferAmount={totalPayoutAmount}
                        productTypeId={customerDetail?.productTypeId}
                        aplicationCode={customerDetail?.policyCode}
                        revisionReasonOptions={revisionReasonOptions}
                        revisionReasonLoading={revisionReasonLoading}
                        rejectReasonOptions={rejectReasonOptions}
                        rejectReasonLoading={rejectReasonLoading}
                        cancelReasonOptions={cancelReasonOptions}
                        cancelReasonLoading={cancelReasonLoading}
                    />
                </Grid>
            </Grid>
        </FormikProvider>
    );
};

export default DeathDisabilityClaimDetailsTab;

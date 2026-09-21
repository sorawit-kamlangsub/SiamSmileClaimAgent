import { useState } from "react";
import { Grid } from "@mui/material";
import { FormikProvider } from "formik";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import useDeathDisabilityExpenseHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityExpenseHook";
import useDeathDisabilityConsiderHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityConsiderHook";
import { TransferAccountChange } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import {
    GetCustomerDetailByIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import { MOCK_DEATH_DISABILITY_BENEFICIARIES } from "../mock/deathDisabilityConsiderMock";
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
 * TODO(death-disability-api): ผู้รับผลประโยชน์
 * ยังเป็น mock
 */
const DeathDisabilityClaimDetailsTab = ({
    detail,
    detailLoading,
    customerDetail,
}: DeathDisabilityClaimDetailsTabProps) => {
    const {
        formik,
        revisionReasonOptions,
        revisionReasonLoading,
        rejectReasonOptions,
        rejectReasonLoading,
        cancelReasonOptions,
        cancelReasonLoading,
    } = useDeathDisabilityConsiderHook({ documentCompleteDate: detail?.documentCompleteDate });
    const { expenseItems, expenseLoading } = useDeathDisabilityExpenseHook(detail, customerDetail);
    // ผลการเปลี่ยนบัญชีจาก dialog เงินสดมอบหน้างาน — มีค่าแล้วจึงแสดง section รายละเอียดต่อจากผู้รับผลประโยชน์
    const [transferAccountChange, setTransferAccountChange] = useState<TransferAccountChange>();
    const totalTransferAmount = MOCK_DEATH_DISABILITY_BENEFICIARIES.reduce((sum, item) => sum + item.amount, 0);
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
                        beneficiaries={MOCK_DEATH_DISABILITY_BENEFICIARIES}
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
                        totalTransferAmount={totalTransferAmount}
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

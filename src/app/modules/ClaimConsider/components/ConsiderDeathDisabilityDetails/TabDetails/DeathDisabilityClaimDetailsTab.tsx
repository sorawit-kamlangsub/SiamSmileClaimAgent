import { useState } from "react";
import { Grid } from "@mui/material";
import { FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";
import { DECISION_ID } from "../../../store/claimConsider.constants";
import { swalError, swalSuccess, swalWarning } from "../../../../_common";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import useDeathDisabilityBeneficiaryHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityBeneficiaryHook";
import useDeathDisabilityExpenseHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityExpenseHook";
import useDeathDisabilityConsiderHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityConsiderHook";
import useDeathDisabilityActionHook from "../../../hooks/ClaimConsiderDeathDisabilityDetail/DeathDisabilityActionHook";
import { TransferAccountChange } from "../../../hooks/ClaimConsiderDeathDisabilityDetail/ChangeTransferAccountHook";
import {
    CaseDocumentV2Request,
    GetCustomerDetailByIdDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import DeathDisabilityClaimInfoSection from "./DeathDisabilityClaimInfoSection";
import DeathDisabilityExpenseSection, { getExpenseTotalAmount } from "./DeathDisabilityExpenseSection";
import DeathDisabilityBeneficiarySection from "./DeathDisabilityBeneficiarySection";
import DeathDisabilityConsiderSection from "./DeathDisabilityConsiderSection";
import TransferAccountChangeSection from "./TransferAccountChangeSection";

const CONSIDER_DEATH_DISABILITY_MONITOR_PATH = "/consider/death-disability-monitor";

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
const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DeathDisabilityClaimDetailsTab = ({
    detail,
    detailLoading,
    customerDetail,
}: DeathDisabilityClaimDetailsTabProps) => {
    const { expenseItems, expenseLoading, disabilityBenefits, standardExpenses } = useDeathDisabilityExpenseHook(
        detail,
        customerDetail
    );
    const { beneficiaries, beneficiaryLoading, totalPayoutAmount, savedTransferAccountChange } =
        useDeathDisabilityBeneficiaryHook(detail);
    const {
        formik,
        revisionReasonOptions,
        revisionReasonLoading,
        rejectReasonOptions,
        rejectReasonLoading,
        cancelReasonOptions,
        cancelReasonLoading,
    } = useDeathDisabilityConsiderHook({ documentCompleteDate: detail?.documentCompleteDate });
    // ผลการเปลี่ยนบัญชีจาก dialog เงินสดมอบหน้างาน — มีค่าแล้วจึงแสดง section รายละเอียดต่อจากผู้รับผลประโยชน์
    const [transferAccountChange, setTransferAccountChange] = useState<TransferAccountChange>();
    // เอกสารที่แนบไฟล์แล้วของแต่ละตาราง (onAttachedDocumentsChange) — ส่งไปกับผลพิจารณา
    // เอกสารที่แนบตอนแก้ไขรายการเปลี่ยนบัญชีที่บันทึกแล้ว (beneficiaryTypeId = 3) — ส่งผูกกับเคสตอนบันทึกผลพิจารณา
    const [savedTransferAccountDocuments, setSavedTransferAccountDocuments] = useState<CaseDocumentV2Request[]>([]);
    const [scanDocuments, setScanDocuments] = useState<CaseDocumentV2Request[]>([]);
    const [rejectDocuments, setRejectDocuments] = useState<CaseDocumentV2Request[]>([]);
    const navigate = useNavigate();
    const { handleSubmitDecision, isSubmitting } = useDeathDisabilityActionHook({
        formik,
        detail,
        productTypeId: customerDetail?.productTypeId,
        transferAccountChange,
        savedTransferAccountDocuments,
        totalPayoutAmount,
        scanDocuments,
        rejectDocuments,
        disabilityBenefits,
        standardExpenses,
        // บันทึกแล้วกลับหน้า monitor Death & Disability
        onSuccess: () => {
            swalSuccess("บันทึกผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว").then(() =>
                navigate(CONSIDER_DEATH_DISABILITY_MONITOR_PATH)
            );
        },
    });
    /** submitForm = mark touched + นับ submitCount ให้ section โชว์ error แล้วจึงเช็คผล validate ก่อนยิง API */
    const handleConfirm = async () => {
        await formik.submitForm();
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) return;
        // ปฏิเสธต้องแนบเอกสารประกอบการปฏิเสธอย่างน้อย 1 รายการ
        if (formik.values.considerResult === DECISION_ID.REJECTED && rejectDocuments.length === 0) {
            swalWarning("แจ้งเตือน", "กรุณาแนบเอกสารประกอบการปฏิเสธ");
            return;
        }
        // อนุมัติ = จ่ายเงินจริง — ยอดโอนผู้รับผลประโยชน์ต้องเท่ายอดเงินรวมทั้งหมดของค่าใช้จ่าย (จ่ายต่ำกว่ายอดเคลมไม่ได้)
        if (formik.values.considerResult === DECISION_ID.APPROVED && !isPayoutComplete) {
            swalError(
                "ยอดโอนผู้รับผลประโยชน์ไม่ครบ",
                `จำนวนเงินโอนรวม ${formatAmount(totalPayoutAmount)} บาท ต้องเท่ากับยอดเงินรวมทั้งหมด ${formatAmount(
                    expenseTotalAmount
                )} บาท กรุณาแก้ไขข้อมูลผู้รับผลประโยชน์`
            );
            return;
        }
        await handleSubmitDecision();
    };
    // เพดานยอดโอนผู้รับผลประโยชน์ = ยอดเงินรวมทั้งหมดในรายละเอียดค่าใช้จ่าย (ปัดทศนิยม 2 ตำแหน่งก่อนเทียบ)
    const expenseTotalAmount = getExpenseTotalAmount(
        expenseItems,
        customerDetail?.productTypeId,
        detail?.coverageTypeId
    );
    const isPayoutComplete = Math.round(totalPayoutAmount * 100) === Math.round(expenseTotalAmount * 100);
    // รอข้อมูลของทุก section ที่ดึงจาก API ในแท็บนี้
    // ที่เพิ่งบันทึกใน dialog มาก่อน ไม่งั้นแสดงที่บันทึกไว้แล้วของเคส (beneficiaryTypeId = 3)
    const displayedTransferAccountChange = transferAccountChange ?? savedTransferAccountChange;
    const isTabLoading = detailLoading || expenseLoading || beneficiaryLoading;
    const claimNo = detail?.claimNo ?? "-";
    const customerName = customerDetail?.customerName ?? "-";

    return (
        <FormikProvider value={formik}>
            {/* overlay เดียวคลุมทุก section — spinner ติดกลางจอ (stickySpinner) เพราะแท็บยาวเกินจอ */}
            <LoadingOverlay isLoading={isTabLoading} message="กำลังโหลดข้อมูลเคลม..." stickySpinner>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <DeathDisabilityClaimInfoSection info={detail} />
                    </Grid>
                    <Grid item xs={12}>
                        <DeathDisabilityExpenseSection
                            items={expenseItems}
                            isLoading={expenseLoading}
                            productTypeId={customerDetail?.productTypeId}
                            coverageTypeId={detail?.coverageTypeId}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <DeathDisabilityBeneficiarySection
                            beneficiaries={beneficiaries}
                            isLoading={beneficiaryLoading}
                            totalAmount={totalPayoutAmount}
                            expenseTotalAmount={expenseTotalAmount}
                            claimNo={claimNo}
                            customerName={customerName}
                            productTypeId={customerDetail?.productTypeId}
                            aplicationCode={customerDetail?.policyCode}
                            onTransferAccountChanged={setTransferAccountChange}
                            hasTransferAccountChange={!!displayedTransferAccountChange}
                        />
                    </Grid>
                    {displayedTransferAccountChange && (
                        <Grid item xs={12}>
                            <TransferAccountChangeSection
                                change={displayedTransferAccountChange}
                                productTypeId={customerDetail?.productTypeId}
                                aplicationCode={customerDetail?.policyCode}
                                claimId={detail?.claimId}
                                caseId={detail?.caseId}
                                claimSourceId={detail?.claimSourceId}
                                claimNo={claimNo}
                                customerName={customerName}
                                amount={totalPayoutAmount}
                                onUnsavedChange={setTransferAccountChange}
                                onSavedChangeDocuments={(docs) =>
                                    setSavedTransferAccountDocuments((prev) => [...prev, ...docs])
                                }
                            />
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
                            onAttachedDocumentsChange={setScanDocuments}
                            filterCaseDocumentsByType
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
                            onConfirm={handleConfirm}
                            isSubmitting={isSubmitting}
                            onRejectDocumentsChange={setRejectDocuments}
                        />
                    </Grid>
                </Grid>
            </LoadingOverlay>
        </FormikProvider>
    );
};

export default DeathDisabilityClaimDetailsTab;

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useFormikContext } from "formik";
import { Dayjs } from "dayjs";
import { CaseDocumentV2Request } from "../../../../../../api/coreClaimApi.client";
import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import { useAppSelector } from "../../../../../../../redux";
import { claimPHSelector } from "../../../../../CreatedClaim/store/claimPHSlice";
import { claimConsiderSelector, ClaimConsiderValues } from "../../../../store/claimConsiderSlice";
import ClaimDocumentTable, { ClaimDocumentRow } from "./ClaimSummary/ClaimDocumentTable";
import ClaimInformationSection from "./ClaimSummary/ClaimInformationSection";
import FinancialSummarySection from "./ClaimSummary/FinancialSummarySection";
import StayDaysSection from "./ClaimSummary/StayDaysSection";

type ClaimSummaryProps = {
    attachedDocuments: CaseDocumentV2Request[];
    createdClaimDate: Dayjs | undefined;
    /**
     * แสดงเฉพาะส่วนหัว : รายละเอียดเคลม (read-only) + ตารางสแกนเอกสาร
     * ใช้ตอนหน้าพิจารณาเคลมโรงพยาบาลที่มี ClaimSummaryStep3 รับผิดชอบส่วนตัวเลข
     * (รายการค่ารักษา / ค่าชดเชย / สรุป / จำนวนวันนอน) อยู่แล้ว กัน render ซ้ำ
     */
    headerOnly?: boolean;
    isCombinedWithMedicalAll?: boolean;
    onCombinedWithMedicalAllChange?: (isCombined: boolean) => void;
};

const ClaimSummary = ({
    attachedDocuments,
    createdClaimDate,
    headerOnly = false,
    isCombinedWithMedicalAll = false,
    onCombinedWithMedicalAllChange,
}: ClaimSummaryProps) => {
    const { documentScanList, documentDetailById } = useAppSelector(claimPHSelector);
    const { calculateResult } = useAppSelector(claimConsiderSelector);
    const { values } = useFormikContext<ClaimConsiderValues>();

    const documentRows: ClaimDocumentRow[] = attachedDocuments
        .map((attached) => {
            const scanInfo = documentScanList.find((document) => document.documentId === attached.documentId);
            const detail = documentDetailById[attached.documentId ?? ""];

            if (!scanInfo) {
                return null;
            }

            return {
                documentId: scanInfo.documentId,
                documentCode: scanInfo.documentCode,
                documentSubTypeName: scanInfo.documentSubTypeName,
                fileCount: detail?.docDetail?.fileCount ?? 0,
            };
        })
        .filter((row): row is ClaimDocumentRow => row !== null);

    const showStayDays = !headerOnly && [2, 7].includes(values.medicalTypeId ?? 0);

    return (
        <CustomPaper>
            <HeadingWithColor icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />} text="สรุปรายการเคลม" color="blue" />
            <ClaimInformationSection values={values} createdClaimDate={createdClaimDate} />
            {showStayDays && (
                <StayDaysSection
                    medicalTypeName={values.medicalTypeName}
                    ipdDays={values.ipdDays ?? 0}
                    icuDays={values.icuDays ?? 0}
                    totalDays={values.totalDays ?? 0}
                />
            )}
            <ClaimDocumentTable rows={documentRows} />
            {!headerOnly && (
                <FinancialSummarySection
                    calculateResult={calculateResult}
                    isCombinedWithMedicalAll={isCombinedWithMedicalAll}
                    onCombinedWithMedicalAllChange={onCombinedWithMedicalAllChange ?? (() => undefined)}
                />
            )}
        </CustomPaper>
    );
};

export default ClaimSummary;

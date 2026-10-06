import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { FormikProps } from "formik";
import { useEffect } from "react";

import OcrReceiptSection from "../../../ConsiderDetails/TabDetails/SubDetailsTab/OcrReceiptSection";
import ExpenseRecords from "../../../ConsiderDetails/TabDetails/SubDetailsTab/ExpenseRecords";
import LoadingOverlay from "../../../../../_common/components/CustomComponent/LoadingOverlay";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../../../api/coreClaimApi";
import useClaimExpenseDetailHook from "../../../../hooks/ClaimConsiderDetail/ClaimExpenseDetailHook";

type TreatmentCostTableProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formik: FormikProps<any>;
    detailData: ReturnType<typeof useGetClaimDetailConsider>["data"];
    customerDetailData: ReturnType<typeof useGetCustomerDetailById>["data"];
    /** โหมดดูอย่างเดียว (DFUAT-066) : Step 2 แก้ไขไม่ได้ทั้ง OCR และตารางค่าใช้จ่าย */
    readOnly?: boolean;
    /** แจ้งสถานะโหลดของรายการค่าใช้จ่ายให้ผู้เรียก — ใช้ปิดปุ่มทำรายการท้ายหน้าระหว่างโหลด */
    onLoadingChange?: (isLoading: boolean) => void;
};

// รับ formik/detailData/customerDetailData เป็น props จาก HospitalClaimDetailsTab (useHospitalConsiderDetailHook)
// แทนการเรียก useConsiderDetailHook() ซ้ำ — hook นั้นมีไว้สำหรับ flow เคลมลูกค้า ไม่ใช่เคลมโรงพยาบาล
// การเรียกซ้ำเดิมทำให้ยิง query/formik ผิดชุดข้อมูลซ้อนกันโดยไม่จำเป็น
// useClaimExpenseDetailHook เรียกที่นี่จุดเดียวแล้วส่งผลลัพธ์ลง ExpenseRecords แทนให้ ExpenseRecords เรียกเอง
// (ดูเหตุผลใน ExpenseRecords.tsx / ExpenseDetails.tsx — ฝั่งเคลมลูกค้าต้องใช้ผลลัพธ์เดียวกันนี้ก่อนถึงจุดนั้น)
const TreatmentCostTable = ({
    formik,
    detailData,
    customerDetailData,
    readOnly = false,
    onLoadingChange,
}: TreatmentCostTableProps) => {
    const expenseDetail = useClaimExpenseDetailHook({ detailData, customerDetailData });
    // unmount (ออกจาก step นี้) = ไม่มีอะไรโหลดค้างแล้ว ต้องคืนค่า false ไม่งั้นปุ่มท้ายหน้าจะถูกปิดค้าง
    const { isExpenseLoading } = expenseDetail;
    useEffect(() => {
        onLoadingChange?.(isExpenseLoading);
        return () => onLoadingChange?.(false);
    }, [isExpenseLoading]);
    return (
        <>
            <CustomPaper>
                <HeadingWithColor
                    icon={<DocumentScannerIcon sx={{ fontSize: 27 }} />}
                    text="OCR ใบแจ้งค่ารักษา"
                    color="blue"
                />
                <OcrReceiptSection
                    formik={formik}
                    applicationCode={customerDetailData?.data?.policyCode}
                    readOnly={readOnly}
                />
            </CustomPaper>

            <CustomPaper>
                <HeadingWithColor text="รายการค่าใช้จ่าย" color="blue" icon={<NoteAddIcon sx={{ fontSize: 27 }} />} />
                {/* เคลมโรงพยาบาล : กรอบแจ้งเตือนยอดเงินเทียบยอดเงินตามใบเสร็จ ไม่เทียบเงินโอน */}
                <LoadingOverlay isLoading={expenseDetail.isExpenseLoading} message="กำลังโหลดรายการค่าใช้จ่าย...">
                    <ExpenseRecords expenseDetail={expenseDetail} reconciliationMode="receipt" readOnly={readOnly} />
                </LoadingOverlay>
            </CustomPaper>
        </>
    );
};

export default TreatmentCostTable;

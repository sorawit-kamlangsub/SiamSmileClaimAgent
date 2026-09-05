import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { FormikProps } from "formik";

import OcrReceiptSection from "../../../ConsiderDetails/TabDetails/SubDetailsTab/OcrReceiptSection";
import ExpenseRecords from "../../../ConsiderDetails/TabDetails/SubDetailsTab/ExpenseRecords";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../../../api/coreClaimApi";

type TreatmentCostTableProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formik: FormikProps<any>;
    detailData: ReturnType<typeof useGetClaimDetailConsider>["data"];
    customerDetailData: ReturnType<typeof useGetCustomerDetailById>["data"];
};

// รับ formik/detailData/customerDetailData เป็น props จาก HospitalClaimDetailsTab (useHospitalConsiderDetailHook)
// แทนการเรียก useConsiderDetailHook() ซ้ำ — hook นั้นมีไว้สำหรับ flow เคลมลูกค้า ไม่ใช่เคลมโรงพยาบาล
// การเรียกซ้ำเดิมทำให้ยิง query/formik ผิดชุดข้อมูลซ้อนกันโดยไม่จำเป็น
const TreatmentCostTable = ({ formik, detailData, customerDetailData }: TreatmentCostTableProps) => {
    return (
        <>
            <CustomPaper>
                <HeadingWithColor
                    icon={<DocumentScannerIcon sx={{ fontSize: 27 }} />}
                    text="OCR ใบแจ้งค่ารักษา"
                    color="blue"
                />
                <OcrReceiptSection formik={formik} applicationCode={customerDetailData?.data?.policyCode} />
            </CustomPaper>

            <CustomPaper>
                <HeadingWithColor text="รายการค่าใช้จ่าย" color="blue" icon={<NoteAddIcon sx={{ fontSize: 27 }} />} />
                <ExpenseRecords detailData={detailData} customerDetailData={customerDetailData} />
            </CustomPaper>
        </>
    );
};

export default TreatmentCostTable;

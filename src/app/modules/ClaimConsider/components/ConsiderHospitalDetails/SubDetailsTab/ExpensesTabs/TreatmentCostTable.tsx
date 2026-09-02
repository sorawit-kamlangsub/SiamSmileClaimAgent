import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

import NoteAddIcon from "@mui/icons-material/NoteAdd";
import useConsiderDetailHook from "../../../../hooks/ClaimConsiderDetail/ConsiderDetailHook";

import OcrReceiptSection from "../../../ConsiderDetails/TabDetails/SubDetailsTab/OcrReceiptSection";
import ExpenseRecords from "../../../ConsiderDetails/TabDetails/SubDetailsTab/ExpenseRecords";

const TreatmentCostTable = () => {
    const { formik, customerDetailData } = useConsiderDetailHook();

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
                <ExpenseRecords />
            </CustomPaper>
        </>
    );
};

export default TreatmentCostTable;

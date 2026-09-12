import { useMemo, useState } from "react";
import { FormikProps } from "formik";
import { useGetClaimContinue } from "../../../../api/coreClaimApi";
import { formatDateString } from "../../../../functionHelpers";
import { ContinuousClaimRow } from "../../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";
import { HospitalConsiderValues } from "./HospitalConsiderDetailHook";

/**
 * แถบ/Modal "เคลมต่อเนื่อง" ของหน้าพิจารณาเคลมโรงพยาบาล — แยกออกมาจาก useHospitalConsiderDetailHook
 * เพราะเป็นคนละความรับผิดชอบ (fetch ประวัติเคลมต่อเนื่องของ policy + เลือก/ล้างเคลมที่จะอ้างอิง)
 *
 * รับ formik ของ Step 1 มาแก้ field "isContinuousClaim"/"continuousClaim" โดยตรง
 */
const useHospitalContinuousClaimHook = (
    formik: FormikProps<HospitalConsiderValues>,
    policyCode: string | undefined
) => {
    const [continuousClaimOpen, setContinuousClaimOpen] = useState(false);

    /** รายการเคลมต่อเนื่อง (สำหรับ Modal เลือกเคลมเดิม + แถบสรุป) */
    const { data: claimContinueData, isLoading: continuousClaimRowsLoading } = useGetClaimContinue(
        policyCode ?? undefined
    );
    const continuousClaimRows: ContinuousClaimRow[] = useMemo(
        () =>
            (claimContinueData?.data ?? []).map((item) => ({
                claimNo: item.claimNo ?? "-",
                chiefComplaint: item.chiefComplaint ?? item.chiefComplaintCustom ?? "-",
                incidentDate: formatDateString(item.incidentDate?.toString() ?? "", "DD/MM/BBBB") ?? "-",
                totalClaimAmount: item.totalCaseAmount ?? 0,
                totalPaidAmount: item.totalPaidAmount ?? 0,
                admissionDate: formatDateString(item.admissionDate?.toString() ?? "", "DD/MM/BBBB") ?? "-",
                claimInfo: item.claimDetail ?? "-",
                diagnosis1: item.icD10Detail ?? "-",
                remainingLimit: item.remainAmount ?? 0,
                // BE ยังไม่ส่งเลขที่เคส/สถานะของเคลมเดิมมา
                previousCaseNo: "-",
                previousCaseStatus: "-",
            })),
        [claimContinueData]
    );

    /** เปิด/ปิด Modal เลือกเคลมต่อเนื่อง ตามการติ๊ก Checkbox */
    const handleToggleContinuousClaim = (checked: boolean) => {
        formik.setFieldValue("isContinuousClaim", checked);

        if (checked) {
            setContinuousClaimOpen(true);
            return;
        }

        formik.setFieldValue("continuousClaim", undefined);
    };

    const handleSelectContinuousClaim = (row: ContinuousClaimRow) => {
        formik.setFieldValue("continuousClaim", row);
        setContinuousClaimOpen(false);
    };

    const handleClearContinuousClaim = () => {
        formik.setFieldValue("continuousClaim", undefined);
        formik.setFieldValue("isContinuousClaim", false);
    };

    return {
        continuousClaimRows,
        continuousClaimRowsLoading,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
    };
};

export default useHospitalContinuousClaimHook;

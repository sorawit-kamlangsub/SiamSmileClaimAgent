import { useMemo, useRef, useState } from "react";
import { FormikProps } from "formik";
import dayjs, { Dayjs } from "dayjs";
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
                // ค่าดิบไว้ map ลง formik ตอนเลือกเคลมต่อเนื่อง (incidentDate/chiefComplaint ด้านบน format
                // ไว้แสดงผลในตารางแล้วเท่านั้น) — เหมือน ConsiderDetailHook ฝั่งเคลมลูกค้า
                incidentDateRaw: item.incidentDate ? dayjs(item.incidentDate) : undefined,
                chiefComplaintIdRaw: item.chiefComplaintId,
            })),
        [claimContinueData]
    );

    /**
     * ค่า incidentDate/chiefComplaintId ก่อนล็อคตามเคลมต่อเนื่อง — เก็บไว้ครั้งแรกที่เลือกเท่านั้น
     * (ไม่ทับซ้ำถ้าผู้ใช้เปลี่ยนเคลมต่อเนื่องที่เลือกอีกรอบ) เพื่อคืนค่าเดิมเมื่อเอาติ๊กออก
     */
    const preContinuousClaimValuesRef = useRef<{ incidentDate?: Dayjs; chiefComplaintId?: number } | null>(null);

    const restorePreContinuousClaimValues = () => {
        if (!preContinuousClaimValuesRef.current) return;
        formik.setFieldValue("incidentDate", preContinuousClaimValuesRef.current.incidentDate);
        formik.setFieldValue("chiefComplaintId", preContinuousClaimValuesRef.current.chiefComplaintId);
        preContinuousClaimValuesRef.current = null;
    };

    /** เปิด/ปิด Modal เลือกเคลมต่อเนื่อง ตามการติ๊ก Checkbox */
    const handleToggleContinuousClaim = (checked: boolean) => {
        formik.setFieldValue("isContinuousClaim", checked);

        if (checked) {
            setContinuousClaimOpen(true);
            return;
        }

        restorePreContinuousClaimValues();
        formik.setFieldValue("continuousClaim", undefined);
    };

    const handleSelectContinuousClaim = (row: ContinuousClaimRow) => {
        if (!preContinuousClaimValuesRef.current) {
            preContinuousClaimValuesRef.current = {
                incidentDate: formik.values.incidentDate,
                chiefComplaintId: formik.values.chiefComplaintId,
            };
        }
        formik.setFieldValue("continuousClaim", row);
        // เลือกเคลมต่อเนื่อง = เหตุเดียวกับเคลมเดิม ดึงวันที่เกิดเหตุ/อาการสำคัญของเคลมเดิมมาเติมให้เลย
        // (ล็อค 2 field นี้ไว้ไม่ให้แก้ — ดู RecordClaimData ที่ disabled ตาม values.continuousClaim)
        if (row.incidentDateRaw) formik.setFieldValue("incidentDate", row.incidentDateRaw);
        if (row.chiefComplaintIdRaw) formik.setFieldValue("chiefComplaintId", row.chiefComplaintIdRaw);
        setContinuousClaimOpen(false);
    };

    const handleClearContinuousClaim = () => {
        restorePreContinuousClaimValues();
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

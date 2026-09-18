import { useParams } from "react-router-dom";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../api/coreClaimApi";
import { safeAtob } from "../../../../functionHelpers";

/**
 * ข้อมูลหัวหน้าพิจารณาเคลม - Death & Disability: รายละเอียดเคลม + ข้อมูลผู้เอาประกัน
 * ยิงแค่ 2 query ที่ header ใช้ — ไม่ใช้ useConsiderDetailHook ของเคลมลูกค้าเพราะพ่วง formik + master อีกหลายตัว
 * (สถานพยาบาล/ICD10/อาการสำคัญ/IncidentType/สาเหตุ/เคลมต่อเนื่อง/แบบร่าง) ที่หน้านี้ไม่ได้ใช้
 */
const useDeathDisabilityDetailHook = () => {
    // route :id/:caseId — ทั้งคู่ encode ด้วย btoa จากหน้า monitor
    const { id, caseId: caseIdEncoded } = useParams();
    const claimId = safeAtob(id);
    const caseId = safeAtob(caseIdEncoded);

    const { data: detailData, isLoading: detailDataLoading } = useGetClaimDetailConsider(claimId ?? "", caseId ?? "");
    const { data: customerDetailData, isLoading: customerDetailLoading } = useGetCustomerDetailById(
        detailData?.data?.customerDetailId
    );

    return { detailData, detailDataLoading, customerDetailData, customerDetailLoading };
};

export default useDeathDisabilityDetailHook;

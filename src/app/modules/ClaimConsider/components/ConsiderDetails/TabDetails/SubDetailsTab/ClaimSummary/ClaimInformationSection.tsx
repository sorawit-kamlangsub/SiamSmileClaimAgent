import { Grid } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { CustomDisplayText } from "../../../../../../_common/components/CustomComponent/CustomDisplayText";
import { formatDateString } from "../../../../../../../functionHelpers";
import { ClaimConsiderValues } from "../../../../../store/claimConsiderSlice";
import { useGetAllHospital, useGetChiefComplaint, useGetICD10 } from "../../../../../../../api/coreClaimMastersApi";

type ClaimInformationSectionProps = {
    values: ClaimConsiderValues;
    createdClaimDate: Dayjs | undefined;
};

const formatDate = (date: Dayjs | undefined) => formatDateString(date?.toString(), "DD/MM/BBBB") ?? undefined;

const formatTime = (date: Dayjs | undefined) =>
    date && dayjs(date).isValid() ? dayjs(date).format("HH:mm") : undefined;

const ClaimInformationSection = ({ values, createdClaimDate }: ClaimInformationSectionProps) => {
    const [diagnosis1, diagnosis2, diagnosis3, diagnosis4, diagnosis5, diagnosis6] = values.diagnoses ?? [];

    // resolve ชื่อจาก id เอง แทนการอ่าน values.hospitalName/chiefComplaintId_selectedText/diagnoses[n].icd10Detail
    // ตรงๆ — ฟิลด์เหล่านั้นมีแค่ตอนผู้ใช้เพิ่งเลือกเองใน Step 1 เท่านั้น ตอน sync ค่าจาก server (เคสปกติของหน้านี้)
    // ConsiderDetailHook เติมมาแค่ id ไม่มีชื่อมาด้วย (DTO ก็ไม่มี field ชื่อให้) จึงว่างเสมอถ้าอ่านแบบเดิม
    // ใช้ query แบบดึงลิสต์เต็ม (ไม่ใช่ *Filter ที่ debounce/slice(0,10) สำหรับ autocomplete) — query key
    // ตรงกับที่ Step 1 เรียกอยู่แล้วผ่าน useGetHospitalDetailAllFilter/useGetICD10Filter จึง cache hit ไม่ยิงซ้ำ
    const { data: chiefComplaintData } = useGetChiefComplaint();
    const { data: hospitalData } = useGetAllHospital();
    const { data: icd10Data } = useGetICD10();

    const chiefComplaintName = chiefComplaintData?.data?.find(
        (item) => item.chiefComplaintId === values.chiefComplaintId
    )?.detail;
    const hospitalName = hospitalData?.data?.find((item) => item.organizeId === values.hospitalId)?.organizeName;
    const getIcd10Name = (diagnosis?: { icd10Id?: number }) =>
        diagnosis?.icd10Id !== undefined
            ? icd10Data?.data?.find((item) => item.icD10Id === diagnosis.icd10Id)?.icD10Detail ?? "-"
            : undefined;

    return (
        <Grid container spacing={2} p={2}>
            <CustomDisplayText label="เหตุของการเคลม" value={values.incidentTypeName} />
            <CustomDisplayText label="ประเภทความคุ้มครอง" value={values.coverageTypeName} />
            <CustomDisplayText label="ประเภทการรักษา" value={values.medicalTypeName} />
            <CustomDisplayText label="วันที่แจ้งเคลม" value={formatDate(createdClaimDate)} />
            <CustomDisplayText label="วันที่เกิดเหตุ" value={formatDate(values.incidentDate)} />
            <CustomDisplayText label="เวลาที่เกิดเหตุ" value={formatTime(values.incidentTime)} />
            <CustomDisplayText label="วันที่เข้า รพ." value={formatDate(values.admissionDate)} />
            <CustomDisplayText label="เวลาที่เข้า รพ." value={formatTime(values.admissionTime)} />
            <CustomDisplayText label="วันที่ออก รพ." value={formatDate(values.dischargeDate)} />
            <CustomDisplayText label="เวลาที่ออก รพ." value={formatTime(values.dischargeTime)} />
            <CustomDisplayText label="อาการสำคัญ" value={chiefComplaintName} xs={12} md={6} />
            <CustomDisplayText label="สถานพยาบาล" value={hospitalName} xs={12} md={12} />
            <CustomDisplayText label="คำวินิจฉัย 1" value={getIcd10Name(diagnosis1)} xs={12} md={12} />
            <CustomDisplayText label="คำวินิจฉัย 2" value={getIcd10Name(diagnosis2)} xs={12} md={12} />
            <CustomDisplayText label="คำวินิจฉัย 3" value={getIcd10Name(diagnosis3)} xs={12} md={12} />
            {/* ตำแหน่ง 4-6 มีเฉพาะฟอร์มเคลมโรงพยาบาล (diagnoses 6 ช่อง) — เคลมอื่น diagnoses มีแค่ 3 ช่อง จึง undefined */}
            {diagnosis4 !== undefined && (
                <CustomDisplayText label="คำวินิจฉัย 4" value={getIcd10Name(diagnosis4)} xs={12} md={12} />
            )}
            {diagnosis5 !== undefined && (
                <CustomDisplayText label="คำวินิจฉัย 5" value={getIcd10Name(diagnosis5)} xs={12} md={12} />
            )}
            {diagnosis6 !== undefined && (
                <CustomDisplayText label="คำวินิจฉัย 6" value={getIcd10Name(diagnosis6)} xs={12} md={12} />
            )}
            <CustomDisplayText label="หมายเหตุ" value={values.detail ?? "-"} xs={12} md={12} />
        </Grid>
    );
};

export default ClaimInformationSection;

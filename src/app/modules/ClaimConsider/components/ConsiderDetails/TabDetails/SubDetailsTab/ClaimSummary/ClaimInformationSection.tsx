import { Grid } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { CustomDisplayText } from "../../../../../../_common/components/CustomComponent/CustomDisplayText";
import { formatDateString } from "../../../../../../../functionHelpers";
import { ClaimConsiderValues } from "../../../../../store/claimConsiderSlice";

type ClaimInformationSectionProps = {
    values: ClaimConsiderValues;
    createdClaimDate: Dayjs | undefined;
};

const formatDate = (date: Dayjs | undefined) => formatDateString(date?.toString(), "DD/MM/BBBB") ?? undefined;

const formatTime = (date: Dayjs | undefined) =>
    date && dayjs(date).isValid() ? dayjs(date).format("HH:mm") : undefined;

const formatDiagnosis = (diagnosis?: { icd10Id?: number; icd10Detail?: string }) =>
    diagnosis?.icd10Id !== undefined ? diagnosis.icd10Detail ?? "-" : undefined;

const ClaimInformationSection = ({ values, createdClaimDate }: ClaimInformationSectionProps) => {
    const [diagnosis1, diagnosis2, diagnosis3] = values.diagnoses ?? [];

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
            <CustomDisplayText label="อาการสำคัญ" value={values.chiefComplaintId_selectedText} xs={12} md={6} />
            <CustomDisplayText label="สถานพยาบาล" value={values.hospitalName} xs={12} md={12} />
            <CustomDisplayText label="คำวินิจฉัย 1" value={formatDiagnosis(diagnosis1)} xs={12} md={12} />
            <CustomDisplayText label="คำวินิจฉัย 2" value={formatDiagnosis(diagnosis2)} xs={12} md={12} />
            <CustomDisplayText label="คำวินิจฉัย 3" value={formatDiagnosis(diagnosis3)} xs={12} md={12} />
            <CustomDisplayText label="หมายเหตุ" value={values.detail ?? "-"} xs={12} md={12} />
        </Grid>
    );
};

export default ClaimInformationSection;

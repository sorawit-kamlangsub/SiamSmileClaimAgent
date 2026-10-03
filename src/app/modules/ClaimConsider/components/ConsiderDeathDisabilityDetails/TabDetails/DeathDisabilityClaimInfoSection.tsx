import { Grid } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { GetDeathAndDisabilityClaimDetailConsiderDtoResponse } from "../../../../../api/coreClaimApi.client";
import { formatDateString } from "../../../../../functionHelpers";

type DeathDisabilityClaimInfoSectionProps = {
    info: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined;
};

/** API อาจส่ง null มา — CustomDisplayText แทน "-" ให้เฉพาะ undefined/สตริงว่าง ส่วน null จะแสดงช่องว่าง จึงแปลงเองที่นี่ */
const show = (value?: string | null) => (value && value.trim() !== "" ? value : "-");
const formatDate = (value?: { toString(): string } | null) =>
    show(value ? formatDateString(value.toString(), "DD/MM/BBBB") : undefined);

/**
 * Section "รายละเอียดเคลม" (read-only, แสดงอย่างเดียว ไม่มี form) — layout 3 คอลัมน์ตาม mockup
 * ข้อมูลจาก GetDeathAndDisabilityClaimDetailConsider
 */
const DeathDisabilityClaimInfoSection = ({ info }: DeathDisabilityClaimInfoSectionProps) => {
    // แสดงการวินิจฉัย 3 ช่องเสมอตาม mockup (ช่องที่ไม่มีค่า CustomDisplayText แสดง "-")
    const diagnoses = [info?.icD10_1, info?.icD10_2, info?.icD10_3];
    return (
        <CustomPaper>
            <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="รายละเอียดเคลม" color="blue" />
            <Grid container spacing={2} p={2}>
                <CustomDisplayText label="ประเภทการเคลม" value={show(info?.claimType)} md={4} />
                <CustomDisplayText label="เหตุของการเคลม" value={show(info?.incidentTypeNameTH)} md={4} />
                <CustomDisplayText label="ประเภทความคุ้มครอง" value={show(info?.coverageTypeNameTH)} md={4} />
                <CustomDisplayText label="สาเหตุการเสียชีวิต" value={show(info?.causeOfIncidentName)} md={4} />
                <CustomDisplayText label="วันที่เกิดเหตุ" value={formatDate(info?.incidentDate)} md={4} />
                <CustomDisplayText label="วันที่เสียชีวิต" value={formatDate(info?.deathDate)} md={4} />
                <CustomDisplayText label="วันที่รับเอกสาร" value={formatDate(info?.documentReceivedDate)} md={4} />
                <CustomDisplayText label="วันที่เอกสารครบ" value={formatDate(info?.documentCompleteDate)} md={4} />
                <CustomDisplayText label="สถานพยาบาล" value={show(info?.organizeName)} md={4} />
                <CustomDisplayText label="อาการสำคัญ" value={show(info?.chiefComplaint)} md={12} />
                {diagnoses.map((diagnosis, index) => (
                    <CustomDisplayText
                        // ช่องการวินิจฉัยคงที่ 3 ช่อง ลำดับไม่เปลี่ยน
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        label={`การวินิจฉัย ${index + 1}`}
                        value={show(diagnosis)}
                        md={12}
                    />
                ))}
                <CustomDisplayText label="หมายเหตุ" value={show(info?.remark)} md={12} />
            </Grid>
        </CustomPaper>
    );
};

export default DeathDisabilityClaimInfoSection;

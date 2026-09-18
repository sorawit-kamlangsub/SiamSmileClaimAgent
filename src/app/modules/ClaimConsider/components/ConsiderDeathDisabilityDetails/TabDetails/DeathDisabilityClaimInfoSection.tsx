import { Grid } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { DeathDisabilityClaimInfo } from "../mock/deathDisabilityConsiderMock";

/**
 * Section "รายละเอียดเคลม" (read-only, แสดงอย่างเดียว ไม่มี form) — layout 3 คอลัมน์ตาม mockup
 * TODO(death-disability-api): ยังใช้ mock — รอ API ใหม่ของเคลม Death & Disability แล้ว map ลง DeathDisabilityClaimInfo
 */
const DeathDisabilityClaimInfoSection = ({ info }: { info: DeathDisabilityClaimInfo }) => {
    // แสดงคำวินิจฉัย 3 ช่องเสมอตาม mockup (ช่องที่ไม่มีค่าแสดง "-")
    const diagnosisSlots = [1, 2, 3];
    return (
        <CustomPaper>
            <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="รายละเอียดเคลม" color="blue" />
            <Grid container spacing={2} p={2}>
                <CustomDisplayText label="ประเภทการเคลม" value={info.claimType} md={4} />
                <CustomDisplayText label="เหตุของการเคลม" value={info.incidentType} md={4} />
                <CustomDisplayText label="ประเภทความคุ้มครอง" value={info.coverageType} md={4} />
                <CustomDisplayText label="สาเหตุการเสียชีวิต" value={info.causeOfDeath} md={4} />
                <CustomDisplayText label="วันที่เกิดเหตุ" value={info.incidentDate} md={4} />
                <CustomDisplayText label="วันที่เสียชีวิต" value={info.deathDate} md={4} />
                <CustomDisplayText label="วันที่รับเอกสาร" value={info.documentReceivedDate} md={4} />
                <CustomDisplayText label="วันที่เอกสารครบ" value={info.documentCompleteDate} md={4} />
                <CustomDisplayText label="สถานพยาบาล" value={info.hospitalName} md={4} />
                <CustomDisplayText label="อาการสำคัญ" value={info.chiefComplaint} md={12} />
                {diagnosisSlots.map((slot) => (
                    <CustomDisplayText
                        key={slot}
                        label={`คำวินิจฉัย ${slot}`}
                        value={info.diagnoses[slot - 1]}
                        md={12}
                    />
                ))}
                <CustomDisplayText label="หมายเหตุ" value={info.remark} md={12} />
            </Grid>
        </CustomPaper>
    );
};

export default DeathDisabilityClaimInfoSection;

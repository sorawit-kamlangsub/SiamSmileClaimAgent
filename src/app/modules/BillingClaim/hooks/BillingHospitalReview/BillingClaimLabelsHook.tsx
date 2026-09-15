import {
    useGetChiefComplaint,
    useGetICD10,
    useGetIncidentType,
    useGetIncidentTypeMapping,
} from "../../../../api/coreClaimMastersApi";
import { BillingReviewFormValues } from "../../store/billingClaim.types";

/** claimSourceId ของเคลมที่เข้ามาทางระบบวางบิล (ใช้ยิง IncidentTypeMapping เหมือนฝั่งพิจารณาเคลม) */
const CLAIM_SOURCE_CONSIDER = 2;

type LabelInput = Pick<
    BillingReviewFormValues,
    "incidentTypeId" | "coverageTypeId" | "medicalTypeId" | "diagnosis1Id" | "diagnosis2Id" | "diagnosis3Id"
>;

/**
 * Step 1/3 เป็น Read-only ล้วน — DTO ส่งมาแต่ ID (`incidentTypeId`/`coverageTypeId`/`medicalTypeId`/
 * `diagnosis1..3Id`) ไม่มีชื่อ ต้อง resolve ชื่อจาก Master เอง (เหมือนที่ ClaimTypeSelector/CD10Autocomplete
 * เดิมทำตอนเป็นฟอร์มแก้ไขได้) เรียก master แต่ละตัวครั้งเดียว (ไม่ใส่ id) แล้ว find เอง แทนที่จะยิงซ้ำ 3 ครั้ง
 */
const useBillingClaimLabels = (values: LabelInput) => {
    const { data: incidentTypeData, isLoading: incidentTypeLoading } = useGetIncidentType();
    const { data: mappingData, isLoading: mappingLoading } = useGetIncidentTypeMapping(
        values.incidentTypeId,
        CLAIM_SOURCE_CONSIDER,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
    );
    const { data: icd10Data, isLoading: icd10Loading } = useGetICD10();
    const { data: chiefComplaintData, isLoading: chiefComplaintLoading } = useGetChiefComplaint();

    const findIcd10Name = (id: number | undefined) =>
        id ? icd10Data?.data?.find((item) => item.icD10Id === id)?.icD10Detail : undefined;

    return {
        isLoading: incidentTypeLoading || mappingLoading || icd10Loading || chiefComplaintLoading,
        incidentTypeName: incidentTypeData?.data?.find((item) => item.incidentTypeId === values.incidentTypeId)
            ?.incidentTypeNameTH,
        coverageTypeName: mappingData?.data?.find((item) => item.coverageTypeId === values.coverageTypeId)
            ?.coverageTypeNameTH,
        medicalTypeName: mappingData?.data?.find((item) => item.medicalTypeId === values.medicalTypeId)
            ?.medicalTypeCode,
        diagnosis1Name: findIcd10Name(values.diagnosis1Id),
        diagnosis2Name: findIcd10Name(values.diagnosis2Id),
        diagnosis3Name: findIcd10Name(values.diagnosis3Id),
        /** สำรอง : ถ้า `chiefComplaintId_selectedText` (จาก `claim.chiefComplaint`) ว่าง ให้ลองหาใน Master */
        chiefComplaintOptions: chiefComplaintData?.data ?? [],
    };
};

export default useBillingClaimLabels;

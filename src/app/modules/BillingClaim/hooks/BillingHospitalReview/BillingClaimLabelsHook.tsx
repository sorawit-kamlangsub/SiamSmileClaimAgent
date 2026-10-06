import {
    useGetChiefComplaint,
    useGetICD10,
    useGetIncidentType,
    useGetIncidentTypeMapping,
} from "../../../../api/coreClaimMastersApi";
import { BillingDetailDto } from "../../../../api/coreClaimApi.client";
import { BillingReviewFormValues } from "../../store/billingClaim.types";

/** claimSourceId ของเคลมที่เข้ามาทางระบบวางบิล (ใช้ยิง IncidentTypeMapping เหมือนฝั่งพิจารณาเคลม) */
const CLAIM_SOURCE_CONSIDER = 2;

type LabelInput = Pick<
    BillingReviewFormValues,
    | "incidentTypeId"
    | "coverageTypeId"
    | "medicalTypeId"
    | "diagnosis1Id"
    | "diagnosis2Id"
    | "diagnosis3Id"
    | "chiefComplaintId"
>;

/** ชื่อพร้อมใช้ที่ BE ส่งมาที่ root ของ `BillingDetailDto` — มีค่าเมื่อไหร่ใช้ก่อนชื่อที่ resolve จาก Master */
export type BillingClaimBeLabels = Pick<
    BillingDetailDto,
    | "coverageTypeNameTH"
    | "medicalTypeCode"
    | "diagnosis1Name"
    | "diagnosis2Name"
    | "diagnosis3Name"
    | "diagnosis4Name"
    | "diagnosis5Name"
    | "diagnosis6Name"
>;

/**
 * Step 1/3 เป็น Read-only ล้วน — `data.claim` ส่งมาแต่ ID (`incidentTypeId`/`coverageTypeId`/`medicalTypeId`/
 * `diagnosis1..3Id`) ส่วนชื่อ BE ส่งมาที่ root ของ `BillingDetailDto` (`beLabels`) บางตัว — ใช้ชื่อจาก BE ก่อน
 * ถ้าไม่มีค่อย resolve จาก Master เอง (เหมือนที่ ClaimTypeSelector/CD10Autocomplete เดิมทำตอนเป็นฟอร์มแก้ไขได้)
 * เรียก master แต่ละตัวครั้งเดียว (ไม่ใส่ id) แล้ว find เอง แทนที่จะยิงซ้ำ 3 ครั้ง
 * การวินิจฉัย 4-6 มีเฉพาะจาก BE (`data.claim` ไม่มี diagnosis4..6Id ให้ resolve)
 */
const useBillingClaimLabels = (values: LabelInput, beLabels?: BillingClaimBeLabels) => {
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
        coverageTypeName:
            beLabels?.coverageTypeNameTH ||
            mappingData?.data?.find((item) => item.coverageTypeId === values.coverageTypeId)?.coverageTypeNameTH,
        medicalTypeName:
            beLabels?.medicalTypeCode ||
            mappingData?.data?.find((item) => item.medicalTypeId === values.medicalTypeId)?.medicalTypeCode,
        diagnosis1Name: beLabels?.diagnosis1Name || findIcd10Name(values.diagnosis1Id),
        diagnosis2Name: beLabels?.diagnosis2Name || findIcd10Name(values.diagnosis2Id),
        diagnosis3Name: beLabels?.diagnosis3Name || findIcd10Name(values.diagnosis3Id),
        diagnosis4Name: beLabels?.diagnosis4Name,
        diagnosis5Name: beLabels?.diagnosis5Name,
        diagnosis6Name: beLabels?.diagnosis6Name,
        /** สำรอง : ถ้า `chiefComplaintId_selectedText` (จาก `claim.chiefComplaint`) ว่าง ให้หาใน Master จาก `chiefComplaintId` แทน */
        chiefComplaintName: chiefComplaintData?.data?.find((item) => item.chiefComplaintId === values.chiefComplaintId)
            ?.detail,
    };
};

export default useBillingClaimLabels;

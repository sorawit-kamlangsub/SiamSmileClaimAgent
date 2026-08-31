import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import dayjs from "dayjs";
import { CoverageType } from "../../../../functionHelpers";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../api/coreClaimApi";
import { useGetDecisionReason, useGetIncidentType, useGetIncidentTypeMapping } from "../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { ChipOption } from "../../../CreatedClaim/components/CreateClaim/ChipSelector";
import { ClaimConsiderValues } from "../../store/claimConsiderSlice";
import {
    CLAIM_LIST_TYPE_CONFIG,
    ContinuousClaimRow,
    DocumentCheckRow,
    MOCK_CONTINUOUS_CLAIMS,
    MOCK_DOCUMENT_CHECK_ROWS,
    MOCK_HOSPITAL_CLAIM,
    parseClaimListType,
} from "../../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";

/**
 * ค่าของฟอร์ม "บันทึกข้อมูลเคลม" ของเคลมโรงพยาบาล
 *
 * ใช้ ClaimConsiderValues เป็นฐาน เพื่อให้ใช้ Component ร่วมกับหน้าเคลมลูกค้าได้
 * (RecordClaimData, ConsiderSection) แล้วเพิ่ม Field เฉพาะของเคลมโรงพยาบาล
 */
export interface HospitalConsiderValues extends ClaimConsiderValues {
    /** เคลมต่อเนื่อง */
    isContinuousClaim: boolean;
    continuousClaim: ContinuousClaimRow | undefined;

    /** ข้อมูลการเข้ารับการรักษา */
    hn: string;
    vn: string;
    underlyingDisease: string;
    treatmentMethod: string;
    labResult: string;
    additionalDetail: string;
    hasProcedure: string;

    /** แพทย์เจ้าของไข้ */
    doctorLicenseNo: string;
    doctorName: string;

    /** ตรวจสอบเอกสาร */
    documentChecks: DocumentCheckRow[];
}

/**
 * ค่าเริ่มต้นของฟอร์ม
 *
 * ฟิลด์ของ Step 1 (เหตุการณ์ / ความคุ้มครอง / วันเวลา / วินิจฉัย / หมายเหตุ) จะถูก
 * Sync ทับจาก GetClaimDetailConsider ส่วนฟิลด์เฉพาะเคลมโรงพยาบาล (HN/VN/แพทย์/
 * ข้อมูลการรักษา) ฝั่ง BE ยังไม่ส่งมา จึงยังไม่มีค่าเริ่มต้น
 */
const buildInitialValues = (): HospitalConsiderValues => ({
    incidentTypeId: undefined,
    incidentTypeName: undefined,
    coverageTypeId: undefined,
    coverageTypeName: undefined,
    medicalTypeId: undefined,
    medicalTypeName: undefined,
    causeOfIncidentId: undefined,
    causeOfIncidentName: undefined,
    incidentDate: undefined,
    incidentTime: undefined,
    admissionDate: undefined,
    admissionTime: undefined,
    dischargeDate: undefined,
    dischargeTime: undefined,
    documentCompleteDate: undefined,
    notificationDate: undefined,
    deathDate: undefined,
    deathTime: undefined,
    ipdDays: 0,
    icuDays: 0,
    totalDays: 0,
    hospitalId: undefined,
    hospitalName: undefined,
    diagnoses: [{}, {}, {}],
    accidentPlace: undefined,
    chiefComplaintId: undefined,
    chiefComplaintId_selectedText: undefined,
    detail: undefined,
    considerResult: undefined,
    decisionReasonId: undefined,
    decisionReasonDetail: undefined,
    considerDocument: undefined,

    isContinuousClaim: false,
    continuousClaim: undefined,

    hn: "",
    vn: "",
    underlyingDisease: "",
    treatmentMethod: "",
    labResult: "",
    additionalDetail: "",
    hasProcedure: "",

    doctorLicenseNo: "",
    doctorName: "",

    documentChecks: MOCK_DOCUMENT_CHECK_ROWS,
});

/** claimSourceId ของเคลมที่เข้ามาทางระบบพิจารณา (ใช้ยิง IncidentTypeMapping) */
const CLAIM_SOURCE_CONSIDER = 2;

const useHospitalConsiderDetailHook = () => {
    const { id } = useParams();
    const claimId = id ? atob(id) : undefined;
    const [searchParams] = useSearchParams();
    const [continuousClaimOpen, setContinuousClaimOpen] = useState(false);

    /**
     * ประเภทรายการเคลมของเคสนี้ (ตอนนี้อ่านจาก Query String เพราะ BE ยังไม่ส่งมา)
     * ตัวอย่าง : ?type=opd-full
     */
    const claimListType = parseClaimListType(searchParams.get("type"));
    const claimListTypeConfig = CLAIM_LIST_TYPE_CONFIG[claimListType];

    const { data: detailData, isLoading: detailDataLoading } = useGetClaimDetailConsider(claimId ?? "");
    const detail = detailData?.data;

    const { data: customerDetailData, isLoading: customerDetailLoading } = useGetCustomerDetailById(
        detail?.customerId ?? undefined
    );
    const customerDetail = customerDetailData?.data;

    const { data: incidentTypeRaw, isLoading: incidentTypeLoading } = useGetIncidentType();
    const incidentType: ClaimTypeOption[] =
        incidentTypeRaw?.data?.map((item) => ({
            id: item.incidentTypeId ?? 0,
            name: item.incidentTypeNameTH ?? "",
            icon: INCIDENT_ICON_MAP[item.incidentTypeId ?? 0],
        })) ?? [];

    const formik = useFormik<HospitalConsiderValues>({
        initialValues: buildInitialValues(),
        enableReinitialize: false,
        onSubmit: () => undefined,
    });

    const activeIncidentTypeId = formik.values.incidentTypeId || detail?.incidentTypeId || undefined;

    const { data: incidentTypeMapping, isLoading: incidentTypeMappingLoading } = useGetIncidentTypeMapping(
        activeIncidentTypeId,
        CLAIM_SOURCE_CONSIDER,
        customerDetail?.productTypeId,
        undefined,
        undefined,
        undefined,
        undefined
    );

    const DEATH_DISABILITY = [CoverageType.Death, CoverageType.Disability];

    const coverageType: ClaimTypeOption[] = useMemo(
        () => [
            ...new Map(
                (incidentTypeMapping?.data ?? [])
                    .filter((item) => !DEATH_DISABILITY.includes(item.coverageTypeId ?? 0))
                    .map((item) => [
                        item.coverageTypeId,
                        {
                            id: item.coverageTypeId ?? 0,
                            name: item.coverageTypeNameTH ?? "",
                            icon: COVERAGE_ICON_MAP[item.coverageTypeId ?? 0],
                        },
                    ])
            ).values(),
        ],
        [incidentTypeMapping]
    );

    const medicalType: ChipOption[] = useMemo(
        () => [
            ...new Map(
                (incidentTypeMapping?.data ?? [])
                    .filter((item) => item.coverageTypeId === formik.values.coverageTypeId)
                    .map((item) => [item.medicalTypeId, { id: item.medicalTypeId ?? 0, name: item.medicalTypeCode ?? "" }])
            ).values(),
        ],
        [incidentTypeMapping, formik.values.coverageTypeId]
    );

    const causeOfIncident: ChipOption[] = useMemo(
        () => [
            ...new Map(
                (incidentTypeMapping?.data ?? [])
                    .filter((item) => item.coverageTypeId === formik.values.coverageTypeId)
                    .map((item) => [
                        item.causeOfIncidentId,
                        { id: item.causeOfIncidentId ?? 0, name: item.causeOfIncidentName ?? "" },
                    ])
            ).values(),
        ],
        [incidentTypeMapping, formik.values.coverageTypeId]
    );

    const hasSyncedMainRef = useRef(false); // incidentType, coverageType, date/time, diagnoses, remark
    const hasSyncedMedicalRef = useRef(false); // medicalType, causeOfIncident (รอ coverageTypeId sync ก่อน)
    const prevIncidentTypeIdRef = useRef(formik.values.incidentTypeId);
    const prevCoverageTypeIdRef = useRef(formik.values.coverageTypeId);

    // ---- phase 1: sync incidentType, coverageType, date/time, diagnoses, remark ----
    useEffect(() => {
        if (!detail || hasSyncedMainRef.current) return;
        if (incidentType.length === 0 || coverageType.length === 0) return;

        const matchedIncident = incidentType.find((item) => item.id === detail.incidentTypeId);
        if (matchedIncident) {
            formik.setFieldValue("incidentTypeId", matchedIncident.id, false);
            formik.setFieldValue("incidentTypeName", matchedIncident.name, false);
            prevIncidentTypeIdRef.current = matchedIncident.id;
        }

        const matchedCoverage = coverageType.find((item) => item.id === detail.coverageTypeId);
        if (matchedCoverage) {
            formik.setFieldValue("coverageTypeId", matchedCoverage.id, false);
            formik.setFieldValue("coverageTypeName", matchedCoverage.name, false);
            prevCoverageTypeIdRef.current = matchedCoverage.id;
        }

        if (detail.admissionDate) {
            formik.setFieldValue("admissionDate", dayjs(detail.admissionDate), false);
            formik.setFieldValue("admissionTime", dayjs(detail.admissionDate), false);
        }
        if (detail.incidentDate) {
            formik.setFieldValue("incidentDate", dayjs(detail.incidentDate), false);
            formik.setFieldValue("incidentTime", dayjs(detail.incidentDate), false);
        }
        if (detail.dischargeDate) {
            formik.setFieldValue("dischargeDate", dayjs(detail.dischargeDate), false);
            formik.setFieldValue("dischargeTime", dayjs(detail.dischargeDate), false);
        }

        formik.setFieldValue("hospitalId", detail.hospitalId ?? undefined, false);
        formik.setFieldValue("chiefComplaintId", detail.chiefComplaintId ?? undefined, false);

        formik.setFieldValue(
            "diagnoses",
            [
                { icd10Id: detail.icD10_1stId ?? undefined, icd10Detail: undefined },
                { icd10Id: detail.icD10_2ndId ?? undefined, icd10Detail: undefined },
                { icd10Id: detail.icD10_3rdId ?? undefined, icd10Detail: undefined },
            ],
            false
        );

        formik.setFieldValue("detail", detail.remark, false);

        hasSyncedMainRef.current = true;
    }, [detail, incidentType, coverageType]);

    // ---- phase 2: sync medicalType/causeOfIncident (รอ coverageTypeId ถูก set จาก phase 1 ก่อน) ----
    useEffect(() => {
        if (!detail || !hasSyncedMainRef.current || hasSyncedMedicalRef.current) return;
        if (medicalType.length === 0 && causeOfIncident.length === 0) return;

        const matchedMedical = medicalType.find((item) => item.id === detail.medicalTypeId);
        if (matchedMedical) {
            formik.setFieldValue("medicalTypeId", matchedMedical.id, false);
            formik.setFieldValue("medicalTypeName", matchedMedical.name, false);
        }

        const matchedCause = causeOfIncident.find((item) => item.id === detail.causeOfIncidentId);
        if (matchedCause) {
            formik.setFieldValue("causeOfIncidentId", matchedCause.id, false);
            formik.setFieldValue("causeOfIncidentName", matchedCause.name, false);
        }

        hasSyncedMedicalRef.current = true;
    }, [detail, medicalType, causeOfIncident]);

    // ---- reset cascade: user เปลี่ยน incidentTypeId เอง ----
    useEffect(() => {
        if (!hasSyncedMainRef.current) return;
        if (prevIncidentTypeIdRef.current === formik.values.incidentTypeId) return;

        formik.setFieldValue("coverageTypeId", undefined, false);
        formik.setFieldValue("coverageTypeName", undefined, false);
        formik.setFieldValue("medicalTypeId", undefined, false);
        formik.setFieldValue("causeOfIncidentId", undefined, false);
        prevIncidentTypeIdRef.current = formik.values.incidentTypeId;
        prevCoverageTypeIdRef.current = undefined;
    }, [formik.values.incidentTypeId]);

    // ---- reset cascade: user เปลี่ยน coverageTypeId เอง ----
    useEffect(() => {
        if (!hasSyncedMainRef.current) return;
        if (prevCoverageTypeIdRef.current === formik.values.coverageTypeId) return;

        formik.setFieldValue("medicalTypeId", undefined, false);
        formik.setFieldValue("causeOfIncidentId", undefined, false);
        prevCoverageTypeIdRef.current = formik.values.coverageTypeId;
    }, [formik.values.coverageTypeId]);

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

    /** อัปเดตผลการตรวจ / หมายเหตุ ของเอกสารแต่ละรายการ */
    const handleDocumentCheckChange = <TField extends keyof DocumentCheckRow>(
        rowIndex: number,
        field: TField,
        value: DocumentCheckRow[TField]
    ) => {
        const nextRows = formik.values.documentChecks.map((row, index) =>
            index === rowIndex ? { ...row, [field]: value } : row
        );

        formik.setFieldValue("documentChecks", nextRows);
    };

    const { data: decisionReason, isLoading: decisionReasonLoading } = useGetDecisionReason(
        undefined,
        formik.values.considerResult
    );

    return {
        formik,
        claimListType,
        claimListTypeConfig,
        detailData,
        customerDetailData,
        detailDataLoading,
        customerDetailLoading,
        incidentType,
        incidentTypeLoading,
        coverageType,
        medicalType,
        causeOfIncident,
        incidentTypeMapping,
        incidentTypeMappingLoading,
        decisionReason,
        decisionReasonLoading,
        continuousClaimRows: MOCK_CONTINUOUS_CLAIMS,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
        handleDocumentCheckChange,
        // ยังไม่มี API : header ใช้ประกอบตอนข้อมูลจริงยังไม่ครบ
        mockHeader: MOCK_HOSPITAL_CLAIM,
    };
};

export default useHospitalConsiderDetailHook;

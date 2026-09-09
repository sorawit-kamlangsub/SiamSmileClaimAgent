import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useFormik, FormikErrors, FormikTouched } from "formik";
import dayjs from "dayjs";
import { CoverageType, MedicalType, formatDateString } from "../../../../functionHelpers";
import {
    useGetCaseReviewOverview,
    useGetClaimContinue,
    useGetClaimDetailConsider,
    useGetCustomerDetailById,
    useGetDocumentByCaseId,
} from "../../../../api/coreClaimApi";
import { GetDocumentByCaseIdDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetDocumentListByIds } from "../../../../api/docstorageApi";
import {
    useGetAllHospital,
    useGetChiefComplaint,
    useGetDecisionReason,
    useGetDocumentReviewStatus,
    useGetICD10,
    useGetIncidentType,
    useGetIncidentTypeMapping,
} from "../../../../api/coreClaimMastersApi";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeOptions";
import { ClaimTypeOption } from "../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { ChipOption } from "../../../CreatedClaim/components/CreateClaim/ChipSelector";
import { ClaimConsiderValues } from "../../store/claimConsiderSlice";
import { parseTimeSpan } from "../../store/draftRevisionMappers";
import {
    CLAIM_LIST_TYPE_CONFIG,
    ContinuousClaimRow,
    DOCUMENT_CHECK_RESULTS,
    DOCUMENT_CHECK_RESULT_COLORS,
    DOCUMENT_CHECK_RESULT_FALLBACK_COLOR,
    DocumentCheckResultOption,
    DocumentCheckRow,
    parseClaimListType,
} from "../../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";

/**
 * ค่าของฟอร์ม "บันทึกข้อมูลเคลม" ของเคลมโรงพยาบาล
 *
 * ใช้ ClaimConsiderValues เป็นฐาน เพื่อให้ใช้ Component ร่วมกับหน้าเคลมลูกค้าได้
 * (RecordClaimData, ConsiderSection) แล้วเพิ่ม Field เฉพาะของเคลมโรงพยาบาล
 */
export interface HospitalConsiderValues extends ClaimConsiderValues {
    /**
     * สาเหตุของการเกิดเหตุ
     * หน้าเคลมลูกค้าตัดฟิลด์นี้ออกจาก ClaimConsiderValues แล้ว แต่เคลมโรงพยาบาลยังใช้
     * (ความคุ้มครองกลุ่มเสียชีวิต/ทุพพลภาพ) จึงประกาศเองที่นี่
     */
    causeOfIncidentId: number | undefined;
    causeOfIncidentName: string | undefined;

    /** เคลมต่อเนื่อง */
    isContinuousClaim: boolean;
    continuousClaim: ContinuousClaimRow | undefined;

    /** ข้อมูลการเข้ารับการรักษา */
    hn: string;
    vn: string;
    /** AN + ข้อบ่งชี้การ Admit : เฉพาะประเภทการรักษา IPD */
    an: string;
    admitIndication: string;
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

/** ข้อมูลเอกสารจาก DocStorage (GET /document/documentid/list) ที่ตาราง "ตรวจสอบเอกสาร" ใช้แสดง */
export type DocStorageDocInfo = {
    /** ชื่อเอกสาร = documentTypeName */
    documentName: string;
    /** จำนวนไฟล์ที่แนบจริงใน DocStorage */
    fileCount: number;
    /** ข้อมูลสำหรับประกอบลิงก์ไปแนบเอกสารที่หน้า DocStorage (ปุ่ม "สแกนเอกสาร") */
    documentCode: string;
    mainIndex: string;
    searchIndex: string;
};

/** ผลการตรวจ/หมายเหตุที่เคยบันทึกไว้ (จาก overview) ต่อ documentId */
type DocumentReviewInfo = { checkResult: DocumentCheckRow["checkResult"]; remark: string };

/**
 * map รายการเอกสารของเคส (GET /document/case/filter — useGetDocumentByCaseId, claimSourceId 3)
 * -> แถวตาราง "ตรวจสอบเอกสาร"
 *
 * - documentId / documentSubTypeId / ชื่อเอกสาร (claimDocumentTypeName) มาจาก endpoint นี้
 * - ผลการตรวจ + หมายเหตุที่เคยบันทึก merge จาก overview ด้วย documentId
 * - `files` ปล่อยว่างไว้เสมอ — จำนวนไฟล์มาจาก GET /document/documentid/list, รายการไฟล์มาจาก
 *   GET /document/{documentId}/documentFile (ตอนเปิด modal)
 */
const mapDocumentChecks = (
    documents: GetDocumentByCaseIdDtoResponse[],
    reviewByDocId: Record<string, DocumentReviewInfo>
): DocumentCheckRow[] =>
    documents.map((doc) => {
        const documentId = doc.documentId ?? doc.caseDocumentId ?? "";
        const review = reviewByDocId[documentId];
        return {
            documentId,
            documentSubTypeId: doc.documentSubTypeId,
            documentName: doc.claimDocumentTypeName || "-",
            files: [],
            checkResult: review?.checkResult ?? "",
            remark: review?.remark ?? "",
        };
    });

/**
 * ค่าเริ่มต้นของฟอร์ม
 *
 * ฟิลด์ของ Step 1 (เหตุการณ์ / ความคุ้มครอง / วันเวลา / วินิจฉัย / หมายเหตุ) จะถูก
 * Sync ทับจาก GetClaimDetailConsider ส่วนฟิลด์เฉพาะเคลมโรงพยาบาล (HN/VN/แพทย์/
 * ข้อมูลการรักษา) ฝั่ง BE ยังไม่ส่งมา จึงยังไม่มีค่าเริ่มต้น
 * documentChecks ว่างไว้ก่อน แล้ว sync จาก GET /document/case/{caseId}/overview
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
    // ชีทระบุ Default = วันที่ปัจจุบัน
    documentCompleteDate: dayjs(),
    createdDate: undefined,
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
    an: "",
    admitIndication: "",
    underlyingDisease: "",
    treatmentMethod: "",
    labResult: "",
    additionalDetail: "",
    hasProcedure: "",

    doctorLicenseNo: "",
    doctorName: "",

    documentChecks: [],
});

/** claimSourceId ของเคลมที่เข้ามาทางระบบพิจารณา (ใช้ยิง IncidentTypeMapping) */
const CLAIM_SOURCE_CONSIDER = 2;

/** claimSourceId ของเคลมโรงพยาบาล (ใช้ดึงรายการเอกสารของเคส — GET /document/case/filter) */
const CLAIM_SOURCE_HOSPITAL = 3;

/** decisionId ของผลการพิจารณา "รอแก้ไข" (ต้องกรอกรายละเอียดการรอแก้ไข) */
const DECISION_REVISION = 4;

/** ลำดับช่องที่ใช้เลื่อนหน้าจอไปยัง error แรกเมื่อกด "ถัดไป" / "ยืนยันบันทึกผลพิจารณา" */
const FIELD_ERROR_ORDER = [
    "incidentTypeId",
    "coverageTypeId",
    "medicalTypeId",
    "causeOfIncidentId",
    "createdDate",
    "documentCompleteDate",
    "incidentDate",
    "admissionDate",
    "dischargeDate",
    "hospitalId",
    "chiefComplaintId",
    "diagnoses",
    "ipdDays",
    "hn",
    "vn",
    "an",
    "admitIndication",
    "underlyingDisease",
    "treatmentMethod",
    "hasProcedure",
    "doctorLicenseNo",
    "doctorName",
    "documentChecks",
    "decisionReasonId",
    "decisionReasonDetail",
];

/**
 * Validate ฟอร์ม Step 1 : บันทึกข้อมูลเคลม (เคลมโรงพยาบาล OPD Half / OPD Full)
 * อ้างอิงชีท "พิจารณาเคลม รพ. OPD Half"
 */
const validateHospitalConsider = (values: HospitalConsiderValues): FormikErrors<HospitalConsiderValues> => {
    const errors: FormikErrors<HospitalConsiderValues> = {};
    const req = "กรุณากรอกข้อมูล";
    const sel = "กรุณาเลือกข้อมูล";

    const isMedical =
        values.coverageTypeId === CoverageType.Medical || values.coverageTypeId === CoverageType.Compensate;
    const isCause = values.coverageTypeId === CoverageType.Death || values.coverageTypeId === CoverageType.Disability;

    // ── ข้อมูลเคลม ──
    if (!values.incidentTypeId) errors.incidentTypeId = sel;
    if (!values.coverageTypeId) errors.coverageTypeId = sel;
    if (isMedical && !values.medicalTypeId) errors.medicalTypeId = sel;
    if (isCause && !values.causeOfIncidentId) errors.causeOfIncidentId = sel;

    if (!values.createdDate) errors.createdDate = req;
    if (!values.documentCompleteDate) errors.documentCompleteDate = req;
    if (!values.incidentDate) errors.incidentDate = req;
    if (!values.admissionDate) errors.admissionDate = req;
    if (!values.dischargeDate) errors.dischargeDate = req;
    if (!values.hospitalId) errors.hospitalId = sel;
    if (!values.chiefComplaintId) errors.chiefComplaintId = sel;

    if (!values.diagnoses?.[0]?.icd10Id) {
        errors.diagnoses = [{ icd10Id: sel }];
    }

    // ── ข้อมูลการเข้ารับการรักษา ──
    if (!values.hn.trim()) errors.hn = req;
    if (!values.vn.trim()) errors.vn = req;
    // AN + ข้อบ่งชี้การ Admit + จำนวนวันนอน : บังคับเฉพาะประเภทการรักษา IPD (ชีท IPD row 161-162, 227, 229)
    if (values.medicalTypeId === MedicalType.IPD) {
        if (!values.an.trim()) errors.an = req;
        if (!values.admitIndication.trim()) errors.admitIndication = req;
        if (!values.ipdDays || values.ipdDays < 1) errors.ipdDays = req;
    }
    if (!values.underlyingDisease.trim()) errors.underlyingDisease = req;
    if (!values.treatmentMethod.trim()) errors.treatmentMethod = req;
    if (!values.hasProcedure) errors.hasProcedure = sel;

    // ── แพทย์เจ้าของไข้ ──
    if (!values.doctorLicenseNo.trim()) errors.doctorLicenseNo = req;
    if (!values.doctorName.trim()) errors.doctorName = req;

    // ── ตรวจสอบเอกสาร : หมายเหตุบังคับกรอกเมื่อผลการตรวจเป็น ไม่ผ่าน หรือ รอเอกสารเพิ่มเติม ──
    const hasMissingDocumentRemark = values.documentChecks.some(
        (row) =>
            (row.checkResult === DOCUMENT_CHECK_RESULTS.failed || row.checkResult === DOCUMENT_CHECK_RESULTS.waiting) &&
            !row.remark.trim()
    );
    if (hasMissingDocumentRemark) {
        errors.documentChecks = "กรุณากรอกหมายเหตุของเอกสารที่ผลการตรวจเป็น ไม่ผ่าน หรือ รอเอกสารเพิ่มเติม";
    }

    // ── ผลการพิจารณา : ตรวจเมื่อผู้ใช้เลือกผลการพิจารณาแล้ว ──
    if (values.considerResult) {
        if (!values.decisionReasonId) errors.decisionReasonId = sel;
        if (values.considerResult === DECISION_REVISION && !values.decisionReasonDetail?.trim()) {
            errors.decisionReasonDetail = req;
        }
    }

    return errors;
};

const useHospitalConsiderDetailHook = () => {
    const { id, caseId: caseIdEncoded } = useParams();
    const claimId = id ? atob(id) : undefined;
    // route hospital/:id/:caseId — :caseId ถูก encode ด้วย btoa จากหน้า monitor (คู่กับ :id)
    const caseId = caseIdEncoded ? atob(caseIdEncoded) : undefined;
    const [searchParams] = useSearchParams();
    const [continuousClaimOpen, setContinuousClaimOpen] = useState(false);

    /**
     * ประเภทรายการเคลมของเคสนี้ (ตอนนี้อ่านจาก Query String เพราะ BE ยังไม่ส่งมา)
     * ตัวอย่าง : ?type=opd-full
     */
    const claimListType = parseClaimListType(searchParams.get("type"));
    const claimListTypeConfig = CLAIM_LIST_TYPE_CONFIG[claimListType];

    const { data: detailData, isLoading: detailDataLoading } = useGetClaimDetailConsider(claimId ?? "", caseId ?? "");
    const detail = detailData?.data;

    const { data: customerDetailData, isLoading: customerDetailLoading } = useGetCustomerDetailById(
        detail?.customerId ?? undefined
    );
    const customerDetail = customerDetailData?.data;

    /**
     * รายการเอกสารของเคส (ป้อนตาราง "ตรวจสอบเอกสาร") — GET /document/case/filter (claimSourceId 3)
     * ชื่อเอกสาร (claimDocumentTypeName) + documentId มาจาก endpoint นี้
     * รอ productTypeId ให้พร้อมก่อนค่อยยิง (กัน query ยิงซ้ำเพราะ productTypeId เปลี่ยนใน key)
     */
    const productTypeId = customerDetail?.productTypeId;
    const { data: caseDocumentData, isLoading: caseDocumentLoading } = useGetDocumentByCaseId(
        productTypeId && detail?.caseId ? detail.caseId : "",
        productTypeId,
        CLAIM_SOURCE_HOSPITAL,
        undefined,
        undefined,
        undefined,
        1,
        100
    );
    const caseDocuments = useMemo(() => caseDocumentData?.data ?? [], [caseDocumentData]);

    /** ผลการตรวจ/หมายเหตุที่เคยบันทึกไว้ — GET /document/case/{caseId}/overview (merge ด้วย documentId) */
    const { data: caseReviewOverviewData, isLoading: caseReviewOverviewLoading } = useGetCaseReviewOverview(
        detail?.caseId ?? undefined
    );
    const reviewByDocId = useMemo<Record<string, DocumentReviewInfo>>(() => {
        const map: Record<string, DocumentReviewInfo> = {};
        (caseReviewOverviewData?.data?.documentReview?.documents ?? []).forEach((doc) => {
            if (doc.documentId) {
                map[doc.documentId] = {
                    checkResult: doc.documentReviewStatusId || "",
                    remark: doc.documentReviewRemark || doc.documentRemark || "",
                };
            }
        });
        return map;
    }, [caseReviewOverviewData]);

    /**
     * เอกสารจริงใน DocStorage ของทุก documentId ในเคสนี้ (GET /document/documentid/list)
     * ตาราง "ตรวจสอบเอกสาร" ใช้ fileCount จาก endpoint นี้ + ข้อมูลประกอบลิงก์แนบเอกสาร
     * และใช้ fileCount เป็นเงื่อนไขเปิด modal ดูรายละเอียด (0 = ไม่มีเอกสารแนบ เปิดไม่ได้)
     */
    const documentIds = useMemo(
        () => caseDocuments.map((doc) => doc.documentId).filter((id): id is string => !!id),
        [caseDocuments]
    );
    const { data: documentStorageListData, isLoading: documentStorageListLoading } =
        useGetDocumentListByIds(documentIds);
    const documentInfoByDocId = useMemo<Record<string, DocStorageDocInfo>>(() => {
        const map: Record<string, DocStorageDocInfo> = {};
        (documentStorageListData?.data ?? []).forEach((doc) => {
            if (doc.documentId) {
                map[doc.documentId] = {
                    documentName: doc.documentTypeName || "-",
                    fileCount: doc.fileCount ?? 0,
                    documentCode: doc.documentCode ?? "",
                    mainIndex: doc.mainIndex ?? "",
                    searchIndex: doc.searchIndex ?? "",
                };
            }
        });
        return map;
    }, [documentStorageListData]);

    /** รายการเคลมต่อเนื่อง (สำหรับ Modal เลือกเคลมเดิม + แถบสรุป) */
    const { data: claimContinueData, isLoading: continuousClaimRowsLoading } = useGetClaimContinue(
        customerDetail?.policyCode ?? undefined
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

    // master list ที่ dropdown ใน RecordClaimData ใช้ — เรียกที่นี่ด้วย (query key เดียวกัน dedupe ไม่ยิงซ้ำ)
    // เพื่อรวมสถานะ loading ไว้ gate ทั้ง Step 1
    const { isLoading: hospitalListLoading } = useGetAllHospital();
    const { isLoading: chiefComplaintListLoading } = useGetChiefComplaint();
    const { isLoading: icd10ListLoading } = useGetICD10();

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
        validate: validateHospitalConsider,
        onSubmit: () => undefined,
    });

    /**
     * ตรวจฟอร์ม Step 1 ทั้งหมดก่อนกด "ถัดไป" หรือ "ยืนยันบันทึกผลพิจารณา"
     * คืน true เมื่อผ่าน, false เมื่อมี error (mark touched + เลื่อนไปช่องแรกที่ผิด)
     */
    const validateStep1 = async (): Promise<boolean> => {
        const errs = await formik.validateForm();
        const errorKeys = Object.keys(errs);
        if (errorKeys.length === 0) return true;

        const touched: FormikTouched<HospitalConsiderValues> = {};
        errorKeys.forEach((key) => {
            if (key === "diagnoses") {
                touched.diagnoses = [{ icd10Id: true }];
            } else {
                (touched as Record<string, unknown>)[key] = true;
            }
        });
        await formik.setTouched(touched, false);

        const firstErrorField = FIELD_ERROR_ORDER.find((field) => (errs as Record<string, unknown>)[field]);
        if (firstErrorField) {
            window.setTimeout(() => {
                document
                    .querySelector(`[data-field-name="${firstErrorField}"]`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
        return false;
    };

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
                    .map((item) => [
                        item.medicalTypeId,
                        { id: item.medicalTypeId ?? 0, name: item.medicalTypeCode ?? "" },
                    ])
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
    const hasSyncedDocumentsRef = useRef(false); // documentChecks (ตาราง "ตรวจสอบเอกสาร")
    const prevIncidentTypeIdRef = useRef(formik.values.incidentTypeId);
    const prevCoverageTypeIdRef = useRef(formik.values.coverageTypeId);

    // ---- sync: ตาราง "ตรวจสอบเอกสาร" จากรายการเอกสารของเคส (ครั้งเดียว ไม่ทับค่าที่ผู้ใช้แก้) ----
    // รอ overview resolve ก่อน เพื่อ prefill ผลการตรวจ/หมายเหตุที่เคยบันทึกไว้ (merge ด้วย documentId)
    useEffect(() => {
        if (hasSyncedDocumentsRef.current) return;
        if (!caseDocumentData?.data) return;
        if (caseReviewOverviewLoading) return;

        formik.setFieldValue("documentChecks", mapDocumentChecks(caseDocuments, reviewByDocId), false);
        hasSyncedDocumentsRef.current = true;
    }, [caseDocumentData, caseDocuments, caseReviewOverviewLoading, reviewByDocId]);

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

        // เวลาต้องอ่านจาก field .xTime (TimeSpan "HH:mm:ss") โดยเฉพาะ — .xDate ไม่มีเวลาจริงติดมาด้วย
        // fallback ไปเวลาจาก .xDate เผื่อ backend ยังไม่ส่ง .xTime มา
        if (detail.admissionDate) {
            formik.setFieldValue("admissionDate", dayjs(detail.admissionDate), false);
            formik.setFieldValue(
                "admissionTime",
                parseTimeSpan(detail.admissionTime) ?? dayjs(detail.admissionDate),
                false
            );
        }
        if (detail.incidentDate) {
            formik.setFieldValue("incidentDate", dayjs(detail.incidentDate), false);
            formik.setFieldValue(
                "incidentTime",
                parseTimeSpan(detail.incidentTime) ?? dayjs(detail.incidentDate),
                false
            );
        }
        if (detail.dischargeDate) {
            formik.setFieldValue("dischargeDate", dayjs(detail.dischargeDate), false);
            formik.setFieldValue(
                "dischargeTime",
                parseTimeSpan(detail.dischargeTime) ?? dayjs(detail.dischargeDate),
                false
            );
        }
        if (detail.createdDate) {
            formik.setFieldValue("createdDate", dayjs(detail.createdDate), false);
        }
        if (detail.documentCompleteDate) {
            formik.setFieldValue("documentCompleteDate", dayjs(detail.documentCompleteDate), false);
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

        // ---- ข้อมูลการเข้ารับการรักษา : default จาก SmileConnect ที่ BE ส่งผ่าน GetClaimDetailConsider ----
        formik.setFieldValue("hn", detail.hn ?? "", false);
        formik.setFieldValue("vn", detail.vn ?? "", false);
        formik.setFieldValue("an", detail.an ?? "", false);
        formik.setFieldValue("underlyingDisease", detail.underlyingDiseaseDetail ?? "", false);
        formik.setFieldValue("treatmentMethod", detail.treatmentMethod ?? "", false);
        formik.setFieldValue("labResult", detail.investigationResults ?? "", false);
        formik.setFieldValue(
            "hasProcedure",
            detail.isProcedurePerformed === true ? "yes" : detail.isProcedurePerformed === false ? "no" : "",
            false
        );
        // admitIndication / additionalDetail : BE ยังไม่ส่ง default มา ปล่อยว่างให้กรอกมือ

        // ---- แพทย์เจ้าของไข้ ----
        formik.setFieldValue("doctorLicenseNo", detail.medicalLicenseNo ?? "", false);
        formik.setFieldValue("doctorName", detail.physicianName ?? "", false);

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

    /**
     * สแกน/ค้นหาเอกสารแถวนั้นใหม่ : ล้างผลตรวจเดิมเฉพาะแถวนั้น เพื่อบังคับให้ตรวจซ้ำ (CR Ver2 ข้อ 4)
     * ไม่ล้างหมายเหตุ — คงค่าเดิมไว้ตาม behavior เดิมของระบบ
     */
    const handleDocumentScan = (rowIndex: number) => {
        handleDocumentCheckChange(rowIndex, "checkResult", "");
    };

    const { data: decisionReason, isLoading: decisionReasonLoading } = useGetDecisionReason(
        undefined,
        formik.values.considerResult
    );

    /** ตัวเลือกผลการตรวจเอกสาร (ผ่าน / ไม่ผ่าน / รอเอกสารเพิ่มเติม) จาก Master API */
    const { data: documentReviewStatusRaw, isLoading: documentCheckResultOptionsLoading } =
        useGetDocumentReviewStatus();
    const documentCheckResultOptions: DocumentCheckResultOption[] = useMemo(
        () =>
            [...(documentReviewStatusRaw?.data ?? [])]
                .sort((a, b) => (a.indexId ?? 0) - (b.indexId ?? 0))
                .map((item) => ({
                    value: item.documentReviewStatusId ?? 0,
                    label: item.documentReviewStatusName ?? "",
                    color:
                        DOCUMENT_CHECK_RESULT_COLORS[item.documentReviewStatusId ?? 0] ??
                        DOCUMENT_CHECK_RESULT_FALLBACK_COLOR,
                })),
        [documentReviewStatusRaw]
    );

    /**
     * Step 1 ยังโหลดข้อมูลต้นทาง (ที่ใช้ prefill field) ไม่ครบ — ระหว่างนี้ทั้ง Step แสดง loading + ปิดแก้ไข
     * นับเฉพาะ query ที่ป้อนค่า default ให้ field ในฟอร์ม (สถานพยาบาล/อาการสำคัญ/การวินิจฉัย/เหตุ/วันที่)
     * — ไม่รวมตาราง "ตรวจสอบเอกสาร" ที่มี loading ของตัวเอง
     */
    const rawStep1Loading =
        detailDataLoading ||
        customerDetailLoading ||
        incidentTypeLoading ||
        incidentTypeMappingLoading ||
        hospitalListLoading ||
        chiefComplaintListLoading ||
        icd10ListLoading;

    /**
     * เพดานเวลา : ถ้า API get ข้อมูลไม่สำเร็จ (error / retry ค้าง) ไม่รอเกิน 8 วิ — ปลดล็อกฟอร์มให้กรอกมือ
     * field ไหนไม่มีข้อมูล default ก็ปล่อยว่างให้ผู้ใช้กรอกเอง
     */
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    useEffect(() => {
        setLoadingTimedOut(false);
        if (!rawStep1Loading) return;
        const timer = window.setTimeout(() => setLoadingTimedOut(true), 8000);
        return () => window.clearTimeout(timer);
    }, [claimId, rawStep1Loading]);

    const isStep1Loading = rawStep1Loading && !loadingTimedOut;

    return {
        formik,
        validateStep1,
        isStep1Loading,
        claimListType,
        claimListTypeConfig,
        detailData,
        customerDetailData,
        detailDataLoading,
        customerDetailLoading,
        caseDocumentLoading,
        caseReviewOverviewLoading,
        documentInfoByDocId,
        documentStorageListLoading,
        incidentType,
        incidentTypeLoading,
        coverageType,
        medicalType,
        causeOfIncident,
        incidentTypeMapping,
        incidentTypeMappingLoading,
        decisionReason,
        decisionReasonLoading,
        continuousClaimRows,
        continuousClaimRowsLoading,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
        handleDocumentCheckChange,
        handleDocumentScan,
        documentCheckResultOptions,
        documentCheckResultOptionsLoading,
    };
};

export default useHospitalConsiderDetailHook;

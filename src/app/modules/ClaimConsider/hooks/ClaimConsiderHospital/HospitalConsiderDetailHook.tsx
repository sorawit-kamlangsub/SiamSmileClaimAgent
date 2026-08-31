import { useMemo, useState } from "react";
import { useFormik } from "formik";
import dayjs from "dayjs";
import { CoverageType, IncidentType, MedicalType } from "../../../../functionHelpers";
import { ClaimConsiderValues } from "../../store/claimConsiderSlice";
import {
    ContinuousClaimRow,
    DocumentCheckRow,
    MOCK_CAUSE_OF_INCIDENTS,
    MOCK_CONTINUOUS_CLAIMS,
    MOCK_COVERAGE_TYPES,
    MOCK_DECISION_REASONS,
    MOCK_DOCUMENT_CHECK_ROWS,
    MOCK_HOSPITAL_CLAIM,
    MOCK_INCIDENT_TYPES,
    MOCK_MEDICAL_TYPES,
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

/** ค่าเริ่มต้นของฟอร์ม อ้างอิงจากข้อมูลที่ SmileConnect ส่งมา (ปัจจุบันเป็น Mock) */
const buildInitialValues = (): HospitalConsiderValues => ({
    incidentTypeId: IncidentType.Illness,
    incidentTypeName: "เจ็บป่วย",
    coverageTypeId: CoverageType.Medical,
    coverageTypeName: "ค่ารักษา",
    medicalTypeId: MedicalType.OPD,
    medicalTypeName: "OPD",
    causeOfIncidentId: undefined,
    causeOfIncidentName: undefined,
    incidentDate: dayjs("2026-03-26"),
    incidentTime: dayjs("2026-03-26T09:30:00"),
    admissionDate: dayjs("2026-03-26"),
    admissionTime: dayjs("2026-03-26T10:30:00"),
    dischargeDate: dayjs("2026-03-26"),
    dischargeTime: dayjs("2026-03-26T11:30:00"),
    documentCompleteDate: dayjs("2026-06-19"),
    notificationDate: dayjs("2026-05-17"),
    deathDate: undefined,
    deathTime: undefined,
    ipdDays: 0,
    icuDays: 0,
    totalDays: 0,
    hospitalId: undefined,
    hospitalName: MOCK_HOSPITAL_CLAIM.hospitalName,
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

    hn: "HN2601",
    vn: "VN660612001",
    underlyingDisease: "ไม่มี",
    treatmentMethod: "ให้สารน้ำและยาตามแผนการรักษา",
    labResult: "ไม่มี",
    additionalDetail: "",
    hasProcedure: "",

    doctorLicenseNo: "12345",
    doctorName: "นพ.สมชาย ใจดี",

    documentChecks: MOCK_DOCUMENT_CHECK_ROWS,
});

const useHospitalConsiderDetailHook = () => {
    const [continuousClaimOpen, setContinuousClaimOpen] = useState(false);

    const formik = useFormik<HospitalConsiderValues>({
        initialValues: buildInitialValues(),
        enableReinitialize: false,
        onSubmit: () => undefined,
    });

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

    const decisionReason = useMemo(() => ({ data: MOCK_DECISION_REASONS }), []);

    return {
        formik,
        incidentType: MOCK_INCIDENT_TYPES,
        coverageType: MOCK_COVERAGE_TYPES,
        medicalType: MOCK_MEDICAL_TYPES,
        causeOfIncident: MOCK_CAUSE_OF_INCIDENTS,
        decisionReason,
        continuousClaimRows: MOCK_CONTINUOUS_CLAIMS,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
        handleDocumentCheckChange,
    };
};

export default useHospitalConsiderDetailHook;

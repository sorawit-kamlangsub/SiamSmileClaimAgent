import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { setClaimLineHeader, setDaysCalculate, setInsuredSearchOpen } from "../store/claimSimulateSlice";
import {
    CLAIM_CAUSE_OPTIONS,
    COVERAGE_TYPE_OPTIONS,
    MEDICAL_TYPE_OPTIONS,
    CAUSE_OF_INCIDENT_OPTIONS,
    FORMAT_TYPE_OPTIONS,
} from "../store/claimSimulateOptions";

// 6 PH | 10 House | 11 Motor | 26 PA | 27 PAชุมชน | 32 SmilePA | 33 TA | 38 PAPersonnel | 41 PA310 | 42 อัคคีภัย
const PRODUCT_TYPE_GROUP = {
    PH: [6],
    PA: [26],
    ClaimMisc: [10, 11, 27, 32, 33, 38, 41, 42],
};
const isProductType = (productTypeId: number | undefined, group: number[]) =>
    productTypeId !== undefined && group.includes(productTypeId);
const CLAIM_CAUSE = { ILLNESS: 2, ACCIDENT: 3 };
const COVERAGE_TYPE = { MEDICAL: 2, COMPENSATE: 3, DISABILITY: 4, DEATH: 5 };
const MEDICAL_TYPE = { OPD: 1, IPD: 2, DAYCASE_SURGERY: 6 };
const CAUSE_OF_INCIDENT = {
    GENERAL_ILLNESS: 2,
    GENERAL_ACCIDENT: 3,
    MOTORCYCLE: 4,
    MURDER: 5,
    PUBLIC_HAZARD: 7,
    SCHOOL_LIABILITY: 8,
};
const FORMAT_TYPE = { SSS: 2, DISABILITY: 3, DEATH: 4, SIM_B1: 5, SIM_B2: 6 };

const getMedicalTypeOptions = (productTypeId?: number, claimCause?: number, coverageType?: number) => {
    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)) {
        if (coverageType === COVERAGE_TYPE.MEDICAL && claimCause === CLAIM_CAUSE.ILLNESS) {
            return MEDICAL_TYPE_OPTIONS.filter((o) =>
                [MEDICAL_TYPE.OPD, MEDICAL_TYPE.IPD, MEDICAL_TYPE.DAYCASE_SURGERY].includes(o.value)
            );
        }
        if (coverageType === COVERAGE_TYPE.MEDICAL && claimCause === CLAIM_CAUSE.ACCIDENT) {
            return MEDICAL_TYPE_OPTIONS.filter((o) => [MEDICAL_TYPE.OPD, MEDICAL_TYPE.IPD].includes(o.value));
        }
        if (coverageType === COVERAGE_TYPE.COMPENSATE) {
            return MEDICAL_TYPE_OPTIONS.filter((o) => o.value === MEDICAL_TYPE.IPD);
        }
        return [];
    }

    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PA)) {
        if (
            (coverageType === COVERAGE_TYPE.MEDICAL || coverageType === COVERAGE_TYPE.COMPENSATE) &&
            claimCause === CLAIM_CAUSE.ILLNESS
        ) {
            return MEDICAL_TYPE_OPTIONS.filter((o) =>
                [MEDICAL_TYPE.OPD, MEDICAL_TYPE.IPD, MEDICAL_TYPE.DAYCASE_SURGERY].includes(o.value)
            );
        }
        if (
            (coverageType === COVERAGE_TYPE.MEDICAL || coverageType === COVERAGE_TYPE.COMPENSATE) &&
            claimCause === CLAIM_CAUSE.ACCIDENT
        ) {
            return MEDICAL_TYPE_OPTIONS.filter((o) => [MEDICAL_TYPE.OPD, MEDICAL_TYPE.IPD].includes(o.value));
        }
        return [];
    }

    return [];
};

const getCauseOfIncidentOptions = (
    productTypeId?: number,
    claimCause?: number,
    coverageType?: number,
    currentCauseOfIncident?: number
) => {
    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)) {
        if (claimCause === CLAIM_CAUSE.ILLNESS && coverageType === COVERAGE_TYPE.DEATH) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) => o.value === CAUSE_OF_INCIDENT.GENERAL_ILLNESS);
        }
        if (claimCause === CLAIM_CAUSE.ACCIDENT && coverageType === COVERAGE_TYPE.DISABILITY) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                [CAUSE_OF_INCIDENT.GENERAL_ACCIDENT, CAUSE_OF_INCIDENT.MOTORCYCLE, CAUSE_OF_INCIDENT.MURDER].includes(
                    o.value
                )
            );
        }
        if (claimCause === CLAIM_CAUSE.ACCIDENT && coverageType === COVERAGE_TYPE.DEATH) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                [CAUSE_OF_INCIDENT.GENERAL_ACCIDENT, CAUSE_OF_INCIDENT.MOTORCYCLE, CAUSE_OF_INCIDENT.MURDER].includes(
                    o.value
                )
            );
        }
        return [];
    }

    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PA)) {
        if (claimCause === CLAIM_CAUSE.ILLNESS && coverageType === COVERAGE_TYPE.DEATH) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) => o.value === CAUSE_OF_INCIDENT.GENERAL_ILLNESS);
        }
        if (claimCause === CLAIM_CAUSE.ACCIDENT && coverageType === COVERAGE_TYPE.DISABILITY) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                [CAUSE_OF_INCIDENT.GENERAL_ACCIDENT, CAUSE_OF_INCIDENT.MOTORCYCLE, CAUSE_OF_INCIDENT.MURDER].includes(
                    o.value
                )
            );
        }
        if (claimCause === CLAIM_CAUSE.ACCIDENT && coverageType === COVERAGE_TYPE.DEATH) {
            const isRefiningDeathCause =
                currentCauseOfIncident === CAUSE_OF_INCIDENT.GENERAL_ACCIDENT ||
                currentCauseOfIncident === CAUSE_OF_INCIDENT.MOTORCYCLE;

            if (isRefiningDeathCause) {
                return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                    [
                        CAUSE_OF_INCIDENT.GENERAL_ACCIDENT,
                        CAUSE_OF_INCIDENT.MOTORCYCLE,
                        CAUSE_OF_INCIDENT.PUBLIC_HAZARD,
                        CAUSE_OF_INCIDENT.SCHOOL_LIABILITY,
                    ].includes(o.value)
                );
            }

            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                [CAUSE_OF_INCIDENT.GENERAL_ACCIDENT, CAUSE_OF_INCIDENT.MOTORCYCLE, CAUSE_OF_INCIDENT.MURDER].includes(
                    o.value
                )
            );
        }
        return [];
    }

    return [];
};

const isMedicalTypeVisible = (coverageType?: number) =>
    coverageType === COVERAGE_TYPE.MEDICAL || coverageType === COVERAGE_TYPE.COMPENSATE;

const isCauseOfIncidentVisible = (coverageType?: number) =>
    coverageType === COVERAGE_TYPE.DISABILITY || coverageType === COVERAGE_TYPE.DEATH;

const getCoverageTypeOptions = (productTypeId?: number, claimCause?: number) => {
    if (!claimCause) return [];

    if (isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)) {
        if (claimCause === CLAIM_CAUSE.ILLNESS) {
            return COVERAGE_TYPE_OPTIONS.filter((o) =>
                [COVERAGE_TYPE.MEDICAL, COVERAGE_TYPE.COMPENSATE, COVERAGE_TYPE.DEATH].includes(o.value)
            );
        }
        return COVERAGE_TYPE_OPTIONS;
    }

    return COVERAGE_TYPE_OPTIONS;
};

const getNoClaimCauseMessage = (productTypeId?: number) =>
    isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)
        ? "กรุณาเลือกเหตุของการเคลมก่อน ระบบจะแสดงประเภทความคุ้มครองตามผลิตภัณฑ์ PH"
        : "ยังไม่ได้เลือกเหตุของการเคลม เลือกเหตุของการเคลมด้านบนเพื่อระบุประเภทความคุ้มครอง";

const getNoCoverageTypeMessage = (productTypeId?: number) =>
    isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)
        ? "กรุณาเลือกประเภทความคุ้มครองก่อน"
        : "ยังไม่ได้เลือกประเภทความคุ้มครอง เลือกประเภทความคุ้มครองด้านบนเพื่อระบุประเภทความคุ้มครอง";

const getFormatTypeOptions = (coverageType?: number) => {
    if (coverageType === COVERAGE_TYPE.MEDICAL) {
        return FORMAT_TYPE_OPTIONS.filter((o) =>
            [FORMAT_TYPE.SSS, FORMAT_TYPE.SIM_B1, FORMAT_TYPE.SIM_B2].includes(o.value)
        );
    }
    if (coverageType === COVERAGE_TYPE.COMPENSATE) {
        return FORMAT_TYPE_OPTIONS.filter((o) => o.value === FORMAT_TYPE.SSS);
    }
    if (coverageType === COVERAGE_TYPE.DEATH) {
        return FORMAT_TYPE_OPTIONS.filter((o) => o.value === FORMAT_TYPE.DEATH);
    }
    if (coverageType === COVERAGE_TYPE.DISABILITY) {
        return FORMAT_TYPE_OPTIONS.filter((o) => o.value === FORMAT_TYPE.DISABILITY);
    }
    return [];
};

export const useClaimLineHeader = () => {
    const dispatch = useDispatch();
    const selectedInsured = useSelector((s: RootState) => s.claimsimulate.selectedInsured);
    const header = useSelector((s: RootState) => s.claimsimulate.header);

    const productTypeId = (selectedInsured as { productTypeId?: number } | null)?.productTypeId;

    const handleOpenInsuredSearch = () => dispatch(setInsuredSearchOpen(true));

    const handleSelectClaimCause = (value: (typeof CLAIM_CAUSE_OPTIONS)[number]["value"]) =>
        dispatch(
            setClaimLineHeader({
                claimCause: value,
                coverageType: undefined,
                medicalType: undefined,
                causeOfIncident: undefined,
                formatTypeId: undefined,
            })
        );

    const handleSelectCoverageType = (value: (typeof COVERAGE_TYPE_OPTIONS)[number]["value"]) => {
        const nextCauseOfIncidentOptions = getCauseOfIncidentOptions(productTypeId, header.claimCause, value);
        const nextFormatTypeOptions = getFormatTypeOptions(value);
        const nextMedicalTypeOptions = getMedicalTypeOptions(productTypeId, header.claimCause, value);
        const autoMedicalType = nextMedicalTypeOptions.length === 1 ? nextMedicalTypeOptions[0].value : undefined;
        dispatch(
            setClaimLineHeader({
                coverageType: value,
                medicalType: autoMedicalType,
                causeOfIncident:
                    nextCauseOfIncidentOptions.length === 1 ? nextCauseOfIncidentOptions[0].value : undefined,
                formatTypeId: nextFormatTypeOptions.length === 1 ? nextFormatTypeOptions[0].value : undefined,
            })
        );
        if (autoMedicalType) dispatch(setDaysCalculate({ medicalType: autoMedicalType }));
    };

    const handleSelectFormatType = (formatTypeId: number) => dispatch(setClaimLineHeader({ formatTypeId }));

    const handleSelectMedicalType = (medicalType: number) => {
        dispatch(setClaimLineHeader({ medicalType }));
        dispatch(setDaysCalculate({ medicalType }));
    };

    const handleSelectCauseOfIncident = (causeOfIncident: number) => dispatch(setClaimLineHeader({ causeOfIncident }));

    const coverageTypeOptions = getCoverageTypeOptions(productTypeId, header.claimCause);
    const medicalTypeOptions = getMedicalTypeOptions(productTypeId, header.claimCause, header.coverageType);
    const formatTypeOptions = getFormatTypeOptions(header.coverageType);
    const causeOfIncidentOptions = getCauseOfIncidentOptions(
        productTypeId,
        header.claimCause,
        header.coverageType,
        header.causeOfIncident
    );

    const validateHeader = (): string | null => {
        if (!selectedInsured) return "กรุณาค้นหาและเลือกผู้เอาประกันก่อน";
        if (!header.claimCause) return "กรุณาเลือกเหตุของการเคลม";
        if (!header.coverageType) return "กรุณาเลือกประเภทความคุ้มครอง";
        if (!header.formatTypeId) return "กรุณาเลือกประเภทรายการค่าใช้จ่าย";
        if (isMedicalTypeVisible(header.coverageType) && !header.medicalType) return "กรุณาเลือกประเภทการรักษา";
        // if (isCauseOfIncidentVisible(header.coverageType) && !header.causeOfIncident)
        //     return "กรุณาเลือกสาเหตุของการเกิดเหตุ";
        return null;
    };

    return {
        selectedInsured,
        header,
        productTypeId,
        claimCauseOptions: CLAIM_CAUSE_OPTIONS,
        coverageTypeOptions,
        medicalTypeOptions,
        formatTypeOptions,
        causeOfIncidentOptions,
        isCauseOfIncidentLocked: causeOfIncidentOptions.length === 1,
        isFormatTypeLocked: formatTypeOptions.length === 1,
        isMedicalTypeLocked: medicalTypeOptions.length === 1,
        isMedicalTypeVisible: isMedicalTypeVisible(header.coverageType),
        isCauseOfIncidentVisible: isCauseOfIncidentVisible(header.coverageType),
        isOrganLossVisible: header.coverageType === COVERAGE_TYPE.DISABILITY,
        noClaimCauseMessage: getNoClaimCauseMessage(productTypeId),
        noCoverageTypeMessage: getNoCoverageTypeMessage(productTypeId),
        handleOpenInsuredSearch,
        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
        handleSelectCauseOfIncident,
        handleSelectFormatType,
        validateHeader,
    };
};

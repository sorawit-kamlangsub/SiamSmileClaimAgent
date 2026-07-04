import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { setClaimLineHeader, setDaysCalculate, setInsuredSearchOpen } from "../store/claimSimulateSlice";
import {
    CLAIM_CAUSE_OPTIONS,
    COVERAGE_TYPE_OPTIONS,
    MEDICAL_TYPE_OPTIONS,
    CAUSE_OF_INCIDENT_OPTIONS,
} from "../store/claimSimulateOptions";

// ── ค่าคงที่อ้างอิง value จริงจาก claimSimulateOptions.ts ──
const PRODUCT_TYPE = { PH: 6, PA: 26 };
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

const getMedicalTypeOptions = (productTypeId?: number, claimCause?: number, coverageType?: number) => {
    if (productTypeId === PRODUCT_TYPE.PH) {
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

    if (productTypeId === PRODUCT_TYPE.PA) {
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
    if (productTypeId === PRODUCT_TYPE.PH) {
        if (claimCause === CLAIM_CAUSE.ILLNESS && coverageType === COVERAGE_TYPE.DEATH) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) => o.value === CAUSE_OF_INCIDENT.GENERAL_ILLNESS);
        }
        if (claimCause === CLAIM_CAUSE.ACCIDENT && coverageType === COVERAGE_TYPE.DISABILITY) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                [CAUSE_OF_INCIDENT.GENERAL_ACCIDENT, CAUSE_OF_INCIDENT.MOTORCYCLE].includes(o.value)
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

    if (productTypeId === PRODUCT_TYPE.PA) {
        if (claimCause === CLAIM_CAUSE.ILLNESS && coverageType === COVERAGE_TYPE.DEATH) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) => o.value === CAUSE_OF_INCIDENT.GENERAL_ILLNESS);
        }
        if (claimCause === CLAIM_CAUSE.ACCIDENT && coverageType === COVERAGE_TYPE.DISABILITY) {
            return CAUSE_OF_INCIDENT_OPTIONS.filter((o) =>
                [CAUSE_OF_INCIDENT.GENERAL_ACCIDENT, CAUSE_OF_INCIDENT.MOTORCYCLE].includes(o.value)
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
            })
        );

    const handleSelectCoverageType = (value: (typeof COVERAGE_TYPE_OPTIONS)[number]["value"]) => {
        const nextCauseOfIncidentOptions = getCauseOfIncidentOptions(productTypeId, header.claimCause, value);
        dispatch(
            setClaimLineHeader({
                coverageType: value,
                medicalType: undefined,
                causeOfIncident:
                    nextCauseOfIncidentOptions.length === 1 ? nextCauseOfIncidentOptions[0].value : undefined,
            })
        );
    };

    const handleSelectMedicalType = (medicalType: number) => {
        dispatch(setClaimLineHeader({ medicalType }));
        dispatch(setDaysCalculate({ medicalType }));
    };

    const handleSelectCauseOfIncident = (causeOfIncident: number) => dispatch(setClaimLineHeader({ causeOfIncident }));

    const medicalTypeOptions = getMedicalTypeOptions(productTypeId, header.claimCause, header.coverageType);
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
        if (isMedicalTypeVisible(header.coverageType) && !header.medicalType) return "กรุณาเลือกประเภทการรักษา";
        if (isCauseOfIncidentVisible(header.coverageType) && !header.causeOfIncident)
            return "กรุณาเลือกสาเหตุของการเกิดเหตุ";
        return null;
    };

    return {
        selectedInsured,
        header,
        productTypeId,
        claimCauseOptions: CLAIM_CAUSE_OPTIONS,
        coverageTypeOptions: COVERAGE_TYPE_OPTIONS,
        medicalTypeOptions,
        causeOfIncidentOptions,
        isCauseOfIncidentLocked: causeOfIncidentOptions.length === 1,
        isMedicalTypeVisible: isMedicalTypeVisible(header.coverageType),
        isCauseOfIncidentVisible: isCauseOfIncidentVisible(header.coverageType),
        handleOpenInsuredSearch,
        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
        handleSelectCauseOfIncident,
        validateHeader,
    };
};

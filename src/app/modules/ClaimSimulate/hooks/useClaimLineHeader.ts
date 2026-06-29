import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { setClaimLineHeader, setInsuredSearchOpen } from "../store/claimSimulateSlice";
import { CLAIM_CAUSE_OPTIONS, COVERAGE_TYPE_OPTIONS } from "../store/claimSimulateOptions";

export const useClaimLineHeader = () => {
    const dispatch = useDispatch();
    const selectedInsured = useSelector((s: RootState) => s.claimsimulate.selectedInsured);
    const header = useSelector((s: RootState) => s.claimsimulate.header);

    const handleOpenInsuredSearch = () => dispatch(setInsuredSearchOpen(true));

    const handleSelectClaimCause = (value: (typeof CLAIM_CAUSE_OPTIONS)[number]["value"]) =>
        dispatch(setClaimLineHeader({ claimCause: value }));

    const handleSelectCoverageType = (value: (typeof COVERAGE_TYPE_OPTIONS)[number]["value"]) =>
        dispatch(setClaimLineHeader({ coverageType: value }));

    const handleSelectMedicalType = (medicalType: number) => dispatch(setClaimLineHeader({ medicalType }));

    return {
        selectedInsured,
        header,
        claimCauseOptions: CLAIM_CAUSE_OPTIONS,
        coverageTypeOptions: COVERAGE_TYPE_OPTIONS,
        handleOpenInsuredSearch,
        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
    };
};

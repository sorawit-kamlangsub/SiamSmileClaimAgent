import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { monitorSelector } from "../../store/monitorSlice";
import { setIsContinuous as setIsContinuousPH, setOldClaim as setOldClaimPH } from "../../store/claimPHSlice";
import { setIsContinuous as setIsContinuousPA, setOldClaim as setOldClaimPA } from "../../store/claimPASlice";
import { GetCaseByClaimIdDtoResponse } from "../../../../api/coreClaimApi.client";
import { useNavigate } from "react-router-dom";

export const useMonitorClaimHistory = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { selectedPolicy } = useAppSelector(monitorSelector);

    const handleContinuousClaim = (item: GetCaseByClaimIdDtoResponse) => {
        const continuous = true;
        if (selectedPolicy?.productTypeId === 26) {
            dispatch(setIsContinuousPH(continuous));
            dispatch(setOldClaimPH(item));
            navigate(
                `/claim/pa/${btoa(selectedPolicy?.appId || "")}/${btoa(selectedPolicy?.customerId?.toString() || "")}`
            );
        } else if (selectedPolicy?.productTypeId === 6) {
            dispatch(setIsContinuousPA(continuous));
            dispatch(setOldClaimPA(item));
            navigate(
                `/claim/ph/${btoa(selectedPolicy?.appId || "")}/${btoa(selectedPolicy?.customerId?.toString() || "")}`
            );
        }
    };

    const handleNewClaim = (productTypeId: number, customerId?: number) => {
        if (productTypeId === 26) {
            window.open(
                `claim/pa/${btoa(selectedPolicy?.appId || "")}/${btoa(customerId?.toString() || "")}`,
                "_blank"
            );
        } else if (productTypeId === 6) {
            window.open(
                `claim/ph/${btoa(selectedPolicy?.appId || "")}/${btoa(customerId?.toString() || "")}`,
                "_blank"
            );
        }
    };

    return {
        selectedPolicy,
        handleContinuousClaim,
        handleNewClaim,
    };
};

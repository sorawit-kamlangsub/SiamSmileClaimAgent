import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import React from "react";
import { PaginationSortableDto } from "../../../_common";
import { ClaimHistoryItem, monitorSelector, setClaimHistory } from "../../store/monitorSlice";
import { mockClaimHistoryPA, mockClaimHistoryPH } from "./useMonitorTable";
import { setIsContinuous } from "../../store/claimPHSlice";

export const useMonitorClaimHistory = () => {
    const dispatch = useAppDispatch();
    const { selectedPolicy, claimHistory } = useAppSelector(monitorSelector);

    const [isLoading, setIsLoading] = useState(false);
    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    useEffect(() => {
        if (!selectedPolicy?.appId) return;

        setIsLoading(true);

        setTimeout(() => {
            const history = selectedPolicy.productName === "PA" ? mockClaimHistoryPA : mockClaimHistoryPH;
            dispatch(setClaimHistory(history));
            setIsLoading(false);
        }, 300);
    }, [selectedPolicy?.appId]);

    const handleContinuousClaim = (item: ClaimHistoryItem) => {
        console.log("แจ้งเคลมต่อเนื่อง", item);
        const continuous = true;
        dispatch(setIsContinuous(continuous));
    };

    const handleNewClaim = (productTypeId: number, customerId?: number) => {
        if (productTypeId === 26) {
            window.open(`claim/pa/${btoa(customerId?.toString() || "")}`, "_blank");
        } else if (productTypeId === 6) {
            window.open(`claim/ph/${btoa(customerId?.toString() || "")}`, "_blank");
        }
    };

    return {
        selectedPolicy,
        claimHistory,
        isLoading,
        paginated,
        setPaginated,
        handleContinuousClaim,
        handleNewClaim,
    };
};

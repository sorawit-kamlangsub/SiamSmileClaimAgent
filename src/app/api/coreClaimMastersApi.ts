import axios from "axios";
import { CORECLAIM_API_URL } from "../../Const";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AllUserDtoResponse, MastersClient } from "./coreClaimApi.client";
import { useMemo } from "react";

const coreClaimMastersClient = new MastersClient(CORECLAIM_API_URL, axios);

const getUserQuerykey = ["getUser"];
const getPatienttypeQueryKey = ["getPatienttype"];

export const useGetUser = (userId?: number | undefined) => {
    return useQuery([getUserQuerykey, userId], () => coreClaimMastersClient.users(userId), {
        cacheTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
    });
};

export const getUserFilter = (searchValue: string, defaultId?: any): UseQueryResult<AllUserDtoResponse[], unknown> => {
    const key = searchValue.substring(0, 5);
    const { data, isLoading, ...rest } = useGetUser();

    return useMemo(() => {
        if (isLoading) return { data, isLoading, ...rest } as UseQueryResult<AllUserDtoResponse[], unknown>;

        // const activeEmployees = data?.data?.filter((item) => item.EmployeeStatus_ID !== 6);

        const selectedEmployee = data?.data?.find((item) => item.userId == defaultId);

        const filteredData = data?.data?.filter((item) => item.displayName?.includes(key)).slice(0, 10);

        if (selectedEmployee && !filteredData?.includes(selectedEmployee)) {
            filteredData?.unshift(selectedEmployee);
        }

        return {
            data: filteredData,
            isLoading,
            ...rest,
        } as UseQueryResult<AllUserDtoResponse[], unknown>;
    }, [key, defaultId, data, isLoading]);
};

export const useGetPatienttype = (patientTypeId?: number | undefined) => {
    return useQuery([getPatienttypeQueryKey, patientTypeId], () => coreClaimMastersClient.patienttype(patientTypeId), {
        refetchOnWindowFocus: true,
    });
};

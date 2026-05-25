import axios from "axios";
import { API_URL } from "../../Const";
import { useQuery } from "@tanstack/react-query";
import { MastersClient } from "./coreClaimApi.client";

const mastersClient = new MastersClient(API_URL, axios);

const getClaimExpenseDetailQueryKey = ["getClaimExpenseDetail"];

export const useGetClaimExpenseDetail = (enabled: boolean, formatTypeId?: number, patientTypeId?: number) => {
    return useQuery(
        [getClaimExpenseDetailQueryKey, formatTypeId, patientTypeId],
        () => mastersClient.simb(formatTypeId, patientTypeId),
        {
            enabled: enabled && !!formatTypeId && !!patientTypeId,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 60, // ← cache 1 ชม. ไม่ fetch ซ้ำถ้า param เดิม
            cacheTime: 1000 * 60 * 60 * 24, // ← เก็บ cache 24 ชม.
        }
    );
};

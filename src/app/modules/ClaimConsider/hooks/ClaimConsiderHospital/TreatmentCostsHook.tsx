import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface TreatmentCostRow {
    id: string;
    code: string;
    label: string;
    receiptAmount: number | "";
    eligibleAmount: number | "";
    discount: number | "";
    uncoveredAmount: number | "";
    reason: string;
    note: string;
}

// ---- API calls ---------------------------------------------------------
// Adjust base path / endpoint names to match your backend.
// Following the "POST + descriptive suffix" pattern instead of GET/PUT verbs.

// const fetchTreatmentCosts = async (caseId: string): Promise<TreatmentCostRow[]> => {
//     const { data } = await axios.get(`/api/treatment-costs/${caseId}`);
//     return data.rows as TreatmentCostRow[];
// };

const saveTreatmentCosts = async (params: { caseId: string; rows: TreatmentCostRow[] }): Promise<void> => {
    await axios.post(`/api/treatment-costs/${params.caseId}/save`, {
        rows: params.rows,
    });
};

// ---- Hook ---------------------------------------------------------------

export function useTreatmentCostsHook(caseId: string) {
    const queryClient = useQueryClient();
    const [rows, setRows] = useState<TreatmentCostRow[]>([]);

    // const { data, isLoading, isError, error } = useQuery({
    //     queryKey: ["treatment-costs", caseId],
    //     queryFn: () => fetchTreatmentCosts(caseId),
    //     enabled: !!caseId,
    // });

    // Sync fetched data into local editable state once it arrives
    // useEffect(() => {
    //     if (data) {
    //         setRows(data);
    //     }
    // }, [data]);

    const {
        mutate: saveRows,
        isSuccess: saveSucceeded,
        isError: saveFailed,
    } = useMutation({
        mutationFn: saveTreatmentCosts,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["treatment-costs", caseId] });
        },
    });

    const updateField = (id: string, field: keyof TreatmentCostRow, value: string) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          [field]:
                              field === "receiptAmount" ||
                              field === "eligibleAmount" ||
                              field === "discount" ||
                              field === "uncoveredAmount"
                                  ? value === ""
                                      ? ""
                                      : Number(value)
                                  : value,
                      }
                    : row
            )
        );
    };

    const deleteRow = (id: string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const save = () => {
        saveRows({ caseId, rows });
    };

    return {
        rows,
        // isLoading,
        // isError,
        // error,
        updateField,
        deleteRow,
        save,
        saveSucceeded,
        saveFailed,
    };
}

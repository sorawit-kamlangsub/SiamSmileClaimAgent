import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { ClaimHistoryItem, monitorSelector, SelectedPolicyInfo, setSelectedPolicy } from "../../store/monitorSlice";
import { PaginationSortableDto } from "../../../_common";
import React from "react";
import { useGetCustomerDetailById, useGetCustomerSearch } from "../../../../api/coreClaimApi";

export const mockClaimHistoryPH: ClaimHistoryItem[] = [
    {
        claimNo: "CL6904000193",
        chiefComplain: "ประสงค์เบิกยาแก้ปวดหัว",
        incidentDate: "2026-03-25",
        totalClaim: 500,
        totalPaid: 500,
        productId: 2,
    },
    {
        claimNo: "CL6904000221",
        chiefComplain: "โดนมาร์จรั่น",
        incidentDate: "2026-03-16",
        totalClaim: 1800,
        totalPaid: 1800,
        productId: 2,
    },
    {
        claimNo: "CL6904000315",
        chiefComplain: "ไข้หวัดใหญ่",
        incidentDate: "2026-02-10",
        totalClaim: 2500,
        totalPaid: 2000,
        productId: 2,
    },
];

export const mockClaimHistoryPA: ClaimHistoryItem[] = [
    {
        claimNo: "CL6905000101",
        chiefComplain: "หกล้มขณะวิ่งเล่น",
        incidentDate: "2026-04-12",
        totalClaim: 1200,
        totalPaid: 1200,
        productId: 1,
    },
    {
        claimNo: "CL6905000102",
        chiefComplain: "ได้รับบาดเจ็บจากกีฬา",
        incidentDate: "2026-03-28",
        totalClaim: 3000,
        totalPaid: 2500,
        productId: 1,
    },
];

export const useMonitorTable = () => {
    const dispatch = useAppDispatch();
    const { search, isSearchMonitor } = useAppSelector(monitorSelector);
    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data, isLoading } = useGetCustomerSearch(
        isSearchMonitor,
        search.searchTypeId,
        search.isAdvancedSearch,
        search.dateHappen,
        search.schoolId,
        search.provinceId,
        undefined,
        search.searchDetail,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    const selectedId =
        selectedRowIndex !== null && data?.data?.[selectedRowIndex]?.id != null ? data.data[selectedRowIndex].id : 0;

    const { data: claimInfo, isLoading: claimInfoLoading } = useGetCustomerDetailById(selectedId);

    useEffect(() => {
        if (!search.searchDetail) return;

        setSelectedRowIndex(null);
        dispatch(setSelectedPolicy(null));
    }, [search]);

    useEffect(() => {
        if (!claimInfo) return;

        const row = data?.data?.[selectedRowIndex!];
        if (!row) return;

        const policy: SelectedPolicyInfo = {
            appId: claimInfo.data?.policyCode || "",
            customerName: claimInfo.data?.customerName || "",
            cardNo: claimInfo.data?.cardDetail || "",
            productName: claimInfo.data?.productTypeName || "",
            productTypeId: data.data?.[selectedRowIndex!]?.productTypeId,
            customerId: data.data?.[selectedRowIndex!]?.id,
            startCoverDate: claimInfo.data?.coverageFrom?.toString() || "",
            endCoverDate: claimInfo.data?.coverageTo?.toString() ?? null,
            schoolName: claimInfo.data?.schoolName || "",
            provinceName: claimInfo.data?.provinceName || "",
            address: claimInfo.data?.address || "",
        };

        dispatch(setSelectedPolicy(policy));
    }, [claimInfo]);

    const handleSelect = (rowIndex: number) => {
        setSelectedRowIndex(rowIndex);
    };

    return { data, isLoading, paginated, setPaginated, selectedRowIndex, handleSelect, search, claimInfoLoading };
};

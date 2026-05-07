import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import {
    ClaimHistoryItem,
    MonitorListItem,
    monitorSelector,
    SelectedPolicyInfo,
    setSelectedPolicy,
} from "../../store/monitorSlice";
import { PaginationSortableDto } from "../../../_common";
import React from "react";

export const mockMonitorList: MonitorListItem[] = [
    {
        appId: "0003067",
        customerName: "นายกรภัทร วรวงศ์คุณากร",
        productName: "PH",
        productCategoryName: "662",
        startCoverDate: "2016-01-01",
        endCoverDate: null,
    },
    {
        appId: "0003067-P30-01",
        customerName: "นายกรภัทร วรวงศ์คุณากร",
        productName: "PH",
        productCategoryName: "P30",
        startCoverDate: "2016-01-01",
        endCoverDate: null,
    },
    {
        appId: "PL60000106",
        customerName: "นายกรภัทร วรวงศ์คุณากร",
        productName: "PL",
        productCategoryName: "Life-810",
        startCoverDate: "2016-01-01",
        endCoverDate: null,
    },
    {
        appId: "PA69240003",
        customerName: "ด.ช.ภิตดิชัย ศิริเดน",
        productName: "PA",
        productCategoryName: "เลือกสิทธิ์",
        startCoverDate: "2026-05-01",
        endCoverDate: "2027-04-30",
    },
];

export const mockClaimHistoryPH: ClaimHistoryItem[] = [
    {
        claimNo: "CL6904000193",
        chiefComplain: "ประสงค์เบิกยาแก้ปวดหัว",
        incidentDate: "2026-03-25",
        totalClaim: 500,
        totalPaid: 500,
    },
    {
        claimNo: "CL6904000221",
        chiefComplain: "โดนมาร์จรั่น",
        incidentDate: "2026-03-16",
        totalClaim: 1800,
        totalPaid: 1800,
    },
    {
        claimNo: "CL6904000315",
        chiefComplain: "ไข้หวัดใหญ่",
        incidentDate: "2026-02-10",
        totalClaim: 2500,
        totalPaid: 2000,
    },
];

export const mockClaimHistoryPA: ClaimHistoryItem[] = [
    {
        claimNo: "CL6905000101",
        chiefComplain: "หกล้มขณะวิ่งเล่น",
        incidentDate: "2026-04-12",
        totalClaim: 1200,
        totalPaid: 1200,
    },
    {
        claimNo: "CL6905000102",
        chiefComplain: "ได้รับบาดเจ็บจากกีฬา",
        incidentDate: "2026-03-28",
        totalClaim: 3000,
        totalPaid: 2500,
    },
];

export const mockSelectedPolicyPH: SelectedPolicyInfo = {
    appId: "0003067",
    customerName: "นายกรภัทร วรวงศ์คุณากร",
    nationalId: "2494029825403",
    productName: "PH",
    startCoverDate: "2016-01-01",
    endCoverDate: null,
};

export const mockSelectedPolicyPA: SelectedPolicyInfo = {
    appId: "PA69240003",
    customerName: "ด.ช.ภิตดิชัย ศิริเดน",
    nationalId: "9217505830122",
    productName: "PA",
    startCoverDate: "2026-05-01",
    endCoverDate: "2027-04-30",
    schoolName: "โรงเรียนแม่พิทยาภูมิ",
    insuredType: "นักเรียน",
    effectiveCoverDate: "2026-05-01",
};

export const useMonitorTable = () => {
    const dispatch = useAppDispatch();
    const { search } = useAppSelector(monitorSelector);
    const [data, setData] = useState<MonitorListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paginated, setPaginated] = React.useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!search.searchDetail) return;

        setIsLoading(true);
        setSelectedRowIndex(null);
        dispatch(setSelectedPolicy(null));

        // Mock: simulate API delay
        setTimeout(() => {
            setData(mockMonitorList);
            setIsLoading(false);
        }, 600);
    }, [search]);

    const handleSelect = (rowIndex: number) => {
        const row = data[rowIndex];
        if (!row) return;
        setSelectedRowIndex(rowIndex);

        const policy: SelectedPolicyInfo = row.productName === "PA" ? mockSelectedPolicyPA : mockSelectedPolicyPH;

        dispatch(setSelectedPolicy({ ...policy, appId: row.appId, productName: row.productName }));
    };

    return { data, isLoading, paginated, setPaginated, selectedRowIndex, handleSelect };
};

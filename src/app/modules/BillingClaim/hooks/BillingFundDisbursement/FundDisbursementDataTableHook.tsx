import { useMemo, useState } from "react";
import { MUIDataTableColumn } from "mui-datatables";
import { cellAlignOptions, formatDateString, numberWithCommas } from "../../../../functionHelpers";
import { PaginationSortableDto } from "../../../_common";
import { FUND_CLAIM_TYPE, FundClaimType, FundDisbursementFilterValues } from "../../store/fundDisbursement.types";
import useFundDisbursementList from "./useFundDisbursementList";

const fmtDate = (value: string | undefined) => (value ? formatDateString(value, "DD/MM/BBBB") : "-");

/**
 * ตาราง list "ตั้งเบิกกองทุน" — คอลัมน์สลับตาม `claimType` (handoff หัวข้อ "ตารางเคลมโรงพยาบาล" /
 * รูป mockup ของเคลมลูกค้า) ข้อมูลจริงยังไม่มี (`useFundDisbursementList` คือ adapter รอ BE) เพจนี้จึง
 * ทำหน้าที่แค่เตรียมโครง column + selection ให้พร้อมต่อทันทีที่มี endpoint
 */
const useFundDisbursementDataTableHook = (
    claimType: FundClaimType | "",
    appliedFilter: FundDisbursementFilterValues
) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

    const {
        items: rows,
        totalCount,
        totalAmount,
        isLoading,
        pagination,
    } = useFundDisbursementList(appliedFilter, paginated);

    const handleRowSelected = (_current: unknown[], _all: unknown[], rowsSelected?: number[]) => {
        setSelectedIndexes(rowsSelected ?? []);
    };

    const selectedAmount = useMemo(
        () => selectedIndexes.reduce((sum, index) => sum + (rows[index]?.disbursementAmount ?? 0), 0),
        [selectedIndexes, rows]
    );

    const isHospital = claimType === FUND_CLAIM_TYPE.hospital;

    const dateColumn = (name: "notifiedDate" | "approvedDate", label: string): MUIDataTableColumn => ({
        name,
        label,
        options: {
            ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
            customBodyRender: (value: string | undefined) => fmtDate(value),
        },
    });

    // เคลมโรงพยาบาล (handoff หัวข้อ "ตารางเคลมโรงพยาบาล") : วันที่อนุมัติเคลม · เลขที่ Case · ชื่อสถานพยาบาล ·
    // ผู้อนุมัติ · จำนวนเงินตั้งเบิก · บริษัทประกัน — เคลมลูกค้า (mockup) : เพิ่มวันที่แจ้งเคลมนำหน้า แทนที่ชื่อ
    // สถานพยาบาลด้วยไม่มีคอลัมน์นั้นเลย
    const column: MUIDataTableColumn[] = [
        ...(isHospital ? [] : [dateColumn("notifiedDate", "วันที่แจ้งเคลม")]),
        dateColumn("approvedDate", "วันที่อนุมัติเคลม"),
        {
            name: "caseCode",
            label: "เลขที่ Case",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        ...(isHospital
            ? [
                  {
                      name: "hospitalName",
                      label: "ชื่อสถานพยาบาล",
                      options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
                  } as MUIDataTableColumn,
              ]
            : []),
        {
            name: "approvedBy",
            label: "ผู้อนุมัติ",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        {
            name: "disbursementAmount",
            label: "จำนวนเงินตั้งเบิก",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value: number) => numberWithCommas(value ?? 0, 2),
            },
        },
        {
            name: "insuranceCompanyName",
            label: "ชื่อบริษัทประกัน",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
    ];

    return {
        column,
        rows,
        totalCount,
        totalAmount,
        isLoading,
        pagination,
        setPaginated,
        selectedIndexes,
        handleRowSelected,
        selectedCount: selectedIndexes.length,
        selectedAmount,
    };
};

export default useFundDisbursementDataTableHook;

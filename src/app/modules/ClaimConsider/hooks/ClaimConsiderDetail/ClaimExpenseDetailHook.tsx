import { useEffect, useMemo, useState } from "react";
import {
    useGetInsuranceCompany,
    useGetNonCoveredReason,
    useGetSimBCategory,
} from "../../../../api/coreClaimMastersApi";
import useConsiderDetailHook from "./ConsiderDetailHook";
import { StandardMedicalExpenseCategoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import {
    applyMaximumLimit,
    hasAmountSumError,
    hasMissingReasonError,
    toAmount,
} from "../../../ClaimSimulate/store/Claimsimulateutils";
import { swalError } from "../../../_common";
import { ClaimExpenseItem, setCaseAdjudicationId, setFilledClaimLineItems } from "../../store/claimConsiderSlice";
import { useGetStandardMedicalExpenseByCase } from "../../../../api/coreClaimApi";
import { CoverageType } from "../../../../functionHelpers";
const mapCategoriesToTree = (data: StandardMedicalExpenseCategoryDtoResponse[]) => {
    // id ของ tree ต้อง unique เสมอ — inputToStandardCategoryId/SubCategoryId/MappingId จาก backend
    // เป็น undefined ได้หลายรายการพร้อมกัน (fallback ?? 0 เดิมทำให้หลายโหนดชน id 0 พร้อมกัน
    // ทั้ง React key ซ้ำ และ expand/select state ไปเปิด/ไฮไลต์โหนดอื่นที่ id ชนกันโดยไม่ตั้งใจ)
    // จึงแจก id ใหม่ทีละตัวแยกจาก id ทางธุรกิจไปเลย ส่วน inputToStandardMappingId ยังเก็บแยกไว้ต่างหาก
    let nextId = 1;
    return data
        .map((cat) => {
            const children = (cat.inputToStandardSubCategoryList ?? [])
                .map((sub) => {
                    const leaves = (sub.inputToStandardMappingList ?? []).map((item) => ({
                        id: nextId++,
                        inputToStandardMappingId: item.inputToStandardMappingId,
                        standardMedicalExpenseId: item.standardMedicalExpenseId,
                        code: item.inputItemCode ?? "",
                        label: `${item.inputItemCode ?? ""} ${item.descriptionTH ?? ""}`.trim(),
                        bodyPartId: item.bodyPartId,
                        maximumLimit: item.maximumLimit,
                        children: [],
                    }));

                    if (leaves.length === 0) return null;

                    return {
                        id: nextId++,
                        label: sub.inputToStandardSubCategoryName ?? "",
                        children: leaves,
                    };
                })
                .filter((sub): sub is NonNullable<typeof sub> => sub !== null);

            if (children.length === 0) return null;

            return {
                id: nextId++,
                label: cat.inputToStandardCategoryName ?? "",
                children,
            };
        })
        .filter((cat): cat is NonNullable<typeof cat> => cat !== null);
};
interface ClaimLineFormValues {
    items: ClaimExpenseItem[];
}
const useClaimExpenseDetailHook = () => {
    const dispatch = useDispatch();
    const { customerDetailData, detailData } = useConsiderDetailHook();
    const { filledItems, form } = useSelector((s: RootState) => s.claimConsider);
    /**
     * coverage/medical : ใช้ค่าใน Redux form ก่อน (ผู้ใช้แก้ใน Step 1 แล้ว sync ลงมา)
     * ถ้ายังว่าง (ยังไม่เคย sync ลง Redux) ให้ fallback ไปค่าตั้งต้นจาก claim detail
     * กันไม่ให้ query ยิงด้วย undefined ตอนอยู่ Step 2 ครั้งแรก
     */
    const coverageTypeId = form.coverageTypeId ?? detailData?.data?.coverageTypeId;
    const medicalTypeId = form.medicalTypeId ?? detailData?.data?.medicalTypeId;
    const [searchText, setSearchText] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [selectedItem, setSelectedItem] = useState<{
        code: string;
        description: string;
        standardMedicalExpenseId?: number;
        inputToStandardMappingId?: number;
        maximumLimit?: number;
    } | null>(null);
    const [selectedLeafId, setSelectedLeafId] = useState<number | null>(null);
    const [pendingAmount, setPendingAmount] = useState("");
    const [pendingDiscount, setPendingDiscount] = useState("");
    const [pendingNotCovered, setPendingNotCovered] = useState("");
    const [pendingReceiptAmount, setPendingReceiptAmount] = useState("");
    const [pendingReason, setPendingReason] = useState<number | undefined>(undefined);
    const [pendingRemark, setPendingRemark] = useState("");
    const [discountError, setDiscountError] = useState("");
    const [notCoveredError, setNotCoveredError] = useState("");
    const [reasonError, setReasonError] = useState("");
    const [showAddPanel, setShowAddPanel] = useState(false);
    const syncItemsToRedux = (next: ClaimExpenseItem[]) => dispatch(setFilledClaimLineItems(next));

    const formikClaimLine = useFormik<ClaimLineFormValues>({
        initialValues: { items: filledItems },
        onSubmit: () => {},
    });
    const items = formikClaimLine.values.items;

    // ── รายการที่ใช้บ่อย: isUseOften=true ───────────────────────────────────
    const { data: frequentData, isLoading: isFrequentLoading } = useGetStandardMedicalExpenseByCase(
        detailData?.data?.caseId ?? "",
        6, //simb2
        coverageTypeId,
        medicalTypeId,
        false,
        customerDetailData?.data?.productTypeId,
        undefined,
        customerDetailData?.data?.productId
    );
    // ── รายการเพิ่มเติม (หมวดหมู่) ───────────────────────────────────────────
    const { data: categoryData, isLoading: isCategoryLoading } = useGetSimBCategory(
        6, //simb2
        coverageTypeId,
        medicalTypeId,
        customerDetailData?.data?.productTypeId,
        undefined,
        customerDetailData?.data?.productId
    );
    const frequentItems = useMemo((): ClaimExpenseItem[] => {
        const raw = frequentData?.data ?? [];
        return raw.map((item, idx) => ({
            id: item.inputToStandardMappingId ?? idx,
            standardMedicalExpenseId: item.standardMedicalExpenseId,
            inputToStandardMappingId: item.inputToStandardMappingId,
            code: item.inputItemCode ?? "",
            description: item.descriptionTH ?? "",
            receiptAmount: undefined,
            claimAmount: item.originalAmount ?? undefined,
            discount: item.discountAmount ?? undefined,
            notCovered: item.nonCoveredAmount ?? undefined,
            // API อาจส่ง 0 เมื่อไม่มีสาเหตุ : normalize เป็น undefined กัน payload ส่ง reasonId = 0
            reason: item.nonCoveredReasonId || undefined,
            remark: item.remark ?? undefined,
            color: item.backgroundColorCode ?? "#FFD6D6",
            disabled: false,
            bodyPartId: item.bodyPartId,
            maximumLimit: item.maximumLimit,
            caseItemId: item.caseItemId,
        }));
    }, [frequentData]);

    /** caseAdjudicationId มาระดับ item — ทุกแถวของ case เดียวกันเป็นค่าเดียวกัน จึงหยิบตัวแรกที่ไม่ว่าง */
    const caseAdjudicationId = useMemo(
        () => frequentData?.data?.find((item) => item.caseAdjudicationId)?.caseAdjudicationId ?? null,
        [frequentData]
    );

    // ส่งขึ้น Redux ให้ ClaimStepCalculateHook หยิบไปใส่ payload คำนวณ (คนละ component จึงส่งเป็น prop ไม่ได้)
    useEffect(() => {
        dispatch(setCaseAdjudicationId(caseAdjudicationId));
    }, [dispatch, caseAdjudicationId]);
    const categories = useMemo(() => {
        const raw = categoryData?.data ?? [];
        setExpandedIds([]);
        setSelectedItem(null);
        setSelectedLeafId(null);
        return mapCategoriesToTree(raw);
    }, [categoryData]);

    const filteredCategories = useMemo(() => {
        if (!searchText.trim()) return categories;

        const keyword = searchText.trim().toLowerCase();

        return categories
            .map((cat) => {
                const subCategories = cat.children
                    .map((sub) => {
                        const leaves = sub.children.filter((leaf) => leaf.label.toLowerCase().includes(keyword));

                        if (leaves.length === 0) return null;

                        return {
                            ...sub,
                            children: leaves,
                        };
                    })
                    .filter(Boolean) as typeof cat.children;

                if (subCategories.length === 0) return null;

                return {
                    ...cat,
                    children: subCategories,
                };
            })
            .filter(Boolean) as typeof categories;
    }, [categories, searchText]);
    // ── สาเหตุไม่คุ้มครอง  ─────────────────────────
    const { data: nonCoveredReasonData, isLoading: isNonCoveredReasonLoading } = useGetNonCoveredReason();

    const notCoveredReasonOptions = useMemo(() => {
        const raw = nonCoveredReasonData?.data ?? [];
        return raw.map((r) => ({
            value: r.nonCoveredReasonId,
            label: r.nonCoveredReasonName ?? "-",
        }));
    }, [nonCoveredReasonData]);

    const { data: insuranceCompany, isLoading: insuranceCompanyLoading } = useGetInsuranceCompany();

    const insuranceCompanyOptions = useMemo(() => {
        const raw = insuranceCompany?.data ?? [];
        return raw.map((r) => ({
            value: r.organizeId,
            label: r.organizeName ?? "-",
        }));
    }, [nonCoveredReasonData]);

    const totalReceipt = items.reduce((s, i) => s + (i.receiptAmount || 0), 0); // ยอดเงินตามใบเสร็จรวม
    const totalClaim = items.reduce((s, i) => s + (i.claimAmount || 0), 0);
    const totalDiscount = items.reduce((s, i) => s + (i.discount || 0), 0);
    const totalNotCovered = items.reduce((s, i) => s + (i.notCovered || 0), 0);
    const netClaimAmount = totalClaim - totalDiscount - totalNotCovered; // ยอดเบิกสุทธิ
    const filterFilledItems = (items: ClaimExpenseItem[]) =>
        items.filter((item) => {
            const hasClaimAmount = item.claimAmount !== undefined && item.claimAmount !== null;
            const hasDiscount = item.discount !== undefined && item.discount !== null;
            const hasNotCovered = item.notCovered !== undefined && item.notCovered !== null;
            const hasReason = item.reason !== undefined && item.reason !== null;
            const hasRemark = !!item.remark?.trim();

            return hasClaimAmount || hasDiscount || hasNotCovered || hasReason || hasRemark;
        });
    const handleUpdateItem = (item: ClaimExpenseItem) => {
        const adjusted = applyMaximumLimit({
            claimAmount: Number(item.claimAmount ?? 0),
            discount: Number(item.discount ?? 0),
            notCovered: Number(item.notCovered ?? 0),
            reason: item.reason,
            maximumLimit: item.maximumLimit,
        });

        const nextItem: ClaimExpenseItem = {
            ...item,
            claimAmount: adjusted.claimAmount,
            notCovered: adjusted.notCovered,
            reason: adjusted.reason,
        };

        const next = items.map((i) => (i.id === nextItem.id ? nextItem : i));
        formikClaimLine.setFieldValue("items", next);
        syncItemsToRedux(next);
    };

    const handleRemoveItem = (id: number) => {
        const next = items.filter((i) => i.id !== id);
        formikClaimLine.setFieldValue("items", next);
        syncItemsToRedux(next);
    };
    const handleToggleExpand = (id: number) =>
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSelectLeaf = (
        code: string,
        description: string,
        id: number,
        standardMedicalExpenseId?: number,
        inputToStandardMappingId?: number,
        maximumLimit?: number
    ) => {
        setSelectedItem({
            code,
            description,
            standardMedicalExpenseId,
            inputToStandardMappingId,
            maximumLimit,
        });
        setSelectedLeafId(id);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReceiptAmount("");
        setPendingReason(undefined);
        setPendingRemark("");
        setDiscountError("");
        setNotCoveredError("");
        setReasonError("");
    };

    /** ประเภทความคุ้มครอง = ค่ารักษา : เงื่อนไขแสดง Section "รายการค่ารักษาเพิ่มเติม" */
    const isMedicalCoverage = coverageTypeId === CoverageType.Medical;

    const hasAnyAmount = items.some((item) => Number(item.claimAmount ?? 0) > 0);
    const hasDiscountError = items.some((item) => Number(item.discount ?? 0) > Number(item.claimAmount ?? 0));
    const hasNotCoveredError = items.some((item) => hasAmountSumError(item));
    /** มียอดไม่คุ้มครองแต่ยังไม่ระบุสาเหตุ — บังคับตาม spec */
    const hasReasonError = items.some((item) => hasMissingReasonError(item));
    const handleAddToTable = () => {
        if (!selectedItem) return;

        const isDuplicate = items.some(
            (item) => item.code === selectedItem.code && item.description === selectedItem.description
        );

        if (isDuplicate) {
            swalError("ไม่สามารถเพิ่มรายการได้", "รายการค่ารักษานี้ถูกเพิ่มไปแล้ว");
            return;
        }
        const rawAmount = toAmount(pendingAmount);
        const rawDiscount = toAmount(pendingDiscount);
        const rawNotCovered = toAmount(pendingNotCovered);

        const {
            claimAmount: amount,
            discount,
            notCovered,
            reason,
        } = applyMaximumLimit({
            claimAmount: rawAmount,
            discount: rawDiscount,
            notCovered: rawNotCovered,
            reason: pendingReason,
            maximumLimit: selectedItem.maximumLimit,
        });

        let hasError = false;
        if (discount > amount && (notCovered == 0 || notCovered == undefined)) {
            setDiscountError("ส่วนลดต้องไม่มากกว่ายอดเบิก");
            hasError = true;
        } else {
            setDiscountError("");
        }
        if (notCovered > amount && (notCovered == 0 || notCovered == undefined)) {
            setNotCoveredError("ยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิก");
            hasError = true;
        } else {
            setNotCoveredError("");
        }
        if (discount + notCovered > amount) {
            setNotCoveredError("ยอดไม่คุ้มครองรวมส่วนลดต้องไม่มากกว่ายอดเบิก");
            setDiscountError("ส่วนลดรวมยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิก");
            hasError = true;
        } else {
            setNotCoveredError("");
            setDiscountError("");
        }
        if (discount > amount && (notCovered == 0 || notCovered == undefined)) {
            setDiscountError("ส่วนลดต้องไม่มากกว่ายอดเบิก");
            hasError = true;
        } else {
            setDiscountError("");
        }
        // ยอดไม่คุ้มครอง > 0 ต้องระบุสาเหตุ
        if (hasMissingReasonError({ claimAmount: amount, discount, notCovered, reason })) {
            setReasonError("กรุณาเลือกสาเหตุไม่คุ้มครอง");
            hasError = true;
        } else {
            setReasonError("");
        }
        if (hasError) return;

        const newItem: ClaimExpenseItem = {
            id: Date.now(),
            standardMedicalExpenseId: selectedItem.standardMedicalExpenseId,
            inputToStandardMappingId: selectedItem.inputToStandardMappingId,
            code: selectedItem.code,
            description: selectedItem.description,
            receiptAmount: toAmount(pendingReceiptAmount),
            claimAmount: amount,
            discount: discount,
            notCovered: notCovered,
            reason: reason,
            remark: pendingRemark,
            disabled: false,
            maximumLimit: selectedItem.maximumLimit,
        };

        const next = [...items, newItem];
        formikClaimLine.setFieldValue("items", next);
        syncItemsToRedux(next);

        setSelectedItem(null);
        setSelectedLeafId(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReceiptAmount("");
        setPendingReason(undefined);
        setDiscountError("");
        setNotCoveredError("");
        setReasonError("");
    };

    const handleNext = (): boolean => {
        if (!hasAnyAmount) {
            swalError("ไม่สามารถดำเนินการต่อได้", "กรุณาเพิ่มรายการค่ารักษาอย่างน้อย 1 รายการ");
            return false;
        }
        if (hasDiscountError || hasNotCoveredError) {
            swalError("ไม่สามารถดำเนินการต่อได้", "กรุณาตรวจสอบยอดส่วนลด/ไม่คุ้มครองให้ไม่เกินยอดเบิก");
            return false;
        }
        if (hasReasonError) {
            swalError("ไม่สามารถดำเนินการต่อได้", "กรุณาเลือกสาเหตุไม่คุ้มครองให้ครบทุกรายการที่มียอดไม่คุ้มครอง");
            return false;
        }

        const filteredItems = filterFilledItems(items);

        dispatch(setFilledClaimLineItems(filteredItems));
        return true;
    };
    useEffect(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return;
        let matched:
            | {
                  catId: number;
                  subId: number;
                  leaf: (typeof categories)[number]["children"][number]["children"][number];
              }
            | undefined;
        outer: for (const cat of categories) {
            for (const sub of cat.children) {
                for (const leaf of sub.children) {
                    const label = leaf.label.toLowerCase();

                    const [code, ...desc] = leaf.label.split(" ");
                    const description = desc.join(" ").toLowerCase();

                    const isExact = label === keyword || code.toLowerCase() === keyword || description === keyword;

                    if (isExact && !!leaf.code) {
                        matched = {
                            catId: cat.id,
                            subId: sub.id,
                            leaf,
                        };
                        break outer;
                    }
                }
            }
        }
        if (!matched) return;
        setExpandedIds((prev) => [...new Set([...prev, matched!.catId, matched!.subId])]);
        const [code, ...desc] = matched.leaf.label.split(" ");
        handleSelectLeaf(
            code,
            desc.join(" "),
            matched.leaf.id,
            matched.leaf.standardMedicalExpenseId,
            matched.leaf.inputToStandardMappingId,
            matched.leaf.maximumLimit
        );
    }, [searchText, categories]);

    useEffect(() => {
        if (isFrequentLoading) return;
        if (frequentItems.length === 0) return;
        if (items.length > 0) return;

        formikClaimLine.setFieldValue("items", frequentItems);
        dispatch(setFilledClaimLineItems(frequentItems));
    }, [frequentItems, isFrequentLoading]);
    return {
        formikClaimLine,
        expenseItems: items,
        frequentItems,
        isFrequentLoading,
        caseAdjudicationId,
        showAddPanel,
        setShowAddPanel,
        searchText,
        setSearchText,
        expandedIds,
        handleToggleExpand,
        selectedItem,
        selectedLeafId,
        handleSelectLeaf,
        pendingAmount,
        setPendingAmount,
        pendingDiscount,
        setPendingDiscount,
        pendingNotCovered,
        setPendingNotCovered,
        pendingReason,
        setPendingReason,
        pendingRemark,
        setPendingRemark,
        handleAddToTable,
        handleUpdateItem,
        handleRemoveItem,
        totalReceipt,
        totalClaim,
        totalDiscount,
        totalNotCovered,
        netClaimAmount,
        notCoveredReasonOptions,
        isNonCoveredReasonLoading,
        insuranceCompanyOptions,
        insuranceCompanyLoading,
        filteredCategories,
        isCategoryLoading,
        handleNext,
        discountError,
        notCoveredError,
        reasonError,
        setDiscountError,
        setNotCoveredError,
        setReasonError,
        hasDiscountError,
        hasNotCoveredError,
        hasReasonError,
        hasAnyAmount,
        isMedicalCoverage,
        pendingReceiptAmount,
        setPendingReceiptAmount,
    };
};

export default useClaimExpenseDetailHook;

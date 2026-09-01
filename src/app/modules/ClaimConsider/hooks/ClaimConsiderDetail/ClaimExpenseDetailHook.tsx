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
import { applyMaximumLimit, hasAmountSumError, toAmount } from "../../../ClaimSimulate/store/Claimsimulateutils";
import { swalError } from "../../../_common";
import { ClaimExpenseItem, setFilledClaimLineItems } from "../../store/claimConsiderSlice";
import { useGetStandardMedicalExpenseByCase } from "../../../../api/coreClaimApi";
const mapCategoriesToTree = (data: StandardMedicalExpenseCategoryDtoResponse[]) =>
    data
        .map((cat) => {
            const children = (cat.inputToStandardSubCategoryList ?? [])
                .map((sub) => {
                    const leaves = (sub.inputToStandardMappingList ?? []).map((item) => ({
                        id: item.inputToStandardMappingId ?? 0,
                        standardMedicalExpenseId: item.standardMedicalExpenseId,
                        code: item.inputItemCode ?? "",
                        label: `${item.inputItemCode ?? ""} ${item.descriptionTH ?? ""}`.trim(),
                        bodyPartId: item.bodyPartId,
                        maximumLimit: item.maximumLimit,
                        children: [],
                    }));

                    if (leaves.length === 0) return null;

                    return {
                        id: sub.inputToStandardSubCategoryId ?? 0,
                        label: sub.inputToStandardSubCategoryName ?? "",
                        children: leaves,
                    };
                })
                .filter((sub): sub is NonNullable<typeof sub> => sub !== null);

            if (children.length === 0) return null;

            return {
                id: cat.inputToStandardCategoryId ?? 0,
                label: cat.inputToStandardCategoryName ?? "",
                children,
            };
        })
        .filter((cat): cat is NonNullable<typeof cat> => cat !== null);
interface ClaimLineFormValues {
    items: ClaimExpenseItem[];
}
const useClaimExpenseDetailHook = () => {
    const dispatch = useDispatch();
    const { customerDetailData, detailData } = useConsiderDetailHook();
    const { filledItems, form } = useSelector((s: RootState) => s.claimConsider);
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
        form.coverageTypeId,
        form.medicalTypeId,
        true,
        customerDetailData?.data?.productTypeId,
        customerDetailData?.data?.productId,
        undefined
    );
    // ── รายการเพิ่มเติม (หมวดหมู่) ───────────────────────────────────────────
    const { data: categoryData, isLoading: isCategoryLoading } = useGetSimBCategory(
        6, //simb2
        form.coverageTypeId,
        form.medicalTypeId,
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
            reason: item.nonCoveredReasonId ?? undefined,
            remark: item.remark ?? undefined,
            color: item.backgroundColorCode ?? "#FFD6D6",
            disabled: false,
            bodyPartId: item.bodyPartId,
            maximumLimit: item.maximumLimit,
            caseItemId: item.caseItemId,
        }));
    }, [frequentData]);
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

    const hasAnyAmount = items.some((item) => Number(item.claimAmount ?? 0) > 0);
    const hasDiscountError = items.some((item) => Number(item.discount ?? 0) > Number(item.claimAmount ?? 0));
    const hasNotCoveredError = items.some((item) => hasAmountSumError(item));
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
        // if (hasReasonError) {
        //     swalError("ไม่สามารถดำเนินการต่อได้", "กรุณาเลือกสาเหตุไม่คุ้มครองให้ครบทุกรายการที่มียอดไม่คุ้มครอง");
        //     return false;
        // }

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
            matched.leaf.id, //inputToStandardMappingId
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
        hasAnyAmount,
        pendingReceiptAmount,
        setPendingReceiptAmount,
    };
};

export default useClaimExpenseDetailHook;

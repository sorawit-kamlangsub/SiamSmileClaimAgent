import { useState, useMemo, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { ClaimLineItem, resetSimulateItems, setFilledItems, setMedicalTypeId } from "../store/claimSimulateSlice";
import { StandardMedicalExpenseCategoryDtoResponse } from "../../../api/coreClaimApi.client";
import { useGetSimB, useGetSimBCategory, useGetNonCoveredReason } from "../../../api/coreClaimMastersApi";
import { toAmount, hasAmountSumError, applyMaximumLimit } from "../store/Claimsimulateutils";
import { swalError } from "../../_common/sweetAlert";

// ─── แปลง API response → TreeNode ────────────────────────────────────────────
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
    items: ClaimLineItem[];
}

export const useClaimLineCalculate = () => {
    const dispatch = useDispatch();
    const { filledItems, header, selectedInsured } = useSelector((s: RootState) => s.claimsimulate);
    const medicalType = header.medicalType;
    const causeOfIncident = header.causeOfIncident;
    const formatTypeId = header.formatTypeId;
    const coverageTypeId = header.coverageType;
    const productTypeId = selectedInsured?.productTypeId;
    const patientTypeId = medicalType ?? causeOfIncident;
    const planId = selectedInsured?.productId;

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const [selectedItem, setSelectedItem] = useState<{
        code: string;
        description: string;
        standardMedicalExpenseId?: number;
        bodyPartId?: number;
        maximumLimit?: number;
    } | null>(null);

    const [selectedLeafId, setSelectedLeafId] = useState<number | null>(null);
    const [pendingAmount, setPendingAmount] = useState("");
    const [pendingDiscount, setPendingDiscount] = useState("");
    const [pendingNotCovered, setPendingNotCovered] = useState("");
    const [pendingReason, setPendingReason] = useState<number | undefined>(undefined);
    const [discountError, setDiscountError] = useState("");
    const [notCoveredError, setNotCoveredError] = useState("");
    const [reasonError, setReasonError] = useState("");

    const formik = useFormik<ClaimLineFormValues>({
        initialValues: { items: filledItems },
        onSubmit: () => {},
    });

    const items = formik.values.items;

    // ── รายการที่ใช้บ่อย: isUseOften=true ───────────────────────────────────
    const { data: frequentData, isLoading: isFrequentLoading } = useGetSimB(
        formatTypeId,
        coverageTypeId,
        medicalType,
        true,
        productTypeId,
        causeOfIncident,
        planId
    );

    // ── รายการเพิ่มเติม (หมวดหมู่) ───────────────────────────────────────────
    const { data: categoryData, isLoading: isCategoryLoading } = useGetSimBCategory(
        formatTypeId,
        coverageTypeId,
        medicalType,
        productTypeId,
        causeOfIncident,
        planId
    );
    // ── สาเหตุไม่คุ้มครอง  ─────────────────────────
    const { data: nonCoveredReasonData, isLoading: isNonCoveredReasonLoading } = useGetNonCoveredReason();

    const notCoveredReasonOptions = useMemo(() => {
        const raw = nonCoveredReasonData?.data ?? [];
        return raw.map((r) => ({
            value: r.nonCoveredReasonId,
            label: r.nonCoveredReasonName ?? "-",
        }));
    }, [nonCoveredReasonData]);

    const frequentItems = useMemo((): ClaimLineItem[] => {
        const raw = frequentData?.data ?? [];
        return raw.map((item, idx) => ({
            id: item.inputToStandardMappingId ?? idx,
            standardMedicalExpenseId: item.standardMedicalExpenseId,
            code: item.inputItemCode ?? "",
            description: item.descriptionTH ?? "",
            claimAmount: undefined,
            discount: undefined,
            notCovered: undefined,
            reason: undefined,
            remark: "",
            color: item.backgroundColorCode ?? "#FFD6D6",
            disabled: false,
            bodyPartId: item.bodyPartId,
            maximumLimit: item.maximumLimit,
        }));
    }, [frequentData]);

    const categories = useMemo(() => {
        const raw = categoryData?.data ?? [];
        setExpandedIds([]);
        setSelectedItem(null);
        setSelectedLeafId(null);
        return mapCategoriesToTree(raw);
    }, [categoryData]);

    // ── Filter ────────────────────────────────────────────────────────────────
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
            matched.leaf.bodyPartId,
            matched.leaf.maximumLimit
        );
    }, [searchText, categories]);

    const totalClaim = items.reduce((s, i) => s + (i.claimAmount || 0), 0);
    const totalDiscount = items.reduce((s, i) => s + (i.discount || 0), 0);
    const totalNotCovered = items.reduce((s, i) => s + (i.notCovered || 0), 0);
    const netAmount = totalClaim - totalDiscount - totalNotCovered;

    const syncItemsToRedux = (next: ClaimLineItem[]) => dispatch(setFilledItems(next));

    // const handleUpdateItem = (item: ClaimLineItem) => {
    //     const next = items.map((i) => (i.id === item.id ? item : i));
    //     formik.setFieldValue("items", next);
    //     syncItemsToRedux(next);
    // };

    const handleUpdateItem = (item: ClaimLineItem) => {
        const adjusted = applyMaximumLimit({
            claimAmount: Number(item.claimAmount ?? 0),
            discount: Number(item.discount ?? 0),
            notCovered: Number(item.notCovered ?? 0),
            reason: item.reason,
            maximumLimit: item.maximumLimit,
        });

        const nextItem: ClaimLineItem = {
            ...item,
            claimAmount: adjusted.claimAmount,
            notCovered: adjusted.notCovered,
            reason: adjusted.reason,
        };

        const next = items.map((i) => (i.id === nextItem.id ? nextItem : i));
        formik.setFieldValue("items", next);
        syncItemsToRedux(next);
    };

    const handleRemoveItem = (id: number) => {
        const next = items.filter((i) => i.id !== id);
        formik.setFieldValue("items", next);
        syncItemsToRedux(next);
    };

    const handleToggleExpand = (id: number) =>
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSelectLeaf = (
        code: string,
        description: string,
        id: number,
        standardMedicalExpenseId?: number,
        bodyPartId?: number,
        maximumLimit?: number
    ) => {
        setSelectedItem({
            code,
            description,
            standardMedicalExpenseId,
            bodyPartId,
            maximumLimit,
        });
        setSelectedLeafId(id);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason(undefined);
        setDiscountError("");
        setNotCoveredError("");
        setReasonError("");
    };

    const hasAnyAmount = items.some((item) => Number(item.claimAmount ?? 0) > 0);
    const hasDiscountError = items.some((item) => Number(item.discount ?? 0) > Number(item.claimAmount ?? 0));
    const hasNotCoveredError = items.some((item) => hasAmountSumError(item));
    // const hasReasonError = items.some((item) => hasMissingReasonError(item));

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
        // const amount = toAmount(pendingAmount);
        // const discount = toAmount(pendingDiscount);
        // const notCovered = toAmount(pendingNotCovered);

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

        const newItem: ClaimLineItem = {
            id: Date.now(),
            standardMedicalExpenseId: selectedItem.standardMedicalExpenseId,
            code: selectedItem.code,
            description: selectedItem.description,
            claimAmount: amount,
            discount: discount,
            notCovered: notCovered,
            reason: reason,
            remark: undefined,
            disabled: false,
            bodyPartId: selectedItem.bodyPartId,
            maximumLimit: selectedItem.maximumLimit,
        };

        const next = [...items, newItem];
        formik.setFieldValue("items", next);
        syncItemsToRedux(next);

        setSelectedItem(null);
        setSelectedLeafId(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason(undefined);
        setDiscountError("");
        setNotCoveredError("");
        setReasonError("");
    };

    const headerDetailSignature = [
        header.claimCause,
        header.coverageType,
        header.medicalType,
        header.causeOfIncident,
        header.formatTypeId,
    ].join("|");
    const prevHeaderDetailSignatureRef = useRef(headerDetailSignature);
    useEffect(() => {
        if (prevHeaderDetailSignatureRef.current === headerDetailSignature) return;
        prevHeaderDetailSignatureRef.current = headerDetailSignature;

        formik.setFieldValue("items", []);
        dispatch(resetSimulateItems());
        setSelectedItem(null);
        setSelectedLeafId(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason(undefined);
    }, [headerDetailSignature]);

    useEffect(() => {
        if (!patientTypeId) return;
        if (isFrequentLoading) return;
        if (frequentItems.length === 0) return;
        if (items.length > 0) return;

        formik.setFieldValue("items", frequentItems);
        dispatch(setFilledItems(frequentItems));
    }, [patientTypeId, frequentItems, isFrequentLoading]);

    const filterFilledItems = (items: ClaimLineItem[]) =>
        items.filter((item) => {
            const hasClaimAmount = item.claimAmount !== undefined && item.claimAmount !== null;
            const hasDiscount = item.discount !== undefined && item.discount !== null;
            const hasNotCovered = item.notCovered !== undefined && item.notCovered !== null;
            const hasReason = item.reason !== undefined && item.reason !== null;
            const hasRemark = !!item.remark?.trim();

            return hasClaimAmount || hasDiscount || hasNotCovered || hasReason || hasRemark;
        });

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

        dispatch(setFilledItems(filteredItems));
        dispatch(setMedicalTypeId(medicalType));
        return true;
    };

    return {
        claimLineFormik: formik,
        filledItems: items,
        medicalType,
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
        handleAddToTable,
        handleUpdateItem,
        handleRemoveItem,
        totalClaim,
        totalDiscount,
        totalNotCovered,
        netAmount,
        notCoveredReasonOptions,
        isNonCoveredReasonLoading,
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
        // hasReasonError,
        hasAnyAmount,
    };
};

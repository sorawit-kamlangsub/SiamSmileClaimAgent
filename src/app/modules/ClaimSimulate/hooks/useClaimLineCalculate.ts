import { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { ClaimLineItem, resetSimulateItems, setFilledItems, setMedicalTypeId } from "../store/claimSimulateSlice";
import { NOT_COVERED_REASON_OPTIONS } from "../store/claimSimulateOptions";
import { StandardMedicalExpenseCategoryDtoResponse } from "../../../api/claimAgentApi.client";
import { useGetSimBCategory, useGetSimB } from "../../../api/claimAgentMaster"; // ปรับ path ตามโปรเจกต์

// ─── แปลง API response → TreeNode ────────────────────────────────────────────
const mapCategoriesToTree = (data: StandardMedicalExpenseCategoryDtoResponse[]) =>
    data.map((cat) => ({
        id: cat.inputToStandardCategoryId ?? 0,
        label: cat.inputToStandardCategoryName ?? "",
        children: (cat.inputToStandardSubCategoryList ?? []).map((sub) => ({
            id: sub.inputToStandardSubCategoryId ?? 0,
            label: sub.inputToStandardSubCategoryName ?? "",
            children: (sub.inputToStandardMappingList ?? []).map((item) => ({
                id: item.inputToStandardMappingId ?? 0,
                label: `${item.inputItemCode ?? ""} ${item.descriptionTH ?? ""}`.trim(),
                children: [],
            })),
        })),
    }));

interface ClaimLineFormValues {
    items: ClaimLineItem[];
}

export const useClaimLineCalculate = (onNext?: () => void) => {
    const dispatch = useDispatch();
    const { filledItems, header } = useSelector((s: RootState) => s.claimsimulate);
    const medicalType = header.medicalType;

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const [selectedItem, setSelectedItem] = useState<{ code: string; description: string } | null>(null);
    const [selectedLeafId, setSelectedLeafId] = useState<number | null>(null);
    const [pendingAmount, setPendingAmount] = useState("");
    const [pendingDiscount, setPendingDiscount] = useState("");
    const [pendingNotCovered, setPendingNotCovered] = useState("");
    const [pendingReason, setPendingReason] = useState("");
    const [discountError, setDiscountError] = useState("");
    const [notCoveredError, setNotCoveredError] = useState("");

    // ── Formik เป็น single source of truth สำหรับตารางรายการค่าใช้จ่าย ──────
    // (ไม่ใช้ enableReinitialize เพื่อเลี่ยง infinite loop กับ useEffect ด้านล่าง
    //  ค่าเริ่มต้นมาจาก redux ครั้งแรกเท่านั้น ส่วนการ sync กลับ redux ทำใน event handler)
    const formik = useFormik<ClaimLineFormValues>({
        initialValues: { items: filledItems },
        onSubmit: () => {},
    });

    const items = formik.values.items;

    // ── รายการที่ใช้บ่อย: isUseOften=true ───────────────────────────────────
    const { data: frequentData, isLoading: isFrequentLoading } = useGetSimB(3, medicalType, true);

    // ── รายการเพิ่มเติม (หมวดหมู่) ───────────────────────────────────────────
    const { data: categoryData, isLoading: isCategoryLoading } = useGetSimBCategory(3, medicalType);

    // ── แปลง frequentData → filledItems format ────────────────────────────────
    const frequentItems = useMemo((): ClaimLineItem[] => {
        const raw = frequentData?.data ?? [];
        return raw.map((item, idx) => ({
            id: item.inputToStandardMappingId ?? idx,
            code: item.inputItemCode ?? "",
            description: item.descriptionTH ?? "",
            claimAmount: undefined,
            discount: undefined,
            notCovered: undefined,
            reason: "",
            remark: "",
            color: item.backgroundColorCode ?? "#FFD6D6",
            disabled: false,
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
        const keyword = searchText.toLowerCase();
        return categories
            .map((cat) => {
                const matchedChildren = cat.children.filter(
                    (sub) =>
                        sub.label.toLowerCase().includes(keyword) ||
                        sub.children.some((leaf) => leaf.label.toLowerCase().includes(keyword))
                );
                if (cat.label.toLowerCase().includes(keyword) || matchedChildren.length > 0) {
                    return { ...cat, children: matchedChildren.length > 0 ? matchedChildren : cat.children };
                }
                return null;
            })
            .filter(Boolean) as typeof categories;
    }, [categories, searchText]);

    // ── ยอดรวม ────────────────────────────────────────────────────────────────
    const totalClaim = items.reduce((s, i) => s + (i.claimAmount || 0), 0);
    const totalDiscount = items.reduce((s, i) => s + (i.discount || 0), 0);
    const totalNotCovered = items.reduce((s, i) => s + (i.notCovered || 0), 0);
    const netAmount = totalClaim - totalDiscount - totalNotCovered;

    // ── sync formik → redux (เรียกจาก event handler เท่านั้น ไม่ผูกกับ useEffect) ──
    const syncItemsToRedux = (next: ClaimLineItem[]) => dispatch(setFilledItems(next));

    // ── CRUD (อ่าน/เขียนผ่าน formik แล้ว sync ออก redux) ───────────────────────
    const handleUpdateItem = (item: ClaimLineItem) => {
        const next = items.map((i) => (i.id === item.id ? item : i));
        formik.setFieldValue("items", next);
        syncItemsToRedux(next);
    };

    const handleRemoveItem = (id: number) => {
        const next = items.filter((i) => i.id !== id);
        formik.setFieldValue("items", next);
        syncItemsToRedux(next);
    };

    // ── Tree ──────────────────────────────────────────────────────────────────
    const handleToggleExpand = (id: number) =>
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSelectLeaf = (code: string, description: string, id: number) => {
        setSelectedItem({ code, description });
        setSelectedLeafId(id);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason("");
    };

    // ── เพิ่มลงตาราง ─────────────────────────────────────────────────────────
    const hasAnyAmount = items.some((item) => Number(item.claimAmount ?? 0) > 0);
    const hasDiscountError = items.some((item) => Number(item.discount ?? 0) > Number(item.claimAmount ?? 0));
    const hasNotCoveredError = items.some(
        (item) =>
            Number(item.discount ?? 0) <= Number(item.claimAmount ?? 0) &&
            Number(item.notCovered ?? 0) > Number(item.claimAmount ?? 0) - Number(item.discount ?? 0)
    );

    const handleAddToTable = () => {
        if (!selectedItem) return;
        const amount = parseFloat(pendingAmount || "0");
        const discount = parseFloat(pendingDiscount || "0");
        const notCovered = parseFloat(pendingNotCovered || "0");

        let hasError = false;
        if (discount > amount) {
            setDiscountError("ส่วนลดต้องไม่มากกว่ายอดเบิก");
            hasError = true;
        } else {
            setDiscountError("");
        }
        if (notCovered > amount - discount) {
            setNotCoveredError("ยอดไม่คุ้มครองต้องไม่มากกว่ายอดเบิกหลังหักส่วนลด");
            hasError = true;
        } else {
            setNotCoveredError("");
        }
        if (hasError) return;

        const newItem: ClaimLineItem = {
            id: Date.now(),
            code: selectedItem.code,
            description: selectedItem.description,
            claimAmount: amount || 0,
            discount: discount || 0,
            notCovered: notCovered || 0,
            reason: pendingReason,
            remark: "",
            disabled: false,
        };

        const next = [...items, newItem];
        formik.setFieldValue("items", next);
        syncItemsToRedux(next);

        setSelectedItem(null);
        setSelectedLeafId(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason("");
    };

    // ── เปลี่ยนประเภทการรักษา → reset รายการ (ทั้ง formik และ redux) ──────────
    useEffect(() => {
        if (!medicalType) return;
        formik.setFieldValue("items", []);
        dispatch(resetSimulateItems());
        setSelectedItem(null);
        setSelectedLeafId(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medicalType]);

    // ── โหลดรายการที่ใช้บ่อยเข้า formik + redux ─────────────────────────────
    useEffect(() => {
        if (!medicalType) return;
        if (isFrequentLoading) return;
        if (frequentItems.length === 0) return;

        formik.setFieldValue("items", frequentItems);
        dispatch(setFilledItems(frequentItems));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medicalType, frequentItems, isFrequentLoading]);

    // ── ถัดไป ─────────────────────────────────────────────────────────────────
    const handleNext = () => {
        syncItemsToRedux(items);
        dispatch(setMedicalTypeId(medicalType));
        onNext?.();
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
        notCoveredReasonOptions: NOT_COVERED_REASON_OPTIONS,
        filteredCategories,
        isCategoryLoading,
        handleNext,
        discountError,
        notCoveredError,
        setDiscountError,
        setNotCoveredError,
        hasDiscountError,
        hasNotCoveredError,
        hasAnyAmount,
    };
};

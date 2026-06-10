import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import { ClaimLineItem, removeFilledItem, setFilledItems, updateFilledItem } from "../../store/claimSimulateSlice";
import { MOCK_FREQUENT_ITEMS, NOT_COVERED_REASON_OPTIONS } from "../../store/mockClaimLine";
import { StandardMedicalExpenseCategoryDtoResponse } from "../../../../api/claimAgentApi.client";
import { useGetSimBCategory } from "../../../../api/claimAgentApi";

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

export const useClaimLineCalculate = (onNext?: () => void) => {
    const dispatch = useDispatch();
    const { filledItems } = useSelector((s: RootState) => s.claimsimulate);

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const [selectedItem, setSelectedItem] = useState<{ code: string; description: string } | null>(null);
    const [selectedLeafId, setSelectedLeafId] = useState<number | null>(null);
    const [pendingAmount, setPendingAmount] = useState("");
    const [pendingDiscount, setPendingDiscount] = useState("");
    const [pendingNotCovered, setPendingNotCovered] = useState("");
    const [pendingReason, setPendingReason] = useState("");

    // ── Fetch API ─────────────────────────────────────────────────────────────
    const { data: categoryData, isLoading: isCategoryLoading } = useGetSimBCategory(3, 2);

    // ── แปลง response → tree ──────────────────────────────────────────────────
    const categories = useMemo(() => {
        const raw = categoryData?.data ?? [];
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
    const totalClaim = filledItems.reduce((s, i) => s + (parseFloat(i.claimAmount) || 0), 0);
    const totalDiscount = filledItems.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0);
    const totalNotCovered = filledItems.reduce((s, i) => s + (parseFloat(i.notCovered) || 0), 0);
    const netAmount = totalClaim - totalDiscount - totalNotCovered;

    // ── init รายการที่ใช้บ่อย ─────────────────────────────────────────────────
    const initItems = () => {
        if (filledItems.length === 0) {
            dispatch(setFilledItems(MOCK_FREQUENT_ITEMS));
        }
    };

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const handleUpdateItem = (item: ClaimLineItem) => dispatch(updateFilledItem(item));
    const handleRemoveItem = (id: number) => dispatch(removeFilledItem(id));

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
    const handleAddToTable = () => {
        if (!selectedItem) return;
        const newItem: ClaimLineItem = {
            id: Date.now(),
            code: selectedItem.code,
            description: selectedItem.description,
            claimAmount: pendingAmount,
            discount: pendingDiscount,
            notCovered: pendingNotCovered,
            reason: pendingReason,
            remark: "",
            color: "#D6E4FF",
            disabled: false,
        };
        dispatch(setFilledItems([...filledItems, newItem]));
        setSelectedItem(null);
        setSelectedLeafId(null);
        setPendingAmount("");
        setPendingDiscount("");
        setPendingNotCovered("");
        setPendingReason("");
    };

    // ── ถัดไป ─────────────────────────────────────────────────────────────────
    const handleNext = () => {
        dispatch(setFilledItems([...filledItems]));
        onNext?.();
    };

    return {
        filledItems,
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
        initItems,
        handleNext,
    };
};

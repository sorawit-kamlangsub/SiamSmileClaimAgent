import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import {
    ClaimLineItem,
    removeFilledItem,
    setFilledItems,
    setPatianTypeId,
    updateFilledItem,
} from "../../store/claimSimulateSlice";
import { NOT_COVERED_REASON_OPTIONS } from "../../store/mockClaimLine";
import { StandardMedicalExpenseCategoryDtoResponse } from "../../../../api/claimAgentApi.client";
import { useGetSimBCategory } from "../../../../api/claimAgentMaster";
import { useGetSimB } from "../../../../api/claimAgentMaster"; // ปรับ path ตามโปรเจกต์

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
    const patientType = useSelector((s: RootState) => s.claimline.header.patientType);

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const [selectedItem, setSelectedItem] = useState<{ code: string; description: string } | null>(null);
    const [selectedLeafId, setSelectedLeafId] = useState<number | null>(null);
    const [pendingAmount, setPendingAmount] = useState("");
    const [pendingDiscount, setPendingDiscount] = useState("");
    const [pendingNotCovered, setPendingNotCovered] = useState("");
    const [pendingReason, setPendingReason] = useState("");

    // ── รายการที่ใช้บ่อย: isUseOften=true ───────────────────────────────────
    const { data: frequentData, isLoading: isFrequentLoading } = useGetSimB(3, patientType, true);

    // ── รายการเพิ่มเติม (หมวดหมู่) ───────────────────────────────────────────
    const { data: categoryData, isLoading: isCategoryLoading } = useGetSimBCategory(3, patientType);

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
    const totalClaim = filledItems.reduce((s, i) => s + (i.claimAmount || 0), 0);
    const totalDiscount = filledItems.reduce((s, i) => s + (i.discount || 0), 0);
    const totalNotCovered = filledItems.reduce((s, i) => s + (i.notCovered || 0), 0);
    const netAmount = totalClaim - totalDiscount - totalNotCovered;

    const initItems = () => {
        if (filledItems.length === 0 && frequentItems.length > 0) {
            dispatch(setFilledItems(frequentItems));
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
            claimAmount: parseFloat(pendingAmount.toString()) || 0,
            discount: parseFloat(pendingDiscount.toString()) || 0,
            notCovered: parseFloat(pendingNotCovered.toString()) || 0,
            reason: pendingReason,
            remark: "",
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
        dispatch(setPatianTypeId(patientType));
        onNext?.();
    };

    return {
        filledItems,
        patientType,
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
        initItems,
        handleNext,
    };
};

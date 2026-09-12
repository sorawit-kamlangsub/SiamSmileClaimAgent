import { useEffect, useMemo, useState } from "react";
import {
    useGetBenefit,
    useGetInsuranceCompany,
    useGetNonCoveredReason,
    useGetSimBCategory,
} from "../../../../api/coreClaimMastersApi";
import { StandardMedicalExpenseCategoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import {
    applyMaximumLimit,
    getClaimAmountReconciliation,
    hasAmountSumError,
    hasMissingReasonError,
    sumClaimExpenseItems,
    toAmount,
} from "../../../ClaimSimulate/store/Claimsimulateutils";
import { swalError } from "../../../_common";
import {
    ClaimExpenseItem,
    setCaseAdjudicationId,
    setDraftExpenseApplied,
    setFilledClaimLineItems,
} from "../../store/claimConsiderSlice";
import { mergeDraftCaseItems } from "../../store/draftRevisionMappers";
import {
    useGetClaimDetailConsider,
    useGetClaimEditDraftRevision,
    useGetCustomerDetailById,
    useGetStandardMedicalExpenseByCase,
} from "../../../../api/coreClaimApi";
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
type UseClaimExpenseDetailHookProps = {
    detailData: ReturnType<typeof useGetClaimDetailConsider>["data"];
    customerDetailData: ReturnType<typeof useGetCustomerDetailById>["data"];
};
// รับ detailData/customerDetailData เป็น param แทนการเรียก useConsiderDetailHook() ซ้ำ (เดิมหน้านี้เรียก hook
// เดียวกัน 3 จุด: ClaimDetailsTab, ExpenseDetails, ที่นี่ — แต่ละจุดยิง React Query hook + Formik ซ้ำชุดเดียวกันหมด
// ทำให้ทุก async response ที่เข้ามาต้อง re-render subtree ทั้งก้อนซ้ำ 3 เท่า เป็นสาเหตุหลักที่หน้าค้างตอนกด "ถัดไป")
const useClaimExpenseDetailHook = ({ detailData, customerDetailData }: UseClaimExpenseDetailHookProps) => {
    const dispatch = useDispatch();
    const { filledItems, filledItemsCaseId, form, viewingDraft, draftExpenseAppliedRevisionId } = useSelector(
        (s: RootState) => s.claimConsider
    );
    const caseId = detailData?.data?.caseId;
    // filledItems เป็น global redux state ข้ามหน้าได้ (ดู docs/modules/ClaimConsider.md) — ตอน remount
    // เข้าเคสใหม่ resetState() ที่ unmount หน้าเก่าอาจมาไม่ทัน useFormik lazy-init ด้านล่างเสมอ (React
    // render ก่อน effect) จึงต้องเชื่อ filledItems เฉพาะตอน caseId ที่แปะมาตรงกับเคสที่กำลังดูอยู่จริงเท่านั้น
    const trustedFilledItems = filledItemsCaseId && filledItemsCaseId === caseId ? filledItems : [];
    const draftRevisionId = viewingDraft?.draftRevisionId;
    // queryKey เดียวกับใน ConsiderDetailHook — React Query แชร์ cache กัน ไม่ยิง request ซ้ำ
    const { data: draftRevision } = useGetClaimEditDraftRevision(draftRevisionId);
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
    const syncItemsToRedux = (next: ClaimExpenseItem[]) => dispatch(setFilledClaimLineItems({ items: next, caseId }));

    const formikClaimLine = useFormik<ClaimLineFormValues>({
        initialValues: { items: trustedFilledItems },
        onSubmit: () => {},
    });
    const items = formikClaimLine.values.items;

    // ── รายการที่ใช้บ่อย: isUseOften=true ───────────────────────────────────
    const {
        data: frequentData,
        isLoading: isFrequentLoading,
        isFetching: isFrequentFetching,
    } = useGetStandardMedicalExpenseByCase(
        detailData?.data?.caseId ?? "",
        6, //simb2
        coverageTypeId,
        medicalTypeId,
        true,
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
            // ใช้ idx (unique เสมอในอาร์เรย์นี้) แทน inputToStandardMappingId เพราะ id นี้เป็นของ
            // "ประเภทรายการ" ซึ่งหลายแถวค่ารักษาอาจใช้ค่าเดียวกันซ้ำได้จริงจาก backend (ทำให้ React key ชนกัน)
            id: idx,
            standardMedicalExpenseId: item.standardMedicalExpenseId,
            inputToStandardMappingId: item.inputToStandardMappingId,
            code: item.inputItemCode ?? "",
            description: item.descriptionTH ?? "",
            // ยอดตามใบเสร็จจาก SmileConnect (originalAmount) — สิทธิ์เบิก/ยอดไม่คุ้มครองเป็นค่าที่ User
            // ต้องพิจารณากรอกเอง จึงห้าม default มาจาก fetch (ดูตาราง Field/Source ของ spec)
            receiptAmount: item.originalAmount ?? undefined,
            claimAmount: undefined,
            discount: item.discountAmount ?? undefined,
            notCovered: undefined,
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

    /** benefitId มาระดับ item — case เดียวอาจมีหลายสิทธิ์เบิกพร้อมกัน (เช่น ค่ารักษา + ค่าห้อง) จึงรวมทุกตัวที่ไม่ซ้ำ
     * เพื่อโชว์ชื่อสิทธิ์เบิกทั้งหมดในการ์ด "สิทธิ์เบิก" ไม่ใช่หยิบมาแค่ตัวแรก */
    const benefitIdList = useMemo(
        () => [...new Set(frequentData?.data?.map((item) => item.benefitId).filter((id): id is number => !!id))],
        [frequentData]
    );
    const { data: benefitData } = useGetBenefit(undefined, benefitIdList);
    const benefitName = useMemo(
        () =>
            benefitIdList.length === 0
                ? undefined
                : benefitIdList
                      .map((id) => benefitData?.data?.find((b) => b.benefitId === id)?.benefitName)
                      .filter((name): name is string => !!name)
                      .join(", "),
        [benefitData, benefitIdList]
    );
    // ส่งขึ้น Redux ให้ ClaimStepCalculateHook หยิบไปใส่ payload คำนวณ (คนละ component จึงส่งเป็น prop ไม่ได้)
    useEffect(() => {
        dispatch(setCaseAdjudicationId(caseAdjudicationId));
    }, [dispatch, caseAdjudicationId]);
    const categories = useMemo(() => {
        const raw = categoryData?.data ?? [];
        return mapCategoriesToTree(raw);
    }, [categoryData]);

    // เคลียร์ state ของ tree เมื่อ categoryData เปลี่ยนจริง — ย้ายมาจากใน useMemo ด้านบน
    // (เดิมเรียก setState ระหว่าง render phase ตรงๆ ซึ่งเป็น anti-pattern เสี่ยง re-render เกินจำเป็น)
    useEffect(() => {
        setExpandedIds([]);
        setSelectedItem(null);
        setSelectedLeafId(null);
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

    const { totalReceipt, totalClaim, totalDiscount, totalNotCovered } = sumClaimExpenseItems(items);
    const netClaimAmount = totalClaim - totalDiscount - totalNotCovered; // ยอดเบิกสุทธิ

    // ยอดที่จ่ายจริง = paymentAmount ตัวเดียวกับการ์ด "สรุปรายการแจ้งโอน" (ExpenseDetails.tsx) — ไม่ใช่
    // ค่าที่คำนวณจากรายการค่ารักษาฝั่ง FE เอง เพราะ netClaimAmount ไม่ได้ถูก cap ด้วยยอดใบเสร็จ/สิทธิ์เบิก
    // undefined (ยังไม่ถึงขั้นตอนแจ้งโอน) ใช้ ?? 0 เฉพาะตอนแสดงผลการ์ด — ต้องส่งค่าดิบเข้า reconciliation
    // เพื่อไม่ให้ขึ้น warningDeficit ก่อนมีข้อมูลยอดโอนจริง
    const rawPaymentAmount = detailData?.data?.paymentAmount;
    const paymentAmount = rawPaymentAmount ?? 0;
    const amountReconciliation = getClaimAmountReconciliation({
        totalReceipt,
        totalClaim,
        totalDiscount,
        totalNotCovered,
        paymentAmount: rawPaymentAmount,
    });
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

        dispatch(setFilledClaimLineItems({ items: filteredItems, caseId }));
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
        // ต้องรอ isFrequentFetching (ไม่ใช่แค่ isFrequentLoading) ด้วย: หลังบันทึกผลพิจารณาแล้วกลับเข้าเคสเดิม
        // react-query โชว์ข้อมูลเก่าที่ invalidate ไว้ (isLoading=false เพราะมี cache อยู่แล้ว) ก่อน แล้วค่อย
        // revalidate เบื้องหลัง — ถ้าไม่รอ isFetching ด้วย effect จะ seed ด้วยของเก่าไปก่อน แล้ว guard
        // "items.length > 0" ด้านล่างจะกันไม่ให้ข้อมูลใหม่ที่ revalidate เสร็จเข้ามาแทนที่อีกเลย
        // (อาการ: กลับเข้าเคสเดิมข้อมูลไม่อัปเดต ต้อง refresh ทั้งหน้าถึงจะเห็นของใหม่)
        if (isFrequentLoading || isFrequentFetching) return;
        if (frequentItems.length === 0) return;
        if (items.length > 0) return;

        formikClaimLine.setFieldValue("items", frequentItems);
        dispatch(setFilledClaimLineItems({ items: frequentItems, caseId }));
    }, [frequentItems, isFrequentLoading, isFrequentFetching]);

    // ── overlay ยอดจาก "บันทึกแบบร่าง" (กดดูจากแท็บประวัติการทำรายการ) ──
    // merge ทับ frequentItems เสมอ (ไม่ใช่ items) ผลลัพธ์จึงเหมือนกันไม่ว่า seed effect ด้านบนจะรันไปแล้วหรือยัง
    // flag "merge แล้ว" เก็บใน Redux ไม่ใช่ ref เพราะ component นี้ (ExpenseDetails) ถูก unmount ทุกครั้งที่
    // สลับออกจาก step "รายละเอียดค่าใช้จ่าย" — ถ้าใช้ ref จะ merge ทับงานที่ผู้ใช้แก้ไปแล้วทุกครั้งที่กลับเข้ามา
    useEffect(() => {
        if (!draftRevisionId) return;
        if (draftExpenseAppliedRevisionId === draftRevisionId) return;
        if (isFrequentLoading || frequentItems.length === 0) return;
        const draftCaseItems = draftRevision?.data?.payload?.case?.caseItem;
        if (!draftCaseItems) return;

        // ใช้แค่ตั้งชื่อแถวที่ผู้ใช้เพิ่มเองตอนทำร่าง — ไม่ gate การ merge ด้วย isCategoryLoading เพราะแถว
        // ปกติ (99% ของเคส) ต้องไม่รอ category tree โหลด ถ้ามาไม่ทันแถวเพิ่มเองจะไม่มีชื่อ ยอมรับได้
        const categoryLeaves = categories.flatMap((cat) => cat.children.flatMap((sub) => sub.children));
        const merged = mergeDraftCaseItems(frequentItems, draftCaseItems, categoryLeaves);
        formikClaimLine.setFieldValue("items", merged);
        dispatch(setFilledClaimLineItems({ items: merged, caseId }));
        dispatch(setDraftExpenseApplied(draftRevisionId));
    }, [draftRevisionId, draftExpenseAppliedRevisionId, draftRevision, frequentItems, isFrequentLoading, categories]);

    return {
        formikClaimLine,
        expenseItems: items,
        frequentItems,
        isFrequentLoading,
        caseAdjudicationId,
        benefitName,
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
        paymentAmount,
        amountReconciliation,
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

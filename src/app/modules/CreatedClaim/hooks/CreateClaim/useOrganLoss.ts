import { useMemo } from "react";
import { GetDisabilityLossPartDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetDisabilityLossPart, useGetNonCoveredReason } from "../../../../api/coreClaimMastersApi";
import { getOrganChoice, OrganChoiceWithId, OrganRuleResult } from "./organLoss.types";
import { useGetBodyPartByDisabilityLossPart } from "../../../../api/coreClaimMastersApi";
import { BodyPartOption, ComboBodyPartOption, SidePickOption } from "./organLoss.types";
import { useCalculateCaseDisability } from "../../../../api/coreClaimApi";

const API_CODE_TO_ORGAN_KEY: Record<string, string> = {
    HAND: "hand",
    FOOT: "foot",
    EYE: "eye",
    EAR: "ear",
    FINGER: "finger",
    TOE: "toe",
    HAND_FOOT: "hand_foot",
    HAND_EYE: "hand_eye",
    FOOT_EYE: "foot_eye",
    PARTIAL_DISABILITY: "partial_disability",
    PERMANENT_DISABILITY: "permanent_disability",
    EXGRATIA: "exgratia",
};

const mapToOrganChoice = (item: GetDisabilityLossPartDtoResponse): OrganChoiceWithId | null => {
    const organKey = API_CODE_TO_ORGAN_KEY[item.disabilityLossPartCode || ""];

    if (!organKey) {
        console.warn("Unmapped disabilityLossPartCode:", item.disabilityLossPartCode);
        return null;
    }

    const staticChoice = getOrganChoice(organKey);
    if (!staticChoice) return null;

    const backendLabel = item.disabilityLossPartNameTH?.trim();

    return {
        ...staticChoice,
        label: backendLabel ? backendLabel : staticChoice.label,
        disabilityLossPartId: item.disabilityLossPartId || 0,
    };
};
export const useOrganLoss = () => {
    const { data: LossPartData, isLoading: LossPartDataLoading } = useGetDisabilityLossPart();
    const { data: nonCoveredReasonData, isLoading: isNonCoveredReasonLoading } = useGetNonCoveredReason();
    const organChoices: OrganChoiceWithId[] = useMemo(() => {
        return (LossPartData?.data ?? []).map(mapToOrganChoice).filter((c): c is OrganChoiceWithId => c !== null);
    }, [LossPartData]);

    return {
        organChoices,
        isOrganChoicesLoading: LossPartDataLoading,
        nonCoveredReasonData,
        isNonCoveredReasonLoading,
    };
};

// ── กรณีที่ 1: อวัยวะเดี่ยว (มือ, เท้า, ตา, หู) ──
export const useSingleBodyPartOptions = (disabilityLossPartId: number | undefined) => {
    const { data, isLoading } = useGetBodyPartByDisabilityLossPart(disabilityLossPartId);

    const options: BodyPartOption[] = useMemo(() => {
        return (data?.data ?? []).map((item) => ({
            bodyPartId: item.bodyPartId ?? 0,
            bodyPartName: item.bodyPartName ?? "",
            disabilitySideId: item.disabilitySideId ?? 0,
            disabilitySideName: item.disabilitySideName ?? "",
            standardMedicalExpenseId: item.standardMedicalExpenseId ?? 0,
        }));
    }, [data]);

    const findByBodyPartId = (bodyPartId: number | undefined): BodyPartOption | undefined => {
        if (bodyPartId === undefined) return undefined;
        return options.find((o) => o.bodyPartId === bodyPartId);
    };

    return { options, isLoading, findByBodyPartId };
};

// ── กรณีที่ 2: combo (มือ+เท้า, มือ+ตา, เท้า+ตา) ──
export const useComboBodyPartOptions = (comboDisabilityLossPartId: number | undefined) => {
    const { data, isLoading } = useGetBodyPartByDisabilityLossPart(comboDisabilityLossPartId);

    const rows: ComboBodyPartOption[] = useMemo(() => {
        return (data?.data ?? []).map((item) => ({
            bodyPartId: item.bodyPartId ?? 0,
            disabilitySidePart1Id: item.disabilitySidePart1Id ?? 0,
            disabilitySidePart1Name: item.disabilitySidePart1Name ?? "",
            disabilitySidePart2Id: item.disabilitySidePart2Id ?? 0,
            disabilitySidePart2Name: item.disabilitySidePart2Name ?? "",
            standardMedicalExpenseId: item.standardMedicalExpenseId ?? 0,
        }));
    }, [data]);

    const part1Options: SidePickOption[] = useMemo(() => {
        const map = new Map<number, string>();
        rows.forEach((r) => map.set(r.disabilitySidePart1Id, r.disabilitySidePart1Name));
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [rows]);

    const part2Options: SidePickOption[] = useMemo(() => {
        const map = new Map<number, string>();
        rows.forEach((r) => map.set(r.disabilitySidePart2Id, r.disabilitySidePart2Name));
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [rows]);

    const resolveBodyPartId = (part1Id?: number, part2Id?: number): ComboBodyPartOption | undefined => {
        if (part1Id === undefined || part2Id === undefined) return undefined;
        return rows.find((r) => r.disabilitySidePart1Id === part1Id && r.disabilitySidePart2Id === part2Id);
    };
    const findByBodyPartId = (bodyPartId: number | undefined): ComboBodyPartOption | undefined => {
        if (bodyPartId === undefined) return undefined;
        return rows.find((r) => r.bodyPartId === bodyPartId);
    };

    return { part1Options, part2Options, resolveBodyPartId, findByBodyPartId, isLoading };
};

export const useCalculateDisabilityOptions = (
    customerId: number | undefined,
    bodyPartId: number | undefined,
    standardMedicalExpenseId: number | undefined
) => {
    const { data, isLoading } = useCalculateCaseDisability(customerId, bodyPartId, standardMedicalExpenseId);

    const options: OrganRuleResult[] = useMemo(() => {
        const item = data?.data;
        if (!item) return [];

        return [
            {
                description: item.benefitName ?? "",
                percent: item.benefitPercent ?? 0,
                coveredAmount: item.maxPrice ?? 0,
            },
        ];
    }, [data]);

    return { options, isLoading };
};

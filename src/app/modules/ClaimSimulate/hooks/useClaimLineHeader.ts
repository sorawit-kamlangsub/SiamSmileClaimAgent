import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { setClaimLineHeader, setDaysCalculate, setInsuredSearchOpen } from "../store/claimSimulateSlice";
import { COVERAGE_TYPE_ICON_MAP } from "../store/claimSimulateOptions";
import { useGetIncidentType, useGetIncidentTypeMapping, useGetFormatType } from "../../../api/coreClaimMastersApi";

// 6 PH | 10 House | 11 Motor | 26 PA | 27 PAชุมชน | 32 SmilePA | 33 TA | 38 PAPersonnel | 41 PA310 | 42 อัคคีภัย
const PRODUCT_TYPE_GROUP = {
    PH: [6],
};

const CLAIM_SOURCE_ID_SIMULATE = 2;

const COVERAGE_TYPE = { MEDICAL: 2, COMPENSATE: 3, DISABILITY: 4, DEATH: 5 };
const FORMAT_TYPE = { SSS: 2, DISABILITY: 3, DEATH: 4, SIM_B1: 5, SIM_B2: 6 };

const isProductType = (productTypeId: number | undefined, group: number[]) =>
    productTypeId !== undefined && group.includes(productTypeId);

const getNoClaimCauseMessage = (productTypeId?: number) =>
    isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)
        ? "กรุณาเลือกเหตุของการเคลมก่อน ระบบจะแสดงประเภทความคุ้มครองตามผลิตภัณฑ์ PH"
        : "ยังไม่ได้เลือกเหตุของการเคลม เลือกเหตุของการเคลมด้านบนเพื่อระบุประเภทความคุ้มครอง";

const getNoCoverageTypeMessage = (productTypeId?: number) =>
    isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)
        ? "กรุณาเลือกประเภทความคุ้มครองก่อน"
        : "ยังไม่ได้เลือกประเภทความคุ้มครอง เลือกประเภทความคุ้มครองด้านบนเพื่อระบุประเภทความคุ้มครอง";

const dedupeByField = <T, K extends keyof T>(rows: T[], key: K): T[] => {
    const seen = new Set<unknown>();
    return rows.filter((row) => {
        const value = row[key];
        if (value === null || value === undefined || seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

export const useClaimLineHeader = () => {
    const dispatch = useDispatch();
    const selectedInsured = useSelector((s: RootState) => s.claimsimulate.selectedInsured);
    const header = useSelector((s: RootState) => s.claimsimulate.header);
    const [showRequiredErrors, setShowRequiredErrors] = useState(false);

    const productTypeId = (selectedInsured as { productTypeId?: number } | null)?.productTypeId;
    const productCategoryCode = (selectedInsured as { productCategoryCode?: string } | null)?.productCategoryCode;

    const { data: incidentTypeData, isLoading: isClaimCauseLoading } = useGetIncidentType();
    const claimCauseOptions =
        incidentTypeData?.data
            ?.filter((item) => item.incidentTypeId !== 1)
            .map((item) => ({
                value: item.incidentTypeId as number,
                label: item.incidentTypeNameTH ?? "-",
            })) ?? [];

    const { data: formatTypeData, isLoading: isFormatTypeLoading } = useGetFormatType();
    const formatTypeOptionsAll =
        formatTypeData?.data?.map((item) => ({
            value: item.formatTypeId as number,
            label: item.formatTypeName ?? "-",
        })) ?? [];

    const getFormatTypeOptions = (coverageType?: number) => {
        if (coverageType === COVERAGE_TYPE.MEDICAL) {
            return formatTypeOptionsAll.filter((o) =>
                [FORMAT_TYPE.SSS, FORMAT_TYPE.SIM_B1, FORMAT_TYPE.SIM_B2].includes(o.value)
            );
        }
        if (coverageType === COVERAGE_TYPE.COMPENSATE) {
            return formatTypeOptionsAll.filter((o) => o.value === FORMAT_TYPE.SSS);
        }
        if (coverageType === COVERAGE_TYPE.DEATH) {
            return formatTypeOptionsAll.filter((o) => o.value === FORMAT_TYPE.DEATH);
        }
        if (coverageType === COVERAGE_TYPE.DISABILITY) {
            return formatTypeOptionsAll.filter((o) => o.value === FORMAT_TYPE.DISABILITY);
        }
        return [];
    };

    const { data: mappingData, isLoading: isMappingLoading } = useGetIncidentTypeMapping(
        header.claimCause,
        CLAIM_SOURCE_ID_SIMULATE,
        productTypeId,
        PRODUCT_TYPE_GROUP.PH ? undefined : productCategoryCode
    );
    const mappingRows = mappingData?.data ?? [];

    const coverageTypeOptions = dedupeByField(mappingRows, "coverageTypeId").map((row) => ({
        value: row.coverageTypeId as number,
        label: row.coverageTypeNameTH ?? "-",
        icon: COVERAGE_TYPE_ICON_MAP[row.coverageTypeId as number],
    }));

    const rowsForCoverageType = mappingRows.filter((row) => row.coverageTypeId === header.coverageType);

    const medicalTypeOptions = dedupeByField(rowsForCoverageType, "medicalTypeId").map((row) => ({
        value: row.medicalTypeId as number,
        label: row.medicalTypeCode ?? "-",
    }));

    const causeOfIncidentOptions = dedupeByField(rowsForCoverageType, "causeOfIncidentId").map((row) => ({
        value: row.causeOfIncidentId as number,
        label: row.causeOfIncidentName ?? "-",
    }));

    const isMedicalTypeVisible = medicalTypeOptions.length > 0;
    const isCauseOfIncidentVisible = causeOfIncidentOptions.length > 0;

    const formatTypeOptions = getFormatTypeOptions(header.coverageType);

    const handleOpenInsuredSearch = () => dispatch(setInsuredSearchOpen(true));

    const handleSelectClaimCause = (value: number) =>
        dispatch(
            setClaimLineHeader({
                claimCause: value,
                coverageType: undefined,
                medicalType: undefined,
                causeOfIncident: undefined,
                formatTypeId: undefined,
            })
        );

    const handleSelectCoverageType = (value: number) => {
        const rows = mappingRows.filter((row) => row.coverageTypeId === value);
        const nextMedicalTypeRows = dedupeByField(rows, "medicalTypeId");
        const nextCauseOfIncidentRows = dedupeByField(rows, "causeOfIncidentId");
        const nextFormatTypeOptions = getFormatTypeOptions(value);

        const autoMedicalType = nextMedicalTypeRows.length === 1 ? nextMedicalTypeRows[0].medicalTypeId : undefined;
        const autoCauseOfIncident =
            nextCauseOfIncidentRows.length === 1 ? nextCauseOfIncidentRows[0].causeOfIncidentId : undefined;

        dispatch(
            setClaimLineHeader({
                coverageType: value,
                medicalType: autoMedicalType,
                causeOfIncident: autoCauseOfIncident,
                formatTypeId: nextFormatTypeOptions.length === 1 ? nextFormatTypeOptions[0].value : undefined,
            })
        );
        if (autoMedicalType) dispatch(setDaysCalculate({ medicalType: autoMedicalType }));
    };

    useEffect(() => {
        if (!header.claimCause || header.coverageType) return;
        if (coverageTypeOptions.length === 1) {
            handleSelectCoverageType(coverageTypeOptions[0].value);
        }
    }, [header.claimCause, mappingRows.length]);

    const handleSelectFormatType = (formatTypeId: number) => dispatch(setClaimLineHeader({ formatTypeId }));

    const handleSelectMedicalType = (medicalType: number) => {
        dispatch(setClaimLineHeader({ medicalType }));
        dispatch(setDaysCalculate({ medicalType }));
    };

    const handleSelectCauseOfIncident = (causeOfIncident: number) => dispatch(setClaimLineHeader({ causeOfIncident }));

    // ── validation ──
    const isHeaderReady =
        !!header.claimCause &&
        !!header.formatTypeId &&
        (!isMedicalTypeVisible || !!header.medicalType) &&
        (!isCauseOfIncidentVisible || !!header.causeOfIncident);

    const validateHeader = (): string | null => {
        if (!selectedInsured) return "กรุณาค้นหาและเลือกผู้เอาประกันก่อน";
        if (!header.claimCause) return "กรุณาเลือกเหตุของการเคลม";
        if (!header.coverageType) return "กรุณาเลือกประเภทความคุ้มครอง";
        if (!header.formatTypeId) return "กรุณาเลือกประเภทรายการค่าใช้จ่าย";
        if (isMedicalTypeVisible && !header.medicalType) return "กรุณาเลือกประเภทการรักษา";
        return null;
    };

    const validateHeaderAndFlagErrors = (): boolean => {
        const errorMessage = validateHeader();
        if (errorMessage) {
            setShowRequiredErrors(true);
            return false;
        }
        setShowRequiredErrors(false);
        return true;
    };

    return {
        selectedInsured,
        header,
        productTypeId,

        claimCauseOptions,
        isClaimCauseLoading,

        coverageTypeOptions,
        medicalTypeOptions,
        formatTypeOptions,
        causeOfIncidentOptions,
        isMappingLoading,
        isFormatTypeLoading,

        isCauseOfIncidentLocked: causeOfIncidentOptions.length === 1,
        isFormatTypeLocked: formatTypeOptions.length === 1,
        isMedicalTypeLocked: medicalTypeOptions.length === 1,
        isMedicalTypeVisible,
        isCauseOfIncidentVisible,
        isOrganLossVisible: header.coverageType === COVERAGE_TYPE.DISABILITY,
        isHeaderReady,

        noClaimCauseMessage: getNoClaimCauseMessage(productTypeId),
        noCoverageTypeMessage: getNoCoverageTypeMessage(productTypeId),

        handleOpenInsuredSearch,
        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
        handleSelectCauseOfIncident,
        handleSelectFormatType,

        validateHeader,
        showRequiredErrors,
        validateHeaderAndFlagErrors,
    };
};

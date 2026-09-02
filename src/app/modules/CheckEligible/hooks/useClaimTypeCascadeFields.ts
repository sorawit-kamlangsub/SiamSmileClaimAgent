import { useEffect } from "react";
import { FormikProps } from "formik";
import { useGetIncidentType, useGetIncidentTypeMapping } from "../../../api/coreClaimMastersApi";
import { isProductType, PRODUCT_TYPE_GROUP } from "../../../functionHelpers";
import { ToolbarFormValues } from "./useCheckEligibleToolbar";

const CLAIM_SOURCE_ID_CHECK_ELIGIBLE = 2;

const dedupeByField = <T, K extends keyof T>(rows: T[], key: K): T[] => {
    const seen = new Set<unknown>();
    return rows.filter((row) => {
        const value = row[key];
        if (value === null || value === undefined || seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

const NO_CLAIM_CAUSE_MESSAGE = "ยังไม่ได้เลือกเหตุของการเคลม เลือกเหตุของการเคลมด้านบนเพื่อระบุประเภทความคุ้มครอง";
const NO_COVERAGE_TYPE_MESSAGE =
    "ยังไม่ได้เลือกประเภทความคุ้มครอง เลือกประเภทความคุ้มครองด้านบนเพื่อระบุประเภทการรักษา";

export const useClaimTypeCascadeFields = (
    formik: FormikProps<ToolbarFormValues>,
    productTypeId?: number,
    productCategoryCode?: string
) => {
    const { claimCause, coverageType, isContinuous } = formik.values;

    const { data: incidentTypeData, isLoading: isClaimCauseLoading } = useGetIncidentType();
    const claimCauseOptions =
        incidentTypeData?.data
            ?.filter((item) => item.incidentTypeId !== 1)
            .map((item) => ({
                value: item.incidentTypeId as number,
                label: item.incidentTypeNameTH ?? "-",
            })) ?? [];

    const productCategoryCodeParam = isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH)
        ? undefined
        : productCategoryCode;

    const { data: mappingData, isLoading: isMappingLoading } = useGetIncidentTypeMapping(
        claimCause,
        CLAIM_SOURCE_ID_CHECK_ELIGIBLE,
        productTypeId,
        productCategoryCodeParam,
        undefined,
        undefined,
        undefined,
        isContinuous === false ? undefined : true
    );
    const mappingRows = mappingData?.data ?? [];

    const coverageTypeOptions = dedupeByField(mappingRows, "coverageTypeId").map((row) => ({
        value: row.coverageTypeId as number,
        label: row.coverageTypeNameTH ?? "-",
    }));

    const rowsForCoverageType = mappingRows.filter((row) => row.coverageTypeId === coverageType);

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

    const handleSelectClaimCause = (value: number) => {
        formik.setValues({
            ...formik.values,
            claimCause: value,
            coverageType: undefined,
            medicalType: undefined,
            causeOfIncident: undefined,
        });
    };

    const handleSelectCoverageType = (value: number) => {
        const rows = mappingRows.filter((row) => row.coverageTypeId === value);
        const nextMedicalTypeRows = dedupeByField(rows, "medicalTypeId");
        const nextCauseOfIncidentRows = dedupeByField(rows, "causeOfIncidentId");

        const autoMedicalType = nextMedicalTypeRows.length === 1 ? nextMedicalTypeRows[0].medicalTypeId : undefined;
        const autoCauseOfIncident =
            nextCauseOfIncidentRows.length === 1 ? nextCauseOfIncidentRows[0].causeOfIncidentId : undefined;

        formik.setValues({
            ...formik.values,
            coverageType: value,
            medicalType: autoMedicalType,
            causeOfIncident: autoCauseOfIncident,
        });
    };

    useEffect(() => {
        if (!claimCause || coverageType) return;
        if (coverageTypeOptions.length === 1) {
            handleSelectCoverageType(coverageTypeOptions[0].value);
        }
    }, [claimCause, mappingRows.length]);

    const handleSelectMedicalType = (value: number) => formik.setFieldValue("medicalType", value);
    const handleSelectCauseOfIncident = (value: number) => formik.setFieldValue("causeOfIncident", value);

    return {
        claimCauseOptions,
        isClaimCauseLoading,

        coverageTypeOptions,
        isMappingLoading,

        medicalTypeOptions,
        causeOfIncidentOptions,
        isMedicalTypeVisible,
        isCauseOfIncidentVisible,
        isMedicalTypeLocked: medicalTypeOptions.length === 1,
        isCauseOfIncidentLocked: causeOfIncidentOptions.length === 1,

        noClaimCauseMessage: NO_CLAIM_CAUSE_MESSAGE,
        noCoverageTypeMessage: NO_COVERAGE_TYPE_MESSAGE,

        handleSelectClaimCause,
        handleSelectCoverageType,
        handleSelectMedicalType,
        handleSelectCauseOfIncident,
    };
};

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Box, Button, Grid, MenuItem, TextField, Typography } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import FactCheckIcon from "@mui/icons-material/FactCheck";

import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import DocumentScanTable from "../../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import { ClaimConsiderValues } from "../../../../store/claimConsiderSlice";
import { useFormikContext } from "formik";
import { GetDecisionReasonDtoResponse } from "../../../../../../api/coreClaimApi.client";

type ConsiderType = "pendingDocument" | "revision" | "rejected" | "cancelled";

type StatusOption = {
    value: ConsiderType;
    decisionId: number;
    label: string;
    icon: ReactNode;
    color: string;
    softColor: string;
    reasonLabel: string;
    detailLabel: string;
    detailPlaceholder: string;
    subheaderLabel: string;
    requiresAttachment?: boolean;
};

const statusOptions: StatusOption[] = [
    {
        value: "pendingDocument",
        decisionId: 3,
        label: "รอเอกสาร",
        icon: <HourglassTopIcon fontSize="small" />,
        color: "#A87808",
        softColor: "#FFF8E8",
        reasonLabel: "สาเหตุที่ขอเอกสาร",
        detailLabel: "รายละเอียดเอกสารที่ต้องการ",
        detailPlaceholder: "ระบุเอกสารหรือข้อมูลที่ต้องการเพิ่มเติม",
        subheaderLabel: "ขอเอกสารเพิ่มเติม",
    },
    {
        value: "revision",
        decisionId: 4,
        label: "รอแก้ไข",
        icon: <FormatListBulletedIcon fontSize="small" />,
        color: "#806033",
        softColor: "#FAF7F2",
        reasonLabel: "สาเหตุที่ขอแก้ไข",
        detailLabel: "รายละเอียดการแก้ไข",
        detailPlaceholder: "ระบุข้อมูลหรือรายการที่ต้องการให้แก้ไข",
        subheaderLabel: "ขอแก้ไขข้อมูล",
    },
    {
        value: "rejected",
        decisionId: 5,
        label: "ปฏิเสธ",
        icon: <BlockIcon fontSize="small" />,
        color: "#D76451",
        softColor: "#FFF4F1",
        reasonLabel: "สาเหตุการปฏิเสธ",
        detailLabel: "รายละเอียดการปฏิเสธ",
        detailPlaceholder: "ระบุเหตุผลประกอบการปฏิเสธ",
        subheaderLabel: "ปิดผลเป็นปฏิเสธ",
        requiresAttachment: true,
    },
    {
        value: "cancelled",
        decisionId: 6,
        label: "ยกเลิก",
        icon: <CancelIcon fontSize="small" />,
        color: "#D92D2D",
        softColor: "#FFF4F4",
        reasonLabel: "สาเหตุการยกเลิก",
        detailLabel: "รายละเอียดการยกเลิก",
        detailPlaceholder: "ระบุเหตุผลประกอบการยกเลิก",
        subheaderLabel: "ยกเลิกรายการเคลม",
    },
];

type ConsiderSectionProps = {
    productId?: number | undefined;
    aplicationCode?: string | undefined;
    decisionReason: { data?: GetDecisionReasonDtoResponse[] } | undefined;
    decisionReasonLoading: boolean;
    /**
     * decisionId ของผลการพิจารณาที่ไม่ต้องแสดงปุ่มในหน้านี้
     * (เช่น หน้าเคลมโรงพยาบาล OPD ไม่มีปุ่ม "รอเอกสาร" = 3, "ยกเลิก" = 5)
     */
    hiddenDecisionIds?: number[];
    /** override หัวข้อ section — default "ผลการพิจารณา" (เคลมโรงพยาบาลใช้ "แจ้งผลการพิจารณาโรงพยาบาล") */
    headingText?: string;
    /** override label ปุ่ม/หัวข้อรายละเอียดของแต่ละ decisionId (เช่น เคลมโรงพยาบาล "รอแก้ไข" → "แจ้งแก้ไข") */
    labelOverrides?: Partial<Record<number, string>>;
};

const ConsiderSection = ({
    productId,
    aplicationCode,
    decisionReason,
    decisionReasonLoading,
    hiddenDecisionIds,
    headingText,
    labelOverrides,
}: ConsiderSectionProps) => {
    const formik = useFormikContext<ClaimConsiderValues>();
    const formRef = useRef<HTMLDivElement>(null);

    const visibleStatusOptions = statusOptions.filter((status) => !hiddenDecisionIds?.includes(status.decisionId));
    const labelOf = (status: StatusOption) => labelOverrides?.[status.decisionId] ?? status.label;

    // ผลการพิจารณาที่เลือกไว้เดิมกลายเป็นตัวเลือกที่ถูกซ่อน (เช่น เปลี่ยน hiddenDecisionIds ภายหลัง) : ล้างค่าเพื่อไม่ให้ค้าง
    useEffect(() => {
        if (formik.values.considerResult === undefined) return;
        const stillVisible = visibleStatusOptions.some((status) => status.decisionId === formik.values.considerResult);
        if (stillVisible) return;

        formik.setFieldValue("considerResult", undefined, false);
        formik.setFieldValue("decisionReasonId", undefined, false);
        formik.setFieldValue("decisionReasonDetail", "", false);
    }, [hiddenDecisionIds, formik.values.considerResult]);

    const reasonMeta = formik.getFieldMeta<number | undefined>("decisionReasonId");
    const detailMeta = formik.getFieldMeta<string | undefined>("decisionReasonDetail");
    const reasonHasError = !!reasonMeta.touched && !!reasonMeta.error;
    const detailHasError = !!detailMeta.touched && !!detailMeta.error;

    const selectedStatus = visibleStatusOptions.find((status) => status.decisionId === formik.values.considerResult);
    const selectStatus = (status: StatusOption) => {
        formik.setFieldValue("considerResult", status.decisionId, false);
        formik.setFieldValue("decisionReasonId", undefined, false);
        formik.setFieldValue("decisionReasonDetail", "", false);

        window.setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 0);
    };

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<FactCheckIcon sx={{ fontSize: 27 }} />}
                text={headingText ?? "ผลการพิจารณา"}
                color="blue"
            />

            <Box aria-label="เลือกผลการพิจารณา" role="radiogroup" sx={{ mt: 2.5 }}>
                <Grid container spacing={{ xs: 1.25, sm: 2 }}>
                    {visibleStatusOptions.map((status) => {
                        const isSelected = status.decisionId === formik.values.considerResult;

                        return (
                            <Grid
                                item
                                xs={6}
                                lg={Math.max(3, Math.floor(12 / visibleStatusOptions.length))}
                                key={status.value}
                            >
                                <Button
                                    fullWidth
                                    aria-checked={isSelected}
                                    color="inherit"
                                    role="radio"
                                    startIcon={status.icon}
                                    variant={isSelected ? "contained" : "outlined"}
                                    onClick={() => selectStatus(status)}
                                    sx={{
                                        minHeight: { xs: 48, sm: 54 },
                                        borderColor: status.color,
                                        borderRadius: 3,
                                        color: isSelected ? "#fff" : status.color,
                                        bgcolor: isSelected ? status.color : "#fff",
                                        fontSize: { xs: 14, sm: 16 },
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        "&:hover": {
                                            borderColor: status.color,
                                            bgcolor: isSelected ? status.color : status.softColor,
                                        },
                                        "&:focus-visible": {
                                            outline: `3px solid ${status.color}55`,
                                            outlineOffset: 2,
                                        },
                                    }}
                                >
                                    {labelOf(status)}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {selectedStatus && (
                <Box
                    ref={formRef}
                    sx={{
                        mt: { xs: 2, md: 3 },
                        overflow: "hidden",
                        border: `1px solid ${selectedStatus.color}33`,
                        borderRadius: 2,
                        bgcolor: "#fff",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.25,
                            px: { xs: 2, sm: 3 },
                            py: 1.75,
                            color: selectedStatus.color,
                            bgcolor: selectedStatus.softColor,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignSelf: "center",
                                "& svg": {
                                    fontSize: { xs: 24, sm: 28 },
                                },
                            }}
                        >
                            {selectedStatus.icon}
                        </Box>
                        <Box>
                            <Typography fontWeight={600}>{labelOf(selectedStatus)}</Typography>
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    color: "text.secondary",
                                    fontSize: { xs: 12, sm: 13 },
                                    lineHeight: 1.35,
                                }}
                            >
                                {selectedStatus.subheaderLabel}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box data-field-name="decisionReasonId">
                            <TextField
                                select
                                required
                                fullWidth
                                label={decisionReasonLoading ? "กำลังโหลด..." : selectedStatus.reasonLabel}
                                value={formik.values.decisionReasonId || ""}
                                onChange={(event) =>
                                    formik.setFieldValue("decisionReasonId", Number(event.target.value))
                                }
                                onBlur={() => formik.setFieldTouched("decisionReasonId", true)}
                                error={reasonHasError}
                                helperText={reasonHasError ? reasonMeta.error : undefined}
                            >
                                {(decisionReason?.data ?? []).map((item) => (
                                    <MenuItem key={item.decisionReasonId} value={item.decisionReasonId}>
                                        {item.decisionReasonName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box data-field-name="decisionReasonDetail" sx={{ mt: 2 }}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                minRows={4}
                                label={selectedStatus.detailLabel}
                                placeholder={selectedStatus.detailPlaceholder}
                                value={formik.values.decisionReasonDetail || ""}
                                onChange={(event) => formik.setFieldValue("decisionReasonDetail", event.target.value)}
                                onBlur={() => formik.setFieldTouched("decisionReasonDetail", true)}
                                error={detailHasError}
                                helperText={detailHasError ? detailMeta.error : undefined}
                            />
                        </Box>

                        {selectedStatus.requiresAttachment && (
                            <DocumentScanTable
                                productTypeId={productId ?? 0}
                                documentType="ใบแจ้งปฏิเสธสินไหม"
                                aplicationCode={aplicationCode ?? ""}
                                Header="เอกสารประกอบการปฏิเสธ"
                            />
                        )}
                    </Box>
                </Box>
            )}
        </CustomPaper>
    );
};

export default ConsiderSection;

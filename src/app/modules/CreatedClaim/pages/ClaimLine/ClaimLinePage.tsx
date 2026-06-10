import React, { useState } from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { calculateSummary, resetItems } from "../../store/claimLineSlice";
import { REASON_OPTIONS } from "../../store/mockClaimLine";
import ClaimLineTable from "../../components/ClaimLine/ClaimLineTable";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmSaveClaimLineModal from "../../components/ClaimLine/ConfirmSaveClaimLineModal";
import ClaimLineHeader from "../../components/ClaimLine/ClaimLineHeader";
import { useClaimLineItems } from "../../hooks/ClaimLine/useClaimLineItems";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { useCalculateCaseClaim } from "../../../../api/claimAgentApi";
import { swalError, swalSuccess } from "../../../_common";
import Swal from "sweetalert2";
import {
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponseServiceResponse,
} from "../../../../api/claimAgentApi.client";
// import ClaimLineSearch from "../../components/ClaimLine/ClaimLineSearch";

// type PageStep = "search" | "header_and_table";

type HighlightKey = "blue" | "green" | "red" | "yellow";

export const colorHighlight: Record<HighlightKey, string> = {
    blue: "primary.main",
    green: "success.main",
    red: "error.main",
    yellow: "edit.main",
};

const SummaryField = ({
    label,
    value,
    highlight = "blue",
}: {
    label: string;
    value: string;
    highlight?: HighlightKey;
}) => (
    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} py={0.3}>
        <Typography sx={{ fontSize: 15 }} color="text.secondary">
            {label} :
        </Typography>
        <Typography
            sx={{ fontSize: 15 }}
            fontWeight={700}
            color={colorHighlight[highlight]}
            minWidth={100}
            textAlign="right"
        >
            {value}
        </Typography>
    </Box>
);

const ClaimLinePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { items, summary, header, filledItems } = useAppSelector((s) => s.claimline);

    // console.log(JSON.stringify(filledItems, null, 2));

    const onSuccessCallback = (response: CalculateCaseClaimDtoResponseServiceResponse) => {
        swalSuccess("Success", response.data?.result ?? "คำนวณสำเร็จ");
    };
    const onErrorCallback = (error: string) => {
        swalError("Error", error);
    };

    const calculateCaseClaim = useCalculateCaseClaim(onSuccessCallback, onErrorCallback);

    const [openConfirm, setOpenConfirm] = useState(false);

    const handleClear = () => dispatch(resetItems());

    const handleVerify = () => dispatch(calculateSummary());

    const { isLoading: isLoadingClaimExpense } = useClaimLineItems({
        formatTypeId: 3,
        patientTypeId: header.patientType as number,
        enabled: !!header.patientType,
    });

    const handleNext = () => {
        dispatch(calculateSummary());
        Swal.fire({
            icon: "question",
            iconHtml: "?",
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
            reverseButtons: true,
            allowOutsideClick: false,
            backdrop: "rgba(0,0,0,0.4)",
            title: "ยืนยันการทำรายการ?",
            text: "ต้องการคำนวณหรือไม่",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const payload: CalculateCaseClaimDtoRequest | undefined = {
                        caseId: "814922be-7531-4f72-9399-8fefefe3e877",
                        isSimulateCase: true,
                        jsonDetail: filledItems.map((item) => ({
                            id: item.id,
                            code: item.code,
                            claimAmount: item.claimAmount,
                            description: item.description,
                            notCovered: item.notCovered,
                            reason: item.reason?.toString(),
                            remark: item.remark,
                        })),
                    };
                    const res = await calculateCaseClaim.mutateAsync(payload);
                    return res.data;
                } catch (error) {
                    Swal.showValidationMessage(`
                  Request failed: ${error}
                `);
                }
            },
        });
    };

    const handleConfirm = () => {
        setOpenConfirm(false);
        alert("บันทึกสำเร็จ");
    };

    // const handleSelected = () => {
    //     // setOpenConfirm(false);
    //     // alert("บันทึกสำเร็จ");
    // };

    const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    return (
        <>
            {/* <CustomPaper>
                <HeadingWithColor text="ค้นหาผู้เอาประกัน" color="blue" />
                <ClaimLineSearch onSelected={handleSelected} />
            </CustomPaper> */}

            {/* {step === "header_and_table" && ( */}
            <>
                {/* Header */}
                {/* <CustomPaper sx={{ mt: 1 }}>
                    <ClaimLineHeader />
                </CustomPaper> */}
                <CustomPaper sx={{ mt: 1 }}>
                    <ClaimLineHeader />
                </CustomPaper>

                {/* Table */}
                <LinearLoading isLoading={isLoadingClaimExpense}>
                    <Box sx={{ mt: 1 }}>
                        <ClaimLineTable
                            items={items}
                            reasonOptions={REASON_OPTIONS}
                            onlineClaimAmount={summary.onlineClaimAmount}
                            formatTypeId={3}
                            patientTypeId={header.patientType}
                        />
                    </Box>

                    {/* สรุปรายการ */}
                    <CustomPaper sx={{ mt: 1 }}>
                        <HeadingWithColor text="สรุปรายการ" color="blue" />

                        <Box
                            sx={{
                                border: "1px solid #b3d4f0",
                                bgcolor: "#f5f9ff",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                mb: 1,
                            }}
                        >
                            <Grid container sx={{ p: 1, alignItems: "flex-end" }}>
                                <Grid item xs={12} sm={6} md={2}>
                                    <Grid container mb={2}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<ClearIcon />}
                                            onClick={handleClear}
                                            sx={{ bgcolor: "#fff", ml: 1, width: { sm: "50%", md: "90%" } }}
                                        >
                                            ล้างค่า
                                        </Button>
                                    </Grid>
                                    <Grid container>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CheckCircleOutlineIcon />}
                                            onClick={handleVerify}
                                            sx={{ bgcolor: "#fff", ml: 1, width: { sm: "50%", md: "90%" } }}
                                            fullWidth
                                        >
                                            ตรวจสอบข้อมูล
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={4} md={3}>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <SummaryField label="ยอดเบิกรวม" value={fmt(summary.totalClaim)} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SummaryField
                                                label="ส่วนลดรวม"
                                                value={fmt(summary.totalDiscount)}
                                                // highlight="yellow"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SummaryField label="ยอดเบิก หลังหักส่วนลด" value={fmt(summary.netClaim)} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={4} md={3}>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <SummaryField
                                                label="ยอดไม่คุ้มครอง"
                                                value={fmt(summary.notCoveredAmount)}
                                                highlight="red"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={4} md={3}>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <SummaryField
                                                label="ยอดเบิกสุทธิ"
                                                value={fmt(summary.coveredAmount)}
                                                highlight="green"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                        {/* </Grid> */}

                        <Divider sx={{ my: 1.5 }} />

                        <Box display="flex" justifyContent="space-between">
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                sx={{ bgcolor: "#fff" }}
                                size="medium"
                            >
                                ย้อนกลับ
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                size="medium"
                                startIcon={<SaveIcon />}
                                onClick={handleNext}
                            >
                                บันทึก
                            </Button>
                        </Box>
                    </CustomPaper>
                </LinearLoading>
                <ConfirmSaveClaimLineModal
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={handleConfirm}
                />
            </>
            {/* )} */}
        </>
    );
};

export default ClaimLinePage;

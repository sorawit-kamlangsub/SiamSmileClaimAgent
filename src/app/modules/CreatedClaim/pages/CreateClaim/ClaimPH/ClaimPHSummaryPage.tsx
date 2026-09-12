import React, { useState } from "react";
import { Box, Button, Grid, LinearProgress, RadioGroup, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CommentIcon from "@mui/icons-material/Comment";
import { useNavigate, useParams } from "react-router-dom";
import {
    BeneficiaryForm,
    removeBankAccount,
    removeContact,
    resetState,
    selectBankAccount,
    selectContact,
} from "../../../store/claimPHSlice";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/AddContactModal";
import ConfirmTransferPHModal from "../../../components/CreateClaim/ClaimPH/ConfirmTransferPHModal";
import ClaimTransferProgressModal from "../../../components/CreateClaim/ClaimTransferProgressModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ClaimSummaryPHTable from "../../../components/CreateClaim/ClaimPH/ClaimSummaryPHTable";
import { useCreateClaimPH } from "../../../hooks/CreateClaim/ClaimPH/useCreateClaimPH";
import { useCreateContinuedClaimPH } from "../../../hooks/CreateClaim/ClaimPH/useCreateContinuedClaimPH";
import { useClaimTransferProcess } from "../../../hooks/CreateClaim/useClaimTransferProcess";
import Swal from "sweetalert2";
import { swalError } from "../../../../_common";
import { useBeneficiaryPH } from "../../../hooks/CreateClaim/ClaimPH/useBeneficiaryPH";
import BeneficiarySectionPH from "../../../components/CreateClaim/ClaimPH/BeneficiarySectionPH";
import { BankAccountCard } from "../../../components/CreateClaim/BankAccountCard";
import { ContactCard } from "../../../components/CreateClaim/ContactCard";

const ClaimPHSummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isContinuous: isContinuousParam } = useParams();
    const isContinuous = isContinuousParam ? atob(isContinuousParam) === "true" : false;
    const { form, bankAccounts, contacts, insured, oldClaim } = useAppSelector((state) => state.claimph);
    const { createClaimPH, confirmPayment, isLoading } = useCreateClaimPH();
    const { createClaimPH: createContinuedClaimPH, confirmPayment: confirmContinuedPayment } =
        useCreateContinuedClaimPH();
    const [openBank, setOpenBank] = useState(false);
    const [openContact, setOpenContact] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const { formik, isLoading: beneficiaryLoading } = useBeneficiaryPH((beneficiaries) => {
        handleConfirm(beneficiaries);
    });
    const isDeathDisability = form.coverageTypeId === 4 || form.coverageTypeId === 5;

    // แจ้งเคลมทั่วไป (ไม่ใช่เสียชีวิต/ทุพพลภาพ) : สร้าง CL/CC + โอนเงิน ต่อกันหลังกด "โอนเงิน" ใน ConfirmTransferPHModal
    const transferProcess = useClaimTransferProcess({
        isContinuous,
        createClaim: isContinuous ? createContinuedClaimPH : createClaimPH,
        confirmPayment: isContinuous ? confirmContinuedPayment : confirmPayment,
    });

    const buildContinuedSuccessHtml = (oldClaimNo: string, responseList: any[]) => {
        const rowsHtml = responseList
            .map(
                (item: any, index: number) => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 4px;">
            <div style="flex:0 0 18px;width:18px;height:18px;border-radius:50%;background:#F2994A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;">${
                index + 1
            }</div>
            <span style="font-size:13px;color:#999;white-space:nowrap;">เคสใหม่</span>
            <span style="color:#DDD;font-size:12px;">•</span>
            <span style="font-size:13.5px;font-weight:700;color:#F2994A;white-space:nowrap;">${
                item?.caseNo ?? "-"
            }</span>
        </div>
    `
            )
            .join("");

        return `
        <div style="max-width:360px;margin:0 auto;">
            <div style="
                display:flex;align-items:center;justify-content:center;gap:6px;
                font-size:13px;color:#666;margin-bottom:10px;
            ">
                <span>🔗 ต่อเนื่องจาก</span>
                <span style="font-weight:700;color:#333;">${oldClaimNo || "-"}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;padding:2px;">
                ${rowsHtml}
            </div>
        </div>
    `;
    };

    const handleSelectBank = (id: string) => {
        dispatch(selectBankAccount(id));
    };

    const handleSelectContact = (id: string) => {
        dispatch(selectContact(id));
    };

    /** ส่งตรวจสอบ (เสียชีวิต/ทุพพลภาพ) : flow เดิม — ไม่ผ่าน Modal ยืนยันบัญชีโอนเงิน/progress */
    const handleConfirm = async (freshBeneficiaries?: BeneficiaryForm[]) => {
        if (isLoading) return;

        Swal.fire({
            icon: "question",
            iconHtml: "?",
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
            reverseButtons: true,
            allowOutsideClick: false,
            backdrop: "rgba(0,0,0,0.4)",
            title: "ยืนยันการสร้างรายการ",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const res = isContinuous
                        ? await createContinuedClaimPH(freshBeneficiaries)
                        : await createClaimPH(freshBeneficiaries);
                    return res;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
        }).then((result: any) => {
            const { claimResponse } = result?.value ?? {};
            const data = claimResponse?.data;
            const responseList = data?.responseList ?? [];

            if (result.isConfirmed && data?.isResult && responseList.length > 0) {
                if (isContinuous) {
                    Swal.fire({
                        icon: "success",
                        title: "ทำรายการสำเร็จ",
                        width: 400,
                        html: `
                    <div style="color:#888;font-size:13px;margin-top:-8px;margin-bottom:12px;text-align:center;">
                        เพิ่มเคสต่อเนื่องเข้าเคลมเดิมเรียบร้อย
                    </div>
                    ${buildContinuedSuccessHtml(oldClaim?.claimNo ?? "", responseList)}
                `,
                        confirmButtonText: "ตกลง",
                        allowOutsideClick: false,
                        backdrop: "rgba(0,0,0,0.4)",
                    }).then(() => {
                        dispatch(resetState());
                        navigate(`/monitor-claim`);
                    });
                    return;
                }
                const itemsHtml = responseList
                    .map(
                        (item: any, index: number) => `
                <div style="background:#fff;border:1px solid #E5E5E5;border-radius:12px;padding:16px;width:300px;margin:0 auto;margin-bottom:${
                    index < responseList.length - 1 ? "12px" : "0"
                };box-shadow:0 2px 8px rgba(0,0,0,.12);text-align:left;">
                    <div style="display:flex;align-items:center;margin-bottom:12px;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#27AE60;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">✓</div>
                        <div>
                            <div style="font-size:12px;color:#888;">เลขที่เคลม :</div>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span style="font-size:18px;font-weight:700;color:#27AE60;">${
                                    item?.claimNo ?? "-"
                                }</span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#2F80ED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">$</div>
                        <div>
                            <div style="font-size:12px;color:#888;">เลขที่เคส :</div>
                            <div style="font-size:18px;font-weight:700;color:#2F80ED;">${item?.caseNo ?? "-"}</div>
                        </div>
                    </div>
                </div>
            `
                    )
                    .join("");
                Swal.fire({
                    icon: "success",
                    title: "ทำรายการสำเร็จ",
                    html: `
                    <div style="color:#666;font-size:14px;margin-top:-8px;margin-bottom:24px;text-align:center;line-height:3;">
                        ระบบได้ส่งข้อมูลให้ฝ่ายพิจารณาเคลมเรียบร้อย
                    </div>
                    ${itemsHtml}
                `,
                    confirmButtonText: "ตกลง",
                    allowOutsideClick: false,
                    backdrop: "rgba(0,0,0,0.4)",
                }).then(() => {
                    navigate(`/monitor-claim`);
                    dispatch(resetState());
                });
            } else if (result.isConfirmed) {
                swalError("บันทึกไม่สำเร็จ !", data?.msg || "กรุณาลองใหม่อีกครั้ง");
            }
        });
    };

    /** แจ้งเคลมทั่วไป : กด "โอนเงิน" ใน ConfirmTransferPHModal แล้ว สร้าง CL/CC → โอนเงิน ต่อกัน (ClaimTransferProgressModal) */
    const handleTransferFlow = async () => {
        setOpenConfirm(false);

        const outcome = await transferProcess.run();
        if (!outcome.ok) {
            swalError("ทำรายการไม่สำเร็จ !", outcome.message);
            return;
        }

        const responseList = outcome.result?.data?.responseList ?? [];
        const paymentCodeList = outcome.result?.paymentResponses?.data?.paymentCodeResponse ?? [];

        const itemsHtml = responseList
            .map(
                (item: any, index: number) => `
                <div style="background:#fff;border:1px solid #E5E5E5;border-radius:12px;padding:16px;width:300px;margin:0 auto;margin-bottom:${
                    index < responseList.length - 1 ? "12px" : "0"
                };box-shadow:0 2px 8px rgba(0,0,0,.12);text-align:left;">
                    <div style="display:flex;align-items:center;margin-bottom:12px;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#27AE60;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">✓</div>
                        <div>
                            <div style="font-size:12px;color:#888;">เลขที่เคลม :</div>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span style="font-size:18px;font-weight:700;color:#27AE60;">${
                                    item?.claimNo ?? "-"
                                }</span>
                                <span
                                    class="material-icons copy-btn"
                                    data-copy="${item?.claimNo ?? ""}"
                                    style="cursor:pointer;color:#2196F3;font-size:18px;margin-left:6px;user-select:none;"
                                >content_copy</span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;margin-bottom:12px;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#2F80ED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">$</div>
                        <div>
                            <div style="font-size:12px;color:#888;">เลขที่เคส :</div>
                            <div style="font-size:18px;font-weight:700;color:#2F80ED;">${item?.caseNo ?? "-"}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#F2994A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">฿</div>
                        <div>
                            <div style="font-size:12px;color:#888;">เลขที่การโอนเงิน :</div>
                            <div style="font-size:18px;font-weight:700;color:#F2994A;">${
                                paymentCodeList[index]?.paymentCode ?? "-"
                            }</div>
                        </div>
                    </div>
                </div>
            `
            )
            .join("");

        Swal.fire({
            icon: "success",
            title: "ทำรายการสำเร็จ",
            html: `
                <div style="color:#666;font-size:14px;margin-top:-8px;margin-bottom:24px;text-align:center;line-height:1.8;">
                    ระบบได้ทำรายการเรียบร้อย และระบบจะทำการโอนเงินหลังจากได้รับ SMS
                </div>
                ${itemsHtml}
            `,
            confirmButtonText: "ตกลง",
            allowOutsideClick: false,
            backdrop: "rgba(0,0,0,0.4)",
            customClass: {
                confirmButton: "swal2-styled swal2-ok",
            },
            didOpen: () => {
                document.querySelectorAll(".copy-btn").forEach((btn) => {
                    btn.addEventListener("click", async () => {
                        const el = btn as HTMLElement;
                        const text = el.dataset.copy ?? "";

                        await navigator.clipboard.writeText(text);

                        el.textContent = "check";
                        el.style.color = "#4CAF50";
                        el.style.cursor = "default";

                        el.classList.remove("copy-btn");
                    });
                });
            },
        }).then(() => {
            dispatch(resetState());
            navigate(`/monitor-claim`);
        });
    };
    return (
        <>
            <CustomPaper>
                <HeadingWithColor
                    text="รายละเอียดบัญชีและเบอร์ติดต่อ"
                    color="blue"
                    icon={<AccountBalanceIcon sx={{ fontSize: 27 }} />}
                />
                <Grid container spacing={1}>
                    {/* ── ข้อมูลเคลม ── */}
                    <Grid item xs={12}>
                        <CustomPaper>
                            <ClaimSummaryPHTable
                                data={[
                                    {
                                        appId: insured?.policyCode ?? "",
                                        customerName: insured?.customerName ?? "",
                                        claimType: `${form.incidentTypeName ?? ""} / ${form.coverageTypeName ?? ""} / ${
                                            !form.medicalTypeId ? form.causeOfIncidentName : form.medicalTypeName
                                        }`,
                                        claimAmount: Number(form.transferAmount),
                                    },
                                ]}
                            />
                        </CustomPaper>
                    </Grid>
                    {/* ── บัญชีรับสินไหม | เบอร์โทรติดต่อ ── */}
                    {!isDeathDisability && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <CustomPaper>
                                    <Grid container spacing={2} p="0 26px 0 26px">
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                                บัญชีรับสินไหม :
                                            </Typography>
                                            <RadioGroup value={bankAccounts.findIndex((b) => b.isDefault).toString()}>
                                                {bankAccounts.map((bank) => (
                                                    <BankAccountCard
                                                        key={bank.id}
                                                        bank={bank}
                                                        selected={bank.isDefault}
                                                        onSelect={() => handleSelectBank(bank.id)}
                                                        onDelete={() => dispatch(removeBankAccount(bank.id))}
                                                    />
                                                ))}
                                            </RadioGroup>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<AddCircleIcon />}
                                                onClick={() => setOpenBank(true)}
                                            >
                                                เพิ่มบัญชีรับสินไหม
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CustomPaper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <CustomPaper>
                                    <Grid container spacing={2} p="0 26px 0 26px">
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                                เบอร์โทรติดต่อ :
                                            </Typography>
                                            <RadioGroup value={contacts.findIndex((c) => c.isDefault).toString()}>
                                                {contacts.map((contact) => (
                                                    <ContactCard
                                                        key={contact.id}
                                                        contact={contact}
                                                        selected={contact.isDefault}
                                                        onSelect={() => handleSelectContact(contact.id)}
                                                        onDelete={() => dispatch(removeContact(contact.id))}
                                                    />
                                                ))}
                                            </RadioGroup>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<AddCircleIcon />}
                                                onClick={() => setOpenContact(true)}
                                            >
                                                เพิ่มเบอร์โทรใหม่
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CustomPaper>
                            </Grid>
                        </>
                    )}
                    {isDeathDisability &&
                        (beneficiaryLoading ? (
                            <LinearProgress sx={{ height: "5px" }} />
                        ) : (
                            <Grid item xs={12}>
                                <BeneficiarySectionPH formik={formik} />
                            </Grid>
                        ))}
                </Grid>
            </CustomPaper>
            <Grid container spacing={1}>
                {/* ── ปุ่ม ── */}
                <Grid item xs={12}>
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
                            startIcon={<CommentIcon />}
                            size="medium"
                            onClick={() => (isDeathDisability ? formik.handleSubmit() : setOpenConfirm(true))}
                        >
                            {isDeathDisability ? "ส่งตรวจสอบ" : "แจ้งโอนเงิน"}
                        </Button>
                    </Box>
                </Grid>
                {/* ── Modals ── */}
                <AddBankAccountModal open={openBank} onClose={() => setOpenBank(false)} productTypeId={6} />
                <AddContactModal open={openContact} onClose={() => setOpenContact(false)} productTypeId={6} />
                <ConfirmTransferPHModal
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={handleTransferFlow}
                    isLoading={isLoading}
                />
                <ClaimTransferProgressModal open={transferProcess.open} steps={transferProcess.steps} />
            </Grid>
        </>
    );
};

export default ClaimPHSummaryPage;

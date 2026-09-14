import React, { useEffect, useState } from "react";
import { Box, Button, Grid, LinearProgress, RadioGroup, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CommentIcon from "@mui/icons-material/Comment";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    removeBankAccount,
    removeContact,
    removeClaimItem,
    setEditingItemId,
    ClaimInsuredItem,
    resetState,
    selectBankAccount,
    selectContact,
    removeTmpClaim,
    MAX_INSURED_PER_CLAIM,
    addContact as addContactPA,
} from "../../../store/claimPASlice";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/AddContactModal";
import ConfirmTransferPAModal from "../../../components/CreateClaim/ClaimPA/ConfirmTransferPAModal";
import ClaimTransferProgressModal from "../../../components/CreateClaim/ClaimTransferProgressModal";
import SchoolInfoSection from "../../../components/CreateClaim/ClaimPA/SchoolInfoSection";
import AddInsuredModal from "../../../components/CreateClaim/ClaimPA/AddInsuredModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useCreateClaimPA } from "../../../hooks/CreateClaim/ClaimPA/useCreateClaimPA";
import { useClaimTransferProcess } from "../../../hooks/CreateClaim/useClaimTransferProcess";
import Swal from "sweetalert2";
import { swalError } from "../../../../_common";
import ClaimSummaryPAInfo from "../../../components/CreateClaim/ClaimPA/ClaimSummaryPAInfo";
import { useBeneficiaryPA } from "../../../hooks/CreateClaim/ClaimPA/useBeneficiaryPA";
import BeneficiarySectionPA from "../../../components/CreateClaim/ClaimPA/BeneficiarySectionPA";
import { CoverageType } from "../../../../../functionHelpers";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { BankAccountCard } from "../../../components/CreateClaim/BankAccountCard";
import { ContactCard } from "../../../components/CreateClaim/ContactCard";
import { useCreateContinuedClaimPA } from "../../../hooks/CreateClaim/ClaimPA/useCreateContinuedClaimPA";

const ClaimPASummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { appId, refId, isContinuous: isContinuousParam, oldClaimId } = useParams();
    const isContinuous = isContinuousParam ? atob(isContinuousParam) === "true" : false;
    const { bankAccounts, contacts, claimItems, school, form, tmpCoreClaim, editingItemId, oldClaim } = useAppSelector(
        (s) => s.claimpa
    );

    const { createClaimPA, confirmPayment, isLoading } = useCreateClaimPA();
    const { createClaimPA: createContinuedClaimPA, confirmPayment: confirmContinuedPayment } =
        useCreateContinuedClaimPA();
    const [openBank, setOpenBank] = useState(false);
    const [openContact, setOpenContact] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openAddInsured, setOpenAddInsured] = useState(false);
    const { formik, isLoading: beneficiaryLoading } = useBeneficiaryPA((beneficiaries) => {
        handleConfirm(beneficiaries);
    });
    const isDeathDisability = form.coverageTypeId === 4 || form.coverageTypeId === 5;

    // แจ้งเคลมทั่วไป (ไม่ใช่เสียชีวิต/ทุพพลภาพ) : สร้าง CL/CC + โอนเงิน ต่อกันหลังกด "โอนเงิน" ใน ConfirmTransferPAModal
    const transferProcess = useClaimTransferProcess({
        isContinuous,
        createClaim: isContinuous ? createContinuedClaimPA : createClaimPA,
        confirmPayment: isContinuous ? confirmContinuedPayment : confirmPayment,
        isClaimSuccess: (r) => (r?.isSuccess ?? r?.data?.isResult) === true,
    });

    useEffect(() => {
        const isEmptyState =
            claimItems.length === 0 || !tmpCoreClaim.createClaim || tmpCoreClaim.createClaim.length === 0;

        if (isEmptyState) {
            navigate(`/claim/pa/${appId}/${refId}/${isContinuousParam}/${oldClaimId}`, { replace: true });
        }
    }, []);

    const handleSelectBank = (id: string) => {
        dispatch(selectBankAccount(id));
    };

    const handleSelectContact = (id: string) => {
        dispatch(selectContact(id));
    };
    const handleEditItem = (item: ClaimInsuredItem) => {
        dispatch(setEditingItemId(item.id));
        navigate(-1);
    };

    const handleBack = () => {
        const itemToEdit =
            (editingItemId && claimItems.find((item) => item.id === editingItemId)) ??
            claimItems[claimItems.length - 1];

        if (itemToEdit) {
            dispatch(setEditingItemId(itemToEdit.id));
        }
        navigate(-1);
    };

    const handleDeleteItem = (id: string) => {
        const item = claimItems.find((c) => c.id === id);
        dispatch(removeClaimItem(id));
        if (item?.tempClaimId) dispatch(removeTmpClaim(item.tempClaimId));
    };

    const hasSingleOnlyCoverage = claimItems.some(
        (item) =>
            item.formValues.coverageTypeId === CoverageType.Death ||
            item.formValues.coverageTypeId === CoverageType.Disability
    );

    const isMaxInsuredReached = claimItems.length >= MAX_INSURED_PER_CLAIM;
    const disableAddInsured = hasSingleOnlyCoverage || isMaxInsuredReached || isContinuous;
    const disableAddInsuredReason = hasSingleOnlyCoverage
        ? "เคลมเสียชีวิต/ทุพพลภาพ รองรับผู้เอาประกันได้เพียงคนเดียวต่อเคลม"
        : isMaxInsuredReached
        ? `เคลมนี้มีผู้เอาประกันครบ ${MAX_INSURED_PER_CLAIM} คนแล้ว`
        : isContinuous
        ? "เคลมต่อเนื่องไม่สามารถเพิ่มผู้เอาประกันได้"
        : "";

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
                        ? await createContinuedClaimPA(freshBeneficiaries)
                        : await createClaimPA(freshBeneficiaries);
                    return res;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
        }).then((result: any) => {
            const { claimResponse } = result?.value ?? {};
            const data = claimResponse?.data;
            const responseList = data?.responseList ?? [];
            const isSuccess = claimResponse?.isSuccess ?? data?.isResult;

            if (result.isConfirmed && isSuccess && responseList.length > 0) {
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
                const rowsHtml = responseList
                    .map(
                        (item: any, index: number) => `
                <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:${
                    index % 2 === 0 ? "#F9FAFB" : "#FFFFFF"
                };border-radius:8px;">
                    <div style="flex:0 0 18px;width:18px;height:18px;border-radius:50%;background:#27AE60;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;">${
                        index + 1
                    }</div>
                    <span style="font-size:13.5px;font-weight:700;color:#27AE60;white-space:nowrap;">${
                        item?.claimNo ?? "-"
                    }</span>
                    <span style="color:#BBB;font-size:12px;">→</span>
                    <span style="font-size:13.5px;font-weight:700;color:#2F80ED;white-space:nowrap;">${
                        item?.caseNo ?? "-"
                    }</span>
                </div>
            `
                    )
                    .join("");

                const itemsHtml = `
                <div style="max-width:380px;margin:0 auto;">
                    <div style="font-size:11px;color:#999;text-align:center;margin-bottom:6px;">เลขที่เคลม → เลขที่เคส</div>
                    <div style="display:flex;flex-direction:column;gap:5px;max-height:300px;overflow-y:auto;padding:2px;">
                        ${rowsHtml}
                    </div>
                </div>
            `;

                Swal.fire({
                    icon: "success",
                    title: "ทำรายการสำเร็จ",
                    width: 440,
                    html: `
                    <div style="color:#666;font-size:14px;margin-top:-8px;margin-bottom:16px;text-align:center;line-height:1.6;">
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

    /** แจ้งเคลมทั่วไป : กด "โอนเงิน" ใน ConfirmTransferPAModal แล้ว สร้าง CL/CC → โอนเงิน ต่อกัน (ClaimTransferProgressModal) */
    const handleTransferFlow = async () => {
        setOpenConfirm(false);

        const outcome = await transferProcess.run();
        if (!outcome.ok) {
            swalError("ทำรายการไม่สำเร็จ !", outcome.message);
            return;
        }

        const responseList = outcome.result?.data?.responseList ?? [];
        const paymentCodeList = outcome.result?.paymentResponses?.data?.paymentCodeResponse ?? [];

        // รหัสการโอนเงิน (CPG) เป็นรายการเดียวต่อ batch — แสดงเฉพาะ card แรกพอ ไม่ต้องวนซ้ำทุกรายชื่อผู้เอาประกัน
        const itemsHtml = responseList
            .map((item: any, index: number) => {
                const isFirst = index === 0;
                const paymentBlock = isFirst
                    ? `
                    <div style="display:flex;align-items:center;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#F2994A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">฿</div>
                        <div>
                            <div style="font-size:12px;color:#888;">รหัสการโอนเงิน :</div>
                            <div style="font-size:18px;font-weight:700;color:#F2994A;">${
                                paymentCodeList[0]?.paymentCode ?? "-"
                            }</div>
                        </div>
                    </div>
                `
                    : "";

                return `
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
                    <div style="display:flex;align-items:center;margin-bottom:${isFirst ? "12px" : "0"};">
                        <div style="width:24px;height:24px;border-radius:50%;background:#2F80ED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">$</div>
                        <div>
                            <div style="font-size:12px;color:#888;">เลขที่เคส :</div>
                            <div style="font-size:18px;font-weight:700;color:#2F80ED;">${item?.caseNo ?? "-"}</div>
                        </div>
                    </div>
                    ${paymentBlock}
                </div>
            `;
            })
            .join("");

        Swal.fire({
            icon: "success",
            title: "ทำรายการสำเร็จ",
            html: `
                    <div style="color:#666;font-size:14px;margin-top:-8px;margin-bottom:24px;text-align:center;line-height:1.8;">
                        ระบบได้ทำรายการเรียบร้อย และระบบจะทำการโอนเงินหลังจากได้รับ SMS
                    </div>
                    <div style="max-height:200px;overflow-y:auto;padding-right:8px;">
                        ${itemsHtml}
                    </div>
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
                    {/* ── ข้อมูลสถานศึกษา ── */}
                    {school && (
                        <Grid item xs={12}>
                            <CustomPaper>
                                <HeadingWithColor text="ข้อมูลสถานศึกษา" color="blue" />
                                <SchoolInfoSection data={school} />
                            </CustomPaper>
                        </Grid>
                    )}

                    {/* ── ตารางผู้เอาประกัน ── */}
                    <Grid item xs={12}>
                        <CustomPaper>
                            <ClaimSummaryPAInfo
                                data={claimItems}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                onAddInsured={() => setOpenAddInsured(true)}
                                disableAddInsured={disableAddInsured}
                                disableAddInsuredReason={disableAddInsuredReason}
                            />
                        </CustomPaper>
                    </Grid>

                    {/* ── รายละเอียดบัญชี ── */}

                    {!isDeathDisability && (
                        <>
                            <Grid item xs={12} md={6}>
                                <CustomPaper>
                                    <Grid container spacing={2} p="0 26px 0 26px">
                                        <Grid item xs={12}>
                                            {/* <CustomPaper sx={{ height: "100%" }}> */}
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
                                            {/* </CustomPaper> */}
                                        </Grid>
                                    </Grid>
                                </CustomPaper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomPaper>
                                    <Grid container spacing={2} p="0 26px 0 26px">
                                        <Grid item xs={12}>
                                            {/* <CustomPaper sx={{ height: "100%" }}> */}
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
                                            {/* </CustomPaper> */}
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
                                <BeneficiarySectionPA formik={formik} />
                            </Grid>
                        ))}
                </Grid>
            </CustomPaper>

            <Grid container spacing={1}>
                {/* ── ปุ่ม ── */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={5}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            sx={{ bgcolor: "#fff" }}
                            size="medium"
                        >
                            ย้อนกลับ
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            size="medium"
                            startIcon={<CommentIcon />}
                            onClick={() => (isDeathDisability ? formik.handleSubmit() : setOpenConfirm(true))}
                        >
                            {isDeathDisability ? "ส่งตรวจสอบ" : "แจ้งโอนเงิน"}
                        </Button>
                    </Box>
                </Grid>

                {/* ── Modals ── */}
                <AddBankAccountModal open={openBank} onClose={() => setOpenBank(false)} productTypeId={26} />
                <AddContactModal
                    open={openContact}
                    onClose={() => setOpenContact(false)}
                    onAdd={(contact) => dispatch(addContactPA(contact))}
                    productTypeId={26}
                />
                <ConfirmTransferPAModal
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={handleTransferFlow}
                    isLoading={isLoading}
                />
                <ClaimTransferProgressModal open={transferProcess.open} steps={transferProcess.steps} />
                <AddInsuredModal
                    open={openAddInsured}
                    onClose={() => setOpenAddInsured(false)}
                    currentItemCount={claimItems.length}
                />
            </Grid>
        </>
    );
};

export default ClaimPASummaryPage;

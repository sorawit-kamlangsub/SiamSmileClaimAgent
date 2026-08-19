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
import SchoolInfoSection from "../../../components/CreateClaim/ClaimPA/SchoolInfoSection";
import AddInsuredModal from "../../../components/CreateClaim/ClaimPA/AddInsuredModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useCreateClaimPA } from "../../../hooks/CreateClaim/ClaimPA/useCreateClaimPA";
import Swal from "sweetalert2";
import { swalError } from "../../../../_common";
import ClaimSummaryPAInfo from "../../../components/CreateClaim/ClaimPA/ClaimSummaryPAInfo";
import { useBeneficiaryPA } from "../../../hooks/CreateClaim/ClaimPA/useBeneficiaryPA";
import BeneficiarySectionPA from "../../../components/CreateClaim/ClaimPA/BeneficiarySectionPA";
import { CoverageType } from "../../../../../functionHelpers";
import { CreateCoreClaimDtoResponseServiceResponse } from "../../../../../api/coreClaimApi.client";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { BankAccountCard } from "../../../components/CreateClaim/BankAccountCard";
import { ContactCard } from "../../../components/CreateClaim/ContactCard";

const ClaimPASummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { appId, refId } = useParams();
    const { bankAccounts, contacts, claimItems, school, form, tmpCoreClaim, editingItemId } = useAppSelector(
        (s) => s.claimpa
    );
    const { createClaimPA, confirmPayment, isLoading } = useCreateClaimPA();
    const [openBank, setOpenBank] = useState(false);
    const [openContact, setOpenContact] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openAddInsured, setOpenAddInsured] = useState(false);
    const [claimResult, setClaimResult] = useState<CreateCoreClaimDtoResponseServiceResponse | undefined>(undefined);
    const [claimBeneficiaries, setClaimBeneficiaries] = useState<BeneficiaryForm[]>([]);
    const { formik, isLoading: beneficiaryLoading } = useBeneficiaryPA((beneficiaries) => {
        handleConfirm(beneficiaries);
    });
    const isDeathDisability = form.coverageTypeId === 4 || form.coverageTypeId === 5;

    useEffect(() => {
        const isEmptyState =
            claimItems.length === 0 || !tmpCoreClaim.createClaim || tmpCoreClaim.createClaim.length === 0;

        if (isEmptyState) {
            navigate(`/claim/pa/${appId}/${refId}`, { replace: true });
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
    const disableAddInsured = hasSingleOnlyCoverage || isMaxInsuredReached;
    const disableAddInsuredReason = hasSingleOnlyCoverage
        ? "เคลมเสียชีวิต/ทุพพลภาพ รองรับผู้เอาประกันได้เพียงคนเดียวต่อเคลม"
        : isMaxInsuredReached
        ? `เคลมนี้มีผู้เอาประกันครบ ${MAX_INSURED_PER_CLAIM} คนแล้ว`
        : "";

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
                    const res = await createClaimPA(freshBeneficiaries);
                    return res;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
        }).then((result: any) => {
            const { claimResponse, beneficiaryList } = result?.value ?? {};
            const data = claimResponse?.data;
            const responseList = data?.responseList ?? [];

            if (result.isConfirmed && data?.isResult && responseList.length > 0) {
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

                if (isDeathDisability) {
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
                        dispatch(resetState());
                        navigate(`/monitor-claim`);
                    });
                } else {
                    Swal.fire({
                        icon: "success",
                        title: "ทำรายการสำเร็จ",
                        html: `
                <div style="color:#666;font-size:14px;margin-top:-8px;margin-bottom:24px;text-align:center;line-height:3;">
                    ระบบได้ทำรายการเรียบร้อย กรุณากด "โอนเงิน" เพื่อดำเนินการโอนเงินต่อ
                </div>
                ${itemsHtml}
            `,
                        confirmButtonText: "โอนเงิน",
                        showCancelButton: true,
                        cancelButtonText: "ปิด",
                        allowOutsideClick: false,
                        backdrop: "rgba(0,0,0,0.4)",
                    }).then((confirmResult) => {
                        if (confirmResult.isConfirmed) {
                            setClaimResult(claimResponse);
                            setClaimBeneficiaries(beneficiaryList ?? []);
                            setOpenConfirm(true);
                        } else {
                            dispatch(resetState());
                            navigate(`/monitor-claim`);
                        }
                    });
                }
            } else if (result.isConfirmed) {
                swalError("บันทึกไม่สำเร็จ !", data?.msg || "กรุณาลองใหม่อีกครั้ง");
            }
        });
    };

    const handleActualTransfer = async () => {
        if (!claimResult) return;

        setOpenConfirm(false);

        Swal.fire({
            icon: "question",
            iconHtml: "?",
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
            reverseButtons: true,
            allowOutsideClick: false,
            backdrop: "rgba(0,0,0,0.4)",
            title: "ยืนยันการโอนเงิน",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const res = await confirmPayment(claimResult, claimBeneficiaries);
                    return res;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
        }).then((result: any) => {
            if (result.isConfirmed) {
                const paymentCodeResponse = result.value?.data?.paymentCodeResponse ?? [];
                const itemsHtml = paymentCodeResponse
                    .map(
                        (item: any, index: number) => `
                <div style="background:#fff;border:1px solid #E5E5E5;border-radius:12px;padding:16px;width:300px;margin:0 auto;margin-bottom:${
                    index < paymentCodeResponse.length - 1 ? "12px" : "0"
                };box-shadow:0 2px 8px rgba(0,0,0,.12);text-align:left;">
                    <div style="display:flex;align-items:center;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#2F80ED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:10px;">$</div>
                        <div>
                            <div style="font-size:12px;color:#888;">รหัสการโอนเงิน :</div>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span style="font-size:18px;font-weight:700;color:#2F80ED;">${
                                    item?.paymentCode ?? "-"
                                }</span>
                                <span
                                    class="material-icons copy-btn"
                                    data-copy="${item?.paymentCode ?? ""}"
                                    style="cursor:pointer;color:#2196F3;font-size:18px;margin-left:6px;user-select:none;"
                                >content_copy</span>
                            </div>
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
            } else {
                swalError("โอนเงินไม่สำเร็จ !", "กรุณาลองใหม่อีกครั้ง");
            }
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
                            onClick={() => (isDeathDisability ? formik.handleSubmit() : handleConfirm())}
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
                />
                <ConfirmTransferPAModal
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={handleActualTransfer}
                    isLoading={isLoading}
                />
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

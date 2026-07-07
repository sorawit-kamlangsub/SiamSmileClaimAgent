import React, { useEffect, useState } from "react";
import { Box, Button, Grid, RadioGroup, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CommentIcon from "@mui/icons-material/Comment";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    removeBankAccount,
    removeContact,
    setBankAccounts,
    setContacts,
    removeClaimItem,
    setEditingItemId,
    setClaimItems,
    ClaimInsuredItem,
    resetState,
} from "../../../store/claimPASlice";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/ClaimPH/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/ClaimPH/AddContactModal";
import ConfirmTransferPAModal from "../../../components/CreateClaim/ClaimPA/ConfirmTransferPAModal";
import ClaimSummaryPATable from "../../../components/CreateClaim/ClaimPA/ClaimSummaryPATable";
import SchoolInfoSection from "../../../components/CreateClaim/ClaimPA/SchoolInfoSection";
import { mockClaimItemsPA } from "../../../store/mockClaimPH";
import AddInsuredModal from "../../../components/CreateClaim/ClaimPA/AddInsuredModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { BankAccountCard, ContactCard } from "../ClaimPH/ClaimPHSummaryPage";
import { useCreateClaimPA } from "../../../hooks/CreateClaim/ClaimPA/useCreateClaimPA";
import Swal from "sweetalert2";
import { swalError } from "../../../../_common";

const ClaimPASummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { bankAccounts, contacts, claimItems, school } = useAppSelector((s) => s.claimpa);
    const { createClaimPA, isLoading } = useCreateClaimPA();
    const [openBank, setOpenBank] = useState(false);
    const [openContact, setOpenContact] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openAddInsured, setOpenAddInsured] = useState(false);

    // ── Load mock claimItems ถ้ายังไม่มีในตอน dev ─────────────
    useEffect(() => {
        if (claimItems.length === 0) {
            dispatch(setClaimItems(mockClaimItemsPA));
        }
    }, []);
    // ─────────────────────────────────────────────────────────

    const handleSelectBank = (i: number) =>
        dispatch(setBankAccounts(bankAccounts.map((b, idx) => ({ ...b, isDefault: idx === i }))));

    const handleSelectContact = (i: number) =>
        dispatch(setContacts(contacts.map((c, idx) => ({ ...c, isDefault: idx === i }))));

    const handleEditItem = (item: ClaimInsuredItem) => {
        dispatch(setEditingItemId(item.id));
        navigate(-1);
    };

    const handleConfirm = async () => {
        if (isLoading) return;
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
            title: "ยืนยันการทำรายการ",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const res = await createClaimPA();
                    return res.data;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
        }).then((result: any) => {
            if (result.isConfirmed && result.value.isResult) {
                Swal.fire({
                    icon: "success",
                    title: "ทำรายการสำเร็จ",
                    html: `
                    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;">
                        <span style="font-size:20px;font-weight:700;color:#2196F3;">${result.value.claimNo}</span>
                        <span
                            class="material-icons copy-btn"
                            data-copy="${result.value.claimNo}"
                            style="cursor:pointer;color:#2196F3;font-size:20px;user-select:none;"
                        >content_copy</span>
                    </div>

                    <div style="
                        background:#f5f5f5;
                        border-radius:8px;
                        padding:14px 20px;
                        text-align:center;
                        color:#555;
                        font-size:15px;
                        font-weight:600;
                        letter-spacing:0.5px;
                    ">
                        ${result.value.caseNo}
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
                });
                dispatch(resetState());

                navigate(`/monitor-claim`);
            } else {
                swalError("บันทึกไม่สำเร็จ !", "กรุณาลองใหม่อีกครั้ง");
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
                            <ClaimSummaryPATable
                                data={claimItems}
                                onEdit={handleEditItem}
                                onDelete={(id) => dispatch(removeClaimItem(id))}
                                onAddInsured={() => setOpenAddInsured(true)}
                            />
                        </CustomPaper>
                    </Grid>

                    {/* ── รายละเอียดบัญชี ── */}
                    <Grid item xs={12} sm={6}>
                        <CustomPaper>
                            <Grid container spacing={2} p="0 26px 0 26px">
                                <Grid item xs={12}>
                                    {/* <CustomPaper sx={{ height: "100%" }}> */}
                                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                        บัญชีรับสินไหม :
                                    </Typography>
                                    <RadioGroup value={bankAccounts.findIndex((b) => b.isDefault).toString()}>
                                        {bankAccounts.map((bank, i) => (
                                            <BankAccountCard
                                                key={bank.id}
                                                bank={bank}
                                                selected={bank.isDefault}
                                                onSelect={() => handleSelectBank(i)}
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
                    <Grid item xs={12} sm={6}>
                        <CustomPaper>
                            <Grid container spacing={2} p="0 26px 0 26px">
                                <Grid item xs={12}>
                                    {/* <CustomPaper sx={{ height: "100%" }}> */}
                                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                        เบอร์โทรติดต่อ :
                                    </Typography>
                                    <RadioGroup value={contacts.findIndex((c) => c.isDefault).toString()}>
                                        {contacts.map((contact, i) => (
                                            <ContactCard
                                                key={contact.id}
                                                contact={contact}
                                                selected={contact.isDefault}
                                                onSelect={() => handleSelectContact(i)}
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

                    {/* ── Modals ── */}
                    <AddBankAccountModal open={openBank} onClose={() => setOpenBank(false)} />
                    <AddContactModal open={openContact} onClose={() => setOpenContact(false)} />
                    <ConfirmTransferPAModal
                        open={openConfirm}
                        onClose={() => setOpenConfirm(false)}
                        onConfirm={handleConfirm}
                    />
                    <AddInsuredModal
                        open={openAddInsured}
                        onClose={() => setOpenAddInsured(false)}
                        currentItemCount={claimItems.length}
                    />
                </Grid>
            </CustomPaper>

            <Grid container spacing={1}>
                {/* ── ปุ่ม ── */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={5}>
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
                            startIcon={<CommentIcon />}
                            onClick={() => setOpenConfirm(true)}
                        >
                            แจ้งโอนเงิน
                        </Button>
                    </Box>
                </Grid>

                {/* ── Modals ── */}
                <AddBankAccountModal open={openBank} onClose={() => setOpenBank(false)} />
                <AddContactModal open={openContact} onClose={() => setOpenContact(false)} />
                <ConfirmTransferPAModal
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={handleConfirm}
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

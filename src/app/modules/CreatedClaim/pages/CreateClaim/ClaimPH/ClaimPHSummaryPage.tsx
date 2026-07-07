import React, { useState } from "react";
import { Avatar, Box, Button, Card, CardContent, Grid, IconButton, Radio, RadioGroup, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CommentIcon from "@mui/icons-material/Comment";
import { useNavigate } from "react-router-dom";
import {
    BankAccount,
    ContactInfo,
    removeBankAccount,
    removeContact,
    resetState,
    setBankAccounts,
    setContacts,
} from "../../../store/claimPHSlice";
import { setBankLogo } from "../../../../../functionHelpers";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/ClaimPH/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/ClaimPH/AddContactModal";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmTransferPHModal from "../../../components/CreateClaim/ClaimPH/ConfirmTransferPHModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ClaimSummaryPHTable from "../../../components/CreateClaim/ClaimPH/ClaimSummaryPHTable";
import { useCreateClaimPH } from "../../../hooks/CreateClaim/ClaimPH/useCreateClaimPH";
import Swal from "sweetalert2";
import { swalError } from "../../../../_common";

// ── BankAccountCard ───────────────────────────────────────────────────────────
interface BankCardProps {
    bank: BankAccount;
    selected: boolean;
    onSelect: () => void;
    onDelete?: () => void;
}

export const BankAccountCard: React.FC<BankCardProps> = ({ bank, selected, onSelect, onDelete }) => {
    const logoSrc = setBankLogo(bank.bankId);
    return (
        <Card
            variant="outlined"
            onClick={onSelect}
            sx={{
                mb: 1,
                cursor: "pointer",
                borderColor: selected ? "primary.main" : "divider",
                borderWidth: selected ? 2 : 1,
                transition: "border-color 0.2s",
                p: 1,
                ml: { sm: 2 },
                maxWidth: { lg: 450 },
                minHeight: 110,
                width: "100%",
                position: "relative",
            }}
        >
            {!bank.isFromMock && onDelete && (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 18,
                        height: 18,
                        color: "text.secondary",
                        p: 1.7,
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20, fontWeight: "bold" }} />
                </IconButton>
            )}
            <CardContent sx={{ py: 0.5, px: 1, "&:last-child": { pb: 0.5 }, pr: { xs: 1, sm: 5 } }}>
                <Box display="flex" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Radio
                            size="small"
                            checked={selected}
                            onChange={onSelect}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar
                            src={logoSrc ?? undefined}
                            variant="circular"
                            sx={{ width: 70, height: 70, bgcolor: logoSrc ? "transparent" : "#e3f2fd", flexShrink: 0 }}
                        >
                            {!logoSrc && (
                                <Typography variant="caption" color="primary" fontWeight={700}>
                                    {bank.bankName.slice(0, 2)}
                                </Typography>
                            )}
                        </Avatar>
                        <Box ml={1}>
                            <Typography variant="body2" fontWeight={700}>
                                {bank.relationship}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {bank.bankName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {bank.accountNo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {bank.accountName}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

// ── ContactCard ───────────────────────────────────────────────────────────────
interface ContactCardProps {
    contact: ContactInfo;
    selected: boolean;
    onSelect: () => void;
    onDelete?: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, selected, onSelect, onDelete }) => (
    <Card
        variant="outlined"
        onClick={onSelect}
        sx={{
            mb: 1,
            cursor: "pointer",
            borderColor: selected ? "primary.main" : "divider",
            borderWidth: selected ? 2 : 1,
            transition: "border-color 0.2s",
            maxWidth: { lg: 450 },
            minHeight: 110,
            width: "100%",
            p: 1,
            position: "relative",
            ml: { sm: 2 },
        }}
    >
        {!contact.isFromMock && onDelete && (
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 18,
                    height: 18,
                    color: "text.secondary",
                    p: 1.7,
                }}
            >
                <CloseIcon sx={{ fontSize: 20, fontWeight: "bold" }} />
            </IconButton>
        )}
        <CardContent sx={{ py: 1, px: 1, "&:last-child": { pb: 0.5 }, pr: { xs: 1, sm: 5 } }}>
            <Box display="flex" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                    <Radio size="small" checked={selected} onChange={onSelect} onClick={(e) => e.stopPropagation()} />
                    <Avatar sx={{ width: 70, height: 70, bgcolor: "success.main", flexShrink: 0 }} variant="circular">
                        <PermPhoneMsgIcon sx={{ width: 42, height: 42 }} />
                    </Avatar>
                    <Box ml={1}>
                        <Typography variant="body2" fontWeight={700}>
                            {contact.relationship}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {contact.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {contact.name}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const ClaimPHSummaryPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { form, bankAccounts, contacts, insured } = useAppSelector((state) => state.claimph);
    const { createClaimPH, isLoading } = useCreateClaimPH();
    const [openBank, setOpenBank] = useState(false);
    const [openContact, setOpenContact] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleSelectBank = (index: number) => {
        dispatch(setBankAccounts(bankAccounts.map((b, i) => ({ ...b, isDefault: i === index }))));
    };

    const handleSelectContact = (index: number) => {
        dispatch(setContacts(contacts.map((c, i) => ({ ...c, isDefault: i === index }))));
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
                    const res = await createClaimPH();
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
                        <div
                            style="
                                color:#666;
                                font-size:14px;
                                margin-top:-8px;
                                margin-bottom:24px;
                                text-align:center;
                                letter-spacing:normal;
                                word-spacing:normal;
                                font-family:inherit;
                                line-height:3;
                            "
                        >
                            ระบบได้ทำรายการเรียบร้อย และระบบจะทำการโอนเงินหลังจากได้รับ SMS
                        </div>

                        <div
                            style="
                                background:#fff;
                                border:1px solid #E5E5E5;
                                border-radius:12px;
                                padding:16px;
                                width:300px;
                                margin:0 auto;
                                box-shadow:0 2px 8px rgba(0,0,0,.12);
                                text-align:left;
                            "
                        >
                            <div style="display:flex;align-items:center;margin-bottom:12px;">
                                <div
                                    style="
                                        width:24px;
                                        height:24px;
                                        border-radius:50%;
                                        background:#27AE60;
                                        color:#fff;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:12px;
                                        font-weight:bold;
                                        margin-right:10px;
                                    "
                                >
                                    ✓
                                </div>

                                <div>
                                    <div style="font-size:12px;color:#888;">เลขที่เคลม :</div>
                                    <div
                                        style="
                                            display:flex;
                                            align-items:center;
                                            gap:6px;
                                        "
                                    >
                                        <span style="font-size:18px;font-weight:700;color:#27AE60;">
                                            ${result.value.claimNo}
                                        </span>

                                        <span
                                            class="material-icons copy-btn"
                                            data-copy="${result.value.claimNo}"
                                            style="
                                                cursor:pointer;
                                                color:#2196F3;
                                                font-size:18px;
                                                margin-left:6px;
                                                user-select:none;
                                            "
                                        >
                                            content_copy
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style="display:flex;align-items:center;">
                                <div
                                    style="
                                        width:24px;
                                        height:24px;
                                        border-radius:50%;
                                        background:#2F80ED;
                                        color:#fff;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:12px;
                                        font-weight:bold;
                                        margin-right:10px;
                                    "
                                >
                                    $
                                </div>

                                <div>
                                    <div style="font-size:12px;color:#888;">เลขที่การโอนเงิน :</div>
                                    <div style="font-size:18px;font-weight:700;color:#2F80ED;">
                                        ${result.value.caseNo}
                                    </div>
                                </div>
                            </div>
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

                                // กันการกดซ้ำ
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
                                onEdit={() => navigate(-1)}
                            />
                        </CustomPaper>
                    </Grid>
                    {/* ── บัญชีรับสินไหม | เบอร์โทรติดต่อ ── */}
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
                            onClick={() => setOpenConfirm(true)}
                        >
                            แจ้งโอนเงิน
                        </Button>
                    </Box>
                </Grid>
                {/* ── Modals ── */}
                <AddBankAccountModal open={openBank} onClose={() => setOpenBank(false)} />
                <AddContactModal open={openContact} onClose={() => setOpenContact(false)} />
                <ConfirmTransferPHModal
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    onConfirm={handleConfirm}
                    isLoading={isLoading}
                />
            </Grid>
        </>
    );
};

export default ClaimPHSummaryPage;

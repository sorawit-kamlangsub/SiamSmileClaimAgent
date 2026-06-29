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
    setBankAccounts,
    setContacts,
} from "../../../store/claimPHSlice";
import { setBankLogo } from "../../../../../functionHelpers";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/ClaimPH/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/ClaimPH/AddContactModal";
import ClaimSummaryPHTable from "../../../components/CreateClaim/ClaimPH/ClaimSummaryPHTable";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmTransferPHModal from "../../../components/CreateClaim/ClaimPH/ConfirmTransferPHModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// ── BankAccountCard ───────────────────────────────────────────────────────────
interface BankCardProps {
    bank: BankAccount;
    selected: boolean;
    onSelect: () => void;
    onDelete?: () => void;
}

const BankAccountCard: React.FC<BankCardProps> = ({ bank, selected, onSelect, onDelete }) => {
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
                                {bank.bankName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {bank.accountNo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {bank.accountName}
                            </Typography>
                            <Typography variant="caption" color="primary">
                                {bank.relationship}
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

const ContactCard: React.FC<ContactCardProps> = ({ contact, selected, onSelect, onDelete }) => (
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
            minHeight: 139,
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
                            {contact.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {contact.name}
                        </Typography>
                        <Typography variant="caption" color="primary">
                            {contact.relationship}
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

    const [openBank, setOpenBank] = useState(false);
    const [openContact, setOpenContact] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleSelectBank = (index: number) => {
        dispatch(setBankAccounts(bankAccounts.map((b, i) => ({ ...b, isDefault: i === index }))));
    };

    const handleSelectContact = (index: number) => {
        dispatch(setContacts(contacts.map((c, i) => ({ ...c, isDefault: i === index }))));
    };

    const handleConfirm = () => {
        setOpenConfirm(false);
        // TODO: Create ClaimNo → ClaimCase → ClaimPayGroup → SendSMS → UpdateStatus
        alert("บันทึกเคลมสำเร็จ");
        navigate("/monitor");
    };

    return (
        <Grid container spacing={1}>
            {/* ── ข้อมูลเคลม ── */}
            <Grid item xs={12}>
                <CustomPaper>
                    <ClaimSummaryPHTable
                        data={[
                            {
                                appId: insured?.policyCode ?? "",
                                customerName: insured?.customerName ?? "",
                                claimType: `${form.incidentTypeName ?? ""} / ${form.coverageTypeName ?? ""}`,
                                claimAmount: Number(form.claimAmount),
                            },
                        ]}
                        onEdit={() => navigate(-1)}
                    />
                </CustomPaper>
            </Grid>
            {/* ── บัญชีรับสินไหม | เบอร์โทรติดต่อ ── */}
            <Grid item xs={12} sm={6}>
                <CustomPaper>
                    <HeadingWithColor
                        text="รายละเอียดบัญชี"
                        color="blue"
                        icon={<AccountBalanceIcon sx={{ fontSize: 27 }} />}
                    />
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
                            <Box
                                display="flex"
                                justifyContent="end"
                                alignItems="center"
                                mb={1}
                                ml={2}
                                maxWidth={{ lg: 450 }}
                            >
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddCircleIcon />}
                                    onClick={() => setOpenBank(true)}
                                >
                                    เพิ่มบัญชีรับสินไหม
                                </Button>
                            </Box>
                            {/* </CustomPaper> */}
                        </Grid>
                    </Grid>
                </CustomPaper>
            </Grid>
            <Grid item xs={12} sm={6}>
                <CustomPaper>
                    <HeadingWithColor
                        text="รายละเอียดการติดต่อ"
                        color="blue"
                        icon={<FontAwesomeIcon icon="address-book" fontSize={26} />}
                    />
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
                            <Box
                                display="flex"
                                justifyContent="end"
                                alignItems="center"
                                mb={1}
                                ml={2}
                                maxWidth={{ lg: 450 }}
                            >
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddCircleIcon />}
                                    onClick={() => setOpenContact(true)}
                                >
                                    เพิ่มเบอร์โทรใหม่
                                </Button>
                            </Box>
                            {/* </CustomPaper> */}
                        </Grid>
                    </Grid>
                </CustomPaper>
            </Grid>
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
            />
        </Grid>
    );
};

export default ClaimPHSummaryPage;

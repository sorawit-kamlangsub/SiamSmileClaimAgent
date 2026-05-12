import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Card, CardContent, Grid, IconButton, Radio, RadioGroup, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    removeBankAccount,
    removeContact,
    setBankAccounts,
    setContacts,
    removeClaimItem,
    setEditingItemId,
    setClaimItems, // ← เพิ่ม reducer นี้ใน slice
    ClaimInsuredItem,
} from "../../../store/claimPASlice";
import { setBankLogo } from "../../../../../functionHelpers";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/ClaimPH/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/ClaimPH/AddContactModal";
import ConfirmTransferPAModal from "../../../components/CreateClaim/ClaimPA/ConfirmTransferPAModal";
import ClaimSummaryPATable from "../../../components/CreateClaim/ClaimPA/ClaimSummaryPATable";
import SchoolInfoSection from "../../../components/CreateClaim/ClaimPA/SchoolInfoSection";
import { mockClaimItemsPA } from "../../../store/mockClaimPH";
import AddInsuredModal from "../../../components/CreateClaim/ClaimPA/AddInsuredModal";

const ClaimPASummaryPage: React.FC<{}> = ({}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { bankAccounts, contacts, claimItems, school } = useAppSelector((s) => s.claimpa);

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

    const handleConfirm = () => {
        setOpenConfirm(false);
        alert("บันทึกเคลมสำเร็จ");
        navigate("/monitor");
    };

    return (
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
            <Grid item xs={12}>
                <CustomPaper>
                    <HeadingWithColor text="รายละเอียดบัญชี" color="blue" />
                    <Grid container spacing={2} p="0 26px 0 26px">
                        {/* บัญชีรับสินไหม */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                บัญชีรับสินไหม :
                            </Typography>
                            <RadioGroup value={bankAccounts.findIndex((b) => b.isDefault).toString()}>
                                {bankAccounts.map((bank, i) => {
                                    const logoSrc = setBankLogo(bank.bankId);
                                    return (
                                        <Card
                                            key={bank.id}
                                            variant="outlined"
                                            onClick={() => handleSelectBank(i)}
                                            sx={{
                                                mb: 1,
                                                cursor: "pointer",
                                                p: 1,
                                                ml: { sm: 2 },
                                                width: "100%",
                                                maxWidth: { lg: 450 },
                                                position: "relative",
                                                borderColor: bank.isDefault ? "primary.main" : "divider",
                                                borderWidth: bank.isDefault ? 2 : 1,
                                            }}
                                        >
                                            {!bank.isFromMock && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(removeBankAccount(bank.id));
                                                    }}
                                                    sx={{
                                                        position: "absolute",
                                                        top: 4,
                                                        right: 4,
                                                        width: 18,
                                                        height: 18,
                                                        bgcolor: "error.main",
                                                        color: "common.white",
                                                        "&:hover": { bgcolor: "error.dark" },
                                                    }}
                                                >
                                                    <CloseIcon sx={{ fontSize: 12 }} />
                                                </IconButton>
                                            )}
                                            <CardContent sx={{ py: 0.5, px: 1, "&:last-child": { pb: 0.5 }, pr: 5, }}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Radio
                                                            size="small"
                                                            checked={bank.isDefault}
                                                            onChange={() => handleSelectBank(i)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <Box>
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
                                                    <Avatar
                                                        src={logoSrc ?? undefined}
                                                        variant="circular"
                                                        sx={{
                                                            width: 70,
                                                            height: 70,
                                                            bgcolor: logoSrc ? "transparent" : "#e3f2fd",
                                                        }}
                                                    >
                                                        {!logoSrc && (
                                                            <Typography
                                                                variant="caption"
                                                                color="primary"
                                                                fontWeight={700}
                                                            >
                                                                {bank.bankName.slice(0, 2)}
                                                            </Typography>
                                                        )}
                                                    </Avatar>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </RadioGroup>
                            <Box display="flex" justifyContent="end" mb={1} ml={2} maxWidth={{ lg: 450 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddCircleIcon />}
                                    onClick={() => setOpenBank(true)}
                                >
                                    เพิ่มบัญชีรับสินไหม
                                </Button>
                            </Box>
                        </Grid>

                        {/* เบอร์โทรติดต่อ */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                เบอร์โทรติดต่อ :
                            </Typography>
                            <RadioGroup value={contacts.findIndex((c) => c.isDefault).toString()}>
                                {contacts.map((contact, i) => (
                                    <Card
                                        key={contact.id}
                                        variant="outlined"
                                        onClick={() => handleSelectContact(i)}
                                        sx={{
                                            mb: 1,
                                            cursor: "pointer",
                                            p: 1,
                                            ml: { sm: 2 },
                                            width: "100%",
                                            maxWidth: { lg: 450 },
                                            minHeight: 139,
                                            position: "relative",
                                            borderColor: contact.isDefault ? "primary.main" : "divider",
                                            borderWidth: contact.isDefault ? 2 : 1,
                                        }}
                                    >
                                        {!contact.isFromMock && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dispatch(removeContact(contact.id));
                                                }}
                                                sx={{
                                                    position: "absolute",
                                                    top: 4,
                                                    right: 4,
                                                    width: 18,
                                                    height: 18,
                                                    bgcolor: "error.main",
                                                    color: "common.white",
                                                    "&:hover": { bgcolor: "error.dark" },
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                        )}
                                        <CardContent sx={{ py: 0.5, px: 1, "&:last-child": { pb: 0.5 }, pr: 5 }}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Radio
                                                        size="small"
                                                        checked={contact.isDefault}
                                                        onChange={() => handleSelectContact(i)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Box>
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
                                                <Avatar
                                                    sx={{ width: 70, height: 70, bgcolor: "#e8f5e9" }}
                                                    variant="circular"
                                                >
                                                    <LocalPhoneIcon
                                                        sx={{ width: 35, height: 35, color: "success.main" }}
                                                    />
                                                </Avatar>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </RadioGroup>
                            <Box display="flex" justifyContent="end" mb={1} ml={2} maxWidth={{ lg: 450 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddCircleIcon />}
                                    onClick={() => setOpenContact(true)}
                                >
                                    เพิ่มเบอร์โทรใหม่
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CustomPaper>
            </Grid>

            {/* ── ปุ่ม ── */}
            <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" mb={5}>
                    <Button variant="outlined" sx={{ bgcolor: "#fff" }} onClick={() => navigate(-1)}>
                        กลับ
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
    );
};

export default ClaimPASummaryPage;

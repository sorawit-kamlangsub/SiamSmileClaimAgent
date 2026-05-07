import React, { useState } from "react";
import { Avatar, Box, Button, Card, CardContent, Grid, IconButton, Radio, RadioGroup, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { BankAccount, ContactInfo, setBankAccounts, setContacts } from "../../../store/claimPHSlice";
import { setBankLogo } from "../../../../../functionHelpers";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import AddBankAccountModal from "../../../components/CreateClaim/ClaimPH/AddBankAccountModal";
import AddContactModal from "../../../components/CreateClaim/ClaimPH/AddContactModal";
import ConfirmTransferModal from "../../../components/CreateClaim/ClaimPH/ConfirmTransferModal";

// ── BankAccountCard ───────────────────────────────────────────────────────────

interface BankCardProps {
    bank: BankAccount;
    selected: boolean;
    onSelect: () => void;
}

const BankAccountCard: React.FC<BankCardProps> = ({ bank, selected, onSelect }) => {
    const logoSrc = setBankLogo(bank.bankId);
    return (
        <Card
            variant="outlined"
            onClick={onSelect}
            sx={{
                mb: 1,
                cursor: "pointer",
                borderColor: selected ? "#02579B" : "divider",
                borderWidth: selected ? 2 : 1,
                transition: "border-color 0.2s",
            }}
        >
            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Radio size="small" checked={selected} onChange={onSelect} onClick={(e) => e.stopPropagation()} />
                    {logoSrc ? (
                        <Avatar src={logoSrc} variant="rounded" sx={{ width: 36, height: 36 }} />
                    ) : (
                        <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "#e3f2fd" }}>
                            <Typography variant="caption" color="primary" fontWeight={700}>
                                {bank.bankName.slice(0, 2)}
                            </Typography>
                        </Avatar>
                    )}
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
            </CardContent>
        </Card>
    );
};

// ── ContactCard ───────────────────────────────────────────────────────────────

interface ContactCardProps {
    contact: ContactInfo;
    selected: boolean;
    onSelect: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, selected, onSelect }) => (
    <Card
        variant="outlined"
        onClick={onSelect}
        sx={{
            mb: 1,
            cursor: "pointer",
            borderColor: selected ? "#02579B" : "divider",
            borderWidth: selected ? 2 : 1,
            transition: "border-color 0.2s",
        }}
    >
        <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
            <Box display="flex" alignItems="center" gap={1}>
                <Radio size="small" checked={selected} onChange={onSelect} onClick={(e) => e.stopPropagation()} />
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#e8f5e9" }}>
                    <Typography variant="caption" color="success.main" fontWeight={700}>
                        {contact.name.slice(0, 2)}
                    </Typography>
                </Avatar>
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
        </CardContent>
    </Card>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

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
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} color="primary">
                    สรุปรายการเคลม และข้อมูลบัญชี
                </Typography>
            </Grid>

            {/* ── ข้อมูลเคลม ── */}
            <Grid item xs={12}>
                <CustomPaper>
                    <HeadingWithColor text="ข้อมูลเคลม" color="blue" />
                    <Box sx={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ backgroundColor: "#02579B", color: "#fff" }}>
                                    {["ApplicationID", "ชื่อผู้เอาประกัน", "ลักษณะการเคลม", "ยอดเบิก", ""].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: "8px 16px",
                                                textAlign: h === "ยอดเบิก" ? "right" : "center",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: "8px 16px", textAlign: "center" }}>{insured?.appId}</td>
                                    <td style={{ padding: "8px 16px", textAlign: "center" }}>
                                        {insured?.customerName}
                                    </td>
                                    <td style={{ padding: "8px 16px", textAlign: "center" }}>{form.claimType}</td>
                                    <td style={{ padding: "8px 16px", textAlign: "right" }}>
                                        {Number(form.claimAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: "8px 16px", textAlign: "center" }}>
                                        <IconButton size="small" color="primary" onClick={() => navigate("/claim/ph")}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Box>
                </CustomPaper>
            </Grid>

            {/* ── บัญชีรับสินไหม | เบอร์โทรติดต่อ ── */}
            <Grid item xs={12} md={6}>
                <CustomPaper sx={{ height: "100%" }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <HeadingWithColor text="บัญชีรับสินไหม" color="blue" />
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddCircleIcon />}
                            onClick={() => setOpenBank(true)}
                        >
                            เพิ่มบัญชีรับสินไหม
                        </Button>
                    </Box>
                    <RadioGroup value={bankAccounts.findIndex((b) => b.isDefault).toString()}>
                        {bankAccounts.map((bank, i) => (
                            <BankAccountCard
                                key={bank.id}
                                bank={bank}
                                selected={bank.isDefault}
                                onSelect={() => handleSelectBank(i)}
                            />
                        ))}
                    </RadioGroup>
                </CustomPaper>
            </Grid>

            <Grid item xs={12} md={6}>
                <CustomPaper sx={{ height: "100%" }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <HeadingWithColor text="เบอร์โทรติดต่อ" color="blue" />
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddCircleIcon />}
                            onClick={() => setOpenContact(true)}
                        >
                            เพิ่มเบอร์โทรใหม่
                        </Button>
                    </Box>
                    <RadioGroup value={contacts.findIndex((c) => c.isDefault).toString()}>
                        {contacts.map((contact, i) => (
                            <ContactCard
                                key={contact.id}
                                contact={contact}
                                selected={contact.isDefault}
                                onSelect={() => handleSelectContact(i)}
                            />
                        ))}
                    </RadioGroup>
                </CustomPaper>
            </Grid>

            {/* ── ปุ่ม ── */}
            <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={() => navigate("/claim/ph")}>
                        กลับ
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
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
            <ConfirmTransferModal open={openConfirm} onClose={() => setOpenConfirm(false)} onConfirm={handleConfirm} />
        </Grid>
    );
};

export default ClaimPHSummaryPage;

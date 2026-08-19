import { Avatar, Box, Card, CardContent, IconButton, Radio, Typography } from "@mui/material";
import { ContactInfo } from "../../store/claimPHSlice";
import CloseIcon from "@mui/icons-material/Close";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";

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
            maxWidth: { xs: "100%", lg: 450 },
            minHeight: { xs: 96, sm: 110 },
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            p: { xs: 0.75, sm: 1 },
            position: "relative",
            ml: { sm: 2 },
        }}
    >
        {onDelete && (
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
        <CardContent
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 1 },
                pr: { xs: 4, sm: 5 },
                "&:last-child": { pb: 0.5 },
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "auto 52px minmax(0, 1fr)", sm: "auto 70px minmax(0, 1fr)" },
                    alignItems: "center",
                    gap: { xs: 1, sm: 2 },
                    width: "100%",
                    minWidth: 0,
                }}
            >
                <Radio
                    size="small"
                    checked={selected}
                    onChange={onSelect}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: { xs: 0.25, sm: 0.5 } }}
                />
                <Avatar
                    sx={{
                        width: { xs: 52, sm: 70 },
                        height: { xs: 52, sm: 70 },
                        bgcolor: "success.main",
                        flexShrink: 0,
                    }}
                    variant="circular"
                >
                    <PermPhoneMsgIcon sx={{ width: { xs: 34, sm: 42 }, height: { xs: 34, sm: 42 } }} />
                </Avatar>
                <Box sx={{ minWidth: 0, width: "100%" }}>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                    >
                        {contact.contactPersonTypeName}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                    >
                        {contact.contactPhoneNo}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}
                    >
                        {contact.contactName}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

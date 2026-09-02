import React from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import CustomBox from "../../_common/components/CustomComponent/CustomBox";
import PolicyIcon from "@mui/icons-material/Policy";

type Props = {
    onOpenExclusion: () => void;
};

const PolicyConditionCard: React.FC<Props> = ({ onOpenExclusion }) => {
    return (
        <CustomBox>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: 35,
                        height: 35,
                        borderRadius: "20%",
                        bgcolor: "#fdf6e3",
                    }}
                >
                    <PolicyIcon sx={{ color: "#e8971f", fontSize: 25 }} />
                </Box>
                <Typography variant="body2" fontWeight={700} color="#6e5210">
                    เงื่อนไขกรมธรรม์
                </Typography>
            </Box>
            <Divider sx={{ my: 1.5, mx: -2.5 }} />
            <Button
                variant="contained"
                startIcon={<ManageSearchIcon />}
                onClick={onOpenExclusion}
                sx={{
                    bgcolor: "#8B6914",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    "&:hover": { bgcolor: "#6e5210" },
                    alignItems: "center",
                }}
                fullWidth
            >
                โรคยกเว้นและเงื่อนไขระยะเวลารอคอย
            </Button>

            {/* </Grid> */}
        </CustomBox>
    );
};

export default PolicyConditionCard;

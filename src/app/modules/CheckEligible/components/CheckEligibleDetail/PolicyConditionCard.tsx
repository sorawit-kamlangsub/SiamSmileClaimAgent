import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

type Props = {
    onOpenExclusion: () => void;
};

const PolicyConditionCard: React.FC<Props> = ({ onOpenExclusion }) => {
    return (
        <Box
            sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2.5,
                bgcolor: "#fff",
                mb: 2,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "#fdf6e3",
                    borderLeft: "4px solid #c8a415",
                    px: 2,
                    py: 1,
                    mb: 2,
                    borderRadius: "0 4px 4px 0",
                }}
            >
                <Typography variant="subtitle1" fontWeight={700} color="#c8a415">
                    เงื่อนไขกรมธรรม์
                </Typography>
            </Box>
            {/* <Grid container alignItems="center" justifyContent="center"> */}
                <Button
                    variant="contained"
                    startIcon={<ManageSearchIcon />}
                    onClick={onOpenExclusion}
                    sx={{
                        bgcolor: "#8B6914",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        "&:hover": { bgcolor: "#6e5210" },
                    }}
                >
                    โรคยกเว้นและเงื่อนไขระยะเวลารอคอย
                </Button>
            {/* </Grid> */}
        </Box>
    );
};

export default PolicyConditionCard;

import React from "react";
import { Button } from "@mui/material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import CustomBox from "../../../_common/components/CustomComponent/CustomBox";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";

type Props = {
    onOpenExclusion: () => void;
};

const PolicyConditionCard: React.FC<Props> = ({ onOpenExclusion }) => {
    return (
        <CustomBox>
            {/* Header */}
            <HeadingWithColor text="เงื่อนไขกรมธรรม์" color="yellow" />
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
        </CustomBox>
    );
};

export default PolicyConditionCard;

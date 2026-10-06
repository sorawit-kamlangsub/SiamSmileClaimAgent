import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type SpiltButtonActionProps = {
    paymentId: string;
    handleTransfer: (paymentId: string) => void;
};

const SpitButtonAction = ({ paymentId, handleTransfer }: SpiltButtonActionProps) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    return (
        <>
            <Button
                variant="outlined"
                sx={{
                    backgroundColor: "#F2FAFF",
                    borderBlockColorColor: "#03A9F4",
                    borderRadius: "72px",

                    "&:hover": {
                        backgroundColor: "#F2FAFF",
                    },
                }}
                onClick={handleClick}
                aria-controls={open ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
            >
                <MoreVertIcon sx={{ color: "#03A9F4", cursor: "pointer" }} />
            </Button>
            <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                <MenuItem
                    // onClick={() => {
                    //     handleRedirect(headerId);
                    // }}
                    // disabled={handleEnable(statusId).enableConsider}
                    disabled
                >
                    ดูรายละเอียด
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleTransfer(paymentId);
                    }}
                    // disabled={handleEnable(statusId).enableDetail}
                >
                    โอนทันที
                </MenuItem>
                <MenuItem
                    // onClick={() => {
                    //     handleShowPDF();
                    // }}
                    // disabled={handleEnable(statusId).enablePrint}
                    disabled
                >
                    เอกสารแจ้งชำระ
                </MenuItem>
            </Menu>
        </>
    );
};

export default SpitButtonAction;

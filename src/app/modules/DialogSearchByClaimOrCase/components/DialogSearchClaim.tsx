import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import { setIsOpenDialog } from "../../Refund/store/refundSlice";
import useDialogSearchHook from "../hooks/DialogSearchHook";
import { FormikTextField } from "../../_common";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ClaimListByClaimSearchTable from "./ClaimListByClaimSearchTable";

type DialogSearchClaimProps = {
    navigatePath: string;
    buttonText: string;
};

const DialogSearchClaim = ({ navigatePath, buttonText }: DialogSearchClaimProps) => {
    const { dialogRefund } = useAppSelector((state) => state.refund);
    const [searchResult, setSearchResult] = useState<any>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSearchSuccess = (data: any[]) => {
        if (!data || data.length === 0) {
            return;
        }

        const allAreClaimNo = data.every((item) => item.isClaimNo);

        if (allAreClaimNo) {
            setSearchResult(data);
        } else {
            navigate("/");
        }
    };

    const { formik } = useDialogSearchHook({
        onSearchSuccess: handleSearchSuccess,
    });

    const handleClose = () => {
        dispatch(setIsOpenDialog({ isOpen: false }));
        setSearchResult(null);
        formik.resetForm();
    };

    useEffect(() => {
        if (!formik.values.searchDetail) setSearchResult(null);
        return () => {
            setSearchResult(null);
        };
    }, [formik.values.searchDetail]);

    return (
        <>
            <Dialog
                onClose={handleClose}
                open={dialogRefund.isOpen}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: "12px" } }}
            >
                <Box sx={{ padding: "20px 24px" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "16px",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    backgroundColor: "#E3F2FD",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <PersonSearchIcon sx={{ color: "#1565C0", fontSize: 18 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 700, color: "#212121" }}>ค้นหารายการ</Typography>
                        </Box>

                        <IconButton
                            size="small"
                            onClick={handleClose}
                            sx={{
                                backgroundColor: "#E53935",
                                color: "#FFFFFF",
                                "&:hover": { backgroundColor: "#C62828" },
                                width: 28,
                                height: 28,
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", gap: "12px" }}>
                        <FormikTextField
                            formik={formik}
                            name="searchDetail"
                            label="กรุณากรอกเลขที่ CPG / CL"
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={() => {
                                formik.handleSubmit();
                            }}
                            sx={{
                                backgroundColor: "#0D4C8C",
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                paddingX: "24px",
                                "&:hover": { backgroundColor: "#0A3D70" },
                            }}
                        >
                            ค้นหา
                        </Button>
                    </Box>
                </Box>

                {searchResult && (
                    <Box sx={{ p: 2 }}>
                        <ClaimListByClaimSearchTable
                            claimData={searchResult}
                            navigatePath={navigatePath}
                            buttonText={buttonText}
                        />
                    </Box>
                )}
            </Dialog>
        </>
    );
};

export default DialogSearchClaim;

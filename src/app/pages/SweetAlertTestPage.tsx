import React, { useState } from "react";
import { Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { swalClaimListSuccess, swalConfirmAction, swalExtraPaymentSuccess } from "../modules/_common/customSweetAlert";

// หน้าทดสอบปุ่มเรียก custom sweet alert ทั้ง 3 แบบ — ลบออกได้เมื่อทดสอบเสร็จ ไม่ใช่ route จริงของ feature
export const SweetAlertTestPage: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleTestExtraPaymentSuccess = () => {
        swalExtraPaymentSuccess({
            bankAccount: {
                bankId: 4,
                bankName: "กรุงไทย",
                bankAccountNo: "5281137123",
                bankAccountName: "นางสาวรัชชนก สุวรรณโชค",
            },
            totalExtraTransferAmount: 200,
            transferItems: [
                { fullName: "นายรภีพร วรวงศ์คุณากร", amount: 100 },
                { fullName: "นางสาวชลธิชา รัตนมณี", amount: 100 },
            ],
            onCopyAmount: () => setCopied(true),
        });
    };

    const handleTestClaimListSuccessSingle = () => {
        swalClaimListSuccess({
            title: "บันทึกสำเร็จ",
            subtitle: "รอขยายวงเงินจากเคลมออนไลน์",
            claimNos: ["CL6904000222"],
        });
    };

    const handleTestClaimListSuccessMultiple = () => {
        swalClaimListSuccess({
            title: "บันทึกสำเร็จ",
            subtitle: "รอขยายวงเงินจากเคลมออนไลน์",
            claimNos: ["CL6904000193", "CL6904000194", "CL6904000222"],
        });
    };

    const handleTestConfirmAction = () => {
        swalConfirmAction({
            preConfirm: async () => {
                await new Promise((r) => setTimeout(r, 800));
                return { ok: true };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // eslint-disable-next-line no-console
                console.log("confirmed:", result.value);
            }
        });
    };

    return (
        <Box p={3}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                ทดสอบ Custom Sweet Alert
            </Typography>
            <Stack spacing={2} maxWidth={320}>
                <Button variant="contained" onClick={handleTestExtraPaymentSuccess}>
                    ทดสอบ: บันทึกโอนเพิ่มสำเร็จ
                </Button>
                <Button variant="contained" onClick={handleTestClaimListSuccessSingle}>
                    ทดสอบ: บันทึกสำเร็จ (CL เดียว)
                </Button>
                <Button variant="contained" onClick={handleTestClaimListSuccessMultiple}>
                    ทดสอบ: บันทึกสำเร็จ (หลาย CL)
                </Button>
                <Button variant="outlined" color="warning" onClick={handleTestConfirmAction}>
                    ทดสอบ: ยืนยันการทำรายการ
                </Button>
            </Stack>

            <Snackbar
                open={copied}
                autoHideDuration={2000}
                onClose={() => setCopied(false)}
                message="คัดลอกยอดเงินแล้ว"
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            />
        </Box>
    );
};

import { FormikErrors, useFormik } from "formik";
import { swalConfirm, swalSuccess, swalWarning } from "../../../_common";
import { useEffect } from "react";
import {
    useGetRefundDetail,
    useGetRefundReasons,
    useGetRefundTransferTypes,
} from "../../../Refund/refundAPI";
import { RefundItemsFormValues } from "../../components/Refund/DetailTab/RefundItemsTable";
import { RefundRecordFormValues } from "../../components/Refund/DetailTab/RefundRecordForm";

type RefundDetailFormValues = RefundItemsFormValues & RefundRecordFormValues;

// TODO: mock detail ใช้ตอน backend ยังไม่คืน data จาก /Refund/SaveRefundDetails
const mockDetailData: any = {
    claimNo: "CL690400010",
    customerName: "โรงเรียนบ้านท่ามะกา",
    createdByUserName: "00054 - สุวัฒนา อินทะปัญญา",
    countItem: 2,
    totalNetPaidAmount: 2500,
    account: {
        contactPerson: "ผู้เอาประกัน",
        accountNo: "5281137123",
        accountName: "นางสาวรัชชนก สุวรรณโชค",
        addedDate: "11/10/2568",
        bankId: 1,
        bankName: "ธนาคารกรุงไทย",
    },
    caseDetails: [
        {
            caseId: "1",
            customerName: "นายกรภัทร วรวงศ์ศุภากร",
            coverageTypeNameTH: "อุบัติเหตุ/ค่ารักษา/OPD",
            caseNo: "CC6904000048",
            totalNetPaidAmount: 4000,
            additionalAmount: 0,
        },
        {
            caseId: "2",
            customerName: "นางสาวชลธิชา รัตนมณี",
            coverageTypeNameTH: "เจ็บป่วย/ค่ารักษา/OPD",
            caseNo: "CC6904000194",
            totalNetPaidAmount: 1900,
            additionalAmount: 0,
        },
    ],
};

const emptyFormValues: RefundDetailFormValues = {
    items: [],
    refundTransferType: undefined,
    refundSlipDateTime: null,
    reasonId: undefined,
    note: "",
    slipFile: [],
};

const useManageRefundDetailHook = (caseId: string) => {
    const { data: refundDetailRes, isLoading: isDetailLoading } = useGetRefundDetail(caseId);
    const { data: refundReasonsRes, isLoading: isReasonLoading } = useGetRefundReasons();
    const { data: transferTypeRes, isLoading: isTransferTypeLoading } = useGetRefundTransferTypes(3);

    // TODO: ลบ mock เมื่อ backend คืนข้อมูลจริงจาก /Refund/SaveRefundDetails
    const detailData = refundDetailRes?.data ?? mockDetailData;

    const mapCaseDetailsRows = (caseDetails: any[]) =>
        (caseDetails ?? []).map((row, index) => ({
            caseId: row.caseId ?? `${row.caseNo ?? index}`,
            customerName: row.customerName,
            coverageTypeNameTH: row.coverageTypeNameTH,
            caseNo: row.caseNo,
            totalNetPaidAmount: row.totalNetPaidAmount,
            additionalAmount: 0,
        }));

    const handleSaveSuccess = () => {
        swalSuccess("ทำรายการสำเร็จ", "บันทึกคำขอคืนเงินสำเร็จ");
    };

    // TODO: เรียกใช้ useSaveRefund เมื่อ backend พร้อม
    const mutate = (_payload: any) => {
        handleSaveSuccess();
    };

    const formik = useFormik<RefundDetailFormValues>({
        initialValues: emptyFormValues,
        validate: (values) => {
            const errors: FormikErrors<RefundDetailFormValues> = {};

            if (!values.refundTransferType) {
                errors.refundTransferType = "กรุณาเลือกประเภทการโอน";
            }

            if (!values.refundSlipDateTime) {
                errors.refundSlipDateTime = "กรุณาเลือกวันที่/เวลาโอนคืน Slip";
            }

            if (!values.reasonId) {
                errors.reasonId = "กรุณาเลือกสาเหตุที่โอนคืน";
            }

            if (!values.note?.trim()) {
                errors.note = "กรุณากรอกหมายเหตุ";
            }

            if (!values.slipFile || values.slipFile.length === 0) {
                errors.slipFile = "กรุณาเลือก Slip การโอนคืน";
            }

            return errors;
        },
        onSubmit: (values) => {
            const refundAmount = Number(values.items?.[0]?.additionalAmount ?? 0);

            if (refundAmount === 0) {
                swalWarning("แจ้งเตือน", "กรุณากรอกจำนวนเงินที่ต้องการโอนคืน");
            } else if (refundAmount > Number(detailData?.totalNetPaidAmount ?? 0)) {
                swalWarning("แจ้งเตือน", "ยอดโอนคืนต้องไม่เกินจำนวนเงินที่โอนแล้วของเคส");
            } else {
                const payload = {
                    caseId: "CL690400010",
                    refundType: values.refundTransferType,
                    slipDateTime: values.refundSlipDateTime?.format("YYYY-MM-DD HH:mm:ss"),
                    items: values.items.map((item) => ({
                        caseNo: item.caseNo,
                        refundAmount: Number(item.additionalAmount ?? 0).toFixed(2),
                    })),
                    refundReasonId: values.reasonId,
                    remark: values.note,
                    slipFile: values.slipFile,
                };
                swalConfirm("ยืนยันการคืนเงิน", "ต้องการยืนยันการคืนเงินใช่หรือไม่", "ยืนยัน", "ยกเลิก").then((res) => {
                    if (res.isConfirmed) {
                        mutate(payload);
                    }
                });
            }
        },
    });

    useEffect(() => {
        if (detailData?.caseDetails) {
            formik.resetForm({
                values: {
                    items: mapCaseDetailsRows(detailData.caseDetails),
                    refundTransferType: undefined,
                    refundSlipDateTime: null,
                    reasonId: undefined,
                    note: "",
                    slipFile: [],
                },
            });
        }
    }, [detailData]);

    const transferTypeOptions = (transferTypeRes?.data ?? []).map((item: any) => ({
        id: item.adjustmentReasonId ?? item.id,
        name: item.adjustmentReasonName ?? item.name,
    }));

    return {
        formik,
        summary: detailData,
        isDetailLoading,
        reasonOptions: refundReasonsRes?.data,
        reasonOptionIsLoading: isReasonLoading,
        transferTypeOptions,
        transferTypeOptionIsLoading: isTransferTypeLoading,
    };
};

export default useManageRefundDetailHook;
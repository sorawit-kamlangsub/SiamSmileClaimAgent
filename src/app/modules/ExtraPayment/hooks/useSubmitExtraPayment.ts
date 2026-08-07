import { useState } from "react";
import { CreateExtraPaymentPayload, CreateExtraPaymentResponse } from "../store/ExtraPayment.types";
import { USE_MOCK_DATA } from "../store/ExtraPaymentMock";

export const useSubmitExtraPayment = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);

    const submit = async (payload: CreateExtraPaymentPayload): Promise<CreateExtraPaymentResponse | null> => {
        setIsSubmitting(true);
        setIsError(false);
        try {
            if (USE_MOCK_DATA) {
                await new Promise((r) => setTimeout(r, 400));
                // return { success: true, transferRefNo: "MOCK-REF-0001" };
            }
            // TODO: เปลี่ยน endpoint ให้ตรงกับ backend จริง
            const res = await fetch(`/api/extra-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to submit extra payment");
            const json: CreateExtraPaymentResponse = await res.json();
            return json;
        } catch (err) {
            setIsError(true);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submit, isSubmitting, isError };
};

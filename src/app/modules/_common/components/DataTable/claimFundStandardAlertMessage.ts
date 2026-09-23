export const NOT_FOUND_MESSAGE = "ไม่พบข้อมูล";

export const mapErrorMessage = (err: unknown): string => {
    const message =
        typeof err === "string"
            ? err
            : err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "";

    if (!message) return "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง";
    if (/404|not found/i.test(message)) return "เกิดข้อผิดพลาด: ไม่พบข้อมูล (404)";
    if (/cors/i.test(message)) return "เกิดข้อผิดพลาด: การเชื่อมต่อถูกบล็อก (CORS)";
    if (/network|timeout|ECONNABORTED|timed out/i.test(message)) {
        return "เกิดข้อผิดพลาด: ไม่สามารถติดต่อเซิร์ฟเวอร์ได้หรือหมดเวลา (Timeout)";
    }
    return `เกิดข้อผิดพลาด: ${message}`;
};
# Agent — สารบัญ Skill และแนวปฏิบัติของโปรเจค ClaimAgent

## วิธีใช้ (สำหรับ AI Agent)

- **อ่านไฟล์นี้ก่อนเริ่มงานเสมอ** เพื่อเลือก skill ที่ตรงกับงาน
- Skill ที่เกี่ยวข้อง → อ่าน `SKILL.md` นั้นผ่าน `read` tool แล้วปฏิบัติตามมาตรฐาน SSD
- รายละเอียดสถานะงานปัจจุบัน ดูได้ที่ `ClaimFundRefundSkill.md`
- สไตล์การเขียนโค้ด ดูได้ที่ `AUN.md` (อ่าน `§0`–`§2` เสมอ แล้วอ่านเฉพาะ section ที่เกี่ยวกับงาน)
- กฎเตือนตัวเองไม่ให้ฟุ้งซ่าน → อ่าน `FOCUS.md` (หลัก 6 ข้อ ทวนก่อนลงมือทุกครั้ง)
- **งานโอนเงินเคลมเพิ่ม (ขยายวงเงิน / IncreaseLimitTransfer) → อ่าน `ClaimFundAdditionalTransfer.md` ก่อนเสมอ**
- **งานสอบถามธนาคาร (BankStatus / Inquiry) → อ่าน `ClaimFundInquiry.md` ก่อนเสมอ**
- **API PayTransfer / โอนเงินจ่ายเคลม (`Transfer/v1/*`, `Setting`, `Notification`) → อ่าน `ClaimFundPayTransfer.md` (swagger host เก่า)`**
- **API กลุ่ม `ClaimFund` บน APIGW (`/api/ClaimFund/*`: Refund/Inquiry/AdditionalTransfer/FailedPayTransfer/Setting/Masters) → อ่าน `ClaimFundApi.md` (swagger CoreClaim_api / dev tunnel)`**

## สารบัญ Skill (.opencode-ai/skills)

| # | Skill | Path | ใช้เมื่อ |
|---|-------|------|---------|
| 1 | ssd-react-api | `.opencode-ai/skills/ssd-react-api/SKILL.md` | เรียก API ด้วย Axios, สร้าง React Query hook, ใช้ NSwag, จัดการ HTTP request/response |
| 2 | ssd-react-form | `.opencode-ai/skills/ssd-react-form/SKILL.md` | สร้าง Form ด้วย Formik, validation, ปรับแต่ง MUI component ให้ใช้กับ Formik |
| 3 | ssd-react-state | `.opencode-ai/skills/ssd-react-state/SKILL.md` | ใช้งาน Redux Toolkit, สร้าง slice, ตั้งค่า rootReducer, dispatch/subscribe |
| 4 | ssd-react-component | `.opencode-ai/skills/ssd-react-component/SKILL.md` | เขียน React component, กำหนด Props type, Refs/Fragments, ตั้งชื่อ component/page/module |

## กฎสำคัญประจำโปรเจค (จาก ClaimFundRefundSkill.md)

- **รากที่เชื่อถือได้ = `D:\source\repo\ClaimAgent\src\app\modules\...`** ผ่าน `read`/`edit` tool
- มี mirror/ghost อีกต้นที่ bash/git มัก resolve ไปเจอและทำลาย byte string — อย่าเชื่อ byte จาก bash/git
- อ่านด้วย `read` → แก้ด้วย `edit` โดยเอา `oldString` จาก output ของ `read` ตรงตัว (byte-for-byte)
- งาน typecheck ใช้ `npx tsc --noEmit`
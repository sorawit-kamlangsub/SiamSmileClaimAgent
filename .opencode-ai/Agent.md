# Agent — สารบัญ Skill และแนวปฏิบัติของโปรเจค ClaimAgent

## วิธีใช้ (สำหรับ AI Agent)

- **อ่านไฟล์นี้ก่อนเริ่มงานเสมอ** เพื่อเลือก skill ที่ตรงกับงาน
- Skill ที่เกี่ยวข้อง → อ่าน `SKILL.md` นั้นผ่าน `read` tool แล้วปฏิบัติตามมาตรฐาน SSD
- รายละเอียดสถานะงานปัจจุบัน ดูได้ที่ `ClaimFundRefundSkill.md`

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
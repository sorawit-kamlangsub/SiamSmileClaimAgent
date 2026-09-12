# FOCUS.md — กฎเตือนตัวเองไม่ให้ฟุ้งซ่าน (สำหรับ agent อ่านทุก session)

> ไฟล์นี้เขียนในมุมมอง "สั่งตัวเอง" ตั้งใจให้กระชับ เพื่อให้ agent ทวนได้เร็วระหว่างทำงานจริง ไม่ใช่เอกสารอธิบายยาว
> ใส่ path นี้ไว้ใน `opencode.json` → `"instructions": ["AGENTS.md", "FOCUS.md"]` เพื่อให้โหลดเข้า context ทุก session

---

## กฎ 6 ข้อ ทวนก่อนลงมือทุกครั้ง

1. **อ่านของจริงก่อนพูด** — ก่อนอ้างถึง field/method/component ใด ๆ ต้องเปิดไฟล์เห็นจริงในบทสนทนานี้ก่อน ห้ามพูดจากความจำ/pattern ที่คุ้น ๆ
2. **อ่านไฟล์แล้วอย่าอ่านซ้ำ** — ถ้าเพิ่งเปิดไฟล์นี้ไปแล้วในบทสนทนา ใช้ผลที่มีอยู่แทนการเปิดซ้ำ เว้นแต่มีเหตุผลใหม่ (ไฟล์ถูกแก้จริงหลังจากนั้น)
3. **Fail ซ้ำ error เดิม 2 ครั้ง = หยุดเดา** — ครั้งที่ 3 ห้ามลองมั่วต่อ ให้กลับไปอ่าน error message ทั้งหมดอย่างละเอียด หรือถามผู้ใช้แทน
4. **ค้นไม่เจอ 2 ครั้งด้วยวิธีเดิม = เปลี่ยนวิธี** — เปลี่ยนคำค้น/ขอบเขต ไม่ใช่รันคำสั่งเดิมซ้ำเผื่อดวง
5. **ไม่แน่ใจว่ากระทบ contract/authorization/business rule = ถามก่อนเดินต่อ** — เดาแล้วเดินหน้าไกลจนต้อง rollback คือการเสียเวลาที่สุด
6. **ตอบให้ตรงคำถาม ไม่ขยายขอบเขตงานเกินที่ถูกขอ** — ถ้าจะแก้ไฟล์อื่นนอกเหนือจากที่จำเป็น ให้หยุดถามก่อน อย่า refactor แถม

---

## สัญญาณเตือนตัวเอง (ถ้าเข้าเงื่อนไขนี้ = กำลังฟุ้งซ่าน ให้หยุดแล้วประเมินใหม่)

- กำลังจะเปิด/ค้นไฟล์เดิมเป็นรอบที่ 3
- กำลังจะลองแก้วิธีที่ 3 กับ error เดิม
- กำลังจะเขียนคำอธิบายยาวกว่าที่คำถามต้องการ
- กำลังจะเดา field/type ที่ยังไม่เห็นในโค้ดจริง แต่ "คิดว่าน่าจะมี"
- กำลังจะแก้ไฟล์ที่ไม่ได้อยู่ใน scope ของคำขอ "เผื่อดีขึ้น"
- กำลังจะสรุปว่างาน "เสร็จแล้ว" ทั้งที่ไม่แน่ใจว่า error ก่อนหน้าถูกแก้ที่ต้นตอจริงหรือแค่บังเอิญผ่าน

พอเจอสัญญาณเหล่านี้ → **หยุด 1 จังหวะ** แล้วเลือกทำอย่างใดอย่างหนึ่ง: (a) กลับไปอ่านของจริงอีกรอบให้ละเอียดกว่าเดิม (b) ถามผู้ใช้ (c) สรุปสถานะที่ทำได้แล้วหยุดรอ — **ห้ามเลือก (d) ลองต่อไปเรื่อย ๆ แบบเดิม**

---

## ก่อนปิดงานทุกครั้ง ถามตัวเอง 3 ข้อนี้

1. สิ่งที่อ้างถึงทั้งหมด (field, path, component) เปิดเห็นจริงหรือจำมา?
2. มีรอบไหนที่ทำซ้ำเกิน 2 ครั้งโดยไม่มีผลต่างไหม?
3. ขอบเขตที่แก้ตรงกับที่ถูกขอ ไม่ได้ขยายเกินไหม?

ถ้าตอบข้อไหนไม่มั่นใจ → บอกผู้ใช้ตรง ๆ ในคำตอบ ไม่ต้องปิดงานแบบมั่นใจเกินจริง

---
---

# FOCUS.md — Self-Reminder Rules Against Rambling (agent reads this every session)

> Written in "self-instruction" voice, deliberately terse, so the agent can re-check it quickly mid-task — not a long explainer doc.
> Add this path to `opencode.json` → `"instructions": ["AGENTS.md", "FOCUS.md"]` so it loads into context every session.

---

## 6 rules to recheck before every action

1. **Read the real thing before speaking** — before citing any field/method/component, open the file and see it for real in this conversation first. Never speak from memory or a "familiar-looking" pattern.
2. **Once read, don't re-read** — if a file was already opened earlier in this conversation, use what you already have instead of reopening it, unless there's a new reason (it was genuinely modified since).
3. **Same error fails twice = stop guessing** — on the 3rd attempt, don't try another random fix. Go back and read the full error message carefully, or ask the user instead.
4. **Search comes up empty twice the same way = change approach** — change the search terms/scope, don't rerun the same command hoping for luck.
5. **Unsure if it touches a contract/authorization/business rule = ask before proceeding** — guessing and pushing forward until a rollback is needed wastes the most time.
6. **Answer exactly what was asked, don't expand scope** — if fixing something requires touching files outside what's necessary, stop and ask first. Don't refactor "while you're in there."

---

## Self-warning signs (if any of these apply, you are rambling — stop and reassess)

- About to open/search the same file for the 3rd time
- About to try a 3rd different fix for the same error
- About to write an explanation longer than the question calls for
- About to guess a field/type not yet seen in real code, because it "probably exists"
- About to edit a file outside the request's scope "just in case it helps"
- About to declare the task "done" while unsure whether an earlier error was actually fixed at its root cause or just happened to pass

When you notice one of these → **pause for one beat** and pick exactly one of: (a) go back and read the real thing again, more carefully this time (b) ask the user (c) report current status and stop and wait — **never pick (d) keep trying the same way indefinitely**.

---

## 3 questions to ask yourself before closing out any task

1. Is everything referenced (fields, paths, components) something I actually opened and saw, or something I recalled?
2. Was any step repeated more than twice without producing a different result?
3. Does the scope of what was changed match exactly what was asked, without expanding beyond it?

If unsure about any of these → say so plainly in the response. Don't close out the task with more confidence than is warranted.

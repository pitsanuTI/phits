@AGENTS.md

## AI Assistant Guidelines

### Before Every Code Change
**CRITICAL:** ทุกครั้งที่จะแก้ไข/เพิ่มฟีเจอร์ ต้องถามผู้ใช้ก่อน ไม่ใช่สมมติ/เดา

1. **ถาม 3 สิ่ง:**
   - **ทำอะไร** — เปลี่ยนแปลงอะไรที่ต้องการ (exactly what)
   - **ตรงไหน** — file/component/section ไหน (location)
   - **รูปแบบเป็นยังไง** — design/format/colors/layout (format/style)

2. **รอคำตอบจากผู้ใช้** ก่อนลงมือแก้ไข

3. **หลังแก้ไขเสร็จ ต้อง commit ลง git**
   - `git add <file>`
   - `git commit -m "message"`
   - เขียน commit message ที่ชัดเจน (why + what)

### ยกเว้น
ถ้าผู้ใช้พูดชัดเจนทั้ง 3 ข้อ + ให้รูป + คำอธิบายละเอียดแล้ว → ลงมือได้เลย

# 11 — Git Workflow Skill

## Purpose

ทุกครั้งที่มีการแก้ไขไฟล์ใดก็ตามในโปรเจกต์ ให้ commit และ push ขึ้น GitHub ทันทีเมื่องานนั้นเสร็จสมบูรณ์

## Rule: Always Commit After Every Change

ไม่ว่าจะแก้ไขไฟล์กี่ไฟล์ หรือเล็กแค่ไหน — ให้ commit และ push ทุกครั้งหลังทำงานเสร็จ

```text
แก้ไขไฟล์ → ตรวจสอบ compile ผ่าน → git add → git commit → git push origin main
```

## Files to Stage

Stage เฉพาะไฟล์ที่แก้ไขจริงเท่านั้น ไม่ใช้ `git add -A` หรือ `git add .` เพราะอาจรวม node_modules หรือไฟล์ไม่พึงประสงค์

```bash
git add <path/to/changed/file1> <path/to/changed/file2> ...
```

## Commit Message Format

ใช้ format: `feat/fix/chore(scope): สรุปสิ่งที่แก้ไข`

ตัวอย่าง:
```text
feat(learning): Stepper 6-step + IndexedDB audio + Social RichTextEditor
fix(investments): TypeScript cast for setSelectedMonth
chore(icons): remove duplicate aria-label from IconGlyph
```

## Push

หลัง commit ให้ push ทันที:

```bash
git push origin main
```

## เมื่อไหร่ที่ต้อง Commit

- หลังสร้าง feature ใหม่เสร็จ
- หลังแก้ bug เสร็จ
- หลังแก้ UI / style ที่ user ขอ
- หลังอัปเดต mock data
- หลังแก้ TypeScript error
- ก่อนเปลี่ยนไปทำงานหน้าอื่น หรือ feature อื่น
- ก่อนสิ้นสุด session

## ห้าม

- ห้ามปล่อยให้มี uncommitted changes ข้ามคืน หรือข้าม session
- ห้าม force push ไปที่ main branch
- ห้าม commit ไฟล์ `.env`, credentials, หรือ node_modules

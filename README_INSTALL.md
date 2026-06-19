# Alpha Trader Claude / Codex Skills Pack

ชุดนี้คือไฟล์ Skill และ Prompt หลักสำหรับให้ Claude Code หรือ Codex สร้างเว็บ **Alpha Trader / Personal Operating System Dashboard** ให้ใกล้ Reference Image มากที่สุด

## Files Included

```text
CLAUDE.md
skills/
  01-ui-lock-skill.md
  02-design-system-skill.md
  03-chart-system-skill.md
  04-mock-data-skill.md
  05-action-interaction-skill.md
  06-form-validation-skill.md
  07-qa-visual-matching-skill.md
  08-trading-module-skill.md
  09-settings-module-skill.md
  10-login-auth-skill.md
page-specs/
  login-page-spec.md
prompts/
  01-start-project-prompt.md
  02-build-login-page-prompt.md
  03-build-trading-page-prompt.md
```

## Recommended Install

วางไฟล์ทั้งหมดไว้ที่ root ของโปรเจกต์:

```text
your-project/
  CLAUDE.md
  skills/
  page-specs/
  prompts/
```

## How To Use

เริ่มจากให้ Claude อ่านกฎก่อน:

```text
Read CLAUDE.md first.
Then read the relevant files in /skills and /page-specs.
Do not modify the sidebar unless I explicitly ask.
```

ถ้าจะสร้าง Login:

```text
Read CLAUDE.md, skills/10-login-auth-skill.md, and page-specs/login-page-spec.md.
Build the Login page first.
Use mock auth with localStorage only.
Do not implement real OAuth, real 2FA, or backend auth unless I explicitly provide backend requirements.
```

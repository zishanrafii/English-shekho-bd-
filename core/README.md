# core/

Phase 1 architecture skeleton. **Nothing was moved.** Existing pages still import from `js/` and keep working.
New code should import from these modules instead, so files can move later without touching every page.

| Folder | Purpose (target) |
|---|---|
| core | Firebase init, sanitize/escape helpers, constants |
| auth | login, guest (anonymous) flow, role checks |
| services | Firestore/API access (users, scores, AI) |
| learning | vocab, grammar, reading, listening engines |
| ai | AI coach client (calls /api/*) |
| gamification | XP, levels, streaks, badges |
| community | chat, friends, groups, moderation |
| admin | admin tooling |
| components | shared UI (topbar, cards, modals) |
| features | page-level feature modules |
| data | content datasets (currently in js/*.js) |
| styles | design tokens (Phase 2) |

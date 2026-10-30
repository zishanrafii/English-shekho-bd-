# Security Release Gate — English Shekho

Do not deploy a restrictive Firestore rules change until the related client migration is complete and emulator-tested.

## Critical privacy issue

`firestore.rules` currently grants any registered account read access to any `/users/{userId}` document. Since user documents contain more than public leaderboard fields, this may expose private profile/progress metadata.

### Safe migration sequence

1. Define an allowlisted public profile schema (for example: `displayName`, `photoURL`, public XP/level, and explicitly opted-in leaderboard visibility only).
2. Create `publicProfiles/{uid}` writes through trusted Cloud Functions, not arbitrary client-supplied private fields.
3. Backfill existing registered users with a one-off admin-only migration; validate the projection contains no email, learning profile, placement, streak detail, private preferences, or other private fields.
4. Migrate leaderboard, friends, chat, and profile views to query `publicProfiles`; preserve only the fields each feature actually needs.
5. Add emulator tests for unauthenticated, anonymous, registered non-owner, owner, and admin access, including query behavior and each migrated feature.
6. Deploy projection writes and migrated clients first; verify production telemetry and feature behavior.
7. Only then change `/users/{userId}` read access to owner/admin and re-run all app flows against the emulator.

## Other required gates

- XP/streak/totalCorrect: server-calculated, idempotent reward endpoint; clients cannot directly award themselves rewards.
- Admin: custom claims assigned by trusted server tooling; no email fallback in production rules.
- Live room: derive attendance from participant/waiting documents or trusted transactions; do not treat client-adjustable counters as authoritative.
- Profile images: Firebase Storage object with owner-scoped upload rules; Firestore stores only the resulting HTTPS URL.

## Current status

These migrations are **not implemented by this package**. They require coordinated client, Cloud Function, data migration, and emulator work. Keeping the known risks explicit is safer than making isolated rules edits that either expose data or break core app features.

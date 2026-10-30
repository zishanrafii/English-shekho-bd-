# English Shekho — Release Readiness Status

Updated: 2026-10-29

## Work completed in this pass

- Fixed navbar branding on 24 HTML pages to use the square mark (`assets/branding/english-shekho-mark.png`) instead of shrinking the full wordmark into a tiny square.
- Kept `assets/branding/english-shekho-logo.png` for full brand lockups where the wordmark can be read.
- Added both brand assets to the service-worker app-shell precache and aligned the install log with cache version `english-shekho-v14`.
- Preserved the current app structure and learning logic; no sweeping Firebase rule changes were made without a compatibility migration.

## Verification performed in this pass

- All 18 `tests/*.test.mjs` suites passed.
- `node tests/functions.test.js` passed.
- `node --check functions/index.js`, `node --check speaking/save.js`, and `node --check sw.js` passed.
- Static local-link scan: 54 HTML pages checked, 552 static local references checked, 0 missing files.
- ZIP archive integrity check passed after packaging.

## Not verified

- No Playwright/real-browser visual regression run was completed in this environment.
- Firestore rules were not compiled or exercised in Firebase Emulator.
- No live Firebase, Cloud Functions, or production hosting behavior was tested.
- This package has not been deployed to production.

## Release blockers / required next work

1. **User privacy:** `firestore.rules` currently lets any registered user read any `/users/{userId}` document. Public-facing pages query `/users` for leaderboard/friends/chat/profile data. A safe fix requires migrating those reads to a minimal `publicProfiles` projection, writing/backfilling that projection, testing all flows, and only then restricting private user documents. Do not deploy a read-rule change in isolation.
2. **Reward integrity:** XP, streak and total-correct fields remain client-writable. Move reward calculation to authenticated, idempotent server-side operations and migrate callers before restricting client writes.
3. **Admin authorization:** a hardcoded email fallback remains in `isAdmin()`. Establish and verify custom-claim provisioning for the real admin account before removing fallback access.
4. **Live attendance:** room counters are bounded but are still approximate client-adjustable display values, not authoritative attendance.
5. **Photo storage:** verify whether profile uploads store base64 in Firestore. Rules expect `photoURL` to be a safe HTTPS URL; use Firebase Storage URLs rather than large data URLs.
6. **Release smoke tests:** run the documented browser smoke tests (including 360px mobile), Firebase Emulator rules tests, then staging deployment tests before production release.

## Recommendation

Treat this ZIP as an updated test-verified development package, **not production sign-off**. The next engineering milestone should be the privacy migration (`publicProfiles`) planned with a compatibility test matrix, followed by server-validated rewards and custom-claim admin authorization.

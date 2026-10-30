# English Shekho — Integrated Fixes & UI Polish Report

Date: 2026-10-29
Scope: fixes integrated into the latest Phase 12 project source plus a calmer global UI polish layer. No live Firebase/hosting access was used.

## Fixed in this batch

1. **XP / CEFR progress consistency**
   - Aligned dashboard, profile, and progress-page XP bands to the dashboard's existing canonical thresholds: A1 0–499, A2 500–1,999, B1 2,000–4,999, B2 5,000–9,999, C1 10,000–17,999, C2 18,000–29,999, mastery at 30,000+.
   - Fixed the unreachable B1 condition in `progress.html`.
   - Fixed the progress bar multiplying percentage by 10; it now stays within 0–100%.
   - Updated related level labels and C2 badge threshold.

2. **Speaking session persistence atomicity**
   - `speaking/save.js` now writes the speaking session and aggregate user update in a single Firestore transaction. This avoids an orphaned session if the user aggregate update fails (and vice versa).

3. **Duplicate AI speaking handler**
   - Removed the shadowed duplicate `/api/speaking-coach` handler from `functions/index.js`, retaining the newer structured, sanitized coaching handler used by the tests.

4. **Firestore rules hardening**
   - Friend requests: create requires a registered account, rejects self-requests, restricts document fields, and only allows the recipient to change a pending request's `status` to `accepted`.
   - Study groups: non-creator membership updates can only add/remove the caller's own UID, limit group size to 100, and validate optional `memberCount` against the members list.
   - Live room counters: non-host updates are restricted to counter fields, bounded to 0–1000 and to changes of at most one per write.

5. **Regression guards added**
   - `tests/level-consistency.test.mjs`
   - `tests/rules-hardening.test.mjs`


6. **Calmer, more consistent UI/UX**
   - Reworked the shared palette from high-energy neon purple/cyan to a calmer deep-navy base, softer indigo, muted teal, warm amber, and clearer secondary text.
   - Added `styles/ux-polish.css` after page-local styles across all 54 HTML pages so shared controls, focus rings, cards, navigation, and mobile tap targets are more consistent without rewriting learning logic.
   - Refined login surfaces, common navigation/cards, form focus states, responsive navigation spacing, and reduced-motion support.
   - Updated PWA theme/background colors and bumped the service-worker cache to `english-shekho-v13`, including the new UI stylesheet in the app shell cache.
   - Kept the existing dark visual identity, but reduced the harsh neon/glow effect for more comfortable long study sessions.

## Verification performed

- 18 Node test files (`tests/*.test.mjs`) passed.
- `tests/functions.test.js` passed as the 19th automated test file.
- Earlier fix-batch baseline: 492 assertions PASS, 0 FAIL; current test run remained green after the UI changes.
- `node --check functions/index.js` passed.
- `node --check speaking/save.js` passed.
- `node tests/functions.test.js` passed.
- Confirmed all 54 HTML pages now include the UI polish stylesheet (directly or via the shared link), and `sw.js` precaches it.
- Added static assertions verify the new rules patterns and XP consistency.

## Not verified in this environment

- Firestore rules were not compiled/executed in the Firestore Emulator; the rules tests above are source assertions only.
- No real browser smoke suite was run in this environment because Playwright is not installed here.
- No live Firebase writes, deployed Cloud Functions, or production hosting behavior were tested.

## Important remaining risks — do not treat this batch as full production sign-off

1. **Private user data exposure remains unresolved.** `firestore.rules` still allows any registered user to read any `/users/{userId}` document. The app currently relies on direct `/users` reads/queries for leaderboard, friends, chat, and profile views. Safely closing this requires introducing a carefully scoped `publicProfiles` projection, migrating those public-facing reads, and backfilling existing users; simply changing the read rule would break existing features. This must be the next high-priority security migration.
2. **XP/streak/totalCorrect are still client-writable.** A proper fix requires migrating rewards to server-validated/idempotent writes and updating all learning pages before restricting those fields in rules. Tightening the rule without that migration would break current progress updates.
3. **Live-room counters remain approximate display counters.** The rules bound individual writes but cannot prevent repeated +/-1 manipulation by a registered user. Authoritative attendance should be derived from participant/waiting documents or server-side transactions.
4. **Admin authorization still includes a hardcoded email fallback.** Migrate fully to server-managed custom claims and test the actual deployed rules before removing the fallback.
5. **Profile image uploads need a separate compatibility check.** `profile.html` writes image values to the user document while the `safePhoto()` rule expects HTTPS URLs; inspect the actual upload output and remove base64 data from Firestore if present.

## Deployment note

Do not deploy these rules blindly to production before running Firebase Emulator tests against the real app flows. In particular, verify friend request acceptance, study group join/leave, and live-class waiting/participant counters. This batch intentionally does not claim the outstanding privacy and XP-integrity risks are solved.

## Dashboard UI refresh (2026-10-29)

- Added `styles/dashboard-redesign.css` and loaded it only from `dashboard.html`, keeping the refresh scoped to the dashboard and avoiding changes to other pages.
- Reworked the dashboard into a calm light interface: soft blue-white surfaces, deep navy text, indigo/teal primary accents, and warm amber for rewards and challenges.
- Improved dashboard card contrast, spacing, shadows, focus states, progress visuals, and touch-friendly mobile spacing.
- Kept the existing dashboard markup, IDs, Firebase/data logic, navigation targets, and daily-plan behavior unchanged.
- Added a horizontally scrollable mobile navigation and a 2-column feature-card layout on typical phone widths, collapsing to one column on very narrow screens.
- Verification after this UI change: all 18 `tests/*.test.mjs` suites passed (0 failures). A headless Chromium screenshot attempt timed out in the current runtime, so real browser visual/regression verification remains outstanding. Firebase Emulator rules tests are also still outstanding as noted above.

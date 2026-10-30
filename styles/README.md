# styles/

`tokens.css` — English Shekho Design System v1 (linked last in every page's `<head>`).

- New code: use `--es-*` tokens and `.es-*` components (see `/design-system.html`).
- Old pages: legacy variables (`--bg`, `--gold`, `--teal`...) are remapped here to the new brand automatically.
- `inbox.html` intentionally does NOT load this file (it has its own light/dark messenger theme).
- Hard-coded colors inside individual pages are not changed yet; they are replaced page by page in later phases.

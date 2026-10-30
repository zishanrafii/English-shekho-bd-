# English Shekho Logo Update

- Added `assets/branding/english-shekho-logo.png` as the full brand lockup.
- Replaced the existing PWA icon PNGs (72–512px) with a consistent mark derived from the new logo.
- Updated pages that use `.logo-icon` to show the actual logo image rather than an emoji.
- Updated manifest theme/background colors to match the blue/teal/gold identity.
- Cache version updated where a matching service-worker cache declaration was found.

Note: confirm the site’s deployment base path and test installed PWA icons after deployment; browser/service-worker checks were not run in this packaging step.

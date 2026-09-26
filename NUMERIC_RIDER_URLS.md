# Legacy numeric rider URLs

The hosting configuration contains 15 permanent redirects: career, results,
and points URLs for Jett Lawrence, Cole Davies, Haiden Deegan, Chase Lock, and
Dalton Oxborrow. Each goes to the same rider and section. The `/index.html`
source form also matches the directory with or without a trailing slash under
Azure Static Web Apps' documented exact-route rules. No wildcard is used, so
API paths such as `/rider/1755/profile` are not intercepted.

Other numeric rider URLs normalize through React after the rider name loads.
This preserves the section, query string, and fragment and replaces browser
history so Back does not return to the numeric alias. Missing/failed rider data
does not produce a guessed redirect. This is client navigation, not an HTTP 301.

Azure limits `staticwebapp.config.json` to 20 KB. These 15 rules are deliberately
bounded; they do not provide server redirects for the entire archive. Universal
server redirects require a routing layer capable of looking up IDs and names.
Reference: https://learn.microsoft.com/en-us/azure/static-web-apps/configuration

Validation: `node scripts/numericRiderRedirect.test.mjs`, targeted ESLint, and
`npm run build`. Vite does not emulate Azure's HTTP routing; after deployment,
verify status 301 and Location for numeric profile/results/points URLs and their
trailing-slash forms. Confirm named destinations return 200 without loops, and
check filtered links retain their query parameters. Only a frontend deployment
is required for this change.

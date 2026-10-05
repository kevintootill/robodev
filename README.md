# RoboDev

Website for https://robodev.online, hosted on SiteGround. GitHub stores the source.

Seven static pages share `site.css` and `site.js`. Edit `tools/build-site.mjs` and run
`node tools/build-site.mjs` to regenerate the pages and sitemap. Privacy copy is in
`tools/privacy-content.html`. SiteGround PHP handles contact submissions.

The main pages are Overview, Studio, Capabilities, Process, Explorations and Contact.
Motion includes rotating geometry, scanning panels, pointer parallax and page transitions.
Visitors can pause motion, choose an accent palette and change the exploration composition
and pace. Device reduced-motion preferences are respected.

Run `node tools/preview.mjs` for a local preview at http://127.0.0.1:4178.
The local preview does not send contact messages.

## Deployment

In SiteGround Site Tools for `robodev.online`, open Site > File Manager and upload
the files from the packaged ZIP into `robodev.online/public_html/`. Overwrite these
files when publishing an update. Do not upload the repository or its `.git` folder.
The GitHub Actions workflow `.github/workflows/deploy.yml` deploys on pushes to
`main` and can also be started manually. It requires the settings below.

Run `./package-site.ps1` to create `artifacts/robodev-siteground.zip` containing
only the public website files. If uploading the ZIP, extract it in `public_html`.

## Hosting configuration

- Domain: `robodev.online`; `www.robodev.online` should also resolve to this site.
- Nameservers: `ns1.siteground.net` and `ns2.siteground.net`.
- SiteGround origin IP at setup: `35.214.43.162` (check Site Tools before reuse).
- Install a free Let's Encrypt certificate under Security > SSL Manager, then
  enable Security > HTTPS Enforce once the certificate is active.
- NGINX Direct Delivery is disabled so Apache applies the cache and redirect rules.
- `.htaccess` selects `index.html`, disables directory listing, and redirects HTTP
  and `www` requests to the canonical HTTPS domain. Keep the SSL certificate active.

GitHub Pages is retired. The former `CNAME` and `.nojekyll` files are removed.
DNS and SSL are managed through SiteGround; domain registration remains at Namecheap.

## Push and deploy

Configure repository variables `SITEGROUND_HOST` (SSH hostname), `SITEGROUND_ORIGIN_IP` (web server IP), `SITEGROUND_USER`
(SSH username), and `SITEGROUND_PATH` (absolute `robodev.online/public_html` path).
Configure secrets `SITEGROUND_SSH_KEY` (dedicated private deployment key) and
`SITEGROUND_KNOWN_HOSTS` (verified server host key on port 18765).
Import the matching public deployment key in Site Tools > Devs > SSH Keys Manager.
Keep all private keys outside the repository.

The workflow validates JavaScript and PHP, uploads only the sixteen public files,
checks PHP on the server, backs up replaced files outside `public_html`, and
publishes the homepage last. It does not upload source-control or test files.
SSH host verification is mandatory. Deployment backups must be cleaned up
periodically in SiteGround; they are named `.backup-<commit>` beside `public_html`.

## Analytics, SEO and contact

GA4 property: **RoboDev (robodev.online)** in the Kevin Tootill Analytics account.
Property ID: `557378343`.
Web stream: **RoboDev website**, stream ID `16044367053`, measurement ID
`G-9TM5P8R1MW`. The site loads the Google tag only after analytics consent;
advertising consent stays denied. The interactive demo and its tracking events have been removed.

The site includes canonical URLs, Open Graph and Twitter metadata, WebSite
structured data, `robots.txt`, and `sitemap.xml`.

`contact.php` sends enquiries to `kevintootill@hotmail.com` using SiteGround PHP
`mail()`, with `website@robodev.online` as sender and the visitor as Reply-To.
It validates input, requires a same-site session token, and limits submissions.
A successful response means the hosting mail service accepted the message;
inbox delivery still depends on mail authentication and spam filtering.
Verify SiteGround SPF/DKIM and test receipt after DNS propagation.

Local checks: `node --test tests/*.test.cjs`, `node --check site.js`, `node --check contact.js`,
and `php -l contact.php` when PHP is available. `./package-site.ps1` builds a ZIP.

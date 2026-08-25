# Security Policy

## Supported version

Security fixes are applied to the latest release and the `main` branch.

## Trust boundary

Depth Video Studio is a static browser application. Selected videos are read
through browser `File` and blob interfaces and are not submitted to a BeatAPI or
project backend. The hosted demo downloads pinned browser runtimes and public
model assets from the providers allowed by the Content Security Policy in
`index.html`.

The deployment check in `scripts/check-security.mjs` requires exact browser
runtime versions, the pinned Depth Anything model revision, versioned MediaPipe
model paths, and the provider allowlist before GitHub Pages publishes the
application.

GitHub Pages controls its own HTTP response headers. The repository therefore
enforces its current policy in the document itself; deployments on other hosts
should also send the same CSP as an HTTP response header together with
`X-Content-Type-Options: nosniff` and an explicit `frame-ancestors` policy that
allows only intended embedding origins.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `support@beatapi.io` with:

- the affected URL or commit;
- reproduction steps;
- the observed and expected security behavior;
- any proof-of-concept files that do not contain private user media.

Do not open a public issue for an unpatched vulnerability. We will acknowledge a
complete report and coordinate disclosure after a fix is available.

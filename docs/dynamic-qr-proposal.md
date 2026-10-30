# Dynamic QR proposal (review only)

This is a proposal, not an implemented feature. Do not apply schema changes until the remaining security dependency findings and QA review are resolved.

## Data model

```prisma
model DynamicQr {
  id        String   @id @default(cuid())
  slug      String   @unique
  targetUrl String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  scans     QrScan[]
}

model QrScan {
  id          String    @id @default(cuid())
  dynamicQrId String
  dynamicQr   DynamicQr @relation(fields: [dynamicQrId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  userAgent   String?
  referrer    String?
  country     String?

  @@index([dynamicQrId, createdAt])
}
```

Generate a cryptographically random opaque slug on the server, validate its alphabet and length, and retry unique-key collisions. Keep internal IDs separate from printed public slugs. Ownership is intentionally absent until customer accounts are designed; for the MVP, management remains admin-only.

## Request path and safety

Printed QR → `/q/:slug` → indexed lookup → temporary HTTP 302 redirect to the current target. Set `Cache-Control: no-store` so editing a destination affects later scans. Unknown/inactive slugs return 404/410 without revealing private records. Exclude `/q/:slug` from locale middleware; the printed address must stay independent of language.

Only accept validated HTTPS destinations without embedded credentials. Reject this service's own redirect URLs to prevent loops. Redirect without fetching the destination: there is no need for server-side URL previews or SSRF exposure. Reject CR/LF and bound all fields. Destination editing requires the existing server-side admin session and origin checks. Add rate limits for management and public scans; public redirects must not become an unrestricted anonymous URL shortener. Hostname restrictions and abuse reporting require a product decision before customer self-service.

Scan records are optional, best effort, and must not block redirect delivery. Prefer aggregate counts; raw IP addresses are unnecessary. If user agent/referrer are retained, truncate them and strip referrer query strings and fragments. Set a retention policy before enabling collection. Derive country only from trusted hosting headers. Treat counts as approximate because bots, retries and prefetches produce scans. Decide consent/privacy requirements before analytics rollout.

## Compatibility

Existing QR payloads, order JSON and printed codes remain unchanged. Dynamic links are opt-in for website, menu, social, review, booking and document URL destinations. Existing `/api/qr` can encode the short HTTPS URL through the `site` type; creating a DynamicQr record is a separate authenticated operation.

Wi-Fi, vCard, email, SMS and car-phone QR types keep their native static payloads. Replacing them with a web redirect changes scanner behavior and is not part of this proposal. Privat24 remains disabled pending a real merchant integration. Do not redirect to card PANs or credentials.

A future order item may carry an optional `dynamicQrId`; old items remain valid. Slug edits, ownership, archival semantics and whether QR links outlive orders need explicit decisions. Status history, customer accounts and analytics are separate iterations. No Prisma schema or production database changes are included here.

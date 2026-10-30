# Dynamic QR infrastructure

Dynamic QR now supports admin-managed editable destinations with stable printed URLs. The public path is independent of language:

```text
printed QR → /q/:slug → database lookup → HTTP 302 redirect
```

## Implemented now

### Data model and slugs

```prisma
model DynamicQr {
  id        String   @id @default(cuid())
  slug      String   @unique
  targetUrl String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

`DynamicQr` is separate from `Order`; it has no ownership or order relation. The schema was synchronized with the project's existing Neon database using `prisma db push`. This adds the `DynamicQr` table and its unique slug index; existing `Order` fields and order data are unchanged. Prisma formatting only changes the alignment of existing model definitions. There is no `QrScan` model.

The server generates public slugs using `crypto.randomBytes(12).toString('base64url')`: 16 URL-safe characters containing 96 random bits. Internal CUIDs are never used as public slugs. Creation retries a unique constraint collision on `slug`, with at most five insert attempts; unrelated database errors are not retried. The public route rejects malformed slugs before querying the database.

### Destination validation and public responses

Destinations must start with `https://` and remain within 2,048 characters before and after URL normalization. Validation rejects other protocols, embedded credentials, empty userinfo, control characters including CR/LF, encoded CR/LF, ASCII whitespace and backslashes. It also rejects this service's `/q` and `/q/...` destinations across known host aliases, including encoded paths and normalized dot segments. External HTTPS destinations with a `/q/...` path remain valid.

Known service hosts include the current request host, the default production host, `APP_URL`, available Vercel deployment/branch/production hosts and any extra `DYNAMIC_QR_SERVICE_ORIGINS`. Host matching ignores case and a trailing DNS dot. Keep extra aliases configured when adding a custom domain.

`app/q/[slug]/route.ts` reads the current record on each request. The locale middleware excludes `/q` at a path-segment boundary, so `/q/:slug` is never rewritten to `/ua/q/:slug` or `/en/q/:slug`.

| Record/request | Response |
| --- | --- |
| Valid, active record | `302`, with the current validated destination in `Location` |
| Unknown or malformed slug | `404` |
| Inactive record | `410` |
| Record with an unsafe destination changed outside the API | `410` |
| Database unavailable | `503` |

All these responses use `Cache-Control: no-store` and an empty body. Public responses expose no record JSON or internal ID. Query parameters cannot supply or override a destination. Redirect delivery performs no destination fetch, preview request or analytics write. Application error logs contain a generic operation failure, without destination URLs or Prisma error details.

### Admin API and UI

All Dynamic QR endpoints use the existing server-side admin session:

| Endpoint | Behavior |
| --- | --- |
| `GET /api/admin/dynamic-qr` | List up to 100 records, newest first; `nextCursor` supports subsequent pages through `?cursor=...` |
| `POST /api/admin/dynamic-qr` | Accept only `{ "targetUrl": "https://example.com" }`; generate the slug on the server; return `201` |
| `PATCH /api/admin/dynamic-qr/:id` | Update `targetUrl`, `active`, or both; return the persisted record |

Missing authentication returns `401`. Invalid input returns `400`; an authenticated PATCH for a missing record returns `404`. Strict request schemas reject unknown fields, caller-provided `id`, `slug` or `createdAt`, and empty PATCH bodies. Successful and error responses use `Cache-Control: no-store`. JSON request bodies are bounded before parsing.

A shared origin guard now protects admin mutations, including login/logout, order-status updates and Dynamic QR creation/updates. The `Origin` header must exactly match the addressed request origin (protocol plus the HTTP `Host`, falling back to the request URL when `Host` is absent); `X-Forwarded-Host` is ignored. This supports Next.js servers whose internal request URL uses a listen address such as `0.0.0.0`. Missing, `null`, malformed and cross-site origins are rejected with `403`. Browser same-origin mutation requests include this header automatically. CLI/API clients must send it explicitly, for example `Origin: http://localhost:3000` when accessing that same local origin.

The existing `/<locale>/admin` dashboard contains a Dynamic QR section in Ukrainian and English. Responsive cards show the slug, destination, active state and creation date. Admins can create records, edit destinations, activate/deactivate links, copy public URLs and load more records. The UI includes loading, empty and error states and controls designed for 320px screens.

### Public origin and printing

Set `APP_URL` to the durable HTTPS origin used for printed URLs, with no path, credentials, query or fragment:

```dotenv
APP_URL="https://qr-helper-two.vercel.app"
# Optional comma-separated additional origins that serve this application:
DYNAMIC_QR_SERVICE_ORIGINS=""
```

The admin copy action uses `APP_URL` when configured. On Vercel, the default production origin is used if `APP_URL` is absent. In local environments without `APP_URL`, it uses the current browser origin and displays a reminder to configure a permanent public domain before printing. A preview or local URL is suitable for testing; printed products require a durable public host where the same slug resolves. Updating `APP_URL` cannot change addresses already printed on existing products, so retain those host aliases and hosting routes.

### Sticker editor compatibility

The existing editor, static QR payload builders, checkout and order JSON remain unchanged. To prepare a printed Dynamic QR now:

1. Create a destination in the admin Dynamic QR section.
2. Copy its public URL using the permanent production origin.
3. Paste that URL into an existing URL-based sticker input: `site`, `socials`, `google`, `youtube`, `olx` or `app`.
4. Preview the QR and complete the existing ordering flow.

The printed payload contains the stable `/q/:slug` URL. Later destination edits require no reprint, as long as the printed host and slug remain available. Existing `/api/qr` can also encode that URL through its `site` payload type.

There is no automatic record creation, public creation endpoint or new Static/Dynamic editor toggle. A separate mode needs an ownership and selection flow before it can safely create or attach records. Wi-Fi, vCard, email, SMS and car-phone QR formats retain their existing native behavior. Privat24 remains a disabled concept pending merchant integration.

### Verification

The implementation has passed `npm run typecheck`, `npm test` and `npm run build`. The regression suite includes 24 Dynamic QR tests plus the six existing payload/order tests. It covers slug generation and bounded collision retries, destination validation and service aliases, uncached redirect/error responses, locale middleware exclusion, admin authentication, origin protection, creation, persisted edits and immutable identities. Route tests use an in-memory Prisma substitute; they do not replace verification against the actual database and running application.

Verification against the local production build and the existing Neon database passed:

- Authenticated admin creation → public `302` to the saved target; editing the target changed `Location` for the same slug immediately.
- Deactivation returned `410`; reactivation restored `302`. Each response was checked without following the external destination.
- The browser exercised password login, create/edit/activation controls, persistence after refresh, copying the public URL, and the invalid-destination error state.
- The admin layout, including a long destination edit, had no horizontal overflow at 320, 360, 375, 390, 430, 768, 1024 and 1440px. A 320px screenshot was visually inspected.
- Existing orders, including order #1, were compared with their pre-schema-change SHA-256 snapshot and remained unchanged. Temporary Dynamic QR test records were removed.

The first running-server test caught Next.js using its listen address in `request.url`; origin validation now uses the addressed `Host`, with a dedicated regression test. Browser QA used headless Chrome and does not replace physical Safari/iOS testing. No production deployment was changed.

## Future work

- Customer accounts, ownership, authenticated destination selection and an explicit Dynamic editor mode.
- Optional order-item linkage and decisions about archival, deletion, slug immutability and whether links outlive orders.
- Dedicated management/public-route rate limits, abuse reporting and destination-host policy before expanding access. The current API is admin-only and does not provide an anonymous URL shortener.
- Scan analytics, aggregate counts, retention and privacy/consent decisions, only as a separate approved feature. This implementation stores no scan history, IP, referrer, user agent, country or geolocation.
- Billing, customer self-service and payment integration remain separate work.


# Form Dashboard — Angular Frontend Starter

This is a **separate starter workspace**. It does not overwrite or modify your existing repository.
Copy/merge it only after checking your existing Angular workspace structure.

## Requirements
- Node.js and npm
- Angular CLI is not required globally; the project uses the local Angular CLI.
- Backend API is not included. This frontend calls a configurable Node.js API.
- Database access belongs in the backend only. Angular must never connect directly to MySQL/PostgreSQL or contain DB credentials.

## Run locally (PowerShell)
```powershell
cd frontend
npm install
npm start
```
Open http://localhost:4200

## Configure the API
Edit `src/environments/environment.ts` and set `apiBaseUrl` to your Node API URL.
The current API service uses real HTTP calls. There is no fake login or fake persisted save in this starter.
Until your backend provides the endpoints below, login, save, publish, analytics and submissions will show API errors rather than pretending they succeeded.

## Important database note
The supplied project requirements specify PostgreSQL by default, or the existing MS SQL database if the backend already uses it. MySQL is not listed as an approved database option in those requirements. Confirm approval before changing the database choice. Regardless of engine, database work remains backend-only.

## Routes scaffolded
- `/admin/login`
- `/admin/forms`
- `/admin/forms/new`
- `/admin/forms/:formId/edit`
- `/admin/forms/:formId/preview`
- `/admin/analytics`
- `/admin/submissions`
- `/forms/:brandMarketSlug/:campaignSlug`

## API contract — proposed, unconfirmed
Match these with the actual Node backend before integration. These are frontend expectations, not claims that the backend already implements them.

| Method | Proposed endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Sign in; backend returns session/profile with role |
| GET | `/api/auth/session` | Current authenticated user and role |
| POST | `/api/auth/logout` | End session |
| GET | `/api/forms` | Search/filter forms |
| POST | `/api/forms` | Create draft |
| GET | `/api/forms/:id` | Read draft and published metadata |
| PUT | `/api/forms/:id` | Update draft |
| POST | `/api/forms/:id/publish` | Explicit publish/republish |
| GET | `/api/public/forms/:brandMarketSlug/:campaignSlug` | Read published version |
| POST | `/api/public/forms/:brandMarketSlug/:campaignSlug/submissions` | Submit public lead and UTM values |
| GET | `/api/analytics` | Admin-only analytics |
| GET | `/api/submissions` | Admin-only submissions |
| POST | `/api/media` | Upload; return backend-issued media reference/URL |
| POST | `/api/ai/form-assistant` | Admin-only AI suggestions; server-side provider call |

Suggested response conventions:
- Auth: `{ user: { id, displayName, role: 'Admin' | 'Editor' } }`
- Form: `{ id, name, brand, market, campaignSlug, status, draftVersion, publishedVersion, definition }`
- Public submit: `{ submissionId, receivedAt }`
- Errors: `{ code, message, fieldErrors? }`

## Security walkthrough — current starter status
- Role authorization: **Not verified** — must be enforced by backend session and endpoint authorization.
- Angular route guards: **Not implemented** — frontend guards are UX only, never the security boundary.
- Server-side validation: **Not verified** — backend must validate all payloads.
- Database parameterized queries: **Not verified** — backend responsibility.
- Secrets/database credentials: **Not present in frontend** — keep them server-side.
- Media validation/storage: **Not implemented** — backend must validate type/size and return a media reference.
- Consent and lead data: public form includes a consent field; lawful wording and server-side retention controls must be supplied/verified by the project owner/backend.
- CSV formula-injection protection: **Not implemented** — implement before exporting live submission data.
- AI assistant: **Not implemented** — connect only to an authorized backend endpoint; never send lead data or provider credentials from the browser.

## Demo acceptance status
This is a frontend starter, not an end-to-end completed system:
1. Admin login — blocked pending backend auth/session.
2. Create BMW form — UI scaffold only; save blocked pending API.
3. Banner upload/content — content fields scaffolded; upload blocked pending media API.
4. Preview/save/publish — preview route scaffolded; persistence/publish blocked pending API.
5. Public URL — route scaffolded; published form fetch blocked pending API.
6. Lead + consent + UTM submission — form scaffolded; submission blocked pending API.
7. Database verification — blocked; inspect the actual backend schema first.
8. Admin analytics — blocked pending Admin-authorized API.
9. Versioned republish — blocked pending backend versioning contract.
10. AI assistant and Editor permissions — blocked pending backend AI and authorization APIs.

## Integration steps
1. Inspect your existing repository and preserve its current Angular workspace.
2. Compare its Angular version and dependencies with this starter.
3. Merge only the needed `src/app` files and route/service patterns; do not replace your root config blindly.
4. Confirm API endpoints and response types with the backend owner.
5. Run `npm install`, `npm start`, and `npm run build`.

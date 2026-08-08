# AI Smart Civic Services — Frontend

Next.js interface for the civic complaint platform. Two surfaces in one app:

- **Citizen** (public, no account): report a problem, see how the AI understood it, track
  it by reference code.
- **Administrator** (JWT-protected): manage the complaint queue and read the statistics.

Backend lives in a separate repository.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (on Base UI primitives) |
| Charts | Recharts |
| Data fetching | TanStack Query |
| Forms | react-hook-form + zod |
| Theme | next-themes (light / dark / system) |

---

## Quick start

```bash
cd frontend
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open **http://localhost:3000**. The backend must be running (default
`http://localhost:8000`).

Demo admin login: `admin@civic.gov` / `admin123`.

---

## Routes

| Route | Access | What it does |
|---|---|---|
| `/` | Public | Landing + report form. On submit, shows the AI's classification, confidence, routed department and summary, plus any likely duplicates. |
| `/track?ref=CIV-XXXXXX` | Public | Status, full timeline and AI output for one complaint. The reference is in the URL so the link is shareable. |
| `/admin/login` | Public | Staff sign-in |
| `/admin` | Protected | KPI tiles, four charts, and the full descriptive-statistics panel |
| `/admin/complaints` | Protected | Filterable, paginated queue |
| `/admin/complaints/[id]` | Protected | Detail, status transitions, reassignment, AI override, re-analysis |
| `/admin/ai` | Protected | Which engine is live, measured accuracy, and the civic assistant |

---

## Structure

```
src/
├── app/
│   ├── page.tsx              # Landing + report form
│   ├── track/                # Public tracking
│   └── admin/                # Protected dashboard (layout applies the guard)
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── charts/               # Recharts wrappers + validated palette hook
│   ├── ai-result-card.tsx    # "What the AI understood" — the centrepiece
│   ├── report-form.tsx
│   ├── complaint-detail.tsx
│   ├── status-timeline.tsx
│   └── resolution-stats-panel.tsx
└── lib/
    ├── api.ts                # Typed client, token handling, error unwrapping
    ├── types.ts              # Mirrors the backend's Pydantic schemas
    ├── domain.ts             # Labels, badge styles, formatters
    └── chart-theme.ts        # Validated chart palette
```

---

## Notes on a few decisions

**Charts are chosen by the data's job, not by variety.** Category and department
distributions are ranked horizontal bars rather than pie charts: with seven categories a
pie needs seven distinguishable colours and a legend round-trip per slice, and near-equal
slices cannot be ranked by eye. Bars put identity in the axis label, so colour carries no
identity job and one hue suffices.

**The chart palette is validated, not chosen by eye.** Every palette in
`lib/chart-theme.ts` was checked for lightness banding, chroma, colour-vision-deficiency
separation, normal-vision separation and surface contrast, in *both* light and dark mode.
Priority initially used a status palette (green/yellow/orange/red); the validator failed
it — warning-yellow and serious-orange measure ΔE 13.6 against a floor of 15, meaning
full-colour readers could not reliably separate High from Critical. It is now a
single-hue ordinal ramp, which is also the honest encoding: priority is ordered magnitude,
not identity.

**No dual-axis charts.** The trend chart puts submitted and resolved on one shared scale
because both are counts of complaints. A second y-axis can make any two lines look
correlated.

**Confidence is shown as a word first, a number second.** A calibrated classifier
reporting 0.74 is not making a claim accurate to the percentage point. "moderate
confidence — review" is what tells an operator what to do; the bar and figure support it.

**The admin guard is UX, not security.** Every admin API route verifies the JWT
server-side. Bypassing the client guard yields an empty shell and 401s.

**Tokens live in `localStorage`.** The API is on a different origin from the app, so an
httpOnly cookie would need `SameSite=None` and a shared parent domain. For an admin
dashboard on a hackathon deployment that trade-off is fine; a production system holding
real citizen data should use httpOnly cookies with a proxied same-origin API.

---

## Deployment (Vercel)

1. Push this directory to its own GitHub repository.
2. Vercel → **New Project** → import the repo (framework auto-detects as Next.js).
3. Set **`NEXT_PUBLIC_API_URL`** to your Render backend URL, e.g.
   `https://civic-services-api.onrender.com`.
4. Deploy.
5. **Then set `CORS_ORIGINS` on the backend to this Vercel URL.** Skipping this is the
   single most common failure: the app loads fine and every API call fails with a CORS
   error that looks like the backend being down.

`NEXT_PUBLIC_*` variables are inlined at build time, so changing the API URL needs a
redeploy, not just a restart.

### Cold starts

Render's free tier sleeps after ~15 minutes idle and takes ~50s to wake. The API client
detects network failures and says so ("the server may be waking up") rather than showing
a generic error, and retries them. Before a live demo, load the backend `/health`
endpoint once to wake it.

---

## Commands

```bash
npm run dev      # development server
npm run build    # production build (type-checks the whole project)
npm run start    # serve the production build
npm run lint     # eslint
```

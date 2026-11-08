This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Francis James delivery dashboard

This App Router dashboard includes learner search, level/pathway/intake filters, alphabetical sorting, pagination, full learner details, a weekly lecture view, and a CSV export of the filtered records. Separate total, Level 4, Level 5, and Level 6 metric cards always reflect the complete loaded dataset. Sample records are fictional and use `example.com` addresses.

### Google Sheets connection

Copy `.env.example` to `.env.local`, replace `YOUR_DEPLOYMENT_ID` in `GOOGLE_APPS_SCRIPT_URL` with your Apps Script Web App deployment, and restart the server. This server-only setting is read by `GET /api/learners`; the browser never calls Google directly. The dashboard starts with 24 sample learners while the first request is loading. Unconfigured endpoints, empty sheets, network errors, and invalid JSON records return clearly labelled sample data. Refresh requests bypass the cache and Google requests time out after 12 seconds.

The endpoint must return an array, `{ "learners": [...] }`, or `{ "data": [...] }`. Each learner uses this shape:

```json
{
  "id": "FJ-2026001",
  "name": "Connor McIntyre",
  "email": "connor@example.com",
  "level": 4,
  "pathway": "Quantity Surveying",
  "cohort": "Jan 2026",
  "requirements": "CAD bridging",
  "notes": "Progressing well"
}
```

Spreadsheet headings also work: `Learner No / ID` (or `Learner ID`), `Learner Name`, `Email`, `Level`, `Study Pathway`, `Cohort / Intake`, `Bridging / Special Requirements`, and `Comments / Notes`. Lecture nights are derived from the level: Tuesday/Thursday for Level 4 and Monday/Wednesday for Levels 5–6.

IDs must be unique. Levels must be 4, 5, or 6. Pathways and intakes must match the dashboard's supplied options. Optional requirements and notes may be empty. The source should contain active learners only.

Run `node --test tests/learners.test.mjs` for data validation and fetch checks, and `npm run build` for the production build. The dashboard does not add authentication; deploy behind your organization's existing staff access controls before connecting private learner records.

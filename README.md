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

## FJ Operations Hub

A modular Next.js App Router staff dashboard with a slate navy theme, Lucide icons, and Tailwind CSS. A persistent desktop sidebar and mobile navigation drawer open Overview (default), Learner Directory, Course Delivery & Schedules, and Bridging & Action Items. The learner table and filters appear only on the dedicated Learner Directory view; the overview and schedules views show the timetable and calendar. The shared overview shows separate learner counts for Levels 4–6, the next lecture, a lecture timetable, and a selectable monthly calendar with blue Level 4, purple Level 5, and emerald Level 6 markers. Shared Level 5/6 lecture dates display both colors. Circles identify lectures and diamonds identify assessment deadlines; the same level colors appear in the selected date agenda. No grades or marks are displayed.

### Source structure

- `src/app/page.tsx`: page composition, tab state, shared directory filters, calendar selection, and learner refresh lifecycle.
- `src/components/dashboard/Sidebar.tsx` and `WorkspaceDialog.tsx`: workspace navigation, mobile drawer, Google Sheets connection, and help.
- `src/components/dashboard/Header.tsx`: page title, breadcrumb, mobile navigation toggle, refresh control, and connection status.
- `src/components/dashboard/MetricCards.tsx`: total and level counts plus the next lecture.
- `src/components/dashboard/TimetableCard.tsx`: next lecture, UK session times, lecturer, cohorts, and Teams action.
- `src/components/dashboard/CalendarCard.tsx`: month navigation, date selection, session/deadline dots, and date agenda.
- `src/components/dashboard/LearnerDirectory.tsx`: real-time search, multi-select filters, sorting, pagination, details, and filtered CSV export.
- `src/components/dashboard/MultiSelect.tsx`, `Badges.tsx`, and `LearnerDetails.tsx`: reusable directory controls and presentation.
- `src/components/dashboard/ScheduleView.tsx` and `ActionItems.tsx`: course schedule and bridging follow-up views.
- `src/types/dashboard.ts`: shared learner, session, deadline, filter, and response interfaces.
- `src/data/mockData.ts`: 24 fictional learners and November/December 2026 sample sessions and deadlines.
- `src/lib/dashboard.ts`: filter, schedule, UK time formatting, and CSV helpers.
- `src/lib/learners.ts` and `src/app/api/learners/route.ts`: Google Sheets JSON fetch and validation.

Multiple values within each directory filter are combined with OR; different filter categories and text search are combined with AND. Counts reflect the complete dataset. Export CSV downloads every matching learner, including records outside the current page. The action view links directly to the corresponding learner's directory record.

### Google Sheets connection

Copy `.env.example` to `.env.local`, replace `YOUR_DEPLOYMENT_ID` in `GOOGLE_APPS_SCRIPT_URL` with your Apps Script Web App deployment, and restart the server. `GET /api/learners` calls this endpoint on the server. Empty, unconfigured, failed, or invalid responses return clearly labelled sample data. The Google request times out after 12 seconds. Refresh requests bypass the cache and preserve displayed data if the local API is unavailable.

The endpoint accepts an array, `{ "learners": [...] }`, or `{ "data": [...] }`. Each learner has this shape:

```json
{
  "id": "FJ-2026001",
  "name": "Connor McIntyre",
  "email": "connor@example.com",
  "level": 4,
  "pathway": "Quantity Surveying",
  "status": "Submitted",
  "cohort": "Jan 2026",
  "requirements": "CAD bridging",
  "notes": "Progressing well"
}
```

Spreadsheet column headings also work: `Learner No / ID` (or `Learner ID`), `Learner Name`, `Email`, `Level`, `Study Pathway`, `Submission Status` (or `Assignment Submission Status`), `Cohort / Intake`, `Bridging / Special Requirements`, and `Comments / Notes`. IDs must be unique. Levels must be 4, 5, or 6. Pathways and intakes must match the supplied filter options. Submission status must be `Pending`, `Submitted`, or `Resubmission Needed`; an omitted status defaults to `Pending`. Requirements and notes can be empty. Lecture nights are derived from the level.

Lecture sessions and assessment deadlines currently come from the mock data file, independently of the learner feed. Times are formatted with the `Europe/London` time zone, including GMT/BST automatically. The next lecture excludes ended sessions and includes a session in progress. Sample Teams URLs are null: join controls become available when a real session meeting URL is supplied. The sample schedule runs from 9 November through 17 December 2026; after it ends, the dashboard displays an empty upcoming schedule.

### Verification

Run `node --test tests/*.test.mjs` for data validation, filter combinations, upcoming session selection, and UK time formatting. Run `npx tsc --noEmit` for TypeScript and `npm run build` for a production build. The dashboard does not add authentication; deploy behind the organization's staff access controls before connecting private records.

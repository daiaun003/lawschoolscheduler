# Fall '26 Law Course Scheduler

A front-facing web app for browsing the law school's Fall 2026 course offerings and
building a personal weekly schedule. Each course shows in its own soft pastel colour,
with live conflict detection. Built with Vite + React 19; data lives in the browser
(localStorage) — no backend.

**Live:** https://law-school-scheduler.vercel.app

## Deploy

Hosted on Vercel. To push a new production deploy after changes:

```bash
npx vercel --prod --yes
```

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## How it works

- **Course data** lives in `src/data/courses.json`, generated from
  `Fall 26 Course Selection.xlsx` by `scripts/parse_courses.py`. Re-run that script if
  the spreadsheet changes (see below).
- **`src/App.jsx`** owns filter state and composes the catalog + calendar.
- **`src/hooks/useSchedule.js`** holds the selected course ids and persists them.
- **`src/utils/palette.js`** — the pastel palette + stable per-course colour.
- **`src/utils/schedule.js`** — time formatting, conflict detection, and the
  side-by-side packing of overlapping calendar blocks.
- **Components**: `Header`, `Filters`, `CourseCard`, `WeeklyCalendar`, `CalendarBlock`.

## Regenerating course data

```bash
pip3 install openpyxl
python3 scripts/parse_courses.py
```

The parser handles weekly classes, multi-day classes, short courses with specific
calendar dates, weekday ranges (e.g. "Mon–Thu"), per-day meeting times, and
async/no-fixed-time courses.

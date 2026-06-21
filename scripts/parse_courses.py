import openpyxl, json, re

import os
SRC = os.path.expanduser('~/Downloads/Fall 26 Course Selection.xlsx')
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'courses.json')

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb['Sheet1']
rows = list(ws.iter_rows(values_only=True))

DAY_MAP = {
    'mon': 'Mon', 'monday': 'Mon',
    'tue': 'Tue', 'tues': 'Tue', 'tuesday': 'Tue',
    'wed': 'Wed', 'weds': 'Wed', 'wednesday': 'Wed',
    'thu': 'Thu', 'thur': 'Thu', 'thurs': 'Thu', 'thursday': 'Thu',
    'fri': 'Fri', 'friday': 'Fri',
    'sat': 'Sat', 'saturday': 'Sat',
    'sun': 'Sun', 'sunday': 'Sun',
}
MONTHS = ['january','february','march','april','may','june','july','august',
          'september','october','november','december']

def to_min(hhmm):
    hhmm = hhmm.strip()
    if len(hhmm) == 4 and hhmm.isdigit():
        return int(hhmm[:2]) * 60 + int(hhmm[2:])
    return None

def parse_time_range(s):
    """Return (start_min, end_min) from 'HHMM-HHMM', else None."""
    m = re.match(r'^\s*(\d{3,4})\s*-\s*(\d{3,4})\s*$', s)
    if not m:
        return None
    a, b = m.group(1).zfill(4), m.group(2).zfill(4)
    sa, sb = to_min(a), to_min(b)
    if sa is None or sb is None:
        return None
    return (sa, sb)

WEEK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

def weekdays_in(text):
    """Ordered unique weekdays found in a string. Expands ranges like
    'Mon-Thu' and 'Fri-Sat'. Avoids treating date ranges ('August 24 -
    September 3') as weekday ranges by only expanding when both sides are
    weekday tokens directly adjacent to the hyphen."""
    t = str(text).lower()
    found = []

    def add(d):
        if d not in found:
            found.append(d)

    # Expand weekday ranges first, e.g. "mon-thu"
    for m in re.finditer(r'([a-z]{3,9})\s*-\s*([a-z]{3,9})', t):
        a, b = m.group(1).strip('.'), m.group(2).strip('.')
        if a in DAY_MAP and b in DAY_MAP:
            i, j = WEEK_ORDER.index(DAY_MAP[a]), WEEK_ORDER.index(DAY_MAP[b])
            if i <= j:
                for d in WEEK_ORDER[i:j + 1]:
                    add(d)

    # Then individual weekday tokens
    for tok in re.split(r'[\s,/\-]+', t):
        tok = tok.strip('.')
        if tok in DAY_MAP:
            add(DAY_MAP[tok])

    # Keep canonical week order
    return [d for d in WEEK_ORDER if d in found]

def has_month(text):
    t = str(text).lower()
    return any(mo in t for mo in MONTHS)

def build_meetings(days_raw, times_raw):
    """Return list of {day,start,end}. Handles weekly, multi-day, and the
    rare per-day-time format embedded in the Times column."""
    days_raw = '' if days_raw is None else str(days_raw)
    times_raw = '' if times_raw is None else str(times_raw)

    # Case: per-day times live in the Times column, e.g.
    # "Thu, 1540-1810\nFri, 1130-1330"
    if weekdays_in(times_raw) and re.search(r'\d{3,4}\s*-\s*\d{3,4}', times_raw):
        meetings = []
        for line in re.split(r'[\n;]+', times_raw):
            wds = weekdays_in(line)
            tr = parse_time_range(re.sub(r'[A-Za-z,]', '', line))
            if wds and tr:
                for d in wds:
                    meetings.append({'day': d, 'start': tr[0], 'end': tr[1]})
        if meetings:
            return meetings

    tr = parse_time_range(times_raw)
    wds = weekdays_in(days_raw)
    if tr and wds:
        return [{'day': d, 'start': tr[0], 'end': tr[1]} for d in wds]
    return []

courses = []
cid = 0
for r in rows[1:]:
    title = r[0]
    if not title or not str(title).strip():
        continue
    title = str(title).strip()
    prof_raw = r[1]
    professors = []
    if prof_raw:
        professors = [p.strip() for p in re.split(r'[\n]+', str(prof_raw)) if p.strip()]

    days_raw = '' if r[2] is None else str(r[2]).strip()
    times_raw = '' if r[3] is None else str(r[3]).strip()
    units = r[4]
    enrollment = '' if r[5] is None else str(r[5]).strip()
    classroom = '' if r[6] is None else str(r[6]).strip()
    exam_type = '' if r[7] is None else str(r[7]).strip()
    notes = '' if r[8] is None else str(r[8]).strip()

    meetings = build_meetings(days_raw, times_raw)
    short_course = has_month(days_raw)
    async_course = (times_raw in ('', '-')) and not meetings

    # clean display name + section
    section = None
    msec = re.search(r'\(Section (\d+)\)', title)
    if msec:
        section = int(msec.group(1))
    clean_title = re.sub(r'\s*\(Section \d+\)\s*', '', title).strip()

    courses.append({
        'id': cid,
        'title': clean_title,
        'fullTitle': title,
        'section': section,
        'professors': professors,
        'daysRaw': days_raw,
        'timesRaw': times_raw,
        'meetings': meetings,
        'units': units,
        'enrollment': enrollment,
        'classroom': classroom,
        'examType': exam_type,
        'notes': notes,
        'shortCourse': short_course,
        'asyncCourse': async_course,
    })
    cid += 1

with open(OUT, 'w') as f:
    json.dump(courses, f, indent=2, ensure_ascii=False)

# diagnostics
with_meet = sum(1 for c in courses if c['meetings'])
print(f'wrote {len(courses)} courses -> {OUT}')
print(f'  with placeable meetings: {with_meet}')
print(f'  short courses: {sum(1 for c in courses if c["shortCourse"])}')
print(f'  async/no-time: {sum(1 for c in courses if c["asyncCourse"])}')
no_meet = [c for c in courses if not c['meetings'] and not c['asyncCourse']]
print(f'  no meetings & not async (needs review): {len(no_meet)}')
for c in no_meet[:15]:
    print('    -', repr(c['title']), '| days=', repr(c['daysRaw'][:40]), '| times=', repr(c['timesRaw'][:30]))

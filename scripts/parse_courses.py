import openpyxl, json, re, datetime

import os
SRC = os.path.expanduser('~/Downloads/Fall 26 Course Selection-2.xlsx')
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

MONTH_NUM = {name: i + 1 for i, name in enumerate(MONTHS)}
YEAR = 2026  # Fall '26

def _month_days(text):
    """All (month, day) pairs mentioned, e.g. 'September 21' -> (9, 21)."""
    pairs = []
    for m in re.finditer(r'(' + '|'.join(MONTHS) + r')\s+(\d{1,2})', text.lower()):
        pairs.append((MONTH_NUM[m.group(1)], int(m.group(2))))
    return pairs

def parse_sessions(days_raw):
    """Resolve a short course's meeting pattern into concrete calendar dates.
    Handles explicit newline lists ('Mon, September 21\\nTue, September 22…')
    and date ranges ('Mon-Thu, August 24 - September 3'). Returns a sorted list
    of {wd, m, d, iso}."""
    text = str(days_raw)
    pairs = _month_days(text)
    if not pairs:
        return []

    dates = []
    is_range = ('\n' not in text) and len(pairs) >= 2 and '-' in text
    if is_range:
        (m1, d1), (m2, d2) = pairs[0], pairs[-1]
        try:
            start = datetime.date(YEAR, m1, d1)
            end = datetime.date(YEAR, m2, d2)
        except ValueError:
            return []
        wds = set(weekdays_in(text))
        cur = start
        while cur <= end:
            if not wds or cur.strftime('%a') in wds:
                dates.append(cur)
            cur += datetime.timedelta(days=1)
    else:
        for (mon, day) in pairs:
            try:
                dates.append(datetime.date(YEAR, mon, day))
            except ValueError:
                pass

    dates = sorted(set(dates))
    return [
        {'wd': d.strftime('%a'), 'm': d.month, 'd': d.day, 'iso': d.isoformat()}
        for d in dates
    ]

def parse_prereqs(raw):
    """Parse the Pre-reqs column into structured data."""
    text = '' if raw is None else str(raw).strip()
    if not text or text.lower() == 'none':
        return {'required': [], 'recommended': [], 'jdPriority': False, 'raw': ''}

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    required = []
    recommended = []
    jd_priority = False
    mode = 'required'

    for line in lines:
        low = line.lower()
        if low in ('jd priority', 'jd only', '2l or 3l only', '3l only',
                    '2l or 3l', '2l or 3l\njd priority'):
            jd_priority = True
            continue
        if low.startswith('helpful, not req'):
            mode = 'recommended'
            continue
        if low.startswith('or ') and (required or recommended):
            target = recommended if mode == 'recommended' else required
            if target:
                target[-1] = target[-1] + ' OR ' + line[3:].strip()
            else:
                target.append(line[3:].strip())
            continue
        if mode == 'recommended':
            recommended.append(line)
        else:
            required.append(line)

    return {
        'required': required,
        'recommended': recommended,
        'jdPriority': jd_priority,
        'raw': text,
    }

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
    prereqs_raw = r[8]
    notes = '' if r[9] is None else str(r[9]).strip()

    meetings = build_meetings(days_raw, times_raw)
    short_course = has_month(days_raw)
    async_course = (times_raw in ('', '-')) and not meetings
    sessions = parse_sessions(days_raw)

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
        'prereqs': parse_prereqs(prereqs_raw),
        'shortCourse': short_course,
        'asyncCourse': async_course,
        'sessions': sessions,
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

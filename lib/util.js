const days = {
  Mo: '0',
  Tu: '1',
  We: '2',
  Th: '3',
  Fr: '4',
};

function parseDays(meetingDays) {
  let md = '';
  for (const day in days) {
    if (meetingDays.includes(day)) {
      md += days[day];
    }
  }
  return md;
}

function parseTime(time) {
  const meridian = time.slice(-2);
  const [hour, minute] = time.slice(0, -2).split(':');
  let h = parseInt(hour);
  if (meridian === 'PM' && h !== 12) {
    h += 12;
  }
  let m = parseInt(minute);
  return { h, m };
}

export function parseMeetingTime(meetingTime) {
  // MoWeFri 1:00PM - 1:50PM
  if (!meetingTime) {
    return {};
  }
  const [meetingDays, start, , end] = meetingTime.split(' ');
  if (!meetingDays || !start || !end) {
    return {};
  }
  return {
    meeting_days: parseDays(meetingDays),
    start_time: parseTime(start),
    end_time: parseTime(end),
  };
}

export function clean(s) {
  if (!s) return;
  if (typeof s === 'string') {
    return s.replace(/\s\s+/g, ' ').trim();
  }
  return s;
}

export function parseDistros(s) {
  s = s.toLowerCase();
  let d = '';
  let f = '';

  const distros = {
    natural: 1,
    formal: 2,
    social: 3,
    historical: 4,
    ethics: 5,
    literature: 6,
    interdisciplinary: 7,
  };

  const disciplines = {
    natural: 1,
    empirical: 2,
    social: 3,
    historical: 4,
    ethical: 5,
    literature: 6,
    interdisciplinary: 7,
  };

  const values = s.split('\n');
  for (const value of values) {
    if (value.includes('distro')) {
      for (const distro in distros) {
        if (value.includes(distro)) {
          d += distros[distro];
        }
      }
    } else if (value.includes('foundational')) {
      for (const discipline in disciplines) {
        if (value.includes(discipline)) {
          f += disciplines[discipline];
        }
      }
    }
  }

  return {
    distros: d || undefined,
    disciplines: f || undefined,
  };
}

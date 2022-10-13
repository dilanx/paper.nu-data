import { parseMeetingTime, clean } from './util.js';
import fetch from 'node-fetch';

const SERVER = 'https://northwestern-prod.apigee.net';

export async function getTerms() {
  const response = await fetch(`${SERVER}/student-system-termget/UGRD`, {
    headers: { apikey: process.env.API_KEY },
  });
  const json = await response.json();

  const terms = json?.['NW_CD_TERM_RESP']?.['TERM']?.map((term) => ({
    term: term['TermID'],
    name: term['TermDescr'],
  }));

  return terms;
}

export async function getAcademicGroups(term) {
  const response = await fetch(
    `${SERVER}/student-system-acadgroupget/${term}`,
    { headers: { apikey: process.env.API_KEY } }
  );
  const json = await response.json();

  const groups = json?.['NW_CD_ACADGROUP_RESP']?.['ACADGROUPS']?.map(
    (group) => group['ACAD_GROUP']
  );

  return groups;
}

export async function getSubjects(term, group) {
  const response = await fetch(
    `${SERVER}/student-system-subjectsget/${term}/${group}`,
    { headers: { apikey: process.env.API_KEY } }
  );
  const json = await response.json();

  const subjects = json?.['NW_CD_SUBJECT_RESP']?.['ACAD_GROUP']?.map(
    (subject) => subject['SUBJECT']
  );

  return subjects;
}

export async function getAllClasses(term, group, subject) {
  const response = await fetch(
    `${SERVER}/student-system-classdescrallcls/${term}/${group}/${subject}`,
    { headers: { apikey: process.env.API_KEY } }
  );
  const json = await response.json();

  const dateStartString =
    json?.['NW_CD_DTL_ALLCLS_RESP']?.['DATE_VISIBLE_IN_SES'];
  if (dateStartString) {
    const dateStart = new Date(dateStartString);
    dateStart.setTime(dateStart.getTime() + 24 * 60 * 60 * 1000);
    const today = new Date();

    if (dateStart.getTime() > today.getTime()) {
      return 'time';
    }
  }

  const data = {};
  const associated = {};

  const sections = json?.['NW_CD_DTL_ALLCLS_RESP']?.['CLASSDESCR'];

  if (!sections) {
    return [];
  }

  for (const s of sections) {
    const course_id = s['CRSE_ID'];
    const title = clean(s['COURSE_TITLE']);
    const number = s['CATALOG_NBR'];
    const section = s['SECTION'];
    if (!data[course_id]) {
      data[course_id] = {
        i: course_id,
        c: group,
        t: title,
        u: subject,
        n: number,
        s: [],
      };
      associated[course_id] = [];
    }

    const section_id = `${course_id}-${section}`;
    let instructors;

    if (s['INSTRUCTOR']) {
      instructors = s['INSTRUCTOR'].map((i) => ({
        n: clean(i['DISPLAY_NAME']),
        p: clean(i['PHONE']),
        a: clean(i['CAMPUS_ADDR']),
        o: clean(i['OFFICE_HOURS']),
        b: clean(i['INST_BIO']),
        u: clean(i['URL']),
      }));
    }

    let room;
    let meeting_days;
    let start_time, end_time;

    if (s['CLASS_MTG_INFO'] && s['CLASS_MTG_INFO'].length > 0) {
      const { ROOM, MEETING_TIME } = s['CLASS_MTG_INFO'][0];
      if (ROOM) {
        room = clean(ROOM);
      }
      if (MEETING_TIME) {
        const {
          meeting_days: md,
          start_time: st,
          end_time: et,
        } = parseMeetingTime(clean(MEETING_TIME));
        meeting_days = md;
        start_time = st;
        end_time = et;
      }
    }

    const start_date = s['START_DT'];
    const end_date = s['END_DT'];
    const component = clean(s['COMPONENT']);
    const capacity = clean(s['ENRL_CAP']);

    let enrl_req;

    if (s['ENRL_REQUIREMENT'] && s['ENRL_REQUIREMENT'].length > 0) {
      const { ENRL_REQ_VALUE } = s['ENRL_REQUIREMENT'][0];
      enrl_req = clean(ENRL_REQ_VALUE);
    }

    s['ASSOCIATED_CLASS']?.forEach((a) => {
      const a_section = a['SECTION'];
      const a_component = a['COMPONENT'];
      if (a_section === 'NO DATA' || a_component === 'NO DATA') {
        return;
      }
      const a_section_id = `${course_id}-${a['SECTION']}`;
      if (associated[course_id].some((x) => x.i === a_section_id)) {
        return;
      }
      let a_room;
      let a_meeting_days;
      let a_start_time, a_end_time;
      if (a['CLASS_MTG_INFO2'] && a['CLASS_MTG_INFO2'].length > 0) {
        const { ROOM, MEETING_TIME } = a['CLASS_MTG_INFO2'][0];
        if (ROOM) {
          a_room = clean(ROOM);
        }
        if (MEETING_TIME) {
          const {
            meeting_days: md,
            start_time: st,
            end_time: et,
          } = parseMeetingTime(clean(MEETING_TIME));
          a_meeting_days = md;
          a_start_time = st;
          a_end_time = et;
        }
      }
      associated[course_id].push({
        i: a_section_id,
        t: title,
        u: subject,
        n: number,
        s: a_section,
        m: a_meeting_days,
        x: a_start_time,
        y: a_end_time,
        l: a_room,
        d: start_date,
        e: end_date,
        c: a_component,
      });
    });

    data[course_id].s.push({
      i: section_id,
      r: instructors,
      t: title,
      u: subject,
      n: number,
      s: section,
      m: meeting_days,
      x: start_time,
      y: end_time,
      l: room,
      d: start_date,
      e: end_date,
      c: component,
      a: capacity,
      q: enrl_req,
    });
  }

  const scheduleData = [];

  for (const course_id in data) {
    for (const a of associated[course_id]) {
      data[course_id].s.push(a);
    }
    scheduleData.push(data[course_id]);
  }

  return scheduleData;
}

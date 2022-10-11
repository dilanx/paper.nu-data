import path from 'path';
import os from 'os';
import * as dotenv from 'dotenv';
import { parseMeetingTime } from './util';

dotenv.config();

const dataMapFile = path.join(os.homedir(), 'paper-map.json');

const SERVER = 'https://northwestern-prod.apigee.net';

async function getTerms() {
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

async function getAcademicGroups(term) {
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

async function getSubjects(term, group) {
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

async function getAllClasses(term, group, subject) {
  const response = await fetch(
    `${SERVER}/student-system-classdescrallcls/${term}/${group}/${subject}`,
    { headers: { apikey: process.env.API_KEY } }
  );
  const json = await response.json();

  const dateStartString =
    json?.['NW_CD_DTL_ALLCLS_RESP']?.['DATE_VISIBLE_IN_SES'];
  const dateStart = new Date(dateStartString);
  dateStart.setTime(dateStart.getTime() + 24 * 60 * 60 * 1000);
  const today = new Date();

  if (dateStart && dateStart < today) {
    return;
  }

  const data = {};

  const sections = json?.['NW_CD_DTL_ALLCLS_RESP']?.['CLASSDESCR'];

  for (const s of sections) {
    const course_id = s['CRSE_ID'];
    const title = s['COURSE_TITLE'];
    const number = s['CATALOG_NBR'];
    const section = s['SECTION'];
    if (!data[course_id]) {
      data[course_id] = {
        course_id,
        school: group,
        title,
        subject,
        number,
        sections: [],
      };
    }

    const section_id = `${course_id}-${section}`;
    let instructors;

    if (s['INSTRUCTOR']) {
      instructors = s['INSTRUCTOR'].map((i) => ({
        name: i['DISPLAY_NAME'],
        phone: i['PHONE'],
        campus_address: i['CAMPUS_ADDR'],
        office_hours: i['OFFICE_HOURS'],
        bio: i['INST_BIO'],
        url: i['URL'],
      }));
    }

    let room;
    let meeting_days;
    let start_time, end_time;

    if (s['CLASS_MTG_INFO'] && s['CLASS_MTG_INFO'].length > 0) {
      const { ROOM, MEETING_TIME } = s['CLASS_MTG_INFO'][0];
      if (ROOM) {
        room = {
          building_name: ROOM,
        };
      }
      if (MEETING_TIME) {
        const {
          meeting_days: md,
          start_time: st,
          end_time: et,
        } = parseMeetingTime(MEETING_TIME);
        meeting_days = md;
        start_time = st;
        end_time = et;
      }
    }

    const start_date = s['START_DT'];
    const end_date = s['END_DT'];
    const component = s['COMPONENT'];
    const capacity = s['ENRL_CAP'];

    let enrl_req;

    if (s['ENRL_REQUIREMENT'] && s['ENRL_REQUIREMENT'].length > 0) {
      const { ENRL_REQ_VALUE } = s['ENRL_REQUIREMENT'][0];
      enrl_req = ENRL_REQ_VALUE;
    }

    data[course_id].sections.push({
      section_id,
      instructors,
      title,
      subject,
      number,
      section,
      meeting_days,
      start_time,
      end_time,
      room,
      start_date,
      end_date,
      component,
      capacity,
      enrl_req,
    });
  }
}

// TODO continue here

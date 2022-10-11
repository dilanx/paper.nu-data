import path from 'path';
import os from 'os';
import * as dotenv from 'dotenv';

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

  const classes = json?.['NW_CD_DTL_ALLCLS_RESP']?.['CLASSDESCR'];
}

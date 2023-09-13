import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs';

export const SUBJECT_COLORS = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

export function loadSubjects() {
  const f = join(homedir(), 'paper-subjects.json');
  const { subjects } = JSON.parse(fs.readFileSync(f));

  const currentColors = {};
  for (const subjectId in subjects) {
    const { c } = subjects[subjectId];
    currentColors[c] = (currentColors[c] ?? 0) + 1;
  }

  return {
    subjects,
    currentColors,
  };
}

export function includeSubject(allSubjectData, { id, school, display }) {
  const { subjects, currentColors } = allSubjectData;
  const color = [...SUBJECT_COLORS].sort(
    (a, b) => currentColors[a] - currentColors[b]
  )[0];

  let newSubject = false;
  const updatedSubject = [];

  if (!subjects[id]?.c) {
    newSubject = true;
    subjects[id] = {
      c: color,
    };

    currentColors[color] = (currentColors[color] ?? 0) + 1;
  }

  if (!subjects[id].d || subjects[id].d !== display) {
    updatedSubject.push(`display ${subjects[id].d || 'NONE'} to ${display}`);
    subjects[id].d = display;
  }

  if (!subjects[id].s || !subjects[id].s.includes(school)) {
    const newSubjs = [...(subjects[id].s ?? []), school];
    updatedSubject.push(
      `school ${subjects[id].s?.join(',') || 'NONE'} to ${newSubjs.join(',')}})`
    );
    subjects[id].s = newSubjs;
  }

  return {
    subjects,
    currentColors,
    newSubject,
    updatedSubject,
  };
}

export function saveSubjects(allSubjectData) {
  const f = join(homedir(), 'paper-subjects.json');
  const { subjects: readSubjects } = JSON.parse(fs.readFileSync(f));
  const { subjects } = allSubjectData;
  if (checkSubjectFileEquality(readSubjects, subjects)) {
    return false;
  }

  fs.writeFileSync(f, JSON.stringify({ subjects }));
  return true;
}

function checkSubjectFileEquality(aSubjects, bSubjects) {
  if (Object.keys(aSubjects).length !== Object.keys(bSubjects).length) {
    return false;
  }

  for (const subjectId in aSubjects) {
    const aSubject = aSubjects[subjectId];
    const bSubject = bSubjects[subjectId];

    if (!bSubject) {
      return false;
    }

    if (aSubject.c !== bSubject.c) {
      return false;
    }

    if (aSubject.d !== bSubject.d) {
      return false;
    }

    if (aSubject.s !== bSubject.s) {
      return false;
    }
  }

  return true;
}

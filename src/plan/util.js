import fs from 'fs';
import { parse as parseCSV } from 'csv-parse/sync';

export const colors = [
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

export function loadPrevData(jsonFile) {
  const data = fs.readFileSync(jsonFile, 'utf8');
  if (data) {
    return JSON.parse(data);
  }
}

export function loadNewData(csvFile) {
  const data = fs.readFileSync(csvFile, 'utf8');
  if (data) {
    return parseCSV(data, { columns: true });
  }
}

export function clean(s) {
  return s.replace(/[\n\t\r\xa0]/g, '').trim();
}

export function repeatable(s) {
  return s.toLowerCase().includes('y');
}

export function parseDescription(s) {
  let description = null;
  let prerequisites = null;

  for (const msg of ['Prereq: ', 'Prerequisite: ', 'Prerequisites: ']) {
    const i = s.indexOf(msg);
    if (i >= 0) {
      description = s.slice(0, i).trim();
      prerequisites = s.slice(i + msg.length).trim();
      break;
    }
  }

  if (prerequisites) {
    if (prerequisites.endsWith('.')) {
      prerequisites = prerequisites.slice(0, -1);
    }
  } else {
    description = s.trim();
  }

  return { description, prerequisites };
}

export function parseTermsOffered(s) {
  if (s.length === 0) return;
  s = s.toLowerCase();

  const terms = ['fall', 'winter', 'spring', 'summer'];

  let termsOffered = '';

  for (let i = 0; i < terms.length; i++) {
    if (s.includes(terms[i])) {
      termsOffered += `${i}`;
    }
  }

  if (termsOffered.length === 0) return;
  return termsOffered;
}

export function parseDistro(s) {
  s = s.toLowerCase();

  const distros = {
    natural: 1,
    formal: 2,
    social: 3,
    historical: 4,
    ethics: 5,
    literature: 6,
    interdisciplinary: 7,
  };

  for (const distro in distros) {
    if (s.includes(distro)) {
      return distros[distro];
    }
  }
}

export function threeDigits(n) {
  return n.toString().padStart(3, '0');
}

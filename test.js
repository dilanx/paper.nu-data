import fs from 'fs';

const data = JSON.parse(fs.readFileSync('local/4920.json'));

const ids = new Set();

for (const course of data) {
  if (ids.has(course.i)) {
    console.error('same id:', course.i);
  }
  ids.add(course.i);
}

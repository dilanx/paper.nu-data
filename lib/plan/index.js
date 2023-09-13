import { log } from '../log.js';
import {
  colors,
  parseDistro,
  clean,
  repeatable,
  threeDigits,
  parseDescription,
  parseTermsOffered,
  loadPrevData,
  loadNewData,
} from './util.js';

function prepare(prevCourses, prevMajors) {
  const majors = {};
  const coursesPerMajor = {
    PLACEHOLDER: [],
  };

  let maxId = -1;
  let lastColor = -1;
  for (const major in prevMajors) {
    coursesPerMajor[major] = [];
    const { i, c, d } = prevMajors[major];
    majors[major] = {
      i,
      c,
      d,
    };

    const idn = parseInt(i);

    if (idn > maxId) {
      maxId = idn;
      lastColor = colors.indexOf(c);
    }
  }

  for (const course of prevCourses) {
    if (course.l) {
      coursesPerMajor['PLACEHOLDER'].push(course);
    }
  }

  return { majors, coursesPerMajor, maxId, lastColor };
}

function finalize(majors, coursesPerMajor) {
  const courses = [];
  for (const major in coursesPerMajor) {
    courses.push(
      ...coursesPerMajor[major].sort((a, b) => a.i.localeCompare(b.i))
    );
  }

  const major_ids = {};

  for (const major in majors) {
    major_ids[majors[major].i] = major;
  }

  return { courses, major_ids };
}

function addToLegacy(oldLegacy, oldCourses, newCourses) {
  const legacy = [...oldLegacy];

  for (const course of oldCourses) {
    if (!newCourses.some((c) => c.i === course.i)) {
      legacy.push(course);
    }
  }

  return legacy;
}

export function parse(prevJsonFile, newCsvFile) {
  log.task('Parsing plan data...');

  const oldData = loadPrevData(prevJsonFile);
  if (!oldData) {
    log.failure('Failed to load old data (json).');
    return;
  }
  const {
    courses: oldCourses,
    majors: oldMajors,
    legacy: oldLegacy,
    shortcuts,
  } = oldData;

  let {
    majors,
    coursesPerMajor,
    maxId: lastId,
    lastColor,
  } = prepare(oldCourses, oldMajors);

  const newData = loadNewData(newCsvFile);
  if (!newData) {
    log.failure('Failed to load new data (csv).');
    return;
  }

  records: for (const record of newData) {
    const major = clean(record['Subject']);
    const number = clean(record['Catalog']);

    if (!majors[major]) {
      coursesPerMajor[major] = [];
      lastId++;
      lastColor = (lastColor + 1) % colors.length;
      majors[major] = {
        i: threeDigits(lastId),
        c: colors[lastColor],
      };
    }

    majors[major].d = clean(record['Subject Descr']);

    const course = {
      i: `${major} ${number}`,
    };

    for (const c of coursesPerMajor[major]) {
      if (c.i === course.i) {
        const checkDistro = clean(
          record['Course Attribute Descr']
        ).toLowerCase();
        if (checkDistro.includes('distribution')) {
          let di = parseDistro(clean(record['Course Attribute Value Descr']));

          if (di) {
            if (c.s) {
              c.s += `${di}`;
            } else {
              c.s = `${di}`;
            }
          }
        }
        continue records;
      }
    }

    course.n = clean(record['Long Course Title']);
    course.u = clean(record['Min Units']);
    course.r = repeatable(clean(record['Repeatable for Credit']));

    const { description, prerequisites } = parseDescription(
      clean(record['Course Description'])
    );
    if (description) {
      course.d = description;
    }
    if (prerequisites) {
      course.p = prerequisites;
    }

    const checkDistro = clean(record['Course Attribute Descr']).toLowerCase();
    if (checkDistro.includes('distribution')) {
      let di = parseDistro(clean(record['Course Attribute Value Descr']));
      if (di) {
        course.s = `${di}`;
      }
    }

    coursesPerMajor[major].push(course);
  }

  const { courses, major_ids } = finalize(majors, coursesPerMajor);

  const legacy = addToLegacy(oldLegacy, oldCourses, courses);

  log.success(
    `Parsed ${courses.length} courses over ${
      Object.keys(majors).length
    } subjects.`
  );

  return {
    newData: {
      courses,
      legacy,
      majors,
      major_ids,
      shortcuts,
    },
    oldData,
  };
}

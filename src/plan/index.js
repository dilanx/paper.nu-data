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
    const { id, color, display } = prevMajors[major];
    majors[major] = {
      id,
      color,
      display,
    };

    const idn = parseInt(id);

    if (idn > maxId) {
      maxId = idn;
      lastColor = colors.indexOf(color);
    }
  }

  for (const course of prevCourses) {
    if (course.placeholder) {
      coursesPerMajor['PLACEHOLDER'].push(course);
    }
  }

  return { majors, coursesPerMajor, maxId, lastColor };
}

function finalize(majors, coursesPerMajor) {
  const courses = [];
  for (const major in coursesPerMajor) {
    courses.push(
      ...coursesPerMajor[major].sort((a, b) => a.id.localeCompare(b.id))
    );
  }

  const major_ids = {};

  for (const major in majors) {
    major_ids[majors[major].id] = major;
  }

  return { courses, major_ids };
}

function addToLegacy(oldLegacy, oldCourses, newCourses) {
  const legacy = [...oldLegacy];

  for (const course of oldCourses) {
    if (!newCourses.some((c) => c.id === course.id)) {
      legacy.push(course);
    }
  }

  return legacy;
}

export function parse(prevJsonFile, newCsvFile) {
  const oldData = loadPrevData(prevJsonFile);
  if (!oldData) return;
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
  if (!newData) return;

  records: for (const record of newData) {
    const major = clean(record['Subject']);
    const number = clean(record['Catalog']);

    if (!majors[major]) {
      coursesPerMajor[major] = [];
      lastId++;
      lastColor = (lastColor + 1) % colors.length;
      majors[major] = {
        id: threeDigits(lastId),
        color: colors[lastColor],
      };
    }

    majors[major].display = clean(record['Subject Descr']);

    const course = {
      id: `${major} ${number}`,
    };

    for (const c of coursesPerMajor[major]) {
      if (c.id === course.id) {
        const checkDistro = clean(
          record['Course Attribute Descr']
        ).toLowerCase();
        if (checkDistro.includes('distribution')) {
          let di = parseDistro(clean(record['Course Attribute Value Descr']));

          if (di) {
            if (c.distros) {
              c.distros += `${di}`;
            } else {
              c.distros = `${di}`;
            }
          }
        }
        continue records;
      }
    }

    course.name = clean(record['Long Course Title']);
    course.units = clean(record['Min Units']);
    course.repeatable = repeatable(clean(record['Repeatable for Credit']));

    const { description, prerequisites } = parseDescription(
      clean(record['Course Description'])
    );
    if (description) {
      course.description = description;
    }
    if (prerequisites) {
      course.prerequisites = prerequisites;
    }

    const offered = parseTermsOffered(
      clean(record['Course Typically Offered'])
    );
    if (offered) {
      course.offered = offered;
    }

    const checkDistro = clean(record['Course Attribute Descr']).toLowerCase();
    if (checkDistro.includes('distribution')) {
      let di = parseDistro(clean(record['Course Attribute Value Descr']));
      if (di) {
        course.distros = `${di}`;
      }
    }

    course.career = clean(record['Career Descr']);
    course.nu_id = clean(record['Course ID']);

    coursesPerMajor[major].push(course);
  }

  const { courses, major_ids } = finalize(majors, coursesPerMajor);

  const legacy = addToLegacy(oldLegacy, oldCourses, courses);

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

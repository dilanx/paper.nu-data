import { log } from '../log.js';

function compareMajors(oldMajors, newMajors, detailed) {
  const o = Object.keys(oldMajors);
  const n = Object.keys(newMajors);

  const added = n.filter((x) => !o.includes(x));
  const removed = o.filter((x) => !n.includes(x));
  const idChanged = o.filter((x) => oldMajors[x].id !== newMajors[x].id);

  await log.cond(
    `Added ${added.length} majors${
      added.length && detailed ? `: ${added.join(', ')}` : '.'
    }`
  );
  await log.cond(
    `Removed ${removed.length} majors${
      removed.length && detailed ? `: ${removed.join(', ')}` : '.'
    }`,
    removed.length === 0
  );

  await log.cond(
    `Changed ${idChanged.length} major ids${
      idChanged.length && detailed ? `: ${idChanged.join(', ')}` : '.'
    }`,
    idChanged.length === 0
  );
}

function compareCourses(
  oldCourses,
  oldLegacy,
  newCourses,
  newLegacy,
  detailed
) {
  const oId = oldCourses.map((x) => x.i);
  const nId = newCourses.map((x) => x.i);

  const added = nId.filter((x) => !oId.includes(x));
  const removed = oId.filter((x) => !nId.includes(x));

  await log.cond(
    `Added ${added.length} courses${
      added.length && detailed ? `: ${added.join(', ')}` : '.'
    }`
  );
  await log.cond(
    `Removed ${removed.length} courses${
      removed.length && detailed ? `: ${removed.join(', ')}` : '.'
    }`
  );

  const oLegacy = oldLegacy.map((x) => x.i);
  const nLegacy = newLegacy.map((x) => x.i);

  const addedLegacy = nLegacy.filter((x) => !oLegacy.includes(x));
  const removedLegacy = oLegacy.filter((x) => !nLegacy.includes(x));

  await log.cond(
    `Added ${addedLegacy.length} legacy courses.`,
    addedLegacy.length === removed.length
  );

  await log.cond(
    `Removed ${removedLegacy.length} legacy courses.`,
    removedLegacy.length === 0
  );
}

export function compare(oldData, newData, detailed = false) {
  let { courses: oldCourses, majors: oldMajors, legacy: oldLegacy } = oldData;
  let { courses: newCourses, majors: newMajors, legacy: newLegacy } = newData;

  log.task('Comparing new data to old data...');

  compareMajors(oldMajors, newMajors, detailed);
  compareCourses(oldCourses, oldLegacy, newCourses, newLegacy, detailed);

  log.success('Comparison complete!');
}

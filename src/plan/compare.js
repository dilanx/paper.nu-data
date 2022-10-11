import { log } from '../log.js';

function compareMajors(oldMajors, newMajors, detailed) {
  const o = Object.keys(oldMajors);
  const n = Object.keys(newMajors);

  const added = n.filter((x) => !o.includes(x));
  const removed = o.filter((x) => !n.includes(x));
  const idChanged = o.filter((x) => oldMajors[x].id !== newMajors[x].id);

  log(
    `Added ${added.length} majors${
      added.length && detailed ? `: ${added.join(', ')}` : '.'
    }\n`
  );
  log(
    `Removed ${removed.length} majors${
      removed.length && detailed ? `: ${removed.join(', ')}` : '.'
    }\n`,
    removed.length === 0
  );

  log(
    `Changed ${idChanged.length} major ids${
      idChanged.length && detailed ? `: ${idChanged.join(', ')}` : '.'
    }\n`,
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
  const oId = oldCourses.map((x) => x.id);
  const nId = newCourses.map((x) => x.id);

  const added = nId.filter((x) => !oId.includes(x));
  const removed = oId.filter((x) => !nId.includes(x));

  log(
    `Added ${added.length} courses${
      added.length && detailed ? `: ${added.join(', ')}` : '.'
    }\n`
  );
  log(
    `Removed ${removed.length} courses${
      removed.length && detailed ? `: ${removed.join(', ')}` : '.'
    }\n`
  );

  const oLegacy = oldLegacy.map((x) => x.id);
  const nLegacy = newLegacy.map((x) => x.id);

  const addedLegacy = nLegacy.filter((x) => !oLegacy.includes(x));
  const removedLegacy = oLegacy.filter((x) => !nLegacy.includes(x));

  log(
    `Added ${addedLegacy.length} legacy courses.\n`,
    addedLegacy.length === removed.length
  );

  log(
    `Removed ${removedLegacy.length} legacy courses.\n`,
    removedLegacy.length === 0
  );
}

export function compare(oldData, newData, detailed = false) {
  let { courses: oldCourses, majors: oldMajors, legacy: oldLegacy } = oldData;
  let { courses: newCourses, majors: newMajors, legacy: newLegacy } = newData;

  compareMajors(oldMajors, newMajors, detailed);
  compareCourses(oldCourses, oldLegacy, newCourses, newLegacy, detailed);
}

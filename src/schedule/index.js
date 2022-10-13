import { log } from '../log.js';
import {
  getAcademicGroups,
  getAllClasses,
  getSubjects,
  getTerms,
} from './request.js';

export async function parse(oneTerm) {
  await log.task(
    `Fetching and parsing schedule data (${oneTerm || 'latest'})...`,
    true
  );

  let terms = await getTerms();
  if (!terms) {
    await log.failure('No terms found.', 0, true);
    return;
  }

  terms = terms.sort((a, b) => parseInt(b.term) - parseInt(a.term));

  if (oneTerm) {
    terms = terms.filter((term) => term.term === oneTerm);
  }

  for (const { term, name } of terms) {
    await log.subtask(`Fetching data for ${name} (${term})...`, 1);

    const termData = [];
    const groups = await getAcademicGroups(term);
    if (!groups) {
      log.nothing(`No data (no academic groups).`, 1);
      continue;
    }

    g: for (const group of groups) {
      const subjects = await getSubjects(term, group);
      if (!subjects) {
        continue;
      }

      for (const subject of subjects) {
        await log.subtask(`Fetching data for ${subject} (${group})...`, 2);
        const classes = await getAllClasses(term, group, subject);
        if (classes === 'time') {
          log.nothing(`No data (courses not yet available).`, 2);
          log.skip(
            `Courses for ${group} (term ${term}) must be unavailable in CAESAR.`,
            2
          );
          continue g;
        }
        if (!classes || classes.length === 0) {
          log.nothing(`No data (no courses found).`, 2);
          continue;
        }

        termData.push(...classes);
        await log.success(`Parsed ${classes.length} classes.`, 2);
      }
    }

    if (termData.length === 0) {
      log.nothing(`No data overall.`, 1);
      continue;
    }

    await log.success(`Found class data.`, 1);
    await log.success(
      `Fetched and parsed ${termData.length} classes for the term ${name}.`,
      0,
      true
    );
    return {
      data: termData,
      term: {
        term,
        name,
      },
    };
  }
}

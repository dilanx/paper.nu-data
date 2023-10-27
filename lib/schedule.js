import { log } from './log.js';
import { includeSubject, loadSubjects, saveSubjects } from './subjects.js';
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

  await log.subtask(`Loading existing subject data...`, 1);
  let allSubjectData = loadSubjects();
  await log.success(`Loaded existing subject data.`, 1);

  for (const { term, name, start, end } of terms) {
    await log.subtask(`Fetching data for ${name} (${term})...`, 1);

    const termData = [];
    const groups = await getAcademicGroups(term);
    if (!groups) {
      await log.nothing(`No data (no academic groups).`, 1);
      continue;
    }

    g: for (const group of groups) {
      const subjects = await getSubjects(term, group);
      if (!subjects) {
        continue;
      }

      for (const { subject, display } of subjects) {
        await log.subtask(`Fetching data for ${subject} (${group})...`, 2);
        const { newSubject, updatedSubject, ...newSubjectData } =
          includeSubject(allSubjectData, {
            id: subject,
            school: group,
            display: display,
          });

        if (newSubject) {
          const { c, d, s } = newSubjectData.subjects[subject];
          await log.log(
            `New subject ${subject} was added (color ${c}; display ${d}; schools ${s.join(
              ','
            )}).`,
            2,
            true
          );
        } else if (updatedSubject.length > 0) {
          await log.log(
            `Subject ${subject} was updated (${updatedSubject.join('; ')}).`,
            2
          );
        }

        allSubjectData = {
          ...newSubjectData,
        };

        const classes = await getAllClasses(term, group, subject);
        if (classes === 'time') {
          await log.nothing(`No data (courses not yet available).`, 2);
          await log.skip(
            `Courses for ${group} (term ${term}) must be unavailable in CAESAR.`,
            2
          );
          continue g;
        }
        if (!classes || classes.length === 0) {
          await log.nothing(`No data (no courses found).`, 2);
          continue;
        }

        termData.push(...classes);
        await log.success(`Parsed ${classes.length} classes.`, 2);
      }
    }

    if (termData.length === 0) {
      await log.nothing(`No data overall.`, 1);
      continue;
    }

    await log.success(`Found class data.`, 1);

    await log.subtask(`Saving subject data...`, 1);
    const saved = saveSubjects(allSubjectData);
    if (saved) {
      await log.success(`Saved subject data.`, 1);
    } else {
      await log.nothing(`No new subject data to save.`, 1);
    }

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
        start,
        end,
      },
      subjectsUpdated: saved,
    };
  }
}

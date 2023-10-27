import { join } from 'path';
import fs from 'fs';
import { log } from './log.js';

export async function updatePlan(dir, termId, scheduleData = null) {
  await log.task('Updating plan data...', true);
  if (!scheduleData) {
    const filepath = join(dir, `${termId}.json`);
    scheduleData = JSON.parse(fs.readFileSync(filepath));
  }

  const planFilepath = join(dir, 'plan.json');
  const planDataString = fs.readFileSync(planFilepath);
  const planData = JSON.parse(planDataString);

  const courses = planData.courses.map((course) => {
    const terms = course.t?.filter((t) => t !== termId);
    course.t = terms;
    return course;
  });

  for (const course of scheduleData) {
    const { u: subject, n: catalogNumber, t: title, s: sections } = course;

    const planCourseId = `${subject} ${catalogNumber}`;
    let distros = null;
    let disciplines = null;

    for (const section of sections) {
      const { o: thisDistros, f: thisDisciplines } = section;
      if (thisDistros) {
        distros = thisDistros;
      }
      if (thisDisciplines) {
        disciplines = thisDisciplines;
      }
    }

    const planCourse = courses.find((course) => course.i === planCourseId);
    if (!planCourse) {
      courses.push({
        i: planCourseId,
        n: title,
        u: '1', // default units
        s: distros,
        f: disciplines,
        t: [termId],
      });
      await log.log(`New course ${planCourseId} was added.`, 1);
    } else {
      planCourse.n = title;
      planCourse.s = distros;
      planCourse.f = disciplines;
      if (planCourse.t) {
        planCourse.t.push(termId);
      } else {
        planCourse.t = [termId];
      }
    }
  }

  planData.courses = courses;
  const newPlanDataString = JSON.stringify(planData);
  fs.writeFileSync(planFilepath, newPlanDataString);

  if (planDataString === newPlanDataString) {
    await log.nothing('No changes to plan data.', 0, true);
    return null;
  }

  await log.success('Plan data updated.', 0, true);
  return planData;
}

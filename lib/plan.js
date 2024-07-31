import { join } from 'path';
import fs from 'fs';
import { log } from './log.js';

export async function updatePlan(dir, termId, scheduleData = null) {
  await log.task(`Updating plan data with term ${termId} data...`, true);
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
    const {
      u: subject,
      n: catalogNumber,
      c: school,
      t: title,
      s: sections,
    } = course;

    const planCourseId = `${subject} ${catalogNumber}`;
    let distros = null;
    let disciplines = null;

    const planCourse = courses.find((course) => course.i === planCourseId);
    let topics = planCourse?.o ? [...planCourse.o] : [];

    for (const section of sections) {
      const { k: topic, o: thisDistros, f: thisDisciplines } = section;

      if (topic && !topics.includes(topic)) {
        topics.push(topic);
      }

      if (thisDistros) {
        distros = thisDistros;
      }

      if (thisDisciplines) {
        disciplines = thisDisciplines;
      }
    }

    if (!planCourse) {
      courses.push({
        i: planCourseId,
        n: title,
        u: '1.00', // default units
        s: distros,
        f: disciplines,
        c: school,
        t: [termId],
        o: topics.length > 0 ? topics : undefined,
      });
      await log.log(`New course ${planCourseId} was added.`, 1);
    } else {
      planCourse.n = title;
      planCourse.s = distros;
      planCourse.f = disciplines;
      planCourse.c = school;
      planCourse.o = topics.length > 0 ? topics : undefined;
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

  await log.success(`Plan data updated with term ${termId} data.`, 0, true);
  return planData;
}

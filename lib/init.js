import fs from 'fs';
import { join } from 'path';
import { log } from './log.js';

export async function init(dir) {
  await log.task('Initializing local paper data...');
  const allDataRes = await fetch('https://api.dilanxd.com/paper/data');
  const allData = await allDataRes.json();

  await log.subtask('Downloading plan data...', 1);
  const planRes = await fetch('https://cdn.dilanxd.net/paper-data/plan.json');
  const planData = await planRes.json();
  const planFilepath = join(dir, 'plan.json');
  fs.writeFileSync(planFilepath, JSON.stringify(planData));
  await log.success('Plan data downloaded.', 1);

  for (const termId in allData.terms) {
    const fullTermName = `${termId} (${allData.terms[termId].name})`;
    await log.subtask(`Downloading schedule data for ${fullTermName}...`, 1);
    const termRes = await fetch(
      `https://cdn.dilanxd.net/paper-data/${termId}.json`
    );
    const termData = await termRes.json();
    const termFilepath = join(dir, `${termId}.json`);
    fs.writeFileSync(termFilepath, JSON.stringify(termData));
    await log.success(`Schedule data for ${fullTermName} downloaded.`, 1);
  }

  await log.success('Local paper data initialized.');
}

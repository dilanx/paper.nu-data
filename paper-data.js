import 'dotenv/config';
import fs from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { init } from './lib/init.js';
import { log } from './lib/log.js';
import { updatePlan } from './lib/plan.js';
import { publish } from './lib/publish.js';
import { parse } from './lib/schedule.js';

const argv = yargs(process.argv.slice(2))
  .version(JSON.parse(fs.readFileSync('package.json')).version)
  .usage('Usage: $0 [options]')
  .option('dir', {
    alias: 'd',
    describe: 'Directory where data is stored',
    type: 'string',
    required: true,
  })
  .option('fetch', {
    alias: 'f',
    describe: 'Fetch and parse data',
    type: 'boolean',
  })
  .option('publish', {
    alias: 'p',
    describe: 'Publish data',
    type: 'boolean',
  })
  .option('plan', {
    alias: 'l',
    describe: 'Update plan data',
    type: 'boolean',
  })
  .option('term', {
    alias: 't',
    describe: 'Fetch data for a specific term ID or latest if omitted',
    type: 'string',
  })
  .option('init', {
    alias: 'i',
    describe: 'Initialize data directory',
    type: 'boolean',
    conflicts: ['fetch', 'publish', 'plan', 'term'],
  })
  .option('log-local-only', {
    alias: 'L',
    describe: 'Log only to local console',
    type: 'boolean',
  })
  .option('subjects-file', {
    alias: 'S',
    describe:
      'Manual path to subjects file or ~/paper-subjects.json if omitted',
    type: 'string',
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .epilog('paper.nu data CLI by Dilan Nair (a.dilanxd.com/p)').argv;

if (argv.logLocalOnly) {
  log.logLocalOnly = true;
}

if (argv.subjectsFile) {
  process.env.SUBJECTS_FILE = argv.subjectsFile;
}

async function main() {
  if (argv.init) {
    await init(argv.dir);
    return;
  }
  if (argv.fetch) {
    const { data, term, subjectsUpdated } = await parse(argv.term);

    if (!data) {
      process.exit(1);
    }

    const termId = term.term;

    const filepath = join(argv.dir, `${termId}.json`);
    fs.writeFileSync(filepath, JSON.stringify(data));

    let planData = argv.plan ? await updatePlan(argv.dir, termId, data) : null;

    if (argv.publish) {
      await publish({
        planData,
        scheduleData: data,
        term,
        isLatestTerm: !argv.term,
        subjectsUpdated,
      });
    }

    return;
  }

  if (argv.plan) {
    if (!argv.term && !argv.publish) {
      await log.failure('At least one of --term or --publish must be set');
      process.exit(1);
    }

    let planData = null;

    if (argv.term) {
      planData = await updatePlan(argv.dir, argv.term);
    }

    if (argv.publish) {
      if (!planData) {
        const filepath = join(argv.dir, `plan.json`);
        planData = JSON.parse(fs.readFileSync(filepath));
      }

      if (!planData) {
        await log.failure('Plan data not found');
        process.exit(1);
      }

      await publish({ planData });
    }

    return;
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    log.failure(err, 0, true).finally(() => process.exit(1));
  });

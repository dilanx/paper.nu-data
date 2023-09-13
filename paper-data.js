import fs from 'fs';
import yargs from 'yargs';
import { parse as parsePlan } from './lib/plan/index.js';
import { parse as parseSchedule } from './lib/schedule/index.js';
import { publish as publishPlan } from './lib/plan/publish.js';
import { publish as publishSchedule } from './lib/schedule/publish.js';
import { compare as comparePlan } from './lib/plan/compare.js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { homedir } from 'os';
import { setMapFileLatest } from './lib/schedule/publish.js';
import { log } from './lib/log.js';

dotenv.config();

/*

  Map file schema

  {
    "latest": "4880",
    "terms": {
      "4880": {
        "name": "2022 Fall",
        "updated": "1665530188801"
      }
    }
  }

 */

const dataMapFile = join(homedir(), 'paper-map.json');

const argv = yargs(process.argv.slice(2))
  .version(false)
  .usage('Usage: $0 <command> [options]')
  .command('plan', 'Parse plan course data', (yargs) =>
    yargs
      .option('out', {
        alias: 'o',
        describe: 'Output file',
        type: 'string',
      })
      .option('prev', {
        alias: 'r',
        describe: 'Old data file (json)',
        demandOption: true,
        type: 'string',
      })
      .option('next', {
        alias: 'n',
        describe: 'New data file (csv)',
        demandOption: true,
        type: 'string',
      })
      .option('compare', {
        alias: 'c',
        describe: 'Print a comparison of old and new data',
        type: 'boolean',
      })
      .option('compareVerbose', {
        alias: 'C',
        describe: 'Print a detailed comparison of old and new data',
        type: 'boolean',
      })
      .option('publish', {
        alias: 'p',
        describe: 'Publish plan data to CDN',
        type: 'boolean',
      })
  )
  .command(
    'schedule',
    'Parse schedule course data for the latest term',
    (yargs) =>
      yargs
        .option('out', {
          alias: 'o',
          describe: 'Output file',
          type: 'string',
        })
        .option('term', {
          alias: 't',
          describe: 'Fetch data for a specific term ID',
          type: 'string',
        })
        .option('min', {
          alias: 'm',
          describe: 'Minified output file',
          type: 'string',
        })
        .option('publish', {
          alias: 'p',
          describe:
            'Publish obtained data to the CDN and update map file ("latest" determined automatically, or unchanged if the term option is specified).',
          type: 'boolean',
        })
        .option('manualPublish', {
          alias: 'P',
          describe:
            'Publish the provided file to the CDN (term "0", name "manual")',
          type: 'string',
          nargs: 1,
        })
        .option('latest', {
          alias: 'l',
          describe:
            'Update the map file with a new latest term ID (no fetching or parsing done).',
        })
  )
  .help('h')
  .alias('h', 'help')
  .demandCommand(1)
  .epilog('paper.nu data parser by Dilan Nair').argv;

const command = argv._[0];

if (command === 'plan') {
  const { out, prev, next, compare, compareVerbose, publish } = argv;
  const data = parsePlan(prev, next);
  if (!data) {
    process.exit(1);
  }
  const { newData, oldData } = data;

  if (out) {
    fs.writeFileSync(out, JSON.stringify(newData, null, 2));
  }

  if (compare || compareVerbose) {
    comparePlan(oldData, newData, compareVerbose);
  }

  if (publish) {
    publishPlan(dataMapFile, newData).catch((err) => {
      log.failure(err, 0, true).finally(() => process.exit(1));
    });
  }
}

if (command === 'schedule') {
  const { out, term, min, publish, manualPublish, latest } = argv;

  const runSchedule = async () => {
    if (latest) {
      setMapFileLatest(dataMapFile, latest);
    } else if (manualPublish) {
      const data = JSON.parse(fs.readFileSync(manualPublish));
      await publishSchedule(
        dataMapFile,
        data,
        { term: '0', name: 'manual' },
        false
      );
    } else {
      const { data, term: newTerm } = await parseSchedule(term);

      if (!data) {
        process.exit(1);
      }
      if (out) {
        fs.writeFileSync(out, JSON.stringify(data, null, 2));
      }
      if (min) {
        fs.writeFileSync(min, JSON.stringify(data));
      }

      if (publish) {
        await publishSchedule(dataMapFile, data, newTerm, true);
      }
    }
  };

  runSchedule()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      log.failure(err, 0, true).finally(() => process.exit(1));
    });
}

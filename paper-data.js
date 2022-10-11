import fs from 'fs';
import yargs from 'yargs';
import { parse as parsePlan } from './src/plan/index.js';
import { compare as comparePlan } from './src/plan/compare.js';

const argv = yargs(process.argv.slice(2))
  .version(false)
  .usage('Usage: $0 <command> [options]')
  .command('plan', 'Parse plan course data', (yargs) =>
    yargs
      .option('out', {
        alias: 'o',
        describe: 'Output file',
        demandOption: true,
        type: 'string',
      })
      .option('prev', {
        alias: 'p',
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
      .option('compare-verbose', {
        alias: 'C',
        describe: 'Print a detailed comparison of old and new data',
        type: 'boolean',
      })
  )
  .command('schedule', 'Parse schedule course data', (yargs) =>
    yargs.option('out', {
      alias: 'o',
      describe: 'Output file',
      demandOption: true,
      type: 'string',
    })
  )
  .help('h')
  .alias('h', 'help')
  .demandCommand(1)
  .epilog('paper.nu data parser by Dilan Nair').argv;

const command = argv._[0];

if (command === 'plan') {
  const { out, prev, next, compare, 'compare-verbose': compareVerbose } = argv;
  const data = parsePlan(prev, next);
  if (!data) {
    process.exit(1);
  }
  const { newData, oldData } = data;
  fs.writeFileSync(out, JSON.stringify(newData, null, 2));

  if (compare || compareVerbose) {
    comparePlan(oldData, newData, compareVerbose);
  }
}

import chalk from 'chalk';

export const log = {
  log: (msg) => {
    console.log(msg);
  },
  task: (msg) => {
    console.log(`${chalk.blueBright('TASK')} ${msg}`);
  },
  success: (msg) => {
    console.log(`${chalk.greenBright('SUCCESS')} ${msg}`);
  },
  failure: (msg) => {
    console.log(`${chalk.redBright('FAILURE')} ${msg}`);
  },
  cond: (msg, ok = true) => {
    console.log(`${ok ? chalk.green('OK') : chalk.red('BAD')} ${msg}`);
  },
};

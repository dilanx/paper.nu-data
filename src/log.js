import chalk from 'chalk';

export function log(msg, ok = true) {
  console.log(`${ok ? chalk.green('OK') : chalk.red('BAD')} ${msg}`);
}

import chalk from 'chalk';
import fetch from 'node-fetch';

function spaces(n) {
  return ' '.repeat(n * 4);
}

function c(msg, sub, prefix) {
  console.log(`${spaces(sub)}${prefix} ${msg}`);
}

async function d(msg, prefix) {
  if (log.logLocalOnly) return;
  const content = `**${prefix}** ${msg}`;
  if (content.length > 2000) {
    content = content.slice(0, 2000 - 3) + '...';
  }
  await fetch(process.env.LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
    }),
  });
}

export const log = {
  logLocalOnly: false,

  log: async (msg, sub = 0, discord = false) => {
    c(msg, sub, chalk.gray('LOG'));
    if (discord) await d(msg, 'LOG');
  },
  task: async (msg, discord = false) => {
    c(msg, 0, chalk.blueBright('TASK'));
    if (discord) await d(msg, 'TASK');
  },
  subtask: async (msg, n = 1, discord = false) => {
    c(msg, n, chalk.yellowBright('SUBTASK'));
    if (discord) await d(msg, 'SUBTASK');
  },
  success: async (msg, sub = 0, discord = false) => {
    c(msg, sub, chalk.greenBright('SUCCESS'));
    if (discord) await d(msg, 'SUCCESS');
  },
  nothing: async (msg, sub = 0, discord = false) => {
    c(msg, sub, chalk.gray('NOTHING'));
    if (discord) await d(msg, 'NOTHING');
  },
  skip: async (msg, sub = 0) => {
    c(msg, sub, chalk.gray('SKIP'));
  },
  failure: async (msg, sub = 0, discord = false) => {
    c(msg, sub, chalk.redBright('FAILURE'));
    if (discord) await d(msg, 'FAILURE');
  },
  cond: async (msg, ok = true, sub = 0) => {
    c(msg, sub, ok ? chalk.green('OK') : chalk.red('BAD'));
  },
};

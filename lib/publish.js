import fs from 'fs';
import { log } from './log.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { join } from 'path';
import { homedir } from 'os';

const dataMapFile = join(homedir(), 'paper-map.json');

export async function publish({
  planData,
  scheduleData,
  term: { term, name, start, end },
  isLatestTerm,
  subjectsUpdated,
}) {
  if (!planData && !scheduleData) {
    await log.failure(
      'Attempt to publish data failed because no data was provided.',
      0,
      true
    );
    return;
  }

  if (scheduleData && !term) {
    await log.failure(
      'Attempt to publish schedule data failed because no term was provided for provided schedule data.',
      0,
      true
    );
    return;
  }

  const updatingArray = [];
  if (planData) {
    updatingArray.push('plan data');
  }
  if (scheduleData) {
    updatingArray.push(`schedule data (term ${term} - ${name})`);
  }
  const updating = updatingArray.join(' and ');

  await log.task(`Publishing ${updating}...`, true);

  const s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.CDN_ACCESS_KEY,
      secretAccessKey: process.env.CDN_ACCESS_SECRET,
    },
  });

  if (planData) {
    await log.subtask('Uploading plan data to CDN...', 1);
    const params = {
      Bucket: 'dilanx-cdn',
      Key: `paper-data/plan.json`,
      Body: JSON.stringify(data),
      ACL: 'public-read',
    };
    await s3Client.send(new PutObjectCommand(params));
    await log.success('Data uploaded.', 1);
  }

  if (scheduleData) {
    await log.subtask('Uploading schedule data to CDN...', 1);
    const params = {
      Bucket: 'dilanx-cdn',
      Key: `paper-data/${term}.json`,
      Body: JSON.stringify(data),
      ACL: 'public-read',
    };
    await s3Client.send(new PutObjectCommand(params));
    await log.success('Data uploaded.', 1);
  }

  await log.subtask(`Updating map file...`, 1);
  const map = JSON.parse(fs.readFileSync(dataMapFile));

  if (planData) {
    map.plan = `${Date.now()}`;
  }
  if (scheduleData) {
    map.terms[term] = {
      name,
      updated: `${Date.now()}`,
      start,
      end,
    };
  }
  if (isLatestTerm) {
    map.latest = `${term}`;
  }
  if (subjectsUpdated) {
    map.subjects = `${Date.now()}`;
  }

  fs.writeFileSync(dataMapFile, JSON.stringify(map));
  await log.success(`Map file updated.`, 1);

  await log.success(`Published ${updating}.`, 0, true);
}

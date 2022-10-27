import fs from 'fs';
import { log } from '../log.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export function setMapFileLatest(dataMapFile, termId) {
  log.task(`Updating map file with new latest term ${termId}...`);
  const map = JSON.parse(fs.readFileSync(dataMapFile));
  map.latest = `${termId}`;
  fs.writeFileSync(dataMapFile, JSON.stringify(map));
  log.success('Map file updated.');
}

export async function publish(dataMapFile, data, { term, name }, isLatest) {
  await log.task(`Publishing data for term ${term} (${name})...`, true);

  await log.subtask(`Uploading data to CDN...`, 1);

  const s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.CDN_ACCESS_KEY,
      secretAccessKey: process.env.CDN_ACCESS_SECRET,
    },
  });

  const params = {
    Bucket: 'dilanx-cdn',
    Key: `paper-data/${term}.json`,
    Body: JSON.stringify(data),
    ACL: 'public-read',
  };

  await s3Client.send(new PutObjectCommand(params));

  await log.success(`Data uploaded.`, 1);

  await log.subtask(`Updating map file...`, 1);
  const map = JSON.parse(fs.readFileSync(dataMapFile));
  map.terms[term] = {
    name,
    updated: `${Date.now()}`,
  };
  if (isLatest) {
    map.latest = `${term}`;
  }
  fs.writeFileSync(dataMapFile, JSON.stringify(map));
  await log.success(`Map file updated.`, 1);

  await log.success(
    `Published data for term ${term} (${name}) and updated map file.`,
    0,
    true
  );
}

import { log } from '../log.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export async function publish(dataMapFile, data) {
  await log.task(`Publishing plan data...`);

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
    Key: `paper-data/plan.json`,
    Body: JSON.stringify(data),
    ACL: 'public-read',
  };

  await s3Client.send(new PutObjectCommand(params));

  await log.success(`Data uploaded.`, 1);

  await log.subtask(`Updating map file...`, 1);
  const map = JSON.parse(fs.readFileSync(dataMapFile));
  map.plan = `${Date.now()}`;
  fs.writeFileSync(dataMapFile, JSON.stringify(map));
  await log.success(`Map file updated.`, 1);

  await log.success(`Published plan data.`);
}

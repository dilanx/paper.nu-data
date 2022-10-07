import path from 'path';
import os from 'os';
import * as dotenv from 'dotenv';

dotenv.config();

const dataMapFile = path.join(os.homedir(), 'paper-map.json');

const SERVER = 'https://northwestern-prod.apigee.net';

async function getTerms() {
  const response = await fetch(`${SERVER}/student-system-termget/UGRD`, {
    headers: {
      apikey: '',
    },
  });
  const json = await response.json();
}

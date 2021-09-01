import chalk from 'chalk';
import axios from 'axios';
import { promises as fsp } from 'fs';
import * as fs from 'fs';

console.log(`Checking ShoppingList file for updates.`);

const path = 'shoppinglist'

async function checkUpdates (): Promise<void> {
  const res = await axios.get('https://api.github.com/repos/shopping-busket/web/commits?path=%2Fsrc%2Fshoppinglist%2FShoppingList.ts&per_page=1');
  const date = new Date(res.data[0].commit.committer.date);
  const lastUpdate = (new Date((await getOrSetLastUpdate()).lastUpdate)).getTime()

  console.log(date.getTime(), lastUpdate);

  if (date.getTime() < lastUpdate) {
    console.log('pulling');
    await setLastUpdate(res.data[0].commit.committer.date);
  }
}

async function setLastUpdate (lastUpdate: string): Promise<void> {
  const data = { lastUpdate };
  await fsp.mkdir(path, { recursive: true });
  await fsp.writeFile(`${path}/data.json`, JSON.stringify(data));
}

async function getOrSetLastUpdate (): Promise<{ lastUpdate: string }> {
  if (!fs.existsSync(`${path}/data.json`)) {
    console.log('no file be');
    await setLastUpdate((new Date()).toISOString());
  }

  const out = await fsp.readFile(`${path}/data.json`);
  return JSON.parse(out.toString());
}

checkUpdates();
